import type { Metadata } from 'next'
import { PrivacyPageClient } from './PrivacyPageClient'

export const metadata: Metadata = {
  title: 'Privacy Policy — BookPhysio.in',
  description:
    'How BookPhysio.in collects, uses, and protects your personal and health information. Compliant with Indian data protection laws.',
  alternates: { canonical: 'https://bookphysio.in/privacy' },
  openGraph: {
    title: 'Privacy Policy — BookPhysio.in',
    description: 'How BookPhysio.in handles your personal and health data.',
    url: 'https://bookphysio.in/privacy',
    siteName: 'BookPhysio.in',
    locale: 'en_IN',
    type: 'website',
  },
}

export default function PrivacyPage() {
  return <PrivacyPageClient />
}
