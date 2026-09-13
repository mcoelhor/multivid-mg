import { useState } from 'react'
import { Heart } from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { BusinessCard } from '../components/UI/BusinessCard'
import { EventCard } from '../components/UI/EventCard'
import { useFavorites } from '../hooks/useFavorites'
import { MOCK_BUSINESSES, MOCK_EVENTS } from '../data/mockData'

function EmptyFavorites() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <Heart size={28} className="text-red-300" />
      </div>
      <p className="text-gray-600 font-medium">Nenhum favorito ainda</p>
      <p className="text-sm text-gray-400 mt-1">
        Toque no ❤️ para salvar estabelecimentos e eventos
      </p>
    </div>
  )
}

export function Favorites() {
  const { favorites } = useFavorites()
  const [tab, setTab] = useState('businesses')

  const favBusinesses = MOCK_BUSINESSES.filter(b => favorites.businesses.includes(b.id))
  const favEvents = MOCK_EVENTS.filter(e => favorites.events.includes(e.id))
  const total = favBusinesses.length + favEvents.length

  return (
    <Layout title="Meus Favoritos" subtitle={total > 0 ? `${total} item${total !== 1 ? 's' : ''}` : undefined}>
      <div className="pt-3">
        <div className="flex gap-0 px-4 mb-4 bg-white mx-4 rounded-2xl overflow-hidden">
          <button
            onClick={() => setTab('businesses')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              tab === 'businesses' ? 'text-green-800 border-b-2 border-green-800' : 'text-gray-400'
            }`}
          >
            Estabelecimentos {favBusinesses.length > 0 && `(${favBusinesses.length})`}
          </button>
          <button
            onClick={() => setTab('events')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              tab === 'events' ? 'text-green-800 border-b-2 border-green-800' : 'text-gray-400'
            }`}
          >
            Eventos {favEvents.length > 0 && `(${favEvents.length})`}
          </button>
        </div>

        {tab === 'businesses' && (
          favBusinesses.length === 0 ? (
            <EmptyFavorites />
          ) : (
            <div className="px-4 space-y-4 pb-4">
              {favBusinesses.map(b => <BusinessCard key={b.id} business={b} />)}
            </div>
          )
        )}

        {tab === 'events' && (
          favEvents.length === 0 ? (
            <EmptyFavorites />
          ) : (
            <div className="px-4 space-y-4 pb-4">
              {favEvents.map(e => <EventCard key={e.id} event={e} />)}
            </div>
          )
        )}
      </div>
    </Layout>
  )
}
