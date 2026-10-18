// Notificações push: "me avise quando chegar" e "avise quando abrir".
// Só funciona com o service worker; no iPhone, só com o app na tela de início.
const FUNCAO = 'https://cpoxykaksqlrqnstjonv.supabase.co/functions/v1/push'
const CHAVE_PUBLICA = 'BAuD7s4IZYdrR-g9i3ma9zje_kQNSUWbGzQOsiPxABv5vAcB5sMS07SH7lhwzl05nMooT2D1NZrzXmDNQuZeQP4'

export const ehIOS = () => /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream
export const instalado = () => window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true
export const suportaPush = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
/** iPhone fora da tela de início não recebe push: precisa instalar primeiro. */
export const precisaInstalar = () => ehIOS() && !instalado()
export const permissao = () => (typeof Notification !== 'undefined' ? Notification.permission : 'denied')

function b64ToU8(s) {
  const pad = '='.repeat((4 - (s.length % 4)) % 4)
  const raw = atob((s + pad).replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(raw, c => c.charCodeAt(0))
}

export function registrarSW() {
  if (!('serviceWorker' in navigator)) return Promise.resolve(null)
  return navigator.serviceWorker.register('/sw.js').catch(() => null)
}

function visitante() { try { return JSON.parse(localStorage.getItem('mv_vis') || 'null')?.id || null } catch { return null } }

/** Pede permissão, assina e guarda no servidor. Devolve a assinatura ou lança erro com mensagem para o usuário. */
export async function assinar({ chegada = null, dias = null } = {}) {
  if (!suportaPush()) throw new Error(precisaInstalar() ? 'No iPhone, primeiro adicione o app à tela de início (Compartilhar → Adicionar à Tela de Início) e abra por lá.' : 'Este navegador não recebe notificações.')
  const reg = await registrarSW()
  if (!reg) throw new Error('Não foi possível preparar as notificações.')
  await navigator.serviceWorker.ready
  const perm = await Notification.requestPermission()
  if (perm !== 'granted') throw new Error('Sem permissão para notificar. Libere nas configurações do navegador.')
  let sub = await reg.pushManager.getSubscription()
  if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToU8(CHAVE_PUBLICA) })
  const r = await fetch(`${FUNCAO}?acao=assinar`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subscription: sub.toJSON(), chegada, dias, visitor: visitante() }) })
  if (!r.ok) throw new Error('Não foi possível guardar a assinatura.')
  try { localStorage.setItem('mv_push', JSON.stringify({ endpoint: sub.endpoint, chegada, dias, t: Date.now() })) } catch { /* */ }
  return sub
}

export function assinaturaLocal() { try { return JSON.parse(localStorage.getItem('mv_push') || 'null') } catch { return null } }

/** "Avise quando abrir" para um lugar. */
export async function avisarQuandoAbrir(businessId) {
  const sub = await assinar()
  const r = await fetch(`${FUNCAO}?acao=abrir`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: sub.endpoint, business_id: businessId }) })
  if (!r.ok) throw new Error('Não foi possível registrar o aviso.')
  try {
    const l = JSON.parse(localStorage.getItem('mv_push_abrir') || '[]'); if (!l.includes(businessId)) l.push(businessId)
    localStorage.setItem('mv_push_abrir', JSON.stringify(l))
  } catch { /* */ }
}
export function jaPediuAviso(businessId) { try { return JSON.parse(localStorage.getItem('mv_push_abrir') || '[]').includes(businessId) } catch { return false } }

/** Data (AAAA-MM-DD) do próximo dia da semana escolhido no roteiro (0 = segunda), no fuso de Monte Verde. */
export function dataDoDia(diaSemana) {
  const agora = new Date()
  for (let k = 0; k < 7; k++) {
    const d = new Date(agora.getTime() + k * 86400e3)
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(d).map(x => [x.type, x.value]))
    const wd = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 }[p.weekday]
    if (wd === diaSemana) return `${p.year}-${p.month}-${p.day}`
  }
  return null
}
