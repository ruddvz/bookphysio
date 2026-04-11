'use client'

import { useEffect } from 'react'

type DashboardRole = 'patient' | 'provider' | 'admin'

const MANIFEST_MAP: Record<DashboardRole, string> = {
  admin: '/manifest-admin.json',
  provider: '/manifest-provider.json',
  patient: '/manifest-patient.json',
}

const THEME_MAP: Record<DashboardRole, string> = {
  admin: '#1a1a2e',
  provider: '#7c3aed',
  patient: '#1e40af',
}

/**
 * Swaps the <link rel="manifest"> and <meta name="theme-color"> in the document head
 * to point to a role-specific manifest and theme color for proper PWA support
 * on each dashboard.
 */
export function DashboardManifest({ role }: { role: DashboardRole }) {
  useEffect(() => {
    // Swap manifest link
    const existingManifest = document.querySelector('link[rel="manifest"]')
    const manifestHref = MANIFEST_MAP[role]

    if (existingManifest) {
      existingManifest.setAttribute('href', manifestHref)
    } else {
      const link = document.createElement('link')
      link.rel = 'manifest'
      link.href = manifestHref
      document.head.appendChild(link)
    }

    // Swap theme color
    const existingTheme = document.querySelector('meta[name="theme-color"]')
    const themeColor = THEME_MAP[role]

    if (existingTheme) {
      existingTheme.setAttribute('content', themeColor)
    } else {
      const meta = document.createElement('meta')
      meta.name = 'theme-color'
      meta.content = themeColor
      document.head.appendChild(meta)
    }

    // Cleanup — restore defaults on unmount
    return () => {
      const manifest = document.querySelector('link[rel="manifest"]')
      if (manifest) manifest.setAttribute('href', '/manifest.json')

      const theme = document.querySelector('meta[name="theme-color"]')
      if (theme) theme.setAttribute('content', '#18312D')
    }
  }, [role])

  return null
}
