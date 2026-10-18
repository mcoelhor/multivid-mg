// Pixel da Meta e tag do Google: só carregam depois que a pessoa aceita cookies de marketing,
// e só se o painel tiver os IDs (tabela config). Eventos: contato, lead, roteiro, visita a lugar.
import { supabase } from './supabase'

const CHAVE = 'mv_cookies' // 'tudo' | 'essencial'
let ids = null
let carregado = false
const fila = []

export function consentimento() { try { return localStorage.getItem(CHAVE) } catch { return null } }
export function guardarConsentimento(v) { try { localStorage.setItem(CHAVE, v) } catch { /* */ } if (v === 'tudo') carregar() }

async function lerIds() {
  if (ids) return ids
  const { data } = await supabase.from('config').select('chave,valor').in('chave', ['meta_pixel_id', 'google_tag_id'])
  ids = Object.fromEntries((data || []).map(x => [x.chave, (x.valor || '').trim()]))
  return ids
}

function script(src) { const s = document.createElement('script'); s.async = true; s.src = src; document.head.appendChild(s) }

/** Carrega os scripts, se houver consentimento e IDs. Idempotente. */
export async function carregar() {
  if (carregado || consentimento() !== 'tudo') return
  const c = await lerIds()
  if (!c.meta_pixel_id && !c.google_tag_id) return
  carregado = true
  if (/^\d{6,20}$/.test(c.meta_pixel_id)) {
    window.fbq = window.fbq || function () { (window.fbq.q = window.fbq.q || []).push(arguments) }
    window.fbq.loaded = true; window.fbq.version = '2.0'; window.fbq.queue = window.fbq.q = window.fbq.q || []
    script('https://connect.facebook.net/en_US/fbevents.js')
    window.fbq('init', c.meta_pixel_id)
    window.fbq('track', 'PageView')
  }
  if (/^(G|AW|GT)-[A-Z0-9]{4,16}$/.test(c.google_tag_id)) {
    window.dataLayer = window.dataLayer || []
    window.gtag = function () { window.dataLayer.push(arguments) }
    script(`https://www.googletagmanager.com/gtag/js?id=${c.google_tag_id}`)
    window.gtag('js', new Date())
    window.gtag('config', c.google_tag_id, { anonymize_ip: true })
  }
  fila.splice(0).forEach(([n, p]) => evento(n, p))
}

/** Evento de marketing (só sai se os pixels estiverem carregados). */
export function evento(nome, params = {}) {
  if (!carregado) { if (consentimento() === 'tudo') fila.push([nome, params]); return }
  const meta = { contato: 'Contact', lead: 'Lead', roteiro: 'CustomizeProduct', lugar: 'ViewContent', oferta: 'Lead' }[nome]
  try { if (window.fbq) window.fbq(meta ? 'track' : 'trackCustom', meta || nome, params) } catch { /* */ }
  try { if (window.gtag) window.gtag('event', nome, params) } catch { /* */ }
}

/** Mudança de página no app (os pixels só veem a primeira). */
export function pagina(path) {
  if (!carregado) return
  try { if (window.fbq) window.fbq('track', 'PageView') } catch { /* */ }
  try { if (window.gtag && ids?.google_tag_id) window.gtag('event', 'page_view', { page_path: path }) } catch { /* */ }
}
