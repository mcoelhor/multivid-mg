/* Service worker do Monte Verde MG: notificações push e uso sem sinal.
   - Navegação: rede primeiro; sem rede, a última versão do app.
   - /assets: cache primeiro (nomes com hash, imutáveis).
   - Lista do guia, ofertas, avisos e fotos: cache enquanto atualiza por trás. */
const VERSAO = 'mv-sw-v2'
const APP = `${VERSAO}-app`
const DADOS = `${VERSAO}-dados`
const SUPA = 'cpoxykaksqlrqnstjonv.supabase.co'

self.addEventListener('install', e => {
  e.waitUntil(caches.open(APP).then(c => c.addAll(['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png']).catch(() => {})).then(() => self.skipWaiting()))
})
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => !k.startsWith(VERSAO)).map(k => caches.delete(k)))).then(() => self.clients.claim()))
})

self.addEventListener('fetch', e => {
  const req = e.request
  if (req.method !== 'GET') return
  const u = new URL(req.url)

  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(APP).then(x => x.put('/index.html', c)); return r })
      .catch(() => caches.match('/index.html')))
    return
  }
  if (u.origin === location.origin && u.pathname.startsWith('/assets/')) {
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(x => { const c = x.clone(); caches.open(APP).then(y => y.put(req, c)); return x })))
    return
  }
  // Dados do guia (lista, ofertas, avisos): rede primeiro, para o que mudou aparecer na hora; sem rede, a cópia guardada.
  if (u.hostname === SUPA && /\/rest\/v1\/(businesses|ofertas|avisos|planos|events)/.test(u.pathname)) {
    e.respondWith(caches.open(DADOS).then(async c => {
      try {
        const r = await fetch(req)
        if (r.ok) c.put(req, r.clone())
        return r
      } catch { return (await c.match(req)) || Response.error() }
    }))
    return
  }
  // Fotos e ícones: cache primeiro, atualiza por trás
  const fotos = u.hostname === SUPA && u.pathname.startsWith('/storage/v1/object/public/fotos/')
  if (fotos || (u.origin === location.origin && /\.(png|svg|webp|json)$/.test(u.pathname))) {
    e.respondWith(caches.open(DADOS).then(async c => {
      const guardado = await c.match(req)
      const rede = fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r }).catch(() => guardado)
      return guardado || rede
    }))
  }
})

self.addEventListener('push', e => {
  let d = {}
  try { d = e.data ? e.data.json() : {} } catch { d = { body: e.data && e.data.text() } }
  e.waitUntil(self.registration.showNotification(d.title || 'Monte Verde MG', {
    body: d.body || '', icon: '/icon-192.png', badge: '/icon-192.png', tag: d.tag || 'mv', renotify: false,
    data: { url: d.url || '/' },
  }))
})
self.addEventListener('notificationclick', e => {
  e.notification.close()
  const url = (e.notification.data && e.notification.data.url) || '/'
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(lista => {
    const aberta = lista.find(c => 'focus' in c)
    if (aberta) { aberta.navigate(url); return aberta.focus() }
    return self.clients.openWindow(url)
  }))
})
