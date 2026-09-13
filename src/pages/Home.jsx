import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ChevronRight, Flame } from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { BusinessCard } from '../components/UI/BusinessCard'
import { EventCard } from '../components/UI/EventCard'
import { useBusinesses } from '../hooks/useBusinesses'
import { useEvents } from '../hooks/useEvents'
import { HOME_ACTIONS } from '../data/categories'
import { MOCK_PROMOTIONS } from '../data/mockData'

function SearchBar() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) navigate(`/busca?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <form onSubmit={handleSubmit} className="px-4 py-3">
      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="O que você procura? Ex: pizza, hotel, táxi..."
          className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl text-sm shadow-sm border border-gray-100 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-green-900/20"
        />
      </div>
    </form>
  )
}

function ActionGrid() {
  const navigate = useNavigate()
  return (
    <section className="px-4 pb-4">
      <h2 className="text-base font-bold text-gray-800 mb-3">O que você quer fazer hoje?</h2>
      <div className="grid grid-cols-4 gap-2.5">
        {HOME_ACTIONS.map(action => (
          <button
            key={action.slug}
            onClick={() => navigate(`/categoria/${action.slug}`)}
            className="flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-transform active:scale-95"
            style={{ background: action.bg }}
          >
            <span className="text-2xl">{action.icon}</span>
            <span className="text-[10px] font-semibold text-center leading-tight" style={{ color: action.color }}>
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}

function HorizontalSection({ title, seeAllPath, children, empty }) {
  const navigate = useNavigate()
  return (
    <section className="pb-4">
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="text-base font-bold text-gray-800">{title}</h2>
        {seeAllPath && (
          <button
            onClick={() => navigate(seeAllPath)}
            className="flex items-center gap-0.5 text-xs font-medium text-green-800"
          >
            Ver todos <ChevronRight size={14} />
          </button>
        )}
      </div>
      {empty ? (
        <p className="px-4 text-sm text-gray-400 italic">{empty}</p>
      ) : (
        <div className="flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-hide" style={{ scrollSnapType: 'x mandatory' }}>
          {children}
        </div>
      )}
    </section>
  )
}

function PromotionCard({ promo }) {
  return (
    <div className="flex-shrink-0 w-72 bg-white rounded-2xl overflow-hidden shadow-sm" style={{ scrollSnapAlign: 'start' }}>
      <div className="relative">
        {promo.image && (
          <img src={promo.image} alt={promo.title} className="w-full h-32 object-cover" loading="lazy" />
        )}
        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          <Flame size={11} /> {promo.discount}
        </span>
      </div>
      <div className="p-3">
        <p className="text-xs text-gray-400 font-medium">{promo.business_name}</p>
        <h4 className="font-semibold text-sm text-gray-900 mt-0.5 line-clamp-1">{promo.title}</h4>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{promo.description}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-400">
            Válido até {new Date(promo.valid_until + 'T00:00:00').toLocaleDateString('pt-BR')}
          </span>
        </div>
      </div>
    </div>
  )
}

export function Home() {
  const { businesses: featured, loading: loadingB } = useBusinesses({})
  const { events, loading: loadingE } = useEvents({ filter: '30days' })

  const featuredList = featured.filter(b => b.featured).slice(0, 6)
  const upcomingEvents = events.slice(0, 4)

  return (
    <Layout>
      <SearchBar />

      <ActionGrid />

      <HorizontalSection
        title="Em Destaque"
        seeAllPath="/categorias"
        empty={!loadingB && featuredList.length === 0 ? 'Nenhum estabelecimento em destaque.' : null}
      >
        {loadingB ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-64 h-52 bg-white rounded-2xl animate-pulse" style={{ scrollSnapAlign: 'start' }} />
          ))
        ) : (
          featuredList.map(b => (
            <div key={b.id} className="flex-shrink-0 w-64" style={{ scrollSnapAlign: 'start' }}>
              <BusinessCard business={b} />
            </div>
          ))
        )}
      </HorizontalSection>

      <HorizontalSection
        title="Próximos Eventos"
        seeAllPath="/eventos"
        empty={!loadingE && upcomingEvents.length === 0 ? 'Nenhum evento próximo.' : null}
      >
        {loadingE ? (
          Array(2).fill(0).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-64 h-52 bg-white rounded-2xl animate-pulse" style={{ scrollSnapAlign: 'start' }} />
          ))
        ) : (
          upcomingEvents.map(ev => (
            <div key={ev.id} className="flex-shrink-0 w-64" style={{ scrollSnapAlign: 'start' }}>
              <EventCard event={ev} />
            </div>
          ))
        )}
      </HorizontalSection>

      {MOCK_PROMOTIONS.length > 0 && (
        <HorizontalSection title="🔥 Ofertas da Região" seeAllPath="/mais">
          {MOCK_PROMOTIONS.map(p => (
            <PromotionCard key={p.id} promo={p} />
          ))}
        </HorizontalSection>
      )}

      <div className="h-4" />
    </Layout>
  )
}
