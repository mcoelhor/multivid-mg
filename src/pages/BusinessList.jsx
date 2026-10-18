import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Search, X, Clock, Siren, ArrowRight } from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { BusinessCard } from '../components/UI/BusinessCard'
import { Icon } from '../components/UI/Icon'
import { ContatoLinha } from '../components/ContatoLinha'
import { Parceiros } from '../components/Parceiros'
import { useBusinesses } from '../hooks/useBusinesses'
import { CATEGORIES } from '../data/categories'
import { FOTO_CATEGORIA } from '../data/fotos'
import { SITUACOES, ehObra } from '../lib/busca'
import { registrar } from '../lib/track'

const URGENTES = ['farmacias', 'pronto-socorro', 'hospitais', 'dentistas', 'clinicas', 'oficinas', 'borracharias', 'postos', 'taxis', 'veterinarios', 'utilidade-publica']
const SUGESTOES = ['fondue', 'café colonial', 'trilha', 'pizza', 'chocolate', 'cervejaria', 'farmácia', 'pousada com lareira']

export function BusinessList() {
  const { category, subcategory } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const q = params.get('q') || ''
  const soAbertos = params.get('aberto') === '1'
  const situacao = SITUACOES.find(s => s.id === q)

  const [sub, setSub] = useState(subcategory || null)
  const [openNow, setOpenNow] = useState(soAbertos)
  const [texto, setTexto] = useState(q)
  useEffect(() => { setSub(subcategory || null) }, [subcategory])
  useEffect(() => { setTexto(q) }, [q])
  useEffect(() => { setOpenNow(soAbertos) }, [soAbertos])

  const { businesses: todos, loading, error } = useBusinesses({ category, search: q || undefined })
  const lista = todos
    .filter(b => !sub || b.subcategory === sub)
    .filter(b => !openNow || b.st.estado === 'aberto' || b.st.estado === 'plantao')
    .filter(b => !(soAbertos && !q && !category) || b.subcategory !== 'utilidade-publica')

  const ultimo = useRef('')
  useEffect(() => {
    if (q && !loading && ultimo.current !== q) { ultimo.current = q; registrar('busca', { term: q, results: todos.length }) }
  }, [q, loading, todos.length])

  const cat = CATEGORIES.find(c => c.slug === category)
  const foto = cat && FOTO_CATEGORIA[cat.id]
  const subsPresentes = cat ? cat.subcategories.filter(s => todos.some(b => b.subcategory === s.id)) : []
  const abertos = todos.filter(b => b.st.estado === 'aberto').length
  const urgente = q && lista[0] && URGENTES.includes(lista[0].subcategory)
  const vazioInicial = !q && !category && !soAbertos
  const titulo = situacao ? situacao.rotulo : q ? `“${q}”` : cat ? cat.name : soAbertos ? 'Aberto agora' : 'Buscar'

  return (
    <Layout title={titulo} showBack subtitle={q ? 'Resultados da busca' : soAbertos ? 'Pelo horário cadastrado' : cat?.description}>
      {foto && !q && (
        <div className="relative mx-5 mb-4 overflow-hidden rounded-[var(--raio)]">
          <img src={foto.p} alt={foto.legenda} className="deriva aspect-[16/9] w-full object-cover" />
        </div>
      )}

      {(q || vazioInicial) && (
        <form onSubmit={e => { e.preventDefault(); if (texto.trim()) navigate(`/busca?q=${encodeURIComponent(texto.trim())}`, { replace: true }) }} className="px-5 pb-4" role="search">
          <div className="relative">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--leve)]" />
            <input type="search" enterKeyHint="search" value={texto} onChange={e => setTexto(e.target.value)} autoFocus={!q}
              placeholder="O que você procura?" aria-label="Buscar"
              className="h-14 w-full rounded-full bg-[var(--papel)] pl-12 pr-12 text-[16px]" />
            {texto && (
              <button type="button" onClick={() => setTexto('')} className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center" aria-label="Limpar">
                <X size={17} className="text-[var(--leve)]" />
              </button>
            )}
          </div>
        </form>
      )}

      {cat && subsPresentes.length > 1 && (
        <div className="flex gap-2 overflow-x-auto px-5 pb-3 scrollbar-hide">
          <button onClick={() => setSub(null)} aria-pressed={!sub} className="chip">Todos</button>
          {subsPresentes.map(s => (
            <button key={s.id} onClick={() => setSub(sub === s.id ? null : s.id)} aria-pressed={sub === s.id} className="chip">
              <Icon name={s.icon} size={15} />{s.name}
            </button>
          ))}
        </div>
      )}

      {(cat || q) && todos.length > 0 && (
        <div className="flex items-center gap-3 px-5 pb-4">
          <button onClick={() => setOpenNow(v => !v)} aria-pressed={openNow} className="chip"><Clock size={15} />Aberto agora</button>
          <span className="text-[14px] text-[var(--leve)]">{lista.length} lugares{abertos ? ` · ${abertos} abertos` : ''}</span>
        </div>
      )}

      {q && ehObra(q) && <Parceiros contexto="busca" />}
      {cat && (category === 'construcao' || category === 'imobiliarias') && !q && <Parceiros contexto={category} />}

      {loading ? (
        <div className="space-y-3 px-5">{[0, 1, 2].map(i => <div key={i} className="esqueleto h-28 rounded-[var(--raio)]" />)}</div>
      ) : error ? (
        <p className="mx-5 rounded-[var(--raio)] bg-[var(--papel)] p-5 text-[15px]">Sem conexão. Tente de novo em instantes.</p>
      ) : vazioInicial ? (
        <div className="px-5">
          <h2 className="text-[20px] font-extrabold tracking-[-0.02em]">Experimente</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {SUGESTOES.map(s => <Link key={s} to={`/busca?q=${encodeURIComponent(s)}`} className="chip">{s}</Link>)}
          </div>
          <h2 className="mt-8 text-[20px] font-extrabold tracking-[-0.02em]">Para cada momento</h2>
          <ul className="mt-2">
            {SITUACOES.map(s => (
              <li key={s.id}><Link to={`/busca?q=${s.id}`} className="flex items-center justify-between py-3 text-[22px] font-bold tracking-[-0.02em]">{s.rotulo}<ArrowRight size={20} className="text-[var(--musgo)]" /></Link></li>
            ))}
          </ul>
        </div>
      ) : lista.length === 0 ? (
        <div className="mx-5 rounded-[var(--raio)] bg-[var(--papel)] p-6">
          <p className="text-[18px] font-bold">{openNow ? 'Nada aberto neste filtro agora.' : `Ainda não temos “${q}”.`}</p>
          {!openNow && <p className="mt-1 text-[15px] text-[var(--leve)]">Anotamos sua busca para incluir em breve.</p>}
          <Link to="/sos" className="botao botao-sos mt-5 w-full"><Siren size={17} />Contatos de emergência</Link>
        </div>
      ) : urgente ? (
        <ul className="space-y-2 px-5 pb-4">{lista.slice(0, 30).map((b, i) => <ContatoLinha key={b.id} b={b} index={i} />)}</ul>
      ) : (
        <div className="space-y-3 px-5 pb-4">{lista.map((b, i) => <BusinessCard key={b.id} business={b} index={i} />)}</div>
      )}

      <p className="px-5 pt-6 text-[15px] text-[var(--leve)]">
        Seu negócio não está aqui? <Link to="/anuncie" className="font-bold text-[var(--musgo)] underline underline-offset-4">Cadastre grátis</Link>.
      </p>
    </Layout>
  )
}
