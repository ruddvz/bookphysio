import type { Metadata } from 'next'
import { AboutPageClient } from './AboutPageClient'

export const metadata: Metadata = {
  title: 'About BookPhysio.in — Our Mission',
  description:
    'BookPhysio.in is India\'s first physiotherapy-only booking platform. We connect patients with IAP-verified physiotherapists for transparent, hassle-free care.',
  alternates: { canonical: 'https://bookphysio.in/about' },
  openGraph: {
    title: 'About BookPhysio.in',
    description: 'India\'s first physiotherapy-only booking platform.',
    url: 'https://bookphysio.in/about',
    siteName: 'BookPhysio.in',
    locale: 'en_IN',
    type: 'website',
  },
}

export default function AboutPage() {
  return <AboutPageClient />
}
