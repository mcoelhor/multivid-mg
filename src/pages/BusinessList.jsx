import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Search, X, Clock, Siren } from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { BusinessCard } from '../components/UI/BusinessCard'
import { Icon } from '../components/UI/Icon'
import { ContatoLinha } from '../components/ContatoLinha'
import { Parceiros } from '../components/Parceiros'
import { useBusinesses } from '../hooks/useBusinesses'
import { CATEGORIES } from '../data/categories'
import { SITUACOES, ehObra } from '../lib/busca'
import { registrar } from '../lib/track'

const URGENTES = ['farmacias', 'pronto-socorro', 'hospitais', 'dentistas', 'clinicas', 'oficinas', 'borracharias', 'postos', 'taxis', 'veterinarios', 'utilidade-publica']

export function BusinessList() {
  const { category, subcategory } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const q = params.get('q') || ''
  const situacao = SITUACOES.find(s => s.id === q)

  const [sub, setSub] = useState(subcategory || null)
  const [openNow, setOpenNow] = useState(false)
  const [texto, setTexto] = useState(q)
  useEffect(() => { setSub(subcategory || null) }, [subcategory])
  useEffect(() => { setTexto(q) }, [q])

  const { businesses: todos, loading, error } = useBusinesses({ category, search: q || undefined })
  const lista = todos
    .filter(b => !sub || b.subcategory === sub)
    .filter(b => !openNow || b.st.estado === 'aberto')

  // Registra a busca uma vez por termo, com quantos resultados teve (as sem resultado viram lista de pendências)
  const ultimo = useRef('')
  useEffect(() => {
    if (q && !loading && ultimo.current !== q) { ultimo.current = q; registrar('busca', { term: q, results: todos.length }) }
  }, [q, loading, todos.length])

  const cat = CATEGORIES.find(c => c.slug === category)
  const subsPresentes = cat ? cat.subcategories.filter(s => todos.some(b => b.subcategory === s.id)) : []
  const abertos = todos.filter(b => b.st.estado === 'aberto').length
  const urgente = q && lista[0] && URGENTES.includes(lista[0].subcategory)
  const titulo = situacao ? situacao.rotulo : q ? `“${q}”` : cat ? cat.name : 'Buscar'

  return (
    <Layout title={titulo} showBack subtitle={q ? 'Resultados da busca' : cat?.description}>
      <div className="pt-3">
        {(q || !category) && (
          <form onSubmit={e => { e.preventDefault(); if (texto.trim()) navigate(`/busca?q=${encodeURIComponent(texto.trim())}`, { replace: true }) }} className="px-4 pb-3" role="search">
            <div className="relative">
              <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a918b]" />
              <input type="search" enterKeyHint="search" value={texto} onChange={e => setTexto(e.target.value)} autoFocus={!q}
                placeholder="O que você precisa?" aria-label="Buscar"
                className="w-full rounded-xl bg-white py-3 pl-10 pr-10 text-[15px] shadow-[inset_0_0_0_1px_rgba(23,36,28,0.08)]" />
              {texto && (
                <button type="button" onClick={() => setTexto('')} className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center" aria-label="Limpar">
                  <X size={15} className="text-[#8a918b]" />
                </button>
              )}
            </div>
          </form>
        )}

        {cat && subsPresentes.length > 1 && (
          <div className="flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide">
            <button onClick={() => setSub(null)} aria-pressed={!sub} className="chip">Todos</button>
            {subsPresentes.map(s => (
              <button key={s.id} onClick={() => setSub(sub === s.id ? null : s.id)} aria-pressed={sub === s.id} className="chip">
                <Icon name={s.icon} size={14} />{s.name}
              </button>
            ))}
          </div>
        )}

        {(cat || q) && todos.length > 0 && (
          <div className="flex items-center gap-2 px-4 pb-3">
            <button onClick={() => setOpenNow(v => !v)} aria-pressed={openNow} className="chip"><Clock size={14} />Aberto agora</button>
            <span className="text-xs text-[#626a63]">{lista.length} lugares{abertos ? ` · ${abertos} abertos` : ''}</span>
          </div>
        )}

        {q && ehObra(q) && <Parceiros contexto="busca" />}
        {cat && (category === 'construcao' || category === 'imobiliarias') && !q && <Parceiros contexto={category} />}

        {loading ? (
          <div className="space-y-3 px-4">{[0, 1, 2].map(i => <div key={i} className="esqueleto h-52 rounded-2xl" />)}</div>
        ) : error ? (
          <p className="mx-4 rounded-2xl bg-white p-4 text-sm text-[#8a3b2e]">Sem conexão. Tente de novo em instantes.</p>
        ) : !q && !category ? (
          <div className="grid grid-cols-2 gap-2 px-4">
            {SITUACOES.map(s => (
              <Link key={s.id} to={`/busca?q=${s.id}`} className="pressiona flex items-center gap-2 rounded-2xl bg-white p-3.5 text-sm font-semibold"><Icon name={s.icone} size={17} className="text-[var(--verde)]" />{s.rotulo}</Link>
            ))}
          </div>
        ) : lista.length === 0 ? (
          <div className="mx-4 rounded-2xl bg-white p-5 text-center">
            <p className="font-semibold">{openNow ? 'Nada aberto neste filtro agora.' : `Ainda não temos cadastro para “${q}”.`}</p>
            {!openNow && <p className="mt-1 text-sm text-[#626a63]">Anotamos sua busca para incluir.</p>}
            <Link to="/sos" className="botao botao-sos mt-4 w-full"><Siren size={16} />Contatos de emergência</Link>
          </div>
        ) : urgente ? (
          <ul className="space-y-2 px-4 pb-4">{lista.slice(0, 30).map((b, i) => <ContatoLinha key={b.id} b={b} index={i} />)}</ul>
        ) : (
          <div className="space-y-3 px-4 pb-4">{lista.map((b, i) => <BusinessCard key={b.id} business={b} index={i} />)}</div>
        )}

        <p className="px-4 pb-2 pt-4 text-[13px] text-[#626a63]">
          Seu negócio não está aqui? <Link to="/anuncie" className="font-semibold text-[var(--verde)] underline">Cadastre grátis</Link>.
        </p>
      </div>
    </Layout>
  )
}
