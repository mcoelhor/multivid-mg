import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Store, LogOut, Loader2, Check, Camera, Trash2, Eye, Phone, MessageCircle, KeyRound, Ticket, Plus, Mail, Search, Clock } from 'lucide-react'
import { Autocadastro } from '../components/Autocadastro'
import { Reivindicar, CodigoConfirmacao } from '../components/Reivindicar'
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
const FOTOS_URL = 'https://isotmggdbtqlyvddxmpe.supabase.co/storage/v1/object/public/fotos/'

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

const ORIGEM = () => location.origin

/** Entrada da área do dono. Primeiro acesso: só o e-mail, chega um link, confirma e cria a senha. */
function Entrar() {
  const [modo, setModo] = useState('novo') // novo | senha | enviado
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [codigo, setCodigo] = useState('')
  const [msg, setMsg] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [espera, setEspera] = useState(0)
  useEffect(() => { if (espera <= 0) return; const t = setTimeout(() => setEspera(espera - 1), 1000); return () => clearTimeout(t) }, [espera])
  const mail = email.trim().toLowerCase()

  async function mandarLink(e) {
    e?.preventDefault(); setMsg('')
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)) { setMsg('Confira o e-mail.'); return }
    setEnviando(true)
    const { error } = await supabase.auth.signInWithOtp({ email: mail, options: { shouldCreateUser: true, emailRedirectTo: `${ORIGEM()}/meu-negocio?nova=1` } })
    setEnviando(false)
    if (error) { setMsg(/rate|seconds|limit/i.test(error.message) ? 'Aguarde um minuto e peça de novo.' : 'Não foi possível enviar o e-mail agora. Tente de novo em instantes.'); return }
    setModo('enviado'); setEspera(60)
  }
  async function entrarComSenha(e) {
    e.preventDefault(); setMsg(''); setEnviando(true)
    const { error } = await supabase.auth.signInWithPassword({ email: mail, password: senha })
    if (error) setMsg('E-mail ou senha incorretos. Primeira vez aqui? Use “Criar conta”.')
    setEnviando(false)
  }
  async function confirmarCodigo(e) {
    e.preventDefault(); setMsg(''); setEnviando(true)
    const { error } = await supabase.auth.verifyOtp({ email: mail, token: codigo.replace(/\D/g, ''), type: 'email' })
    if (error) setMsg('Código inválido ou vencido. Peça um novo link.')
    else { const u = new URL(location.href); u.searchParams.set('nova', '1'); history.replaceState(null, '', u) }
    setEnviando(false)
  }

  if (modo === 'enviado') {
    return (
      <div className="mx-5 rounded-[var(--raio)] bg-[var(--papel)] p-5">
        <p className="flex items-center gap-2 text-[20px] font-extrabold tracking-[-0.02em]"><Mail size={22} className="text-[var(--musgo)]" />Confira seu e-mail</p>
        <p className="mt-2 text-[16px] leading-relaxed text-[var(--leve)]">Mandamos um link para <b className="text-[var(--araucaria)]">{mail}</b>. Abra o e-mail <b className="text-[var(--araucaria)]">neste celular</b> e toque no link: você volta para cá e cria sua senha.</p>
        <p className="mt-2 text-[14px] leading-relaxed text-[var(--leve)]">Não chegou? Olhe no spam ou em Promoções.</p>
        <form onSubmit={confirmarCodigo} className="mt-5 border-t border-[var(--nevoa-2)] pt-4">
          <label className="block text-[15px] font-bold" htmlFor="oc">O e-mail trouxe um código? <span className="font-medium text-[var(--leve)]">(opcional)</span></label>
          <div className="mt-1.5 flex gap-2">
            <input id="oc" inputMode="numeric" autoComplete="one-time-code" maxLength={8} value={codigo} onChange={e => setCodigo(e.target.value)} placeholder="000000" className="num min-w-0 flex-1 rounded-2xl bg-[var(--nevoa)] px-4 py-3 text-[18px] tracking-[0.2em]" />
            <button disabled={enviando || codigo.replace(/\D/g, '').length < 6} className="botao botao-pri px-5">Confirmar</button>
          </div>
        </form>
        {msg && <p className="mt-3 text-[15px] font-semibold text-[var(--sos)]" role="alert">{msg}</p>}
        <div className="mt-4 flex flex-wrap gap-x-5">
          <button onClick={() => mandarLink()} disabled={espera > 0 || enviando} className="min-h-11 text-[15px] font-bold text-[var(--musgo)] disabled:text-[var(--leve)]">{espera > 0 ? `Reenviar em ${espera}s` : 'Reenviar link'}</button>
          <button onClick={() => { setModo('novo'); setMsg('') }} className="min-h-11 text-[15px] font-bold text-[var(--leve)]">Trocar e-mail</button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-5">
      <div className="mb-4 grid grid-cols-2 gap-1 rounded-full bg-[var(--nevoa-2)] p-1" role="tablist">
        {[['novo', 'Criar conta'], ['senha', 'Já tenho senha']].map(([m, t]) => (
          <button key={m} role="tab" aria-selected={modo === m} onClick={() => { setModo(m); setMsg('') }} className={`min-h-11 rounded-full text-[15px] font-bold transition-colors duration-150 ${modo === m ? 'bg-white text-[var(--araucaria)]' : 'text-[var(--leve)]'}`}>{t}</button>
        ))}
      </div>
      {modo === 'novo' ? (
        <form onSubmit={mandarLink} className="rounded-[var(--raio)] bg-[var(--papel)] p-5" noValidate>
          <p className="text-[16px] leading-relaxed text-[var(--leve)]">Para cadastrar seu negócio ou assumir a página que já está no guia. Grátis.</p>
          <ol className="mt-3 space-y-1 text-[15px] leading-snug">
            {['Coloque seu e-mail', 'Toque no link que chega no e-mail', 'Crie sua senha e cadastre o negócio'].map((t, k) => <li key={t} className="flex gap-2"><span className="num w-5 shrink-0 font-extrabold text-[var(--musgo)]">{k + 1}</span>{t}</li>)}
          </ol>
          <div className="mt-4"><label className="block text-[15px] font-bold" htmlFor="ne">E-mail</label><input id="ne" type="email" required autoComplete="email" inputMode="email" value={email} onChange={e => setEmail(e.target.value)} className={campo} /></div>
          {msg && <p className="mt-3 text-[15px] font-semibold text-[var(--sos)]" role="alert">{msg}</p>}
          <button disabled={enviando} className="botao botao-pri mt-5 h-14 w-full text-[17px]">{enviando ? <Loader2 size={18} className="animate-spin" /> : 'Receber link no e-mail'}</button>
        </form>
      ) : (
        <form onSubmit={entrarComSenha} className="rounded-[var(--raio)] bg-[var(--papel)] p-5">
          <div><label className="block text-[15px] font-bold" htmlFor="le">E-mail</label><input id="le" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className={campo} /></div>
          <div className="mt-4"><label className="block text-[15px] font-bold" htmlFor="ls">Senha</label><input id="ls" type="password" required autoComplete="current-password" value={senha} onChange={e => setSenha(e.target.value)} className={campo} /></div>
          {msg && <p className="mt-3 text-[15px] font-semibold text-[var(--sos)]" role="alert">{msg}</p>}
          <button disabled={enviando} className="botao botao-pri mt-5 h-14 w-full text-[17px]">{enviando ? <Loader2 size={18} className="animate-spin" /> : 'Entrar'}</button>
          <button type="button" onClick={() => mandarLink()} className="mt-3 min-h-11 w-full text-[15px] font-bold text-[var(--musgo)]">Esqueci a senha: mandar link</button>
        </form>
      )}
    </div>
  )
}

/** Depois do link: o dono cria a senha (ou uma nova, se esqueceu). */
function CriarSenha({ user, onPronto }) {
  const [s, setS] = useState(''); const [s2, setS2] = useState('')
  const [msg, setMsg] = useState(''); const [enviando, setEnviando] = useState(false)
  async function salvar(e) {
    e.preventDefault(); setMsg('')
    if (s.length < 8) { setMsg('Use pelo menos 8 caracteres.'); return }
    if (s !== s2) { setMsg('As duas senhas não são iguais.'); return }
    setEnviando(true)
    const { error } = await supabase.auth.updateUser({ password: s, data: { senha_definida: true } })
    setEnviando(false)
    if (error) { setMsg(/different|same/i.test(error.message) ? 'Use uma senha diferente da anterior.' : 'Não foi possível salvar. Tente de novo.'); return }
    onPronto()
  }
  return (
    <form onSubmit={salvar} className="mx-5 rounded-[var(--raio)] bg-[var(--papel)] p-5">
      <p className="flex items-center gap-2 text-[20px] font-extrabold tracking-[-0.02em]"><Check size={22} className="text-[var(--musgo)]" />E-mail confirmado</p>
      <p className="mt-1 text-[16px] leading-relaxed text-[var(--leve)]">Agora crie a senha para entrar com <b className="text-[var(--araucaria)]">{user.email}</b>.</p>
      <div className="mt-4"><label className="block text-[15px] font-bold" htmlFor="ns">Senha <span className="font-medium text-[var(--leve)]">(mínimo 8 caracteres)</span></label><input id="ns" type="password" required autoComplete="new-password" value={s} onChange={e => setS(e.target.value)} className={campo} /></div>
      <div className="mt-4"><label className="block text-[15px] font-bold" htmlFor="ns2">Repita a senha</label><input id="ns2" type="password" required autoComplete="new-password" value={s2} onChange={e => setS2(e.target.value)} className={campo} /></div>
      {msg && <p className="mt-3 text-[15px] font-semibold text-[var(--sos)]" role="alert">{msg}</p>}
      <button disabled={enviando} className="botao botao-pri mt-5 h-14 w-full text-[17px]">{enviando ? <Loader2 size={18} className="animate-spin" /> : 'Salvar senha e continuar'}</button>
    </form>
  )
}

/** Conta sem negócio (ou adicionando outro): já está no guia, ou ainda não está. */
function LigarNegocio({ pedidos, onMudou, onFechar }) {
  const [opcao, setOpcao] = useState('')
  const [resp, setResp] = useState(null)
  const pend = (pedidos || []).filter(p => p.status === 'pendente' && p.codigo !== resp?.codigo)
  return (
    <div className="px-5">
      {pend.map(p => <div key={p.id} className="mb-4"><CodigoConfirmacao codigo={p.codigo} negocio={p.businesses?.name || 'seu negócio'} whatsappGuia={p.whatsapp_guia} /></div>)}
      {resp ? (
        <CodigoConfirmacao codigo={resp.codigo} negocio={resp.negocio} whatsappGuia={resp.whatsapp_guia} />
      ) : (
        <>
          <h2 className="text-[22px] font-extrabold tracking-[-0.03em]">{pend.length ? 'Outro negócio?' : 'Qual é o seu negócio?'}</h2>
          <div className="mt-3 grid grid-cols-1 gap-2">
            {[['guia', 'Já está no guia', 'Assuma a página que já existe'], ['novo', 'Ainda não está no guia', 'Cadastro grátis, com fotos']].map(([id, t, d]) => (
              <button key={id} onClick={() => setOpcao(opcao === id ? '' : id)} aria-expanded={opcao === id} className={`pressiona flex items-center gap-3 rounded-[var(--raio)] p-4 text-left ${opcao === id ? 'bg-[var(--araucaria)] text-white' : 'bg-[var(--papel)]'}`}>
                {id === 'guia' ? <Search size={22} className="shrink-0" /> : <Plus size={22} className="shrink-0" />}
                <span className="flex-1"><span className="block text-[17px] font-bold leading-tight">{t}</span><span className={`block text-[14px] ${opcao === id ? 'text-white/75' : 'text-[var(--leve)]'}`}>{d}</span></span>
              </button>
            ))}
          </div>
          {opcao === 'guia' && <div className="entra mt-4"><Reivindicar onPedido={d => { setResp(d); onMudou(null) }} /></div>}
          {opcao === 'novo' && <div className="entra mt-4"><Autocadastro onPronto={d => onMudou(d?.id)} /></div>}
        </>
      )}
      {onFechar && <button onClick={onFechar} className="mt-4 min-h-11 text-[15px] font-bold text-[var(--leve)]">Voltar ao meu negócio</button>}
    </div>
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
      <h3 className="text-[18px] font-extrabold tracking-[-0.02em]">Fotos do seu negócio <span className="text-[14px] font-medium text-[var(--leve)]">({fotos.length} de 5)</span></h3>
      <p className="mt-1 text-[14px] text-[var(--leve)]">Só o dono pode pôr fotos. A primeira vira a capa; fotos de verdade, na horizontal, ficam melhores.</p>
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
        <p className="mt-3 text-[13px] text-white/60">Últimos 30 dias no guia.{b.status === 'active' && <> <Link to={`/estabelecimento/${b.slug}`} className="underline">Ver minha página</Link></>}</p>
      </div>
      {b.status !== 'active' && (
        <p className="mt-3 flex gap-2.5 rounded-[var(--raio)] bg-[var(--broto)] p-4 text-[15px] leading-snug"><Clock size={18} className="mt-0.5 shrink-0" /><span><b>Em análise.</b> Sua página entra no guia depois que conferirmos, normalmente em até 2 dias úteis. Já pode pôr as fotos e completar os dados.</span></p>
      )}

      <Fotos b={b} fotos={fotos} setFotos={setFotos} />

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

      {b.status === 'active' && <OfertasDono b={b} />}

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
    const { error } = await supabase.auth.updateUser({ password: s, data: { senha_definida: true } })
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

/** Área do dono: conta por e-mail, cadastro ou reivindicação do negócio, edição e fotos. */
export function MeuNegocio() {
  const { carregando, user } = useSessao()
  const [meus, setMeus] = useState(null)
  const [pedidos, setPedidos] = useState([])
  const [ativo, setAtivo] = useState(null)
  const [adicionando, setAdicionando] = useState(false)
  const [nova, setNova] = useState(() => new URLSearchParams(location.search).has('nova'))
  const [erroLink] = useState(() => /error_code|error=/.test(location.hash) ? 'Esse link venceu ou já foi usado. Peça um novo abaixo.' : '')

  const carregar = useCallback(async (abrirId = null) => {
    if (!user) return
    const [{ data: donos }, { data: peds }, { data: cfg }] = await Promise.all([
      supabase.from('business_owners').select('business_id, businesses(id,slug,name,status,description,category,subcategory,address,city,phone,phone2,whatsapp,email,instagram,website,hours,open_24h,amenities)').eq('user_id', user.id),
      supabase.from('reivindicacoes').select('id,status,codigo,business_id,criado_em,businesses(name)').eq('user_id', user.id).order('criado_em', { ascending: false }),
      supabase.from('config').select('valor').eq('chave', 'whatsapp_guia').maybeSingle(),
    ])
    const l = (donos || []).map(x => x.businesses).filter(Boolean)
    const wg = (cfg?.valor || '').replace(/\D/g, '')
    setMeus(l); setPedidos((peds || []).map(p => ({ ...p, whatsapp_guia: wg })))
    setAtivo(a => (abrirId && l.find(x => x.id === abrirId)) || (a && l.find(x => x.id === a.id)) || l[0] || null)
    if (abrirId) setAdicionando(false)
  }, [user])
  useEffect(() => { if (!user) { setMeus(null); setAtivo(null); setPedidos([]); return } carregar() }, [user, carregar])

  const precisaSenha = user && (nova || !user.user_metadata?.senha_definida)
  const fimSenha = () => { setNova(false); const u = new URL(location.href); u.searchParams.delete('nova'); u.hash = ''; history.replaceState(null, '', u) }
  const sair = () => supabase.auth.signOut()

  let conteudo
  if (carregando) conteudo = <div className="esqueleto mx-5 h-40 rounded-[var(--raio)]" />
  else if (!user) conteudo = <>{erroLink && <p className="mx-5 mb-3 rounded-2xl bg-[var(--papel)] p-4 text-[15px] font-semibold text-[var(--sos)]">{erroLink}</p>}<Entrar /></>
  else if (precisaSenha) conteudo = <CriarSenha user={user} onPronto={fimSenha} />
  else if (meus === null) conteudo = <div className="esqueleto mx-5 h-40 rounded-[var(--raio)]" />
  else if (meus.length === 0 || adicionando) conteudo = <LigarNegocio pedidos={pedidos} onMudou={carregar} onFechar={meus.length ? () => setAdicionando(false) : null} />
  else conteudo = (
    <>
      {meus.length > 1 && (
        <div className="flex gap-2 overflow-x-auto px-5 pb-4 scrollbar-hide">
          {meus.map(m => <button key={m.id} onClick={() => setAtivo(m)} aria-pressed={ativo?.id === m.id} className="chip"><Store size={15} />{m.name}</button>)}
        </div>
      )}
      {ativo && <Editor key={ativo.id} negocio={ativo} />}
      <button onClick={() => setAdicionando(true)} className="botao botao-sec mx-5 mt-8 w-[calc(100%-2.5rem)]"><Plus size={17} />Adicionar outro negócio</button>
      <TrocarSenha />
    </>
  )

  return (
    <Layout title="Meu negócio" subtitle={user ? user.email : 'Área do dono'} showBack>
      {conteudo}
      {user && <button onClick={sair} className="mx-5 mt-4 flex min-h-12 items-center gap-2 text-[15px] font-bold text-[var(--leve)]"><LogOut size={17} />Sair</button>}
    </Layout>
  )
}
