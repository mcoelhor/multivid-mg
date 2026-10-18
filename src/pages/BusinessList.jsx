import { useEffect, useRef } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Search, X, Clock, Siren, ArrowRight, Sparkles } from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { BusinessCard } from '../components/UI/BusinessCard'
import { Icon } from '../components/UI/Icon'
import { ContatoLinha } from '../components/ContatoLinha'
import { Parceiros } from '../components/Parceiros'
import { useBusinesses } from '../hooks/useBusinesses'
import { CATEGORIES } from '../data/categories'
import { FOTO_CATEGORIA } from '../data/fotos'
import { SITUACOES, ehObra, ehUrgente, situacaoDoTermo, subsDoTermo } from '../lib/busca'
import { registrar } from '../lib/track'
import { BotaoVoz } from '../components/BotaoVoz'

const URGENTES = ['farmacias', 'pronto-socorro', 'hospitais', 'dentistas', 'clinicas', 'oficinas', 'borracharias', 'postos', 'taxis', 'veterinarios', 'utilidade-publica']
const SUGESTOES = ['fondue', 'café colonial', 'trilha', 'pizza', 'chocolate', 'cervejaria', 'farmácia', 'aventura']
const SUGESTAO_VAZIO = [
  ['Comer', '/categoria/alimentacao'], ['Fazer', '/categoria/turismo'], ['Ficar', '/categoria/hospedagem'],
  ['Comprar', '/categoria/compras'], ['Úteis', '/uteis'],
]

/** Lista de uma categoria ou resultado de busca. Filtros vivem na URL para sobreviver ao "voltar". */
export function BusinessList() {
  const { category, subcategory } = useParams()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const q = params.get('q') || ''
  const sub = subcategory || params.get('sub') || null
  const openNow = params.get('aberto') === '1'
  const situacao = situacaoDoTermo(q) || SITUACOES.find(s => s.id === q)
  const mudar = (chave, valor) => {
    const p = new URLSearchParams(params)
    if (valor) p.set(chave, valor); else p.delete(chave)
    setParams(p, { replace: true })
  }

  const { businesses: todos, loading, error } = useBusinesses({ category, search: q || undefined })
  const lista = todos
    .filter(b => !sub || b.subcategory === sub)
    .filter(b => !openNow || b.st.estado === 'aberto' || b.st.estado === 'plantao')
    .filter(b => !(openNow && !q && !category) || b.subcategory !== 'utilidade-publica')
  const curados = q ? lista.filter(b => b.curado) : []
  const restantes = q ? lista.filter(b => !b.curado) : lista

  const ultimo = useRef('')
  useEffect(() => {
    if (q && !loading && ultimo.current !== q) { ultimo.current = q; registrar('busca', { term: q, results: todos.length }) }
  }, [q, loading, todos.length])

  const cat = CATEGORIES.find(c => c.slug === category)
  const foto = cat && FOTO_CATEGORIA[cat.id]
  const subsPresentes = cat ? cat.subcategories.filter(s => todos.some(b => b.subcategory === s.id)) : []
  const abertos = todos.filter(b => b.st.estado === 'aberto').length
  const urgente = q && lista[0] && URGENTES.includes(lista[0].subcategory)
  const vazioInicial = !q && !category && !openNow
  const titulo = situacao ? situacao.rotulo : q ? `“${q}”` : cat ? cat.name : openNow ? 'Aberto agora' : 'Buscar'
  const subtitulo = q ? (curados.length ? `${curados.length} escolhas do guia e mais ${restantes.length}` : 'Resultados da busca') : openNow && !cat ? 'Pelo horário cadastrado' : cat?.description
  const sugeridas = q ? subsDoTermo(q) : []

  return (
    <Layout title={titulo} showBack subtitle={subtitulo}>
      {foto && !q && (
        <div className="relative mx-5 mb-4 overflow-hidden rounded-[var(--raio)]">
          <img src={foto.p} alt={foto.legenda} className="deriva aspect-[16/9] w-full object-cover" />
        </div>
      )}

      {(q || vazioInicial) && (
        <form onSubmit={e => { e.preventDefault(); const v = e.currentTarget.q.value.trim(); if (v) navigate(`/busca?q=${encodeURIComponent(v)}`, { replace: !!q }) }} className="px-5 pb-4" role="search">
          <div className="relative">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--leve)]" />
            <input name="q" type="search" enterKeyHint="search" defaultValue={q} key={q} autoFocus={!q}
              placeholder="O que você procura?" aria-label="Buscar"
              className="h-14 w-full rounded-full bg-[var(--papel)] pl-12 pr-14 text-[16px]" />
            {q ? (
              <Link to="/busca" replace className="absolute right-1.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full" aria-label="Limpar busca">
                <X size={18} className="text-[var(--leve)]" />
              </Link>
            ) : (
              <BotaoVoz onTexto={t => navigate(`/busca?q=${encodeURIComponent(t)}`)} className="absolute right-1.5 top-1/2 -translate-y-1/2" />
            )}
          </div>
        </form>
      )}

      {cat && subsPresentes.length > 1 && (
        <div className="flex gap-2 overflow-x-auto px-5 pb-3 scrollbar-hide">
          <button onClick={() => mudar('sub', null)} aria-pressed={!sub} className="chip">Todos</button>
          {subsPresentes.map(s => (
            <button key={s.id} onClick={() => mudar('sub', sub === s.id ? null : s.id)} aria-pressed={sub === s.id} className="chip">
              <Icon name={s.icon} size={15} />{s.name}
            </button>
          ))}
        </div>
      )}

      {(cat || q) && todos.length > 0 && (
        <div className="flex items-center gap-3 px-5 pb-4">
          <button onClick={() => mudar('aberto', openNow ? null : '1')} aria-pressed={openNow} className="chip"><Clock size={15} />Aberto agora</button>
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
              <li key={s.id}><Link to={`/busca?q=${s.id}`} className="flex min-h-12 items-center justify-between py-2 text-[22px] font-bold tracking-[-0.02em]">{s.rotulo}<ArrowRight size={20} className="text-[var(--musgo)]" /></Link></li>
            ))}
          </ul>
        </div>
      ) : lista.length === 0 ? (
        <div className="mx-5 rounded-[var(--raio)] bg-[var(--papel)] p-6">
          <p className="text-[20px] font-extrabold tracking-[-0.02em]">{openNow ? 'Nada aberto agora com esse filtro.' : `Ainda não temos “${q}” no guia.`}</p>
          <p className="mt-2 text-[15px] leading-relaxed text-[var(--leve)]">
            {openNow ? 'Tire o filtro para ver quem abre mais tarde.' : 'Sua busca ficou anotada para incluirmos. Enquanto isso, veja por categoria:'}
          </p>
          {!openNow && (
            <div className="mt-4 flex flex-wrap gap-2">
              {SUGESTAO_VAZIO.map(([t, to]) => <Link key={to} to={to} className="chip">{t}</Link>)}
            </div>
          )}
          {openNow && <button onClick={() => mudar('aberto', null)} className="botao botao-sec mt-4 w-full">Ver todos</button>}
          {q && ehUrgente(q) && <Link to="/sos" className="botao botao-sos mt-4 w-full"><Siren size={17} />Contatos de emergência</Link>}
          {q && !ehUrgente(q) && <Link to="/mais#corrigir" className="mt-4 block text-[15px] font-bold text-[var(--musgo)]">Conhece um lugar para isso? Avise a gente</Link>}
        </div>
      ) : urgente ? (
        <ul className="space-y-2 px-5 pb-4">{lista.slice(0, 30).map((b, i) => <ContatoLinha key={b.id} b={b} index={i} />)}</ul>
      ) : (
        <div className="px-5 pb-4">
          {curados.length > 0 && (
            <section aria-labelledby="h-curados" className="mb-6">
              <h2 id="h-curados" className="mb-3 flex items-center gap-2 text-[18px] font-extrabold tracking-[-0.02em]"><Sparkles size={18} className="text-[var(--ouro)]" />Escolhas do guia{situacao ? ` para ${situacao.rotulo.toLowerCase()}` : ''}</h2>
              <div className="space-y-3">{curados.map((b, i) => <BusinessCard key={b.id} business={b} index={i} />)}</div>
            </section>
          )}
          {curados.length > 0 && restantes.length > 0 && <h2 className="mb-3 text-[18px] font-extrabold tracking-[-0.02em]">Mais opções</h2>}
          {!curados.length && <h2 className="sr-only">Lugares</h2>}
          <div className="space-y-3">{restantes.map((b, i) => <BusinessCard key={b.id} business={b} index={i} />)}</div>
          {q && sugeridas.length === 0 && restantes.length < 4 && (
            <p className="mt-5 text-[15px] text-[var(--leve)]">Poucos resultados. Tente outra palavra ou veja as <Link to="/categorias" className="font-bold text-[var(--musgo)] underline underline-offset-4">categorias</Link>.</p>
          )}
        </div>
      )}

      <p className="px-5 pt-6 text-[15px] text-[var(--leve)]">
        Seu negócio não está aqui? <Link to="/mais#cadastro" className="inline-flex min-h-11 items-center font-bold text-[var(--musgo)] underline underline-offset-4">Cadastre grátis</Link>.
      </p>
    </Layout>
  )
}
