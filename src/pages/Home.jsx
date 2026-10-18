import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Search, ArrowRight, Route } from 'lucide-react'
import { Icon } from '../components/UI/Icon'
import { Layout } from '../components/Layout/Layout'
import { EventCard } from '../components/UI/EventCard'
import { StatusPill } from '../components/UI/Badge'
import { Parceiros } from '../components/Parceiros'
import { useBusinesses } from '../hooks/useBusinesses'
import { useEvents } from '../hooks/useEvents'
import { CATEGORIES } from '../data/categories'
import { FOTOS, FOTO_CATEGORIA } from '../data/fotos'
import { agoraMV, DIAS_NOME, DIAS, hhmm } from '../lib/horario'

const POSTER = [FOTOS.marDeNuvens, FOTOS.porDoSol, FOTOS.enxaimel, FOTOS.serra, FOTOS.ruaAraucaria]
const SO_AQUI = [
  [FOTOS.serelepe, 'Serelepes que descem das araucárias atrás de pinhão'],
  [FOTOS.samambaia, 'Samambaiaçus, as samambaias gigantes da Mata Atlântica'],
  [FOTOS.capela, 'Capelas de madeira e torres brancas'],
  [FOTOS.chale, 'Chalés de telhado alto, feitos para o frio'],
  [FOTOS.nuvensVale, 'Manhãs em que o vale vira um mar de nuvens'],
]
const MOMENTOS = [
  ['Dia de chuva', 'chuva'], ['Com crianças', 'criancas'], ['A dois', 'a-dois'],
  ['Aventura', 'aventura'], ['Depois que escurece', 'noite'], ['Com o cachorro', 'pet'],
]

function saudacao(min) {
  if (min < 300) return 'Boa madrugada'
  if (min < 720) return 'Bom dia'
  if (min < 1080) return 'Boa tarde'
  return 'Boa noite'
}

/** Pôster: o nome dividido nos cantos, as fotos da vila trocando por baixo. */
function Poster() {
  const [i, setI] = useState(0)
  const [prontas, setProntas] = useState(() => new Set([0]))
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    // A próxima foto só entra no DOM 1,5 s antes da troca: no load carrega uma foto só.
    const pre = setTimeout(() => setProntas(p => new Set(p).add((i + 1) % POSTER.length)), 3700)
    const t = setTimeout(() => setI((i + 1) % POSTER.length), 5200)
    return () => { clearTimeout(pre); clearTimeout(t) }
  }, [i])
  return (
    <section className="relative h-[60svh] min-h-[400px] overflow-hidden bg-[var(--araucaria)]" aria-label="Monte Verde">
      {POSTER.map((f, k) => prontas.has(k) && (
        <div key={f.id} className={`slide ${k === i ? 'on' : ''}`} aria-hidden={k !== i}>
          <img src={f.g} srcSet={`${f.p} 700w, ${f.g} 1600w`} sizes="480px" alt={f.legenda}
            className="deriva h-full w-full object-cover" fetchPriority={k === 0 ? 'high' : 'auto'} />
        </div>
      ))}
      <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(10,14,12,.55) 0%, rgba(10,14,12,0) 30%, rgba(10,14,12,0) 55%, rgba(10,14,12,.6) 100%)' }} />
      <h1 className="sr-only">Monte Verde, Minas Gerais</h1>
      <p className="sobe display absolute left-5 text-[length:var(--fs-poster)] text-white" style={{ top: 'calc(env(safe-area-inset-top) + 18px)', '--i': 0 }} aria-hidden="true">Monte</p>
      <p className="sobe display absolute bottom-5 right-5 text-[length:var(--fs-poster)] text-white" style={{ '--i': 1 }} aria-hidden="true">Verde</p>
      <p key={i} className="entra absolute left-5 max-w-[60%] text-[14px] leading-snug text-white/90" style={{ top: 'calc(env(safe-area-inset-top) + 18px + var(--fs-poster) * 0.95)' }}>{POSTER[i].legenda}</p>
      <Link to="/busca" aria-label="Buscar" className="pressiona absolute right-5 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[var(--araucaria)]" style={{ top: 'calc(env(safe-area-inset-top) + 26px)' }}>
        <Search size={19} />
      </Link>
    </section>
  )
}

// Chips de intenção mudam com a hora: de manhã café, à noite fondue e pizza.
function chipsDaHora(min) {
  if (min < 660) return [['Café da manhã', 'cafe da manha'], ['Trilha', 'trilha'], ['Mar de nuvens', 'mirante'], ['Farmácia', 'farmacia']]
  if (min < 900) return [['Almoço', 'almoco'], ['Comida mineira', 'mineira'], ['Aventura', 'aventura'], ['Com crianças', 'criancas']]
  if (min < 1080) return [['Café e chocolate', 'chocolate quente'], ['Lojinhas', 'lembranca'], ['Aventura', 'aventura'], ['Dia de chuva', 'chuva']]
  return [['Fondue', 'fondue'], ['Pizza', 'pizza'], ['Cervejaria', 'cervejaria'], ['A dois', 'a-dois']]
}

/** Logo abaixo do pôster: o agora e as quatro decisões da viagem, na primeira tela e meia. */
function Agora() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const a = agoraMV()
  const { businesses } = useBusinesses({})
  const abertos = businesses.filter(b => b.st.estado === 'aberto' || b.st.estado === 'plantao')
  const n = cat => abertos.filter(b => b.category === cat).length
  const ACOES = [
    ['Comer agora', `${n('alimentacao')} abertos`, '/categoria/alimentacao?aberto=1', 'Utensils'],
    ['Fazer hoje', `${businesses.filter(b => b.category === 'turismo').length} passeios`, '/categoria/turismo', 'Mountain'],
    ['Ficar', `${businesses.filter(b => b.category === 'hospedagem').length} pousadas`, '/categoria/hospedagem', 'BedDouble'],
    ['Úteis', 'farmácia, posto, caixa', '/uteis', 'LifeBuoy'],
  ]

  return (
    <section className="bg-[var(--araucaria)] px-5 pb-8 pt-6 text-white" aria-labelledby="h-agora">
      <p className="sobe text-[15px] text-white/75" style={{ '--i': 2 }}>
        {saudacao(a.min)}. {DIAS_NOME[DIAS[a.dia]]}, <span className="num">{hhmm(a.min)}</span> em Monte Verde.
      </p>
      <h2 id="h-agora" className="sobe mt-1 text-[26px] font-extrabold leading-tight tracking-[-0.03em]" style={{ '--i': 2 }}>
        {abertos.length ? <><span className="num">{abertos.length}</span> lugares abertos agora</> : 'O que você precisa agora?'}
      </h2>

      <div className="sobe mt-5 grid grid-cols-2 gap-2.5" style={{ '--i': 3 }}>
        {ACOES.map(([t, sub, to, ic]) => (
          <Link key={to} to={to} className="pressiona flex min-h-[92px] flex-col justify-between rounded-[var(--raio)] bg-white/10 p-4">
            <Icon name={ic} size={22} className="text-[var(--broto)]" />
            <span><span className="block text-[18px] font-extrabold leading-tight tracking-[-0.02em]">{t}</span><span className="block text-[13px] text-white/65">{sub}</span></span>
          </Link>
        ))}
      </div>

      <form onSubmit={e => { e.preventDefault(); if (q.trim()) navigate(`/busca?q=${encodeURIComponent(q.trim())}`) }} role="search"
        className="sobe mt-3 flex h-14 items-center gap-2 rounded-full bg-white pl-5 pr-1.5 text-[var(--araucaria)]" style={{ '--i': 4 }}>
        <Search size={18} className="shrink-0 text-[var(--leve)]" />
        <input type="search" enterKeyHint="search" value={q} onChange={e => setQ(e.target.value)} aria-label="O que você procura?"
          placeholder="fondue, farmácia, trilha…" className="min-w-0 flex-1 bg-transparent text-[16px] placeholder:text-[var(--leve)]" />
      </form>
      <div className="sobe -mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1 scrollbar-hide" style={{ '--i': 4 }}>
        {chipsDaHora(a.min).map(([t, termo]) => (
          <Link key={termo} to={`/busca?q=${encodeURIComponent(termo)}`} className="chip bg-white/10 text-white">{t}</Link>
        ))}
      </div>

      <Link to="/roteiro" className="sobe botao botao-broto mt-5 h-14 w-full justify-between px-6 text-[17px]" style={{ '--i': 5 }}>
        <span className="flex items-center gap-2.5"><Route size={20} />Montar meu roteiro</span><ArrowRight size={20} />
      </Link>
    </section>
  )
}

/** Convite ao roteiro: foto grande, cartão encostado embaixo. */
function ConviteRoteiro() {
  return (
    <section className="relative mt-16" aria-labelledby="h-roteiro">
      <div className="revela-foto relative h-[62svh] min-h-[420px] overflow-hidden">
        <img src={FOTOS.porDoSol.g} srcSet={`${FOTOS.porDoSol.p} 700w, ${FOTOS.porDoSol.g} 1600w`} sizes="480px" alt={FOTOS.porDoSol.legenda} loading="lazy" className="deriva h-full w-full object-cover" />
      </div>
      <div className="revela relative -mt-24 mx-5 rounded-[var(--raio)] bg-[var(--papel)] p-6">
        <h2 id="h-roteiro" className="titulo">Seu fim de semana, já montado</h2>
        <p className="mt-3 text-[16px] leading-relaxed text-[var(--leve)]">
          Diga quantos dias fica, com quem vem e do que gosta. Montamos manhã, almoço, tarde e jantar, priorizando quem tem horário confirmado para o dia. Depois é só trocar o que quiser.
        </p>
        <Link to="/roteiro" className="botao botao-pri mt-5 w-full">Montar em 30 segundos <ArrowRight size={18} /></Link>
      </div>
    </section>
  )
}

/** Frase fixa enquanto três fotos passam por ela. */
function FrasePresa() {
  return (
    <section className="relative mt-16 h-[210svh]" aria-label="Sobre Monte Verde">
      <div className="sticky top-0 z-10 flex h-[100svh] items-center px-5">
        <p className="max-w-[18ch] text-[24px] font-extrabold leading-[1.15] tracking-[-0.025em] text-[var(--araucaria)]">
          Um imigrante europeu, com saudade do frio, fundou aqui uma vila de montanha.
        </p>
      </div>
      <div className="absolute inset-0 pt-[55svh]">
        <img src={FOTOS.enxaimel.p} alt={FOTOS.enxaimel.legenda} loading="lazy" className="ml-auto mr-5 aspect-[4/5] w-[46%] object-cover" />
        <img src={FOTOS.ruaAraucaria.p} alt={FOTOS.ruaAraucaria.legenda} loading="lazy" className="ml-5 mt-[38svh] aspect-[4/5] w-[40%] object-cover" />
      </div>
    </section>
  )
}

/** Momentos: lista em um tamanho só, como um programa. */
function Momentos() {
  return (
    <section className="px-5 pt-14" aria-labelledby="h-momentos">
      <h2 id="h-momentos" className="titulo revela">Para cada momento da viagem</h2>
      <p className="revela mt-2 text-[15px] text-[var(--leve)]">Escolhas do guia, não anúncios.</p>
      <ul className="mt-6">
        {MOMENTOS.map(([t, q], k) => (
          <li key={q} className="revela" style={{ '--i': k % 4 }}>
            <Link to={`/busca?q=${q}`} className="group flex min-h-12 items-center justify-between gap-3 py-2">
              <span className="text-[26px] font-bold leading-tight tracking-[-0.02em] transition-colors duration-150 group-active:text-[var(--musgo)]">{t}</span>
              <ArrowRight size={22} className="shrink-0 text-[var(--musgo)] transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Uma moldura só, o conteúdo troca: o que só existe aqui. Toque avança. */
function SoAqui() {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setI(v => (v + 1) % SO_AQUI.length), 3400)
    return () => clearInterval(t)
  }, [i])
  return (
    <section className="mt-16 bg-[var(--ceu)] px-5 py-14" aria-labelledby="h-soaqui">
      <h2 id="h-soaqui" className="titulo revela">O que só tem aqui</h2>
      <button onClick={() => setI(v => (v + 1) % SO_AQUI.length)} className="revela relative mx-auto mt-8 block aspect-[4/5] w-[78%] overflow-hidden" aria-label="Próxima foto">
        {SO_AQUI.map(([f], k) => (
          <img key={f.id} src={f.p} alt={k === i ? f.legenda : ''} loading="lazy" className={`slide h-full w-full object-cover ${k === i ? 'on' : ''}`} style={{ transitionDuration: '700ms' }} />
        ))}
      </button>
      <p key={i} className="entra mx-auto mt-4 max-w-[30ch] text-center text-[16px] leading-snug">{SO_AQUI[i][1]}</p>
    </section>
  )
}

/** Categorias: linhas com uma foto da vila e o que tem em cada uma. */
function Explorar() {
  const ORDEM = ['alimentacao', 'turismo', 'hospedagem', 'compras']
  const cats = ORDEM.map(id => CATEGORIES.find(c => c.id === id)).filter(Boolean)
  return (
    <section className="mt-16 px-5" aria-labelledby="h-explorar">
      <h2 id="h-explorar" className="titulo revela">Explore a vila</h2>
      <ul className="mt-6 space-y-2">
        {cats.map((c, k) => {
          const f = FOTO_CATEGORIA[c.id]
          return (
            <li key={c.id} className="revela" style={{ '--i': k % 3 }}>
              <Link to={`/categoria/${c.slug}`} className="pressiona flex items-center gap-4 rounded-[var(--raio)] bg-[var(--papel)] p-2.5 pr-4">
                <img src={f.p} alt="" loading="lazy" className="h-[72px] w-[72px] shrink-0 rounded-[14px] object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[20px] font-extrabold tracking-[-0.02em]">{c.name}</span>
                  <span className="block truncate text-[14px] text-[var(--leve)]">{c.description}</span>
                </span>
                <ArrowRight size={19} className="shrink-0 text-[var(--musgo)]" />
              </Link>
            </li>
          )
        })}
        <li className="revela" style={{ '--i': 1 }}>
          <Link to="/uteis" className="pressiona flex items-center gap-4 rounded-[var(--raio)] bg-[var(--araucaria)] p-2.5 pr-4 text-white">
            <span className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-[14px] bg-white/10 text-[var(--broto)]"><Icon name="LifeBuoy" size={30} /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-[20px] font-extrabold tracking-[-0.02em]">Úteis</span>
              <span className="block truncate text-[14px] text-white/65">Farmácia, posto, caixa, táxi, emergência</span>
            </span>
            <ArrowRight size={19} className="shrink-0 text-[var(--broto)]" />
          </Link>
        </li>
      </ul>
      <Link to="/categorias" className="mt-3 inline-flex min-h-12 items-center gap-2 text-[16px] font-bold text-[var(--musgo)]">Todas as categorias <ArrowRight size={17} /></Link>
    </section>
  )
}

/** Chamada para quem tem negócio na vila. */
function ParaNegocios() {
  return (
    <section className="mt-16" aria-labelledby="h-negocio">
      <div className="revela-foto overflow-hidden">
        <img src={FOTOS.vilaAerea.g} alt={FOTOS.vilaAerea.legenda} loading="lazy" className="aspect-[4/3] w-full object-cover" />
      </div>
      <div className="bg-[var(--musgo)] px-5 pb-10 pt-8 text-white">
        <h2 id="h-negocio" className="titulo revela">Tem um negócio em Monte Verde?</h2>
        <p className="revela mt-3 max-w-[34ch] text-[17px] leading-relaxed text-white" style={{ '--i': 1 }}>
          Apareça para o turista na hora em que ele decide onde comer, dormir e passear. Cadastro grátis; destaque a partir de R$ 49 por mês.
        </p>
        <Link to="/anuncie" className="revela botao botao-claro mt-6 w-full" style={{ '--i': 2 }}>Ver planos e anunciar <ArrowRight size={18} /></Link>
      </div>
    </section>
  )
}

export function Home() {
  const { events } = useEvents({ filter: '30days' })
  return (
    <Layout hideHeader titulo="">
      <Poster />
      <Agora />
      <Momentos />
      <Explorar />
      <ConviteRoteiro />
      <FrasePresa />
      <SoAqui />
      {events.length > 0 && (
        <section className="mt-16" aria-labelledby="h-eventos">
          <div className="flex items-end justify-between px-5">
            <h2 id="h-eventos" className="titulo revela">Acontece na vila</h2>
            <Link to="/eventos" className="text-[15px] font-bold text-[var(--musgo)]">Todos</Link>
          </div>
          <div className="mt-5 flex gap-3 overflow-x-auto px-5 pb-1 scrollbar-hide" style={{ scrollSnapType: 'x mandatory' }}>
            {events.slice(0, 5).map(ev => <div key={ev.id} className="w-[78%] shrink-0" style={{ scrollSnapAlign: 'start' }}><EventCard event={ev} /></div>)}
          </div>
        </section>
      )}
      <div className="mt-12"><Parceiros contexto="home" /></div>
      <ParaNegocios />
    </Layout>
  )
}
