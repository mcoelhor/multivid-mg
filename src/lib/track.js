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

const recentes = new Map()

/** kind: view | tel | whatsapp | rota | site | instagram | busca | parceiro | lead */
export function registrar(kind, { businessId = null, term = '', results = -1 } = {}) {
  if (/bot|crawl|spider|preview|headless/i.test(navigator.userAgent)) return
  if (localStorage.getItem('mv_equipe') === '1') return // equipe não infla os números
  const chave = `${kind}|${businessId}|${term}`
  const agora = Date.now()
  if (kind !== 'busca' && agora - (recentes.get(chave) || 0) < 30 * 60 * 1000) return
  recentes.set(chave, agora)
  supabase.from('interactions').insert({
    kind, business_id: businessId, term: String(term).slice(0, 120), results, visitor: visitante(),
  }).then(() => {}, () => {})
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
