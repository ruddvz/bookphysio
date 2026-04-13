import type { Metadata } from 'next'
import { getLocalizedStaticAlternates } from '@/lib/i18n/static-pages'

export const metadata: Metadata = {
  title: 'FAQ — Physiotherapy Booking Questions | BookPhysio.in',
  description: 'Answers to common questions about booking physiotherapists, home visits, IAP verification, payments, and cancellations on BookPhysio.in.',
  alternates: {
    canonical: 'https://bookphysio.in/faq',
    ...getLocalizedStaticAlternates('en', '/faq'),
  },
  openGraph: {
    title: 'FAQ — BookPhysio.in',
    description: 'Common questions about booking physiotherapists on BookPhysio.in.',
    url: 'https://bookphysio.in/faq',
    siteName: 'BookPhysio.in',
    locale: 'en_IN',
    type: 'website',
  },
}

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return children
}
