import type { Metadata } from 'next'
import { getLocalizedStaticAlternates } from '@/lib/i18n/static-pages'

export const metadata: Metadata = {
  title: 'Terms of Service | BookPhysio.in',
  description:
    'Read the BookPhysio terms that govern patient bookings, provider listings, platform responsibilities, and service limitations.',
  alternates: getLocalizedStaticAlternates('en', '/terms'),
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children
}