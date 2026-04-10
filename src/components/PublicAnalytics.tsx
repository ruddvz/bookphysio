'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Analytics } from '@vercel/analytics/next'

const PUBLIC_ANALYTICS_PATHS = new Set([
  '/',
  '/about',
  '/faq',
  '/how-it-works',
  '/privacy',
  '/terms',
  '/search',
  '/hi/search',
  '/hi/about',
  '/hi/faq',
  '/hi/how-it-works',
  '/hi/privacy',
  '/hi/terms',
])

const PUBLIC_ANALYTICS_PREFIXES = ['/city/', '/specialty/']
const PUBLIC_ANALYTICS_EXTRA_PREFIXES = ['/specialties/']
const COOKIE_CONSENT_KEY = 'cookie-consent'
const COOKIE_CONSENT_EVENT = 'cookie-consent-changed'

export function shouldTrackPublicPath(pathname: string | null): boolean {
  if (!pathname) {
    return false
  }

  return PUBLIC_ANALYTICS_PATHS.has(pathname)
    || PUBLIC_ANALYTICS_PREFIXES.some((prefix) => pathname.startsWith(prefix))
    || PUBLIC_ANALYTICS_EXTRA_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

function hasAcceptedAnalyticsConsent(): boolean {
  return window.localStorage.getItem(COOKIE_CONSENT_KEY) === 'accepted'
}

export function PublicAnalytics() {
  const pathname = usePathname()
  const [hasConsent, setHasConsent] = useState(false)

  useEffect(() => {
    const syncConsent = () => {
      setHasConsent(hasAcceptedAnalyticsConsent())
    }

    syncConsent()

    window.addEventListener(COOKIE_CONSENT_EVENT, syncConsent)
    window.addEventListener('storage', syncConsent)

    return () => {
      window.removeEventListener(COOKIE_CONSENT_EVENT, syncConsent)
      window.removeEventListener('storage', syncConsent)
    }
  }, [])

  if (!hasConsent || !shouldTrackPublicPath(pathname)) {
    return null
  }

  return <Analytics />
}