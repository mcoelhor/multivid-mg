import { useNavigate } from 'react-router-dom'
import { Heart, MapPin, MessageCircle, Phone } from 'lucide-react'
import { Icon } from './Icon'
import { StatusPill, ParceiroBadge, VerificadoBadge } from './Badge'
import { useFavorites } from '../../hooks/useFavorites'
import { useGeolocation } from '../../hooks/useGeolocation'
import { iconeDe, nomeSub, categoria } from '../../data/categories'
import { registrar, linkWhatsApp, linkTel } from '../../lib/track'

export const planoAtivo = b => (b.plan === 'premium' || b.plan === 'destaque') && (!b.plan_expires_at || new Date(b.plan_expires_at) > new Date()) ? b.plan : 'free'

/** Topo com foto do lugar; sem foto, um campo chapado na cor do tipo com o ícone. */
export function Capa({ b, alto = 'h-40', grande = false }) {
  if (b.images?.[0]) {
    return <img src={b.images[0]} alt="" className={`w-full ${alto} object-cover`} loading="lazy" />
  }
  const tint = categoria(b.category)?.tint || '#2c6a45'
  return (
    <div className={`relative w-full ${alto} overflow-hidden capa-sem-foto`} style={{ '--tint': tint }}>
      <Icon name={iconeDe(b)} size={grande ? 88 : 48} strokeWidth={1.2} className="absolute bottom-8 right-6 text-white/35" />
    </div>
  )
}

/** Quadrado com o ícone do tipo, na cor da categoria. */
export function Selo({ b, tam = 52 }) {
  const tint = categoria(b.category)?.tint || '#2c6a45'
  return (
    <span className="flex shrink-0 items-center justify-center rounded-[14px] text-white" style={{ width: tam, height: tam, background: tint }}>
      <Icon name={iconeDe(b)} size={Math.round(tam * 0.44)} strokeWidth={1.9} />
    </span>
  )
}

function Texto({ b, dist, formatDistance }) {
  const plano = planoAtivo(b)
  return (
    <div className="min-w-0 flex-1">
      <h3 className="line-clamp-2 text-[19px] font-extrabold leading-tight tracking-[-0.02em]">{b.name}</h3>
      <p className="mt-0.5 text-[14px] text-[var(--leve)]">
        {nomeSub(b)}{b.city && b.city !== 'Monte Verde' ? ` · ${b.city}` : ''}
        {dist !== null && <span className="ml-1 inline-flex items-center gap-0.5"><MapPin size={12} />{formatDistance(dist)}</span>}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <StatusPill st={b.st} />
        {plano !== 'free' && <ParceiroBadge plano={plano} />}
        {b.verified_at && <VerificadoBadge />}
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
    <article className="entra overflow-hidden rounded-[var(--raio)] bg-[var(--papel)]" style={{ '--i': Math.min(index, 10) }}>
      {b.images?.[0] ? (
        <button onClick={abrir} className="pressiona block w-full text-left" aria-label={`Ver ${b.name}`}>
          <Capa b={b} alto={compacto ? 'h-32' : 'h-48'} />
          <div className="px-4 pt-3.5"><Texto b={b} dist={dist} formatDistance={formatDistance} /></div>
        </button>
      ) : (
        <button onClick={abrir} className="pressiona flex w-full items-start gap-3.5 px-4 pt-4 text-left" aria-label={`Ver ${b.name}`}>
          <Selo b={b} />
          <Texto b={b} dist={dist} formatDistance={formatDistance} />
        </button>
      )}

      {compacto ? <div className="h-4" /> : (
        <div className="flex gap-2 px-4 pb-4 pt-3.5">
          {b.whatsapp ? (
            <a href={linkWhatsApp(b.whatsapp)} target="_blank" rel="noopener noreferrer" onClick={() => registrar('whatsapp', { businessId: b.id })} className="botao botao-wa h-11 min-h-0 flex-1">
              <MessageCircle size={17} />WhatsApp
            </a>
          ) : b.phone ? (
            <a href={linkTel(b.phone)} onClick={() => registrar('tel', { businessId: b.id })} className="botao botao-pri h-11 min-h-0 flex-1"><Phone size={17} />Ligar</a>
          ) : (
            <button onClick={abrir} className="botao botao-sec h-11 min-h-0 flex-1">Ver detalhes</button>
          )}
          <button onClick={() => toggleBusiness(b.id)} className="botao botao-sec h-11 min-h-0 w-11 px-0" aria-label={isFav ? 'Remover dos salvos' : 'Salvar'} aria-pressed={isFav}>
            <Heart size={18} className={`coracao ${isFav ? 'ativo' : ''}`} />
          </button>
        </div>
      )}
    </article>
  )
}
