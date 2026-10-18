import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Search, ArrowRight, Route } from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { EventCard } from '../components/UI/EventCard'
import { StatusPill } from '../components/UI/Badge'
import { Parceiros } from '../components/Parceiros'
import { useBusinesses } from '../hooks/useBusinesses'
import { useEvents } from '../hooks/useEvents'
import { CATEGORIES, nomeSub } from '../data/categories'
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
  ['Depois que escurece', 'noite'], ['Com o cachorro', 'pet'], ['Café e chocolate quente', 'cafe'],
  ['Trilha e natureza', 'trilha'], ['Fondue', 'fondue'],
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
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setI(v => (v + 1) % POSTER.length), 5200)
    return () => clearInterval(t)
  }, [])
  return (
    <section className="relative h-[78svh] min-h-[480px] overflow-hidden bg-[var(--araucaria)]" aria-label="Monte Verde">
      {POSTER.map((f, k) => (
        <div key={f.id} className={`slide ${k === i ? 'on' : ''}`} aria-hidden={k !== i}>
          <img src={k === 0 ? f.p : f.g} srcSet={`${f.p} 700w, ${f.g} 1600w`} sizes="480px" alt={f.legenda}
            className="deriva h-full w-full object-cover" fetchPriority={k === 0 ? 'high' : 'auto'} loading={k === 0 ? 'eager' : 'lazy'} />
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

/** Logo abaixo do pôster: frase de chegada, o agora e as duas ações. */
function Chegada() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const a = agoraMV()
  const { businesses } = useBusinesses({})
  const abertos = businesses.filter(b => b.st.estado === 'aberto' || b.st.estado === 'plantao')
  const comer = abertos.filter(b => b.category === 'alimentacao').slice(0, 4)

  return (
    <section className="bg-[var(--araucaria)] px-5 pb-10 pt-7 text-white">
      <p className="lead sobe max-w-[22ch]" style={{ '--i': 2 }}>A vila de montanha a 1.554 metros, entre araucárias, chalés e o mar de nuvens.</p>

      <div className="sobe mt-6 flex flex-col gap-2.5" style={{ '--i': 3 }}>
        <Link to="/roteiro" className="botao botao-broto h-14 justify-between px-6 text-[17px]">
          <span className="flex items-center gap-2.5"><Route size={20} />Montar meu roteiro</span><ArrowRight size={20} />
        </Link>
        <form onSubmit={e => { e.preventDefault(); if (q.trim()) navigate(`/busca?q=${encodeURIComponent(q.trim())}`) }} role="search"
          className="flex h-14 items-center gap-2 rounded-full bg-white/10 pl-5 pr-1.5">
          <Search size={18} className="shrink-0 text-white/60" />
          <input type="search" enterKeyHint="search" value={q} onChange={e => setQ(e.target.value)} aria-label="O que você procura?"
            placeholder="fondue, farmácia, trilha…" className="min-w-0 flex-1 bg-transparent text-[16px] text-white placeholder:text-white/55" />
        </form>
      </div>

      <div className="mt-9">
        <p className="text-[15px] text-white/70">
          {saudacao(a.min)}. {DIAS_NOME[DIAS[a.dia]]}, <span className="num">{hhmm(a.min)}</span> em Monte Verde.
        </p>
        <h2 className="mt-1 text-[26px] font-extrabold leading-tight tracking-[-0.03em]">
          {abertos.length ? <><span className="num">{abertos.length}</span> lugares abertos agora</> : 'Quem está aberto agora'}
        </h2>
        {comer.length > 0 && (
          <ul className="mt-4">
            {comer.map((b, k) => (
              <li key={b.id} className="entra" style={{ '--i': k }}>
                <Link to={`/estabelecimento/${b.slug}`} className="pressiona flex items-center gap-3 py-3">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[18px] font-bold">{b.name}</span>
                    <span className="block text-[14px] text-white/60">{nomeSub(b)} · {b.st.rotulo}</span>
                  </span>
                  <ArrowRight size={18} className="shrink-0 text-white/50" />
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link to="/busca?aberto=1" className="mt-3 inline-flex items-center gap-2 text-[16px] font-bold text-[var(--broto)]">Ver tudo que está aberto <ArrowRight size={17} /></Link>
      </div>
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
          Diga quantos dias fica, com quem vem e do que gosta. Montamos manhã, almoço, tarde e jantar só com lugares abertos naquele dia. Depois é só trocar o que quiser.
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
    <section className="px-5" aria-labelledby="h-momentos">
      <h2 id="h-momentos" className="titulo revela">Para cada momento da viagem</h2>
      <ul className="mt-6">
        {MOMENTOS.map(([t, q], k) => (
          <li key={q} className="revela" style={{ '--i': k % 4 }}>
            <Link to={`/busca?q=${q}`} className="group flex items-center justify-between gap-3 py-2.5">
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
  const ORDEM = ['alimentacao', 'hospedagem', 'turismo', 'compras', 'saude', 'transporte']
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
      </ul>
      <Link to="/categorias" className="mt-4 inline-flex items-center gap-2 text-[16px] font-bold text-[var(--musgo)]">Serviços, construção e imóveis <ArrowRight size={17} /></Link>
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
        <p className="revela mt-3 max-w-[34ch] text-[17px] leading-relaxed text-white/85" style={{ '--i': 1 }}>
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
    <Layout hideHeader>
      <Poster />
      <Chegada />
      <ConviteRoteiro />
      <FrasePresa />
      <Momentos />
      <SoAqui />
      <Explorar />
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
