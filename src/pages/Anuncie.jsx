import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Check, ArrowRight, Search, Loader2, MessageCircle, BarChart3, MousePointerClick, Route, BadgeCheck } from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { supabase } from '../lib/supabase'
import { useBusinesses } from '../hooks/useBusinesses'
import { norm } from '../lib/busca'
import { FOTOS } from '../data/fotos'
import { registrar } from '../lib/track'

const FUNCAO = 'https://cpoxykaksqlrqnstjonv.supabase.co/functions/v1/checkout'
const FUNCAO_REIV = 'https://cpoxykaksqlrqnstjonv.supabase.co/functions/v1/reivindicar'
const GRATIS = { id: 'free', nome: 'Grátis', preco: 0, beneficios: ['Página com endereço, telefone, WhatsApp e rota', 'Selo “aberto agora” pelo seu horário', 'Aparece na busca e no mapa'] }
const reais = v => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })

function usePlanos() {
  const [planos, setPlanos] = useState(null)
  useEffect(() => {
    supabase.from('planos').select('id,nome,preco,dias,beneficios,ordem').eq('ativo', true).order('ordem')
      .then(({ data }) => setPlanos(data?.length ? data : [
        { id: 'destaque', nome: 'Destaque', preco: 49, dias: 30, beneficios: [] },
        { id: 'premium', nome: 'Parceiro', preco: 129, dias: 30, beneficios: [] },
      ]))
  }, [])
  return planos
}

/** Escolha do próprio negócio na lista (ou nome novo, se ainda não estiver no guia). */
export function EscolheNegocio({ valor, onChange }) {
  const { businesses } = useBusinesses({})
  const [q, setQ] = useState(valor?.name || '')
  const [aberto, setAberto] = useState(false)
  const achados = useMemo(() => {
    const t = norm(q)
    if (t.length < 2) return []
    return businesses.filter(b => norm(b.name).includes(t) && b.category !== 'emergencia').slice(0, 6)
  }, [q, businesses])
  return (
    <div className="relative">
      <label className="block text-[15px] font-bold" htmlFor="neg">Nome do seu negócio</label>
      <div className="relative mt-1.5">
        <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--leve)]" />
        <input id="neg" value={q} autoComplete="off" required minLength={2}
          onChange={e => { setQ(e.target.value); setAberto(true); onChange({ id: null, name: e.target.value }) }}
          onFocus={() => setAberto(true)} onBlur={() => setTimeout(() => setAberto(false), 150)}
          placeholder="Comece a digitar" className="h-13 w-full rounded-2xl bg-[var(--nevoa)] py-3.5 pl-11 pr-4 text-[16px]" />
      </div>
      {valor?.id && <p className="mt-1.5 flex items-center gap-1.5 text-[14px] font-semibold text-[var(--musgo)]"><Check size={15} />Já está no guia: o plano entra nesta página</p>}
      {aberto && achados.length > 0 && !valor?.id && (
        <ul className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-2xl bg-white py-1" style={{ boxShadow: '0 16px 40px -12px rgba(18,26,21,.35)' }}>
          {achados.map(b => (
            <li key={b.id}>
              <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => { onChange({ id: b.id, name: b.name }); setQ(b.name); setAberto(false) }}
                className="w-full px-4 py-2.5 text-left text-[15px] hover:bg-[var(--nevoa)]">
                <span className="font-bold">{b.name}</span><span className="text-[var(--leve)]"> · {b.address || b.city}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Pedido({ plano, onFechar }) {
  const [neg, setNeg] = useState({ id: null, name: '' })
  const [f, setF] = useState({ contato_nome: '', contato_whatsapp: '', contato_email: '', site_url: '' })
  const [estado, setEstado] = useState('') // '', enviando, recebido, erro
  const [msg, setMsg] = useState('')
  const set = k => e => setF(v => ({ ...v, [k]: e.target.value }))

  async function enviar(e) {
    e.preventDefault()
    setEstado('enviando'); setMsg('')
    try {
      const r = await fetch(FUNCAO, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...f, plano: plano.id, business_id: neg.id, nome_negocio: neg.name }) })
      const d = await r.json()
      if (!r.ok) throw new Error(d.erro || 'Não foi possível enviar.')
      registrar('lead', { term: `plano:${plano.id}` })
      if (d.checkout) { window.location.href = d.checkout; return }
      setEstado('recebido')
    } catch (err) { setEstado('erro'); setMsg(err.message) }
  }

  if (estado === 'recebido') {
    return (
      <div className="rounded-[var(--raio)] bg-[var(--papel)] p-6">
        <h3 className="text-[24px] font-extrabold tracking-[-0.03em]">Pedido recebido</h3>
        <p className="mt-2 text-[16px] leading-relaxed text-[var(--leve)]">O pagamento online entra no ar nos próximos dias. Vamos te chamar no WhatsApp para ativar o plano {plano.nome} agora mesmo.</p>
        <button onClick={onFechar} className="botao botao-sec mt-5 w-full">Voltar aos planos</button>
      </div>
    )
  }

  return (
    <form onSubmit={enviar} className="rounded-[var(--raio)] bg-[var(--papel)] p-5">
      <div className="flex items-baseline justify-between">
        <h3 className="text-[24px] font-extrabold tracking-[-0.03em]">Plano {plano.nome}</h3>
        <span className="num text-[18px] font-bold">{reais(plano.preco)}<span className="text-[14px] font-medium text-[var(--leve)]">/mês</span></span>
      </div>
      <div className="mt-5 space-y-4">
        <EscolheNegocio valor={neg} onChange={setNeg} />
        <div>
          <label className="block text-[15px] font-bold" htmlFor="cn">Seu nome</label>
          <input id="cn" value={f.contato_nome} onChange={set('contato_nome')} autoComplete="name" className="mt-1.5 w-full rounded-2xl bg-[var(--nevoa)] px-4 py-3.5 text-[16px]" />
        </div>
        <div>
          <label className="block text-[15px] font-bold" htmlFor="cw">WhatsApp com DDD</label>
          <input id="cw" value={f.contato_whatsapp} onChange={set('contato_whatsapp')} required inputMode="tel" autoComplete="tel" placeholder="(35) 9 9999-9999" className="mt-1.5 w-full rounded-2xl bg-[var(--nevoa)] px-4 py-3.5 text-[16px]" />
        </div>
        <div>
          <label className="block text-[15px] font-bold" htmlFor="ce">E-mail para o recibo</label>
          <input id="ce" type="email" value={f.contato_email} onChange={set('contato_email')} autoComplete="email" className="mt-1.5 w-full rounded-2xl bg-[var(--nevoa)] px-4 py-3.5 text-[16px]" />
        </div>
        <input tabIndex={-1} aria-hidden="true" value={f.site_url} onChange={set('site_url')} className="absolute -left-[9999px] h-0 w-0" />
      </div>
      {msg && <p className="mt-4 text-[15px] font-semibold text-[var(--sos)]" role="alert">{msg}</p>}
      <button disabled={estado === 'enviando'} className="botao botao-pri mt-5 h-14 w-full text-[17px]">
        {estado === 'enviando' ? <><Loader2 size={18} className="animate-spin" />Abrindo pagamento…</> : <>Pagar com Pix ou cartão <ArrowRight size={18} /></>}
      </button>
      <p className="mt-3 text-center text-[14px] text-[var(--leve)]">Pagamento seguro pelo Mercado Pago. Vale {plano.dias} dias, sem fidelidade.</p>
      <button type="button" onClick={onFechar} className="mt-2 w-full py-2 text-[15px] font-semibold text-[var(--leve)]">Escolher outro plano</button>
    </form>
  )
}

/** "Este negócio é meu": pedido de acesso do dono, com código de confirmação e consulta de CNPJ. */
function ReivindicarNegocio() {
  const [neg, setNeg] = useState({ id: null, name: '' })
  const [f, setF] = useState({ nome_contato: '', whatsapp: '', email: '', cnpj: '', site_url: '' })
  const [estado, setEstado] = useState('')
  const [msg, setMsg] = useState('')
  const [res, setRes] = useState(null)
  const set = k => e => setF(v => ({ ...v, [k]: e.target.value }))
  const campo = 'mt-1.5 w-full rounded-2xl bg-[var(--nevoa)] px-4 py-3.5 text-[16px]'

  async function enviar(e) {
    e.preventDefault()
    if (!neg.id) { setMsg('Escolha seu negócio na lista. Se ele não aparece, use o cadastro grátis acima.'); return }
    setEstado('enviando'); setMsg('')
    try {
      const r = await fetch(FUNCAO_REIV, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...f, business_id: neg.id }) })
      const d = await r.json()
      if (!r.ok) throw new Error(d.erro || 'Não foi possível enviar.')
      registrar('lead', { term: 'reivindicacao', businessId: neg.id })
      setRes(d); setEstado('ok')
    } catch (err) { setEstado('erro'); setMsg(err.message) }
  }

  if (estado === 'ok' && res) {
    const texto = `Código ${res.codigo} — sou responsável por ${res.negocio} no Monte Verde MG.`
    return (
      <section className="px-5 pt-12" id="meu-negocio" style={{ scrollMarginTop: 16 }}>
        <div className="rounded-[var(--raio)] bg-[var(--araucaria)] p-6 text-white">
          <h2 className="titulo">Falta só confirmar</h2>
          <p className="mt-3 text-[16px] leading-relaxed text-white/85">Seu código de confirmação:</p>
          <p className="num mt-1 text-[44px] font-extrabold tracking-[0.08em] text-[var(--broto)]">{res.codigo}</p>
          {res.whatsapp_guia ? (
            <>
              <p className="mt-3 text-[16px] leading-relaxed text-white/85">Mande este código <b className="text-white">pelo WhatsApp do seu negócio</b> (o número que está no guia). É assim que confirmamos que você é o responsável.</p>
              <a href={`https://wa.me/${res.whatsapp_guia}?text=${encodeURIComponent(texto)}`} target="_blank" rel="noopener noreferrer" className="botao botao-broto mt-5 w-full"><MessageCircle size={18} />Enviar código pelo WhatsApp</a>
            </>
          ) : (
            <p className="mt-3 text-[16px] leading-relaxed text-white/85">Vamos chamar no WhatsApp cadastrado do negócio e pedir este código. Guarde-o.</p>
          )}
          {res.cnpj && (
            <p className="mt-4 text-[14px] leading-relaxed text-white/70">
              CNPJ consultado: {res.cnpj.nome || 'sem retorno'}{res.cnpj.situacao ? ` · ${res.cnpj.situacao}` : ''}{res.cnpj.confere === true ? ' · nome confere' : res.cnpj.confere === false ? ' · nome não confere com o cadastro, vamos conferir manualmente' : ''}
            </p>
          )}
          <p className="mt-4 text-[14px] leading-relaxed text-white/70">Depois da confirmação você recebe o acesso por WhatsApp e passa a editar horário, fotos e contatos em <b className="text-white">Meu negócio</b>.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="px-5 pt-12" id="meu-negocio" style={{ scrollMarginTop: 16 }}>
      <h2 className="titulo flex items-center gap-2"><BadgeCheck size={30} className="text-[var(--musgo)]" />Este negócio é meu</h2>
      <p className="mt-3 text-[16px] leading-relaxed text-[var(--leve)]">Já está no guia? Confirme que é o responsável e edite horário, fotos, descrição e contatos quando quiser. Verificação por código no WhatsApp do negócio e, se quiser, pelo CNPJ.</p>
      <form onSubmit={enviar} className="mt-5 rounded-[var(--raio)] bg-[var(--papel)] p-5">
        <div className="space-y-4">
          <EscolheNegocio valor={neg} onChange={setNeg} />
          <div><label className="block text-[15px] font-bold" htmlFor="rn">Seu nome</label><input id="rn" required value={f.nome_contato} onChange={set('nome_contato')} autoComplete="name" className={campo} /></div>
          <div><label className="block text-[15px] font-bold" htmlFor="rw">Seu WhatsApp com DDD</label><input id="rw" required inputMode="tel" autoComplete="tel" value={f.whatsapp} onChange={set('whatsapp')} placeholder="(35) 9 9999-9999" className={campo} /></div>
          <div><label className="block text-[15px] font-bold" htmlFor="re">E-mail (será seu login)</label><input id="re" type="email" required autoComplete="email" value={f.email} onChange={set('email')} className={campo} /></div>
          <div><label className="block text-[15px] font-bold" htmlFor="rc">CNPJ <span className="font-medium text-[var(--leve)]">(opcional, acelera a verificação)</span></label><input id="rc" inputMode="numeric" value={f.cnpj} onChange={set('cnpj')} placeholder="00.000.000/0001-00" className={campo} /></div>
          <input tabIndex={-1} aria-hidden="true" value={f.site_url} onChange={set('site_url')} className="absolute -left-[9999px] h-0 w-0" />
        </div>
        {msg && <p className="mt-4 text-[15px] font-semibold text-[var(--sos)]" role="alert">{msg}</p>}
        <button disabled={estado === 'enviando'} className="botao botao-pri mt-5 h-14 w-full text-[17px]">
          {estado === 'enviando' ? <><Loader2 size={18} className="animate-spin" />Enviando…</> : <>Pedir acesso <ArrowRight size={18} /></>}
        </button>
        <p className="mt-3 text-[14px] text-[var(--leve)]">Já tem acesso? <Link to="/meu-negocio" className="font-bold text-[var(--musgo)] underline underline-offset-4">Entrar em Meu negócio</Link>.</p>
      </form>
    </section>
  )
}

const MOTIVOS = [
  [MousePointerClick, 'Na hora da decisão', 'O turista abre o guia quando já está na vila, procurando onde comer, dormir ou passear agora.'],
  [Route, 'Dentro do roteiro', 'Planos pagos entram nas sugestões do roteiro montado para cada visitante.'],
  [MessageCircle, 'Direto no seu WhatsApp', 'Um toque e o cliente fala com você, já dizendo que veio pelo Monte Verde MG.'],
  [BarChart3, 'Você vê o resultado', 'Relatório de visitas, ligações, WhatsApp e rotas para o seu negócio.'],
]

export function Anuncie() {
  const planos = usePlanos()
  const [escolhido, setEscolhido] = useState(null)
  const todos = planos ? [GRATIS, ...planos] : null

  return (
    <Layout title="Anuncie" showBack hideHeader>
      <section className="relative">
        <img src={FOTOS.avenida.g} srcSet={`${FOTOS.avenida.p} 700w, ${FOTOS.avenida.g} 1600w`} sizes="480px" alt={FOTOS.avenida.legenda} className="h-[56svh] min-h-[380px] w-full object-cover" />
        <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(10,14,12,.5) 0%, rgba(10,14,12,0) 35%, rgba(10,14,12,.75) 100%)' }} />
        <Link to="/" className="pressiona absolute left-5 flex h-11 items-center rounded-full bg-white px-4 text-[15px] font-bold text-[var(--araucaria)]" style={{ top: 'calc(env(safe-area-inset-top) + 16px)' }}>Monte Verde</Link>
        <h1 className="sobe titulo absolute bottom-6 left-5 right-5 text-white">Seja encontrado por quem já está na vila</h1>
      </section>

      <section className="bg-[var(--araucaria)] px-5 pb-12 pt-8 text-white">
        <p className="lead max-w-[30ch]">Cadastro grátis para todo comércio de Monte Verde. Quer aparecer primeiro? Escolha um plano e ele entra no ar assim que o pagamento é aprovado.</p>
        <ul className="mt-8 space-y-6">
          {MOTIVOS.map(([I, t, d], k) => (
            <li key={t} className="revela flex gap-4" style={{ '--i': k }}>
              <I size={24} className="mt-0.5 shrink-0 text-[var(--broto)]" />
              <div><h2 className="text-[19px] font-extrabold tracking-[-0.02em]">{t}</h2><p className="mt-1 text-[16px] leading-relaxed text-white/80">{d}</p></div>
            </li>
          ))}
        </ul>
      </section>

      <ReivindicarNegocio />

      <section className="px-5 pt-12" id="planos" style={{ scrollMarginTop: 16 }}>
        <h2 className="titulo">Planos</h2>
        {escolhido ? (
          <div className="mt-6 entra"><Pedido plano={escolhido} onFechar={() => setEscolhido(null)} /></div>
        ) : !todos ? (
          <div className="mt-6 space-y-3">{[0, 1, 2].map(i => <div key={i} className="esqueleto h-48 rounded-[var(--raio)]" />)}</div>
        ) : (
          <div className="mt-6 space-y-3">
            {todos.map((p, k) => {
              const forte = p.id === 'premium'
              return (
                <article key={p.id} className={`entra rounded-[var(--raio)] p-6 ${forte ? 'bg-[var(--musgo)] text-white' : 'bg-[var(--papel)]'}`} style={{ '--i': k }}>
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-[26px] font-extrabold tracking-[-0.03em]">{p.nome}</h3>
                    <p className="num text-[30px] font-extrabold tracking-[-0.03em]">{p.preco ? reais(p.preco) : 'R$ 0'}<span className={`text-[15px] font-medium ${forte ? 'text-white/85' : 'text-[var(--leve)]'}`}>{p.preco ? '/mês' : ''}</span></p>
                  </div>
                  {forte && <p className="mt-1 text-[15px] font-bold text-[var(--broto)]">O mais visto da vila</p>}
                  <ul className="mt-4 space-y-2.5">
                    {(p.beneficios || []).map(t => (
                      <li key={t} className="flex gap-2.5 text-[16px] leading-snug"><Check size={18} className={`mt-0.5 shrink-0 ${forte ? 'text-[var(--broto)]' : 'text-[var(--musgo)]'}`} />{t}</li>
                    ))}
                  </ul>
                  {p.id === 'free' ? (
                    <Link to="/mais#cadastro" className="botao botao-sec mt-6 w-full">Cadastrar grátis</Link>
                  ) : (
                    <button onClick={() => setEscolhido(p)} className={`botao mt-6 w-full ${forte ? 'botao-claro' : 'botao-pri'}`}>Quero o {p.nome} <ArrowRight size={18} /></button>
                  )}
                </article>
              )
            })}
          </div>
        )}
        <p className="mt-5 text-[15px] leading-relaxed text-[var(--leve)]">Planos pagos aparecem sempre identificados como Destaque ou Parceiro. Cancelar é só não renovar: no fim do período, a página volta ao plano grátis.</p>
      </section>
    </Layout>
  )
}

/** Volta do Mercado Pago: mostra se o plano já foi ativado. */
export function AnuncieObrigado() {
  const [params] = useSearchParams()
  const id = params.get('id')
  const [d, setD] = useState(null)
  useEffect(() => {
    if (!id) return
    let n = 0, t
    const busca = async () => {
      const r = await fetch(`${FUNCAO}?status=${id}`).then(x => x.json()).catch(() => null)
      setD(r)
      if (r?.status === 'pendente' && n++ < 20) t = setTimeout(busca, 3000)
    }
    busca()
    return () => clearTimeout(t)
  }, [id])
  const aprovado = d?.status === 'aprovado'
  return (
    <Layout title="Pagamento" showBack>
      <div className="px-5 pt-4">
        <div className={`rounded-[var(--raio)] p-6 ${aprovado ? 'bg-[var(--musgo)] text-white' : 'bg-[var(--papel)]'}`}>
          <h2 className="titulo">{aprovado ? 'Plano ativo!' : d?.status === 'recusado' ? 'Pagamento não aprovado' : 'Confirmando o pagamento…'}</h2>
          <p className={`mt-3 text-[16px] leading-relaxed ${aprovado ? 'text-white/85' : 'text-[var(--leve)]'}`}>
            {aprovado
              ? `${d.nome_negocio} já aparece em destaque no guia${d.vigente_ate ? ` até ${new Date(d.vigente_ate).toLocaleDateString('pt-BR')}` : ''}.`
              : d?.status === 'recusado' ? 'Tente de novo com outro meio de pagamento.' : 'Pix costuma confirmar em segundos. Pode fechar esta tela: o plano ativa sozinho assim que o pagamento for aprovado.'}
          </p>
          <Link to={d?.status === 'recusado' ? '/anuncie#planos' : '/'} className={`botao mt-6 w-full ${aprovado ? 'botao-claro' : 'botao-pri'}`}>{d?.status === 'recusado' ? 'Tentar de novo' : 'Ir para o guia'}</Link>
        </div>
      </div>
    </Layout>
  )
}
