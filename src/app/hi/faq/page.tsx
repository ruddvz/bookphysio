import type { Metadata } from 'next'
import { HiFAQPageClient } from './HiFAQPageClient'

export const metadata: Metadata = {
  title: 'FAQ — BookPhysio.in (हिंदी)',
  alternates: { canonical: 'https://bookphysio.in/hi/faq' },
}

export default function HindiFAQPage() {
  return <HiFAQPageClient />
}
