import type { CSSProperties } from 'react'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from '@/app/providers'
import { CookieConsent } from '@/components/CookieConsent'
import { PublicAnalytics } from '@/components/PublicAnalytics'
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration'
import { SupportChatWidgetLoader } from '@/components/SupportChatWidgetLoader'

const fontVariables = {
  ['--font-inter' as const]: '"Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  ['--font-outfit' as const]: '"Outfit", "Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
} as CSSProperties

export const metadata: Metadata = {
  metadataBase: new URL('https://bookphysio.in'),
  title: 'Book Physiotherapists Online in India | Home Visits | BookPhysio.in',
  description:
    'Find and book IAP-verified physiotherapists in India for home visits and in-clinic sessions. Clear pricing, real availability, and same-day slots with many providers.',
  keywords: 'physiotherapist near me, book physiotherapist online India, home visit physiotherapy, physio booking India',
  icons: {
    icon: '/icon.png?v=20260411',
    shortcut: '/icon.png?v=20260411',
    apple: '/icon.png?v=20260411',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    title: 'BookPhysio',
    statusBarStyle: 'default',
    capable: true,
  },
  alternates: {
    canonical: 'https://bookphysio.in',
  },
  openGraph: {
    title: 'Book Physiotherapists Online in India | Home Visits | BookPhysio.in',
    description:
      'BookPhysio is a focused booking platform for physiotherapy in India. Find IAP-verified physiotherapists for home visits and in-clinic sessions.',
    siteName: 'BookPhysio',
    type: 'website',
    url: 'https://bookphysio.in',
    locale: 'en_IN',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'BookPhysio: Book Verified Physiotherapists in India',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Book Physiotherapists Online in India | Home Visits | BookPhysio.in',
    description:
      'BookPhysio is a focused booking platform for physiotherapy in India. Find IAP-verified physiotherapists for home visits and in-clinic sessions.',
    images: ['/opengraph-image'],
  },
}

export const viewport: Viewport = {
  themeColor: '#18312D',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full antialiased" style={fontVariables}>
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-[#00766C] focus:text-white focus:rounded-lg focus:text-sm focus:font-semibold focus:outline-none focus:ring-2 focus:ring-white">
          Skip to main content
        </a>
        <noscript>You need JavaScript enabled to use BookPhysio.</noscript>
        <Providers><main id="main-content">{children}</main></Providers>
        <CookieConsent />
        <PublicAnalytics />
        <ServiceWorkerRegistration />
        <SupportChatWidgetLoader />
      </body>
    </html>
  )
}
