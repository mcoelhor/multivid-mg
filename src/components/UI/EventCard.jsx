import { useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Clock, Heart } from 'lucide-react'
import { useFavorites } from '../../hooks/useFavorites'

const CATEGORY_LABELS = {
  musica: 'Música', gastronomia: 'Gastronomia', festival: 'Festival',
  esporte: 'Esporte', cultura: 'Cultura', turismo: 'Turismo',
  infantil: 'Infantil', feiras: 'Feiras', shows: 'Shows',
}

function formatEventDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })
}

export function EventCard({ event }) {
  const navigate = useNavigate()
  const { isFavoriteEvent, toggleEvent } = useFavorites()
  const isFav = isFavoriteEvent(event.id)

  return (
    <div
      className="bg-white rounded-[var(--raio)] overflow-hidden shadow-sm cursor-pointer"
      onClick={() => navigate(`/evento/${event.id}`)}
    >
      <div className="relative">
        {event.image ? (
          <img src={event.image} alt={event.title} className="w-full h-44 object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-44 bg-gradient-to-br from-green-900 to-emerald-700 flex items-center justify-center">
            <Calendar size={44} strokeWidth={1.4} className="text-white/40" />
          </div>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); toggleEvent(event.id) }}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm"
        >
          <Heart size={16} fill={isFav ? '#EF4444' : 'none'} stroke={isFav ? '#EF4444' : '#6B7280'} />
        </button>
        <div className="absolute bottom-3 left-3">
          <span className="bg-green-900/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            {CATEGORY_LABELS[event.category] || event.category}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-base leading-snug mb-2 line-clamp-2">
          {event.title}
        </h3>

        <div className="space-y-1.5 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-green-700 shrink-0" />
            <span>{formatEventDate(event.date_start)}</span>
            {event.time_start && (
              <>
                <Clock size={14} className="text-green-700 shrink-0" />
                <span>{event.time_start}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-green-700 shrink-0" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
