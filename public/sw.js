// BookPhysio Service Worker — caches essential app shell assets for offline/PWA use.
// Uses a cache-first strategy for static assets and network-first for API calls.

const CACHE_NAME = 'bp-cache-v2'
const APP_SHELL = [
  '/',
  '/search',
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
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  // Skip non-GET and API/auth requests
  if (request.method !== 'GET') return
  if (request.url.includes('/api/')) return
  if (request.url.includes('/auth/')) return

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request).then((response) => {
        // Only cache same-origin successful responses (basic) or CORS (cors)
        if (!response || response.status !== 200 || (response.type !== 'basic' && response.type !== 'cors')) {
          return response
        }
        const clone = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        return response
      })
    }).catch(() => {
      // Offline fallback for navigation requests
      if (request.mode === 'navigate') {
        return caches.match('/')
      }
      return new Response('Offline', { status: 503 })
    })
  )
})
