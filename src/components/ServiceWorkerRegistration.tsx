'use client'

import { useEffect } from 'react'

const RELOAD_FLAG = 'bp-sw-reloaded'

/**
 * Registers the service worker for PWA support, and self-heals existing
 * visitors who were poisoned by the previous cache-first SW (`bp-cache-v2`)
 * that pinned them to a stale HTML build:
 *
 *  - Forces an update check on every load.
 *  - Reloads the page exactly once when a new SW takes control, so the
 *    user immediately sees the latest bundle instead of waiting for the
 *    next manual hard-refresh.
 *  - Deletes any leftover legacy cache entries.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return

    let cancelled = false

    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        if (cancelled) return
        // Always check for an updated SW on load.
        registration.update().catch(() => {
          // Best-effort — never block the page on update check.
        })
      })
      .catch(() => { /* SW registration failed — non-critical */ })

    // When a new SW takes control, reload exactly once so the user gets the
    // newest HTML/JS bundle instead of being stuck on the previously cached one.
    const onControllerChange = () => {
      try {
        if (sessionStorage.getItem(RELOAD_FLAG) === '1') return
        sessionStorage.setItem(RELOAD_FLAG, '1')
      } catch {
        // sessionStorage may be unavailable (private mode, embedded contexts).
      }
      window.location.reload()
    }
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)

    // One-shot purge of any leftover legacy caches from the cache-first SW.
    if ('caches' in window) {
      caches
        .keys()
        .then((keys) =>
          Promise.all(
            keys
              .filter((key) => key !== 'bp-cache-v3')
              .map((key) => caches.delete(key))
          )
        )
        .catch(() => {
          // Best-effort.
        })
    }

    return () => {
      cancelled = true
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
    }
  }, [])

  return null
}
