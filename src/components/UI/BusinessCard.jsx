import { useNavigate } from 'react-router-dom'
import { Heart, MapPin, MessageCircle } from 'lucide-react'
import { StarRating } from './StarRating'
import { OpenBadge } from './Badge'
import { useFavorites } from '../../hooks/useFavorites'
import { useGeolocation } from '../../hooks/useGeolocation'
import { CATEGORIES } from '../../data/categories'

function getCategoryInfo(slug) {
  return CATEGORIES.find(c => c.id === slug) || null
}

function openWhatsApp(whatsapp, businessName) {
  const msg = encodeURIComponent(`Olá! Vi o(a) ${businessName} no Multivid MG e gostaria de mais informações.`)
  window.open(`https://wa.me/${whatsapp}?text=${msg}`, '_blank')
}

export function BusinessCard({ business }) {
  const navigate = useNavigate()
  const { isFavoriteBusiness, toggleBusiness } = useFavorites()
  const { getDistance, formatDistance } = useGeolocation()

  const cat = getCategoryInfo(business.category)
  const isFav = isFavoriteBusiness(business.id)
  const dist = business.latitude ? getDistance(business.latitude, business.longitude) : null

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm active:scale-98 transition-transform">
      <div className="relative">
        {business.images?.[0] ? (
          <img
            src={business.images[0]}
            alt={business.name}
            className="w-full h-44 object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-44 flex items-center justify-center text-5xl"
            style={{ background: cat?.bg || '#F3F4F6' }}
          >
            {cat?.icon || '🏪'}
          </div>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); toggleBusiness(business.id) }}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm"
        >
          <Heart size={16} fill={isFav ? '#EF4444' : 'none'} stroke={isFav ? '#EF4444' : '#6B7280'} />
        </button>
        {business.featured && (
          <span className="absolute top-3 left-3 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">
            ⭐ Destaque
          </span>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 text-base leading-tight line-clamp-1 flex-1">
            {business.name}
          </h3>
          <OpenBadge isOpen={business.isOpen} />
        </div>

        <p className="text-sm text-gray-500 mb-2 line-clamp-2">{business.description}</p>

        <div className="flex items-center justify-between mb-3">
          <StarRating rating={business.rating} count={business.review_count} />
          {dist !== null && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <MapPin size={11} />
              {formatDistance(dist)}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/estabelecimento/${business.slug}`)}
            className="flex-1 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: '#14532d' }}
          >
            Ver detalhes
          </button>
          {business.whatsapp && (
            <button
              onClick={() => openWhatsApp(business.whatsapp, business.name)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-white bg-green-500"
            >
              <MessageCircle size={15} />
              WhatsApp
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
