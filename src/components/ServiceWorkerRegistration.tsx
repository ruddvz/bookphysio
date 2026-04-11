'use client'

import { useEffect } from 'react'

/**
 * Registers the service worker for PWA support.
 * Only runs in production and when the browser supports service workers.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((err) => console.warn('SW registration failed:', err))
    }
  }, [])

  return null
}
