import type { Metadata } from 'next'
import { FAQPageClient } from './FAQPageClient'

export const metadata: Metadata = {
  title: 'FAQ — BookPhysio.in',
  description:
    'Frequently asked questions about booking physiotherapy sessions, payments, refunds, and privacy on BookPhysio.in.',
  alternates: { canonical: 'https://bookphysio.in/faq' },
}

export default function FAQPage() {
  return <FAQPageClient />
}
