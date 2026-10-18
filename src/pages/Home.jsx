import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Search, ChevronRight, Siren, Phone } from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { BusinessCard } from '../components/UI/BusinessCard'
import { EventCard } from '../components/UI/EventCard'
import { Icon } from '../components/UI/Icon'
import { ContatoLinha } from '../components/ContatoLinha'
import { Parceiros } from '../components/Parceiros'
import { useBusinesses } from '../hooks/useBusinesses'
import { useEvents } from '../hooks/useEvents'
import { CATEGORIES } from '../data/categories'
import { SITUACOES } from '../lib/busca'
import { agoraMV, DIAS_NOME, DIAS, hhmm } from '../lib/horario'
import { linkTel, registrar } from '../lib/track'

const ATALHOS = [
  ['Farmácia', 'Pill', 'farmacia'], ['Médico', 'Stethoscope', 'medico'], ['Dentista', 'Stethoscope', 'dentista'],
  ['Mecânico', 'Wrench', 'mecanico'], ['Pneu', 'CircleDot', 'pneu'], ['Táxi', 'CarTaxiFront', 'taxi'],
  ['Jantar', 'UtensilsCrossed', 'jantar'], ['Café', 'Coffee', 'cafe'], ['Mercado', 'ShoppingCart', 'mercado'],
  ['Caixa 24h', 'Landmark', 'caixa 24h'], ['Ferramenta', 'Hammer', 'chave de fenda'],
]

function Hero() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const a = agoraMV()
  const ir = termo => navigate(`/busca?q=${encodeURIComponent(termo)}`)
  return (
    <section className="relative overflow-hidden px-4 pb-6 pt-2" style={{ background: 'linear-gradient(180deg, var(--verde) 0%, var(--verde-escuro) 100%)' }}>
      <Serra />
      <p className="sobe relative text-[13px] font-medium text-[#bfe3c9]" style={{ '--i': 0 }}>
        {DIAS_NOME[DIAS[a.dia]]}, <span className="num">{hhmm(a.min).replace(/h$/, 'h00')}</span> em Monte Verde
      </p>
      <h1 className="sobe relative mt-1 text-[30px] font-extrabold leading-[1.05] text-white" style={{ '--i': 1 }}>
        O que você precisa agora?
      </h1>
      <form
        onSubmit={e => { e.preventDefault(); if (q.trim()) ir(q.trim()) }}
        className="sobe relative mt-4 flex items-center gap-2 rounded-2xl bg-white p-1.5 pl-3.5 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.6)]"
        style={{ '--i': 2 }} role="search"
      >
        <Search size={18} className="shrink-0 text-[#8a918b]" />
        <input
          type="search" enterKeyHint="search" value={q} onChange={e => setQ(e.target.value)}
          placeholder="farmácia aberta, pneu furado, jantar…"
          aria-label="O que você precisa?"
          className="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] text-[#17241c] placeholder:text-[#8a918b]"
        />
        <button type="submit" className="botao bg-[var(--ouro)] text-[#2a2006]">Buscar</button>
      </form>
      <div className="sobe relative -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide" style={{ '--i': 3 }}>
        {ATALHOS.map(([rot, ic, termo]) => (
          <button key={rot} onClick={() => ir(termo)} className="chip bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]">
            <Icon name={ic} size={15} />{rot}
          </button>
        ))}
      </div>
    </section>
  )
}

/** Silhueta da Mantiqueira, desenhada (sem foto de banco). */
function Serra() {
  return (
    <svg className="pointer-events-none absolute inset-x-0 bottom-0 h-28 w-full" viewBox="0 0 480 120" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 78 L40 60 L78 70 L120 38 L150 52 L190 30 L232 50 L268 34 L300 46 L340 18 L378 40 L420 26 L452 42 L480 34 L480 120 L0 120Z" fill="#ffffff" opacity="0.05" />
      <path d="M0 98 L50 82 L96 92 L140 72 L186 88 L230 76 L278 94 L330 74 L372 90 L420 80 L480 92 L480 120 L0 120Z" fill="#ffffff" opacity="0.06" />
    </svg>
  )
}

function Emergencia() {
  const { businesses } = useBusinesses({ group: 'Emergência' })
  const numeros = businesses.filter(b => b.subcategory === 'utilidade-publica').sort((a, b) => Number(a.phone) - Number(b.phone))
  const ps = businesses.find(b => b.subcategory === 'pronto-socorro')
  const farm = businesses.filter(b => b.subcategory === 'farmacias')
  const farmAberta = farm.find(b => b.st.estado === 'aberto')
  return (
    <section className="bg-[var(--sos-fundo)] px-4 pb-5 pt-5" aria-labelledby="h-emerg">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 id="h-emerg" className="flex items-center gap-2 text-lg font-bold text-[var(--sos)]"><Siren size={20} />Emergência</h2>
        <Link to="/sos" className="flex items-center text-[13px] font-semibold text-[var(--sos)]">Ver tudo <ChevronRight size={16} /></Link>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {numeros.map((b, i) => (
          <a key={b.id} href={linkTel(b.phone)} onClick={() => registrar('tel', { businessId: b.id })}
            className="cai pressiona flex flex-col items-center justify-center rounded-2xl bg-white py-3" style={{ '--i': i }}>
            <span className="num text-[28px] font-extrabold leading-none text-[var(--sos)]">{b.phone}</span>
            <span className="mt-1 text-xs font-medium text-[#17241c]">{b.name.split(' —')[0].replace(' Militar', '')}</span>
          </a>
        ))}
      </div>
      {ps && (
        <a href={linkTel(ps.phone)} onClick={() => registrar('tel', { businessId: ps.id })} className="cai botao botao-sos mt-2 w-full justify-between px-4" style={{ '--i': 3, minHeight: 56 }}>
          <span className="flex items-center gap-2.5"><Phone size={18} /><span className="text-left leading-tight">Pronto-socorro 24h<br /><span className="num text-xs font-medium opacity-85">{ps.phone}</span></span></span>
          <ChevronRight size={18} />
        </a>
      )}
      {(farmAberta || farm[0]) && (
        <ul className="mt-2"><ContatoLinha b={farmAberta || farm[0]} index={4} /></ul>
      )}
      {farm.length > 0 && !farmAberta && (
        <p className="mt-2 text-[13px] text-[#8a3b2e]">Nenhuma farmácia aberta agora pelo horário cadastrado. Em urgência, ligue para o pronto-socorro.</p>
      )}
    </section>
  )
}

function Faixa({ titulo, icone, verTodos, children }) {
  return (
    <section className="pt-6">
      <div className="mb-3 flex items-baseline justify-between px-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-[#17241c]">{icone && <Icon name={icone} size={19} className="text-[var(--verde)]" />}{titulo}</h2>
        {verTodos && <Link to={verTodos} className="flex items-center text-[13px] font-semibold text-[var(--verde)]">Ver todos <ChevronRight size={16} /></Link>}
      </div>
      {children}
    </section>
  )
}

export function Home() {
  const navigate = useNavigate()
  const { businesses: comer, loading } = useBusinesses({ category: 'alimentacao' })
  const abertos = comer.filter(b => b.st.estado === 'aberto').slice(0, 8)
  const { events } = useEvents({ filter: '30days' })

  return (
    <Layout>
      <Hero />
      <Emergencia />

      <Faixa titulo="Aberto agora para comer" icone="Utensils" verTodos="/categoria/alimentacao">
        {loading ? (
          <div className="flex gap-3 px-4">{[0, 1].map(i => <div key={i} className="esqueleto h-56 w-60 shrink-0 rounded-2xl" />)}</div>
        ) : abertos.length ? (
          <div className="flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-hide" style={{ scrollSnapType: 'x mandatory' }}>
            {abertos.map((b, i) => (
              <div key={b.id} className="w-60 shrink-0" style={{ scrollSnapAlign: 'start' }}><BusinessCard business={b} index={i} /></div>
            ))}
          </div>
        ) : (
          <p className="mx-4 rounded-2xl bg-white p-4 text-sm text-[#626a63]">Nenhum restaurante com horário cadastrado está aberto neste momento.</p>
        )}
      </Faixa>

      <Faixa titulo="Para cada situação">
        <div className="grid grid-cols-2 gap-2 px-4">
          {SITUACOES.map((s, i) => (
            <button key={s.id} onClick={() => navigate(`/busca?q=${s.id}`)} className="entra pressiona flex items-center gap-3 rounded-2xl bg-white p-3.5 text-left" style={{ '--i': i }}>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e3efe6] text-[var(--verde)]"><Icon name={s.icone} size={18} /></span>
              <span className="text-[14px] font-semibold text-[#17241c]">{s.rotulo}</span>
            </button>
          ))}
        </div>
      </Faixa>

      <Faixa titulo="Explore por categoria">
        <div className="grid grid-cols-3 gap-2 px-4">
          {CATEGORIES.map((c, i) => (
            <button key={c.id} onClick={() => navigate(`/categoria/${c.slug}`)} className="entra pressiona flex flex-col items-start gap-2 rounded-2xl bg-white p-3" style={{ '--i': i }}>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl text-white" style={{ background: c.tint }}><Icon name={c.icon} size={18} /></span>
              <span className="text-[13px] font-semibold leading-tight text-[#17241c]">{c.name}</span>
            </button>
          ))}
        </div>
      </Faixa>

      {events.length > 0 && (
        <Faixa titulo="Próximos eventos" icone="Calendar" verTodos="/eventos">
          <div className="flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-hide">
            {events.slice(0, 4).map(ev => <div key={ev.id} className="w-64 shrink-0"><EventCard event={ev} /></div>)}
          </div>
        </Faixa>
      )}

      <div className="pt-4"><Parceiros contexto="home" /></div>
      <div className="h-2" />
    </Layout>
  )
}
