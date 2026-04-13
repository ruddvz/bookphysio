import type { Metadata } from 'next'
import { getLocalizedStaticAlternates } from '@/lib/i18n/static-pages'

export const metadata: Metadata = {
  title: 'How to Book a Physiotherapist Online in India | BookPhysio.in',
  description: 'Book a physiotherapist in 4 steps — search by condition, compare verified experts, pick a slot, and confirm. Same-day home visits and clinic sessions available.',
  alternates: {
    canonical: 'https://bookphysio.in/how-it-works',
    ...getLocalizedStaticAlternates('en', '/how-it-works'),
  },
  openGraph: {
    title: 'How It Works — BookPhysio.in',
    description: 'Book a physiotherapist in 4 simple steps on BookPhysio.in.',
    url: 'https://bookphysio.in/how-it-works',
    siteName: 'BookPhysio.in',
    locale: 'en_IN',
    type: 'website',
  },
}

export default function HowItWorksLayout({ children }: { children: React.ReactNode }) {
  return children
}