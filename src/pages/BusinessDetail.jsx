import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Phone, MessageCircle, Navigation, Share2, Heart, MapPin, Globe, Clock, ChevronLeft, ChevronDown, Mail, Flag } from 'lucide-react'
import { useBusinessBySlug, useBusinesses } from '../hooks/useBusinesses'
import { useFavorites } from '../hooks/useFavorites'
import { Capa, BusinessCard, planoAtivo } from '../components/UI/BusinessCard'
import { StatusPill, ParceiroBadge, VerificadoBadge } from '../components/UI/Badge'
import { InstagramIcon } from '../components/UI/Icon'
import { BottomNav } from '../components/Layout/BottomNav'
import { Rodape } from '../components/Layout/Rodape'
import { useTitulo } from '../components/Layout/Layout'
import { Parceiros } from '../components/Parceiros'
import { CartaoOferta } from '../components/Oferta'
import { AvisarAbertura } from '../components/Avisar'
import { useOfertas } from '../hooks/useOfertas'
import { nomeSub } from '../data/categories'
import { semanaLinhas } from '../lib/horario'
import { registrar, linkTel, linkWhatsApp, linkRota, linkInstagram } from '../lib/track'

function Fotos({ b }) {
  const [i, setI] = useState(0)
  if (!b.images?.length) return <Capa b={b} alto="h-44" grande />
  return (
    <div className="relative h-64 overflow-hidden bg-[var(--nevoa-2)]">
      <div className="flex h-full snap-x snap-mandatory overflow-x-auto scrollbar-hide" onScroll={e => setI(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}>
        {b.images.map((src, k) => <img key={src} src={src} alt={k === 0 ? b.name : ''} className="h-full w-full shrink-0 snap-center object-cover" />)}
      </div>
      {b.images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-1.5">
          {b.images.map((_, k) => <span key={k} className="h-1.5 rounded-full bg-white transition-all duration-200" style={{ width: k === i ? 16 : 6, opacity: k === i ? 1 : 0.6 }} />)}
        </div>
      )}
    </div>
  )
}

async function compartilhar(b) {
  const url = `${location.origin}/estabelecimento/${b.slug}?utm_source=compartilhado&utm_medium=whatsapp`
  const texto = `${b.name}${b.st?.estado === 'aberto' ? ' (aberto agora)' : ''} · Monte Verde MG`
  try {
    if (navigator.share) await navigator.share({ title: b.name, text: texto, url })
    else { await navigator.clipboard.writeText(url); alert('Link copiado.') }
    registrar('compartilhar', { businessId: b.id })
  } catch { /* cancelado */ }
}

export function BusinessDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { business: b, loading } = useBusinessBySlug(slug)
  const { businesses: mesmos } = useBusinesses({ category: b?.category })
  const { isFavoriteBusiness, toggleBusiness } = useFavorites()
  const [horarios, setHorarios] = useState(false)
  const { porLugar } = useOfertas()
  const ofertas = b ? porLugar.get(b.id) || [] : []
  useTitulo(b ? `${b.name} · ${nomeSub(b)}` : 'Monte Verde MG')

  useEffect(() => { if (b?.id) registrar('view', { businessId: b.id }) }, [b?.id])

  if (loading) {
    return (
      <div className="min-h-dvh">
        <div className="esqueleto h-56" />
        <div className="space-y-3 p-5"><div className="esqueleto h-7 w-3/4 rounded-lg" /><div className="esqueleto h-4 w-1/2 rounded-lg" /><div className="esqueleto h-12 rounded-xl" /></div>
        <BottomNav />
      </div>
    )
  }
  if (!b) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-8 text-center">
        <p className="font-semibold">Não encontramos esse lugar.</p>
        <button onClick={() => navigate('/')} className="botao botao-pri">Voltar ao início</button>
        <BottomNav />
      </div>
    )
  }

  const fav = isFavoriteBusiness(b.id)
  const semana = semanaLinhas(b)
  const local = [b.address, b.city, 'MG'].filter(Boolean).join(', ')
  const outros = mesmos.filter(x => x.id !== b.id && x.subcategory === b.subcategory).slice(0, 4)
  const acao = (kind) => () => registrar(kind, { businessId: b.id })

  return (
    <main className="flex min-h-dvh flex-col pb-safe">
      <div className="relative">
        <Fotos b={b} />
        <button onClick={() => (history.length > 1 ? navigate(-1) : navigate('/'))} className="pressiona absolute left-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[var(--araucaria)]" style={{ top: 'calc(env(safe-area-inset-top) + 14px)' }} aria-label="Voltar"><ChevronLeft size={22} /></button>
        <div className="absolute right-4 flex gap-2" style={{ top: 'calc(env(safe-area-inset-top) + 14px)' }}>
          <button onClick={() => compartilhar(b)} className="pressiona flex h-11 w-11 items-center justify-center rounded-full bg-white text-[var(--araucaria)]" aria-label="Compartilhar"><Share2 size={18} /></button>
          <button onClick={() => toggleBusiness(b.id)} aria-pressed={fav} className="pressiona flex h-11 w-11 items-center justify-center rounded-full bg-white text-[var(--araucaria)]" aria-label="Favoritar"><Heart size={18} className={`coracao ${fav ? 'ativo' : ''}`} /></button>
        </div>
      </div>

      <div className="relative z-10 -mt-4 flex-1 rounded-t-[28px] bg-[var(--nevoa)] px-5 pt-6">
        <div className="sobe" style={{ '--i': 0 }}>
          <h1 className="titulo">{b.name}</h1>
          <p className="mt-2 text-[16px] font-semibold text-[var(--musgo)]">{nomeSub(b)}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusPill st={b.st} longo />
            {planoAtivo(b) !== 'free' && <ParceiroBadge plano={planoAtivo(b)} />}
            {b.verified_at && <VerificadoBadge />}
          </div>
          {b.description && <p className="mt-3 text-[17px] leading-relaxed">{b.description}</p>}
        </div>

        {ofertas.length > 0 && (
          <div className="sobe mt-4 space-y-3" style={{ '--i': 1 }}>
            {ofertas.map(o => <CartaoOferta key={o.id} oferta={o} lugar={b} />)}
          </div>
        )}

        {/* Ações principais: grandes e no topo, porque quem abre aqui geralmente tem pressa */}
        <div className="sobe mt-4 grid grid-cols-2 gap-2" style={{ '--i': 1 }}>
          {b.phone && <a href={linkTel(b.phone)} onClick={acao('tel')} className="botao botao-pri" style={{ minHeight: 52 }}><Phone size={18} />Ligar</a>}
          {b.whatsapp && <a href={linkWhatsApp(b.whatsapp)} target="_blank" rel="noopener noreferrer" onClick={acao('whatsapp')} className="botao botao-wa" style={{ minHeight: 52 }}><MessageCircle size={18} />WhatsApp</a>}
          {(b.address || b.latitude) && <a href={linkRota(b)} target="_blank" rel="noopener noreferrer" onClick={acao('rota')} className={`botao botao-claro ${b.phone && b.whatsapp ? 'col-span-2' : ''}`} style={{ minHeight: 52 }}><Navigation size={18} />Como chegar</a>}
        </div>
        <AvisarAbertura b={b} />

        <div className="sobe mt-4 divide-y divide-[var(--nevoa)] rounded-[var(--raio)] bg-[var(--papel)]" style={{ '--i': 2 }}>
          {b.address && (
            <div className="flex gap-3 p-4"><MapPin size={18} className="mt-0.5 shrink-0 text-[var(--verde)]" /><p className="text-[15px]"><span className="sr-only">Endereço: </span>{local}</p></div>
          )}
          {(b.phone || b.phone2) && (
            <div className="flex gap-3 p-4"><Phone size={18} className="mt-0.5 shrink-0 text-[var(--verde)]" /><p className="num flex flex-wrap items-center gap-x-1 text-[15px]">
              {b.phone && <a href={linkTel(b.phone)} onClick={acao('tel')} className="inline-flex min-h-11 items-center underline decoration-black/20 underline-offset-4">{b.phone}</a>}
              {b.phone2 && <> · <a href={linkTel(b.phone2)} onClick={acao('tel')} className="inline-flex min-h-11 items-center underline decoration-black/20 underline-offset-4">{b.phone2}</a></>}
            </p></div>
          )}
          <div className="p-4">
            <button onClick={() => setHorarios(v => !v)} aria-expanded={horarios} disabled={!semana.length} className="flex min-h-11 w-full items-center gap-3 text-left">
              <Clock size={18} className="shrink-0 text-[var(--verde)]" />
              <span className="flex-1 text-[15px]">{semana.length ? 'Horários da semana' : <>Horário a confirmar. <Link to="/mais#corrigir" className="font-semibold text-[var(--musgo)] underline underline-offset-4">Sabe o horário?</Link></>}</span>
              {semana.length > 0 && <ChevronDown size={18} className="text-[var(--leve)] transition-transform duration-200" style={{ transform: horarios ? 'rotate(180deg)' : 'none' }} />}
            </button>
            <div className={`abre ${horarios ? 'aberto' : ''}`}><div>
              <ul className="ml-[30px] mt-2 space-y-1">
                {semana.map(l => (
                  <li key={l.dias} className={`flex justify-between text-sm ${l.hoje ? 'font-semibold text-[var(--verde)]' : 'text-[var(--araucaria)]'}`}>
                    <span>{l.dias}{l.hoje ? ' (hoje)' : ''}</span><span className="num">{l.texto}</span>
                  </li>
                ))}
              </ul>
            </div></div>
            {b.open_24h?.startsWith('plant') && <p className="ml-[30px] mt-2 text-[13px] text-[#7a5a08]">Atende plantão 24h por telefone.</p>}
          </div>
          {b.instagram && (
            <a href={linkInstagram(b.instagram)} target="_blank" rel="noopener noreferrer" onClick={acao('instagram')} className="flex items-center gap-3 p-4"><InstagramIcon size={18} className="text-[var(--verde)]" /><span className="text-[15px]">@{b.instagram.replace(/^@|.*instagram\.com\//g, '').replace(/\/$/, '')}</span></a>
          )}
          {b.website && (
            <a href={b.website} target="_blank" rel="noopener noreferrer" onClick={acao('site')} className="flex items-center gap-3 p-4"><Globe size={18} className="text-[var(--verde)]" /><span className="truncate text-[15px]">{b.website.replace(/^https?:\/\/(www\.)?/, '')}</span></a>
          )}
          {b.email && (
            <a href={`mailto:${b.email}`} className="flex items-center gap-3 p-4"><Mail size={18} className="text-[var(--verde)]" /><span className="truncate text-[15px]">{b.email}</span></a>
          )}
        </div>

        <Link to="/mais#corrigir" className="mt-2 flex min-h-11 items-center gap-2 px-1 text-[14px] text-[var(--leve)]"><Flag size={14} />Informação desatualizada? Avise a gente.</Link>
      </div>

      {(b.category === 'construcao' || b.category === 'imobiliarias') && <Parceiros contexto={b.category} />}

      {outros.length > 0 && (
        <section className="px-5 pt-6">
          <h2 className="titulo mb-4">Outros parecidos</h2>
          <div className="space-y-3">{outros.map((x, i) => <BusinessCard key={x.id} business={x} index={i} compacto />)}</div>
        </section>
      )}
      <Rodape />
      <BottomNav />
    </main>
  )
}
