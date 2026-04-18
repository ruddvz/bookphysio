import type { Metadata } from 'next'
import { TermsPageClient } from './TermsPageClient'

export const metadata: Metadata = {
  title: 'Terms of Service — BookPhysio.in',
  description:
    'Terms of use for the BookPhysio.in physiotherapy booking platform, covering accounts, bookings, payments, and provider responsibilities.',
  alternates: { canonical: 'https://bookphysio.in/terms' },
  openGraph: {
    title: 'Terms of Service — BookPhysio.in',
    description: 'Terms of use for BookPhysio.in.',
    url: 'https://bookphysio.in/terms',
    siteName: 'BookPhysio.in',
    locale: 'en_IN',
    type: 'website',
  },
}

export default function TermsPage() {
  return <TermsPageClient />
}
