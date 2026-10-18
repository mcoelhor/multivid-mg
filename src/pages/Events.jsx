import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Calendar, Clock, MapPin, MessageCircle, Globe } from 'lucide-react'

function InstagramIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  )
}
import { Layout } from '../components/Layout/Layout'
import { EventCard } from '../components/UI/EventCard'
import { LoadingSpinner } from '../components/UI/LoadingSpinner'
import { useEvents, useEvent } from '../hooks/useEvents'

const DATE_FILTERS = [
  { id: null, label: 'Todos' },
  { id: 'today', label: 'Hoje' },
  { id: 'tomorrow', label: 'Amanhã' },
  { id: 'weekend', label: 'Fim de semana' },
  { id: '7days', label: 'Próximos 7 dias' },
  { id: '30days', label: 'Próximos 30 dias' },
]

const CATEGORY_FILTERS = [
  { id: null, label: 'Todas' },
  { id: 'musica', label: 'Música' },
  { id: 'gastronomia', label: 'Gastronomia' },
  { id: 'festival', label: 'Festival' },
  { id: 'turismo', label: 'Turismo' },
  { id: 'feiras', label: 'Feiras' },
  { id: 'cultura', label: 'Cultura' },
]

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

export function Events() {
  const [dateFilter, setDateFilter] = useState(null)
  const [catFilter, setCatFilter] = useState(null)
  const { events, loading } = useEvents({ filter: dateFilter, category: catFilter })

  return (
    <Layout title="Eventos" subtitle="Monte Verde e região">
      <div className="pt-3">
        <div className="flex gap-2 overflow-x-auto px-5 pb-2 scrollbar-hide">
          {DATE_FILTERS.map(f => (
            <button
              key={String(f.id)}
              onClick={() => setDateFilter(f.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                dateFilter === f.id ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200'
              }`}
              style={dateFilter === f.id ? { background: '#14532d' } : {}}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto px-5 pb-3 scrollbar-hide">
          {CATEGORY_FILTERS.map(f => (
            <button
              key={String(f.id)}
              onClick={() => setCatFilter(f.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                catFilter === f.id ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200'
              }`}
              style={catFilter === f.id ? { background: '#14532d' } : {}}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center py-16 px-8 text-center">
            <p className="text-gray-700 font-semibold">Nenhum evento neste período</p>
            <p className="text-sm text-gray-500 mt-1">A agenda de Monte Verde está sendo montada. Tem um evento? Avise pelo menu Mais.</p>
          </div>
        ) : (
          <div className="px-5 space-y-4 pb-4">
            {events.map(ev => <EventCard key={ev.id} event={ev} />)}
          </div>
        )}
      </div>
    </Layout>
  )
}

export function EventDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { event, loading } = useEvent(id)
  if (loading) return <Layout title="Evento" showBack><div className="esqueleto m-4 h-64 rounded-[var(--raio)]" /></Layout>

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh gap-3 pb-20">
        <p className="text-gray-600 font-medium">Evento não encontrado</p>
        <button onClick={() => navigate('/eventos')} className="text-green-800 text-sm font-semibold">
          Ver todos os eventos
        </button>
      </div>
    )
  }

  function openWhatsApp() {
    const msg = encodeURIComponent(`Olá! Vi o evento "${event.title}" no Portal Monte Verde.`)
    window.open(`https://wa.me/${event.whatsapp}?text=${msg}`, '_blank')
  }

  function openMaps() {
    if (event.latitude && event.longitude) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`, '_blank')
    }
  }

  return (
    <Layout title={event.title} showBack>
      <div className="pb-4">
        {event.image && (
          <img src={event.image} alt={event.title} className="w-full h-56 object-cover" />
        )}

        <div className="px-5 pt-5 space-y-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">{event.title}</h1>
            <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
              {event.category}
            </span>
          </div>

          <div className="bg-gray-50 rounded-[var(--raio)] p-4 space-y-2.5">
            <div className="flex items-center gap-3 text-sm">
              <Calendar size={16} className="text-green-700 shrink-0" />
              <span className="text-gray-700">{formatDate(event.date_start)}</span>
            </div>
            {event.time_start && (
              <div className="flex items-center gap-3 text-sm">
                <Clock size={16} className="text-green-700 shrink-0" />
                <span className="text-gray-700">{event.time_start}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <MapPin size={16} className="text-green-700 shrink-0" />
              <span className="text-gray-700">{event.location}</span>
            </div>
            {event.organizer && (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-400">Organizado por:</span>
                <span className="text-gray-700 font-medium">{event.organizer}</span>
              </div>
            )}
          </div>

          <p className="text-sm text-gray-600 leading-relaxed">{event.description}</p>

          <div className="space-y-2">
            {event.whatsapp && (
              <button onClick={openWhatsApp} className="w-full flex items-center justify-center gap-2 py-3 rounded-[var(--raio)] bg-green-500 text-white font-semibold text-sm">
                <MessageCircle size={18} /> Falar no WhatsApp
              </button>
            )}
            {(event.latitude || event.location) && (
              <button onClick={openMaps} className="w-full flex items-center justify-center gap-2 py-3 rounded-[var(--raio)] bg-amber-50 text-amber-800 font-semibold text-sm border border-amber-200">
                <MapPin size={18} /> Como chegar
              </button>
            )}
            {event.instagram && (
              <a
                href={`https://instagram.com/${event.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl"
              >
                <InstagramIcon size={16} className="text-pink-600" />
                <span className="text-sm font-medium text-pink-700">@{event.instagram}</span>
              </a>
            )}
            {event.website && (
              <a
                href={event.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl"
              >
                <Globe size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-blue-700 truncate">{event.website.replace(/^https?:\/\//, '')}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
