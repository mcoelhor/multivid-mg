import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, MessageCircle } from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { useBusinesses } from '../hooks/useBusinesses'
import { renderToStaticMarkup } from 'react-dom/server'
import { CATEGORIES, categoria, iconeDe, nomeSub } from '../data/categories'
import { Icon } from '../components/UI/Icon'
import { StatusPill } from '../components/UI/Badge'
import { registrar, linkWhatsApp } from '../lib/track'


function MapView({ businesses, onSelect }) {
  const [MapContainer, setMapContainer] = useState(null)
  const [TileLayer, setTileLayer] = useState(null)
  const [Marker, setMarkerComp] = useState(null)
  const [Popup, setPopup] = useState(null)
  const [L, setL] = useState(null)

  useEffect(() => {
    import('leaflet').then(leaflet => {
      import('leaflet/dist/leaflet.css')
      const L = leaflet.default
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })
      setL(L)
    })
    import('react-leaflet').then(rl => {
      setMapContainer(() => rl.MapContainer)
      setTileLayer(() => rl.TileLayer)
      setMarkerComp(() => rl.Marker)
      setPopup(() => rl.Popup)
    })
  }, [])

  if (!MapContainer || !TileLayer || !Marker || !Popup || !L) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-green-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Carregando mapa...</p>
        </div>
      </div>
    )
  }

  const createIcon = (b) => {
    const bg = categoria(b.category)?.tint || '#14532d'
    const svg = renderToStaticMarkup(<Icon name={iconeDe(b)} size={16} strokeWidth={2.2} />)
    return L.divIcon({
      html: `<div class="pino" style="background:${bg}">${svg}</div>`,
      className: '',
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      popupAnchor: [0, -36],
    })
  }

  return (
    <MapContainer
      center={[-22.8686, -46.0422]}
      zoom={14}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {businesses.map(b => b.latitude && b.longitude ? (
        <Marker
          key={b.id}
          position={[b.latitude, b.longitude]}
          icon={createIcon(b)}
          eventHandlers={{ click: () => onSelect(b) }}
        />
      ) : null)}
    </MapContainer>
  )
}

function BottomSheet({ business, onClose }) {
  const navigate = useNavigate()
  if (!business) return null

  return (
    <div className="absolute bottom-20 left-0 right-0 mx-5 bg-white rounded-[var(--raio)] shadow-2xl p-4 z-[1000]">
      <div className="flex items-start gap-3">
        {business.images?.[0] ? (
          <img src={business.images[0]} alt={business.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-2xl shrink-0">
            <Icon name={iconeDe(business)} size={24} className="text-[var(--leve)]" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-base leading-tight line-clamp-1">{business.name}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{nomeSub(business)}</p>
          <StatusPill st={business.st} className="mt-1" />
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => navigate(`/estabelecimento/${business.slug}`)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold text-white"
              style={{ background: '#14532d' }}
            >
              Ver detalhes
            </button>
            {business.whatsapp && (
              <a
                href={linkWhatsApp(business.whatsapp)} target="_blank" rel="noopener noreferrer"
                onClick={() => registrar('whatsapp', { businessId: business.id })}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-green-500 text-white text-xs font-semibold"
              >
                <MessageCircle size={13} /> WhatsApp
              </a>
            )}
          </div>
        </div>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 shrink-0">
          <X size={14} className="text-gray-500" />
        </button>
      </div>
    </div>
  )
}

export function MapPage() {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedBusiness, setSelectedBusiness] = useState(null)
  const { businesses, loading } = useBusinesses({ category: selectedCategory || undefined })

  return (
    <Layout title="Mapa" showBack={false}>
      <div className="relative flex flex-col" style={{ height: 'calc(100dvh - 8rem)' }}>
        <div className="flex gap-2 px-5 py-2 overflow-x-auto scrollbar-hide absolute top-0 left-0 right-0 z-[999] bg-gradient-to-b from-white/80 to-transparent backdrop-blur-sm">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              !selectedCategory ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200'
            }`}
            style={!selectedCategory ? { background: '#14532d' } : {}}
          >
            Todos
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                selectedCategory === cat.id ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200'
              }`}
              style={selectedCategory === cat.id ? { background: cat.tint } : {}}
            >
              <Icon name={cat.icon} size={13} /> {cat.name}
            </button>
          ))}
        </div>

        <div className="flex-1 pt-12">
          <MapView businesses={businesses} onSelect={setSelectedBusiness} />
        </div>

        {!loading && (
          <p className="absolute bottom-24 left-4 right-4 z-[998] rounded-xl bg-white/95 px-3 py-2 text-xs text-[var(--leve)] shadow">
            {businesses.filter(b => b.latitude).length} de {businesses.length} lugares já têm localização no mapa. Os outros estão sendo marcados.
          </p>
        )}
        <BottomSheet business={selectedBusiness} onClose={() => setSelectedBusiness(null)} />
      </div>
    </Layout>
  )
}
