import { useNavigate } from 'react-router-dom'
import { Heart, MapPin, MessageCircle, Phone } from 'lucide-react'
import { Icon } from './Icon'
import { StatusPill, ParceiroBadge } from './Badge'
import { useFavorites } from '../../hooks/useFavorites'
import { useGeolocation } from '../../hooks/useGeolocation'
import { iconeDe, nomeSub, categoria } from '../../data/categories'
import { registrar, linkWhatsApp, linkTel } from '../../lib/track'

/** Topo do cartão: foto quando existe; sem foto, uma faixa com o ícone do tipo (sem foto de banco). */
export function Capa({ b, alto = 'h-40', grande = false }) {
  if (b.images?.[0]) {
    return <img src={b.images[0]} alt="" className={`w-full ${alto} object-cover`} loading="lazy" />
  }
  const tint = categoria(b.category)?.tint || '#14532d'
  return (
    <div className={`relative w-full ${alto} overflow-hidden capa-sem-foto`} style={{ '--tint': tint }}>
      <Icon name={iconeDe(b)} size={grande ? 72 : 44} strokeWidth={1.3} className="absolute right-5 bottom-8 text-white/30" />
    </div>
  )
}

/** Quadrado com o ícone do tipo, na cor da categoria (usado quando não há foto). */
export function Selo({ b, tam = 48 }) {
  const tint = categoria(b.category)?.tint || '#14532d'
  return (
    <span className="flex shrink-0 items-center justify-center rounded-xl text-white" style={{ width: tam, height: tam, background: tint }}>
      <Icon name={iconeDe(b)} size={Math.round(tam * 0.46)} strokeWidth={1.9} />
    </span>
  )
}

function Texto({ b, dist, formatDistance, semPadding }) {
  return (
    <div className={`min-w-0 flex-1 ${semPadding ? '' : 'px-4 pt-3 pb-1'}`}>
      <h3 className="font-semibold text-[15px] leading-snug text-[#17241c] line-clamp-2">
        {b.name}{b.plan === 'premium' && !b.images?.[0] && <ParceiroBadge className="ml-1.5 align-middle" />}
      </h3>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
        <StatusPill st={b.st} />
        <span className="text-xs text-[#626a63]">{nomeSub(b)}{b.city && b.city !== 'Monte Verde' ? ` · ${b.city}` : ''}</span>
        {dist !== null && <span className="flex items-center gap-0.5 text-xs text-[#626a63]"><MapPin size={11} />{formatDistance(dist)}</span>}
      </div>
    </div>
  )
}

export function BusinessCard({ business: b, compacto = false, index = 0 }) {
  const navigate = useNavigate()
  const { isFavoriteBusiness, toggleBusiness } = useFavorites()
  const { getDistance, formatDistance, location } = useGeolocation()
  const isFav = isFavoriteBusiness(b.id)
  const dist = location && b.latitude ? getDistance(b.latitude, b.longitude) : null
  const abrir = () => navigate(`/estabelecimento/${b.slug}`)

  return (
    <article
      className="cartao entra bg-white rounded-2xl overflow-hidden ring-1 ring-black/[0.04]"
      style={{ '--i': Math.min(index, 10) }}
    >
      {b.images?.[0] ? (
        <button onClick={abrir} className="block w-full text-left pressiona" aria-label={`Ver ${b.name}`}>
          <div className="relative">
            <Capa b={b} alto={compacto ? 'h-28' : 'h-36'} />
            {b.plan === 'premium' && <ParceiroBadge className="absolute left-3 bottom-3" />}
          </div>
          <Texto b={b} dist={dist} formatDistance={formatDistance} />
        </button>
      ) : (
        <button onClick={abrir} className="flex w-full items-start gap-3 px-4 pt-4 text-left pressiona" aria-label={`Ver ${b.name}`}>
          <Selo b={b} />
          <Texto b={b} dist={dist} formatDistance={formatDistance} semPadding />
        </button>
      )}

      {compacto && !b.images?.[0] && <div className="h-4" />}
      {!compacto && (
        <div className="flex gap-2 px-4 pb-4 pt-3">
          {b.whatsapp ? (
            <a
              href={linkWhatsApp(b.whatsapp)} target="_blank" rel="noopener noreferrer"
              onClick={() => registrar('whatsapp', { businessId: b.id })}
              className="botao botao-wa flex-1"
            ><MessageCircle size={16} />WhatsApp</a>
          ) : b.phone ? (
            <a href={linkTel(b.phone)} onClick={() => registrar('tel', { businessId: b.id })} className="botao botao-pri flex-1">
              <Phone size={16} />Ligar
            </a>
          ) : (
            <button onClick={abrir} className="botao botao-sec flex-1">Ver detalhes</button>
          )}
          <button
            onClick={() => toggleBusiness(b.id)}
            className="botao botao-sec w-11 px-0"
            aria-label={isFav ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
            aria-pressed={isFav}
          >
            <Heart size={17} className={`coracao ${isFav ? 'ativo' : ''}`} />
          </button>
        </div>
      )}
    </article>
  )
}
