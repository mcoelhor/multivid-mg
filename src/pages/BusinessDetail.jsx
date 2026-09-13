import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Phone, MessageCircle, Navigation2, Share2, Heart,
  MapPin, Globe, Clock, ChevronLeft,
} from 'lucide-react'

function InstagramIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  )
}
import { useBusinessBySlug } from '../hooks/useBusinesses'
import { useFavorites } from '../hooks/useFavorites'
import { LoadingSpinner } from '../components/UI/LoadingSpinner'
import { OpenBadge } from '../components/UI/Badge'
import { StarRating } from '../components/UI/StarRating'
import { BottomNav } from '../components/Layout/BottomNav'

const DAY_NAMES = {
  monday: 'Segunda', tuesday: 'Terça', wednesday: 'Quarta',
  thursday: 'Quinta', friday: 'Sexta', saturday: 'Sábado', sunday: 'Domingo',
}
const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const TODAY_KEY = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()]

function ImageCarousel({ images, name }) {
  const [current, setCurrent] = useState(0)
  if (!images?.length) {
    return (
      <div className="w-full h-72 bg-gradient-to-br from-green-900 to-emerald-600 flex items-center justify-center text-6xl">
        🏪
      </div>
    )
  }
  return (
    <div className="relative w-full h-72 overflow-hidden bg-gray-100">
      <img src={images[current]} alt={name} className="w-full h-full object-cover" />
      {images.length > 1 && (
        <>
          <button
            onClick={() => setCurrent(c => Math.max(0, c - 1))}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
            style={{ display: current === 0 ? 'none' : 'flex' }}
          >‹</button>
          <button
            onClick={() => setCurrent(c => Math.min(images.length - 1, c + 1))}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
            style={{ display: current === images.length - 1 ? 'none' : 'flex' }}
          >›</button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`swiper-dot ${i === current ? 'active' : ''}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function ActionButton({ icon: Icon, label, onClick, color = '#14532d', bg = '#F0FDF4', full = false }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm transition-all active:scale-95 ${full ? 'flex-1' : 'px-4'}`}
      style={{ background: bg, color }}
    >
      <Icon size={18} strokeWidth={2} />
      {label}
    </button>
  )
}

function openWhatsApp(whatsapp, name) {
  const msg = encodeURIComponent(`Olá! Vi o(a) *${name}* no Multivid MG e gostaria de mais informações.`)
  window.open(`https://wa.me/${whatsapp}?text=${msg}`, '_blank')
}

function openMaps(lat, lng, name) {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  const url = isIOS
    ? `maps://maps.apple.com/?q=${encodeURIComponent(name)}&ll=${lat},${lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(name)}`
  window.open(url, '_blank')
}

async function shareBusiness(name, slug) {
  const url = `${window.location.origin}/estabelecimento/${slug}`
  if (navigator.share) {
    try { await navigator.share({ title: name, text: `Confira ${name} no Multivid MG`, url }) } catch {}
  } else {
    await navigator.clipboard.writeText(url)
    alert('Link copiado!')
  }
}

export function BusinessDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { business, loading } = useBusinessBySlug(slug)
  const { isFavoriteBusiness, toggleBusiness } = useFavorites()

  if (loading) {
    return (
      <div className="min-h-dvh flex flex-col">
        <div className="h-72 bg-gray-200 animate-pulse" />
        <div className="p-4 space-y-3">
          <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
        </div>
        <BottomNav />
      </div>
    )
  }

  if (!business) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh gap-3">
        <span className="text-5xl">😕</span>
        <p className="text-gray-600 font-medium">Estabelecimento não encontrado</p>
        <button onClick={() => navigate(-1)} className="text-green-800 text-sm font-semibold">Voltar</button>
        <BottomNav />
      </div>
    )
  }

  const isFav = isFavoriteBusiness(business.id)

  return (
    <div className="flex flex-col min-h-dvh pb-safe">
      <div className="relative">
        <ImageCarousel images={business.images} name={business.name} />

        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-9 h-9 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
        >
          <ChevronLeft size={22} />
        </button>

        <button
          onClick={() => toggleBusiness(business.id)}
          className="absolute top-4 right-4 w-9 h-9 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center"
        >
          <Heart size={18} fill={isFav ? '#EF4444' : 'none'} stroke={isFav ? '#EF4444' : 'white'} />
        </button>
      </div>

      <div className="flex-1 bg-white rounded-t-3xl -mt-4 relative z-10 px-5 pt-5 pb-8 space-y-5">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h1 className="text-xl font-bold text-gray-900 leading-tight">{business.name}</h1>
            <OpenBadge isOpen={business.isOpen} />
          </div>
          <StarRating rating={business.rating} count={business.review_count} size="md" />
          {business.address && (
            <p className="flex items-start gap-1.5 text-sm text-gray-500 mt-2">
              <MapPin size={14} className="text-green-700 mt-0.5 shrink-0" />
              {business.address}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          {business.phone && (
            <ActionButton
              icon={Phone}
              label="Ligar"
              onClick={() => window.open(`tel:${business.phone}`, '_self')}
              full
              color="#1D4ED8"
              bg="#EFF6FF"
            />
          )}
          {business.whatsapp && (
            <ActionButton
              icon={MessageCircle}
              label="WhatsApp"
              onClick={() => openWhatsApp(business.whatsapp, business.name)}
              full
              color="#15803d"
              bg="#F0FDF4"
            />
          )}
        </div>

        <div className="flex gap-2">
          {business.latitude && (
            <ActionButton
              icon={Navigation2}
              label="Como chegar"
              onClick={() => openMaps(business.latitude, business.longitude, business.name)}
              full
              color="#B45309"
              bg="#FFFBEB"
            />
          )}
          <ActionButton
            icon={Share2}
            label="Compartilhar"
            onClick={() => shareBusiness(business.name, business.slug)}
            full
            color="#6B7280"
            bg="#F9FAFB"
          />
        </div>

        {business.description && (
          <div>
            <h2 className="text-sm font-bold text-gray-800 mb-2">Sobre</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{business.description}</p>
          </div>
        )}

        {business.hours && (
          <div>
            <h2 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Clock size={15} className="text-green-700" /> Horário de Funcionamento
            </h2>
            <div className="bg-gray-50 rounded-2xl overflow-hidden">
              {DAY_ORDER.map(day => {
                const h = business.hours[day]
                const isToday = day === TODAY_KEY
                return (
                  <div
                    key={day}
                    className={`flex items-center justify-between px-4 py-2.5 text-sm border-b border-gray-100 last:border-0 ${isToday ? 'bg-green-50' : ''}`}
                  >
                    <span className={`font-medium ${isToday ? 'text-green-800' : 'text-gray-700'}`}>
                      {DAY_NAMES[day]} {isToday && '(hoje)'}
                    </span>
                    {h?.closed ? (
                      <span className="text-red-500 text-xs font-medium">Fechado</span>
                    ) : h?.open === '00:00' && h?.close === '23:59' ? (
                      <span className="text-green-600 text-xs font-medium">24 horas</span>
                    ) : (
                      <span className={`${isToday ? 'text-green-700 font-semibold' : 'text-gray-500'}`}>
                        {h?.open} – {h?.close}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {(business.instagram || business.website) && (
          <div>
            <h2 className="text-sm font-bold text-gray-800 mb-2">Links</h2>
            <div className="flex flex-col gap-2">
              {business.instagram && (
                <a
                  href={`https://instagram.com/${business.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl"
                >
                  <InstagramIcon size={18} className="text-pink-600" />
                  <span className="text-sm font-medium text-pink-700">@{business.instagram}</span>
                </a>
              )}
              {business.website && (
                <a
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl"
                >
                  <Globe size={18} className="text-blue-600" />
                  <span className="text-sm font-medium text-blue-700 truncate">{business.website.replace(/^https?:\/\//, '')}</span>
                </a>
              )}
            </div>
          </div>
        )}

        {business.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {business.tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
