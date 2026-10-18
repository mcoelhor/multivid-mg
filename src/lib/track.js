import { supabase } from './supabase'

// Contagem anônima de cliques e visitas. Sem IP, sem cadastro:
// o "visitante" é um código aleatório que muda todo dia, só para contar pessoas únicas.

function visitante() {
  const hoje = new Date().toISOString().slice(0, 10)
  try {
    const salvo = JSON.parse(localStorage.getItem('mv_vis') || 'null')
    if (salvo?.dia === hoje) return salvo.id
    const id = crypto.getRandomValues(new Uint32Array(2)).join('').slice(0, 16)
    localStorage.setItem('mv_vis', JSON.stringify({ dia: hoje, id }))
    return id
  } catch {
    return 'anon'
  }
}

/**
 * De onde a pessoa veio, guardado por 30 dias no aparelho (primeiro toque):
 * utm_source/utm_medium da URL (QR code, Instagram, placa), ou o site que mandou (referrer),
 * ou "app" quando abriu pelo ícone instalado, ou "direto".
 */
export function origem() {
  try {
    const salvo = JSON.parse(localStorage.getItem('mv_origem') || 'null')
    if (salvo && Date.now() - salvo.t < 30 * 86400e3) return salvo.v
    const u = new URL(location.href)
    const utm = u.searchParams.get('utm_source') || u.searchParams.get('ref') || u.searchParams.get('origem')
    const medium = u.searchParams.get('utm_medium')
    let v = ''
    if (utm) v = `${utm}${medium ? '/' + medium : ''}`.toLowerCase().slice(0, 60)
    else if (window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone) v = 'app instalado'
    else if (document.referrer) {
      const h = new URL(document.referrer).hostname.replace(/^(www|l|lm|m)\./, '')
      v = /instagram/.test(h) ? 'instagram' : /facebook|fb\./.test(h) ? 'facebook' : /google/.test(h) ? 'google' : /whatsapp/.test(h) ? 'whatsapp' : /tiktok/.test(h) ? 'tiktok' : h.slice(0, 60)
    } else v = 'direto'
    localStorage.setItem('mv_origem', JSON.stringify({ v, t: Date.now() }))
    return v
  } catch { return 'desconhecida' }
}

const recentes = new Map()

/** kind: visita | view | tel | whatsapp | rota | site | instagram | busca | parceiro | lead */
export function registrar(kind, { businessId = null, term = '', results = -1 } = {}) {
  if (/bot|crawl|spider|preview|headless/i.test(navigator.userAgent)) return
  if (localStorage.getItem('mv_equipe') === '1') return // equipe não infla os números
  const chave = `${kind}|${businessId}|${term}`
  const agora = Date.now()
  if (kind !== 'busca' && agora - (recentes.get(chave) || 0) < 30 * 60 * 1000) return
  recentes.set(chave, agora)
  supabase.from('interactions').insert({
    kind, business_id: businessId, term: String(term).slice(0, 120), results, visitor: visitante(),
    source: origem(), path: location.pathname.slice(0, 80),
  }).then(() => {}, () => {})
}

/** Uma visita por dia por aparelho, com a origem. Chamar uma vez ao abrir o app. */
export function registrarVisita() {
  try {
    const hoje = new Date().toISOString().slice(0, 10)
    if (localStorage.getItem('mv_visita') === hoje) return
    localStorage.setItem('mv_visita', hoje)
  } catch { /* sem armazenamento: conta mesmo assim */ }
  registrar('visita', { term: origem() })
}

export const MSG_WA = 'Olá! Encontrei vocês no Portal Monte Verde (monteverdemg.com.br).'

export function linkWhatsApp(numero, texto = MSG_WA) {
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`
}

export function linkTel(tel) {
  const d = String(tel || '').replace(/\D/g, '')
  if (!d) return ''
  return d.length <= 3 ? `tel:${d}` : `tel:+55${d}`
}

export function linkRota(b) {
  const destino = b.latitude && b.longitude
    ? `${b.latitude},${b.longitude}`
    : `${b.address || b.name}, ${b.city || 'Monte Verde'}, Camanducaia - MG`
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destino)}`
}

export function linkInstagram(ig) {
  if (!ig) return ''
  return /^https?:\/\//.test(ig) ? ig : `https://instagram.com/${ig.replace(/^@/, '')}`
}
