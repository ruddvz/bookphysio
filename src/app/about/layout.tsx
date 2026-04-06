import type { Metadata } from 'next'
import { getLocalizedStaticAlternates } from '@/lib/i18n/static-pages'

export const metadata: Metadata = {
  title: 'About BookPhysio — India\'s Premier Physiotherapy Booking Platform',
  description: 'BookPhysio connects patients with IAP-verified physiotherapists across 18 Indian cities. Learn about our mission, verification process, and commitment to accessible physiotherapy care.',
  alternates: getLocalizedStaticAlternates('en', '/about'),
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
