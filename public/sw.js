// BookPhysio Service Worker
// Strategy:
//   - Navigations (HTML documents): NETWORK-FIRST, with cached fallback only when offline.
//     This prevents the user from being stuck on a stale build after a deploy — a single
//     refresh always picks up the latest HTML and the latest hashed JS chunks it references.
//   - Hashed Next.js static assets (/_next/static/*): CACHE-FIRST, immutable by hash.
//   - Other GETs (icons, manifests): cache-first with background refresh.
//   - API and auth requests are passed straight through to the network.

const CACHE_NAME = 'bp-cache-v3'
const OFFLINE_URL = '/'

const STATIC_ASSETS = [
  '/manifest.json',
  '/manifest-admin.json',
  '/manifest-provider.json',
  '/manifest-patient.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-admin-192.png',
  '/icon-admin-512.png',
  '/icon-patient-192.png',
  '/icon-patient-512.png',
  '/icon-provider-192.png',
  '/icon-provider-512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // Best-effort: never block install on a missing icon
      Promise.allSettled(STATIC_ASSETS.map((url) => cache.add(url)))
    )
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // Never intercept API or auth — let the network handle it.
  if (url.pathname.startsWith('/api/')) return
  if (url.pathname.startsWith('/auth/')) return

  // HTML navigations: network-first so deploys take effect immediately.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Don't cache navigations — we never want to serve stale HTML again.
          return response
        })
        .catch(async () => {
          // Offline fallback only.
          const cached = await caches.match(OFFLINE_URL)
          return cached || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } })
        })
    )
    return
  }

  // Hashed Next.js static assets are immutable — cache-first is safe and fast.
  const isHashedStatic = url.pathname.startsWith('/_next/static/')

  if (isHashedStatic) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          if (response && response.status === 200 && (response.type === 'basic' || response.type === 'cors')) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return response
        })
      })
    )
    return
  }

  // Other same-origin GETs (icons, manifests, fonts): cache-first with refresh.
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          if (response && response.status === 200 && (response.type === 'basic' || response.type === 'cors')) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return response
        })
        .catch(() => cached)
      return cached || fetchPromise
    })
  )
})
