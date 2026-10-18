import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Store, LogOut, Loader2, Check, Camera, Trash2, Eye, Phone, MessageCircle, Navigation, KeyRound, Ticket, Plus } from 'lucide-react'
import { carregarOfertas } from '../hooks/useOfertas'
import { Layout } from '../components/Layout/Layout'
import { StatusPill } from '../components/UI/Badge'
import { supabase } from '../lib/supabase'
import { carregarLugares } from '../hooks/useBusinesses'
import { DIAS, DIAS_NOME, statusHorario } from '../lib/horario'
import { nomeSub } from '../data/categories'
import { COMODIDADES } from '../data/comodidades'
import { Icon } from '../components/UI/Icon'

const campo = 'mt-1.5 w-full rounded-2xl bg-[var(--nevoa)] px-4 py-3.5 text-[16px]'
const FOTOS_URL = 'https://cpoxykaksqlrqnstjonv.supabase.co/storage/v1/object/public/fotos/'

function useSessao() {
  const [s, setS] = useState({ carregando: true, user: null })
  useEffect(() => {
    let vivo = true
    supabase.auth.getSession().then(({ data }) => vivo && setS({ carregando: false, user: data.session?.user || null }))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setTimeout(() => vivo && setS({ carregando: false, user: session?.user || null }), 0))
    return () => { vivo = false; sub.subscription.unsubscribe() }
  }, [])
  return s
}

function Entrar() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [msg, setMsg] = useState('')
  const [enviando, setEnviando] = useState(false)
  async function enviar(e) {
    e.preventDefault(); setMsg(''); setEnviando(true)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password: senha })
    if (error) setMsg('E-mail ou senha incorretos. O acesso chega pelo WhatsApp depois da verificação.')
    setEnviando(false)
  }
  return (
    <form onSubmit={enviar} className="mx-5 rounded-[var(--raio)] bg-[var(--papel)] p-5">
      <p className="text-[16px] leading-relaxed text-[var(--leve)]">Entre com o e-mail e a senha que você recebeu depois de confirmar que o negócio é seu.</p>
      <div className="mt-4"><label className="block text-[15px] font-bold" htmlFor="le">E-mail</label><input id="le" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className={campo} /></div>
      <div className="mt-4"><label className="block text-[15px] font-bold" htmlFor="ls">Senha</label><input id="ls" type="password" required autoComplete="current-password" value={senha} onChange={e => setSenha(e.target.value)} className={campo} /></div>
      {msg && <p className="mt-3 text-[15px] font-semibold text-[var(--sos)]" role="alert">{msg}</p>}
      <button disabled={enviando} className="botao botao-pri mt-5 h-14 w-full text-[17px]">{enviando ? <Loader2 size={18} className="animate-spin" /> : 'Entrar'}</button>
      <p className="mt-4 text-[14px] leading-relaxed text-[var(--leve)]">Ainda não pediu acesso? <Link to="/anuncie#meu-negocio" className="font-bold text-[var(--musgo)] underline underline-offset-4">Este negócio é meu</Link>. Esqueceu a senha? Chame o guia no WhatsApp cadastrado e pedimos uma nova.</p>
    </form>
  )
}

/** Converte a foto no aparelho para webp de até 1600 px antes de enviar. */
async function comprimir(file, max = 1600, q = 0.78) {
  const bmp = await createImageBitmap(file)
  const esc = Math.min(1, max / Math.max(bmp.width, bmp.height))
  const W = Math.round(bmp.width * esc), H = Math.round(bmp.height * esc)
  const c = document.createElement('canvas'); c.width = W; c.height = H
  c.getContext('2d').drawImage(bmp, 0, 0, W, H)
  return new Promise(r => c.toBlob(r, 'image/webp', q))
}

function Fotos({ b, fotos, setFotos }) {
  const input = useRef()
  const [enviando, setEnviando] = useState(false)
  const [msg, setMsg] = useState('')
  async function enviar(e) {
    const files = [...(e.target.files || [])].slice(0, 5 - fotos.length)
    if (!files.length) return
    setEnviando(true); setMsg('')
    for (const f of files) {
      try {
        const blob = await comprimir(f)
        const nome = `lugares/${b.id}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.webp`
        const { error } = await supabase.storage.from('fotos').upload(nome, blob, { contentType: 'image/webp' })
        if (error) throw error
        const { data, error: e2 } = await supabase.from('business_images').insert({ business_id: b.id, image_url: FOTOS_URL + nome, display_order: fotos.length }).select('id,image_url,display_order').single()
        if (e2) throw e2
        setFotos(v => [...v, data])
      } catch (err) { setMsg('Não foi possível enviar uma das fotos: ' + (err.message || '')) }
    }
    setEnviando(false); e.target.value = ''
  }
  async function apagar(f) {
    if (!confirm('Remover esta foto?')) return
    await supabase.from('business_images').delete().eq('id', f.id)
    const caminho = f.image_url.replace(FOTOS_URL, '')
    if (caminho.startsWith('lugares/')) await supabase.storage.from('fotos').remove([caminho])
    setFotos(v => v.filter(x => x.id !== f.id))
  }
  return (
    <section className="mt-6">
      <h3 className="text-[18px] font-extrabold tracking-[-0.02em]">Fotos <span className="text-[14px] font-medium text-[var(--leve)]">({fotos.length} de 5)</span></h3>
      <p className="mt-1 text-[14px] text-[var(--leve)]">A primeira vira a capa. Fotos de verdade do seu lugar, na horizontal, ficam melhores.</p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {fotos.map(f => (
          <div key={f.id} className="relative aspect-square overflow-hidden rounded-[14px] bg-[var(--nevoa-2)]">
            <img src={f.image_url} alt="" className="h-full w-full object-cover" />
            <button onClick={() => apagar(f)} className="absolute right-1.5 top-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[var(--sos)]" aria-label="Remover foto"><Trash2 size={16} /></button>
          </div>
        ))}
        {fotos.length < 5 && (
          <button onClick={() => input.current?.click()} disabled={enviando} className="pressiona flex aspect-square flex-col items-center justify-center gap-1 rounded-[14px] bg-[var(--nevoa-2)] text-[14px] font-bold text-[var(--musgo)]">
            {enviando ? <Loader2 size={22} className="animate-spin" /> : <><Camera size={22} />Adicionar</>}
          </button>
        )}
      </div>
      <input ref={input} type="file" accept="image/*" multiple className="hidden" onChange={enviar} />
      {msg && <p className="mt-2 text-[14px] font-semibold text-[var(--sos)]">{msg}</p>}
    </section>
  )
}

/** Ofertas do dono: até 3 ativas, "mostre esta tela", com contagem de usos. */
function OfertasDono({ b }) {
  const [lista, setLista] = useState(null)
  const [f, setF] = useState({ titulo: '', regras: '', fim: '' })
  const [msg, setMsg] = useState('')
  const [enviando, setEnviando] = useState(false)
  const set = k => e => setF(v => ({ ...v, [k]: e.target.value }))
  const carregar = () => supabase.from('ofertas').select('*').eq('business_id', b.id).order('criado_em', { ascending: false }).then(({ data }) => setLista(data || []))
  useEffect(() => { carregar() }, [b.id])
  async function criar(e) {
    e.preventDefault(); setMsg('')
    if (f.titulo.trim().length < 4) { setMsg('Escreva a oferta, por exemplo: "Café grátis com o almoço".'); return }
    setEnviando(true)
    const { error } = await supabase.from('ofertas').insert({ business_id: b.id, titulo: f.titulo.trim().slice(0, 80), regras: f.regras.trim().slice(0, 200) || null, fim: f.fim ? new Date(f.fim + 'T23:59:59').toISOString() : null })
    setEnviando(false)
    if (error) { setMsg(error.message.includes('Máximo') ? 'Você já tem 3 ofertas ativas. Desative uma para criar outra.' : 'Não foi possível criar.'); return }
    setF({ titulo: '', regras: '', fim: '' }); carregar(); carregarOfertas(true)
  }
  async function alternar(o) { await supabase.from('ofertas').update({ ativo: !o.ativo }).eq('id', o.id); carregar(); carregarOfertas(true) }
  async function apagar(o) { if (confirm('Apagar esta oferta?')) { await supabase.from('ofertas').delete().eq('id', o.id); carregar(); carregarOfertas(true) } }
  const ativas = (lista || []).filter(o => o.ativo && (!o.fim || new Date(o.fim) > new Date()))
  return (
    <section className="mt-8 rounded-[var(--raio)] bg-[var(--papel)] p-5">
      <h3 className="flex items-center gap-2 text-[18px] font-extrabold tracking-[-0.02em]"><Ticket size={19} className="text-[var(--musgo)]" />Ofertas para quem vem pelo guia</h3>
      <p className="mt-1 text-[14px] leading-relaxed text-[var(--leve)]">O turista toca em "Usar oferta", mostra a tela no balcão e você vê quantas vezes ela foi usada. Até 3 ativas. Exemplos: "Café grátis com o almoço", "10% no fondue de terça a quinta", "Sobremesa por conta da casa".</p>
      {lista === null ? <div className="esqueleto mt-3 h-16 rounded-2xl" /> : lista.length > 0 && (
        <ul className="mt-4 space-y-2">
          {lista.map(o => (
            <li key={o.id} className={`rounded-2xl bg-[var(--nevoa)] p-3.5 ${o.ativo ? '' : 'opacity-60'}`}>
              <p className="text-[16px] font-bold leading-tight">{o.titulo}</p>
              <p className="mt-1 text-[13px] text-[var(--leve)]">{o.regras ? o.regras + ' · ' : ''}{o.fim ? `até ${new Date(o.fim).toLocaleDateString('pt-BR')}` : 'sem prazo'} · <b className="num text-[var(--araucaria)]">{o.usos}</b> {o.usos === 1 ? 'uso' : 'usos'}{!o.ativo ? ' · desativada' : o.fim && new Date(o.fim) < new Date() ? ' · encerrada' : ''}</p>
              <div className="mt-2 flex gap-2">
                <button onClick={() => alternar(o)} className="botao botao-sec h-9 min-h-0 flex-1 text-[14px]">{o.ativo ? 'Desativar' : 'Ativar'}</button>
                <button onClick={() => apagar(o)} className="botao botao-sec h-9 min-h-0 w-10 px-0" aria-label="Apagar"><Trash2 size={15} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {ativas.length < 3 && (
        <form onSubmit={criar} className="mt-4">
          <label className="block text-[15px] font-bold" htmlFor="ot">Nova oferta</label>
          <input id="ot" value={f.titulo} onChange={set('titulo')} maxLength={80} placeholder="Ex.: Café grátis com o almoço" className={campo} />
          <input value={f.regras} onChange={set('regras')} maxLength={200} placeholder="Condições (opcional): de terça a quinta, uma por mesa…" className={campo} />
          <label className="mt-3 block text-[15px] font-bold" htmlFor="of">Vale até <span className="font-medium text-[var(--leve)]">(opcional)</span></label>
          <input id="of" type="date" value={f.fim} onChange={set('fim')} className={campo} />
          {msg && <p className="mt-2 text-[14px] font-semibold text-[var(--sos)]">{msg}</p>}
          <button disabled={enviando} className="botao botao-pri mt-3 h-12 w-full"><Plus size={17} />Publicar oferta</button>
        </form>
      )}
    </section>
  )
}

function Editor({ negocio, onSalvo }) {
  const [b, setB] = useState({ ...negocio, hours: { ...(negocio.hours || {}) } })
  const [fotos, setFotos] = useState([])
  const [rel, setRel] = useState(null)
  const [estado, setEstado] = useState('')
  const set = k => e => setB(v => ({ ...v, [k]: e.target.value }))
  const setH = d => e => setB(v => ({ ...v, hours: { ...v.hours, [d]: e.target.value } }))
  useEffect(() => {
    supabase.from('business_images').select('id,image_url,display_order').eq('business_id', negocio.id).order('display_order').then(({ data }) => setFotos(data || []))
    supabase.rpc('meu_relatorio', { p_business: negocio.id, dias: 30 }).then(({ data }) => setRel(Object.fromEntries((data || []).map(r => [r.kind, Number(r.total)]))))
  }, [negocio.id])

  async function salvar() {
    setEstado('salvando')
    const hours = Object.fromEntries(Object.entries(b.hours).filter(([, v]) => String(v).trim()).map(([k, v]) => [k, String(v).trim().toLowerCase()]))
    const p = { description: b.description, whatsapp: String(b.whatsapp || '').replace(/\D/g, ''), phone: b.phone, phone2: b.phone2, instagram: b.instagram, website: b.website, email: b.email, address: b.address, open_24h: b.open_24h, hours: Object.keys(hours).length ? hours : null, amenities: b.amenities || [] }
    const { error } = await supabase.rpc('editar_meu_negocio', { p_business: negocio.id, p })
    if (error) { setEstado('erro'); return }
    carregarLugares(true)
    setEstado('ok'); setTimeout(() => setEstado(''), 2500)
    onSalvo?.()
  }
  const st = statusHorario({ ...b, hours: b.hours })
  const n = k => rel?.[k] || 0

  return (
    <div className="px-5">
      <div className="rounded-[var(--raio)] bg-[var(--araucaria)] p-5 text-white">
        <p className="text-[14px] text-white/70">{nomeSub(b)}</p>
        <h2 className="text-[24px] font-extrabold leading-tight tracking-[-0.03em]">{b.name}</h2>
        <div className="mt-4 grid grid-cols-4 gap-2 text-center">
          {[['view', 'visitas', Eye], ['whatsapp', 'WhatsApp', MessageCircle], ['tel', 'ligações', Phone], ['cupom', 'ofertas', Ticket]].map(([k, r, I]) => (
            <div key={k} className="rounded-2xl bg-white/10 py-3"><I size={16} className="mx-auto text-[var(--broto)]" /><p className="num mt-1 text-[22px] font-extrabold leading-none">{rel ? n(k) : '–'}</p><p className="mt-1 text-[12px] text-white/70">{r}</p></div>
          ))}
        </div>
        <p className="mt-3 text-[13px] text-white/60">Últimos 30 dias no guia. <Link to={`/estabelecimento/${b.slug}`} className="underline">Ver minha página</Link></p>
      </div>

      <section className="mt-6">
        <h3 className="text-[18px] font-extrabold tracking-[-0.02em]">Horário de funcionamento</h3>
        <p className="mt-1 text-[14px] text-[var(--leve)]">Escreva como 08:00-18:00, 12:00-15:00,19:00-23:00, fechado ou 24h. Em branco = não informado. Agora: <StatusPill st={st} longo /></p>
        <div className="mt-3 grid grid-cols-1 gap-2">
          {DIAS.map(d => (
            <label key={d} className="flex items-center gap-3"><span className="w-20 text-[15px] font-bold">{DIAS_NOME[d]}</span><input value={b.hours[d] || ''} onChange={setH(d)} placeholder="08:00-18:00" className="min-w-0 flex-1 rounded-2xl bg-[var(--nevoa)] px-4 py-3 text-[16px]" /></label>
          ))}
        </div>
        <label className="mt-3 flex items-center gap-3 text-[15px]"><span className="w-20 font-bold">24 horas</span>
          <select value={b.open_24h || ''} onChange={set('open_24h')} className="min-w-0 flex-1 rounded-2xl bg-[var(--nevoa)] px-4 py-3 text-[16px]"><option value="">Não</option><option value="sim">Sim, sempre aberto</option><option value="plantão">Plantão por telefone</option></select>
        </label>
      </section>

      <section className="mt-6">
        <h3 className="text-[18px] font-extrabold tracking-[-0.02em]">Sobre o lugar</h3>
        <label className="mt-2 block text-[15px] font-bold" htmlFor="desc">Descrição <span className="font-medium text-[var(--leve)]">(até 600 caracteres)</span></label>
        <textarea id="desc" rows={4} maxLength={600} value={b.description || ''} onChange={set('description')} placeholder="O que vocês servem ou fazem, o que é especial, se aceita pet, se tem lareira…" className={campo} />
      </section>

      <section className="mt-6">
        <h3 className="text-[18px] font-extrabold tracking-[-0.02em]">O que tem no lugar</h3>
        <p className="mt-1 text-[14px] text-[var(--leve)]">Marque só o que existe de verdade. Vira filtro na busca.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {COMODIDADES.map(([id, nome, ic]) => {
            const on = (b.amenities || []).includes(id)
            return <button key={id} type="button" onClick={() => setB(v => ({ ...v, amenities: on ? (v.amenities || []).filter(x => x !== id) : [...(v.amenities || []), id] }))} aria-pressed={on} className="chip"><Icon name={ic} size={15} />{nome}</button>
          })}
        </div>
      </section>

      <section className="mt-6">
        <h3 className="text-[18px] font-extrabold tracking-[-0.02em]">Contato e endereço</h3>
        {[['whatsapp', 'WhatsApp com DDD', 'tel'], ['phone', 'Telefone', 'tel'], ['phone2', 'Outro telefone', 'tel'], ['instagram', 'Instagram (@)', 'text'], ['website', 'Site', 'url'], ['email', 'E-mail', 'email'], ['address', 'Endereço', 'text']].map(([k, r, t]) => (
          <div key={k} className="mt-3"><label className="block text-[15px] font-bold" htmlFor={'c' + k}>{r}</label><input id={'c' + k} type={t} value={b[k] || ''} onChange={set(k)} className={campo} /></div>
        ))}
      </section>

      <Fotos b={b} fotos={fotos} setFotos={setFotos} />
      <OfertasDono b={b} />

      <button onClick={salvar} disabled={estado === 'salvando'} className="botao botao-pri mt-8 h-14 w-full text-[17px]">
        {estado === 'salvando' ? <Loader2 size={18} className="animate-spin" /> : estado === 'ok' ? <><Check size={18} />Salvo</> : 'Salvar alterações'}
      </button>
      {estado === 'erro' && <p className="mt-2 text-[15px] font-semibold text-[var(--sos)]">Não foi possível salvar. Tente de novo.</p>}
      <p className="mt-3 text-[14px] text-[var(--leve)]">Nome, categoria e plano são alterados pelo guia: fale com a gente pelo WhatsApp.</p>
    </div>
  )
}

function TrocarSenha() {
  const [s, setS] = useState(''); const [msg, setMsg] = useState('')
  async function trocar(e) {
    e.preventDefault()
    if (s.length < 8) { setMsg('Use pelo menos 8 caracteres.'); return }
    const { error } = await supabase.auth.updateUser({ password: s })
    setMsg(error ? 'Não foi possível trocar.' : 'Senha trocada.'); if (!error) setS('')
  }
  return (
    <form onSubmit={trocar} className="mx-5 mt-8 rounded-[var(--raio)] bg-[var(--papel)] p-5">
      <h3 className="flex items-center gap-2 text-[18px] font-extrabold tracking-[-0.02em]"><KeyRound size={18} />Trocar senha</h3>
      <input type="password" autoComplete="new-password" value={s} onChange={e => setS(e.target.value)} placeholder="Nova senha" className={campo} />
      {msg && <p className="mt-2 text-[14px] font-semibold">{msg}</p>}
      <button className="botao botao-sec mt-3 w-full">Salvar nova senha</button>
    </form>
  )
}

/** Área do dono: edita o próprio lugar e acompanha os contatos que recebeu. */
export function MeuNegocio() {
  const { carregando, user } = useSessao()
  const [meus, setMeus] = useState(null)
  const [ativo, setAtivo] = useState(null)
  useEffect(() => {
    if (!user) { setMeus(null); setAtivo(null); return }
    supabase.from('business_owners').select('business_id, businesses(id,slug,name,description,category,subcategory,address,city,phone,phone2,whatsapp,email,instagram,website,hours,open_24h,amenities)').eq('user_id', user.id)
      .then(({ data }) => { const l = (data || []).map(x => x.businesses).filter(Boolean); setMeus(l); setAtivo(l[0] || null) })
  }, [user])

  return (
    <Layout title="Meu negócio" subtitle={user ? user.email : 'Área do responsável'} showBack>
      {carregando ? <div className="esqueleto mx-5 h-40 rounded-[var(--raio)]" /> : !user ? <Entrar /> : meus === null ? <div className="esqueleto mx-5 h-40 rounded-[var(--raio)]" /> : meus.length === 0 ? (
        <div className="mx-5 rounded-[var(--raio)] bg-[var(--papel)] p-5">
          <p className="text-[17px] font-bold">Nenhum negócio ligado a esta conta ainda.</p>
          <p className="mt-2 text-[15px] leading-relaxed text-[var(--leve)]">Se você acabou de ser aprovado, saia e entre de novo. Se ainda não pediu, vá em <Link to="/anuncie#meu-negocio" className="font-bold text-[var(--musgo)] underline underline-offset-4">Este negócio é meu</Link>.</p>
          <button onClick={() => supabase.auth.signOut()} className="botao botao-sec mt-4 w-full"><LogOut size={17} />Sair</button>
        </div>
      ) : (
        <>
          {meus.length > 1 && (
            <div className="flex gap-2 overflow-x-auto px-5 pb-4 scrollbar-hide">
              {meus.map(m => <button key={m.id} onClick={() => setAtivo(m)} aria-pressed={ativo?.id === m.id} className="chip"><Store size={15} />{m.name}</button>)}
            </div>
          )}
          {ativo && <Editor key={ativo.id} negocio={ativo} />}
          <TrocarSenha />
          <button onClick={() => supabase.auth.signOut()} className="mx-5 mt-4 flex min-h-12 items-center gap-2 text-[15px] font-bold text-[var(--leve)]"><LogOut size={17} />Sair</button>
        </>
      )}
    </Layout>
  )
}
