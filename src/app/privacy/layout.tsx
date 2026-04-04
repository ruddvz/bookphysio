import type { Metadata } from 'next'
import { getLocalizedStaticAlternates } from '@/lib/i18n/static-pages'

export const metadata: Metadata = {
  title: 'Privacy Policy | BookPhysio.in',
  description:
    'Learn how BookPhysio handles account, booking, payment, and AI-assistant data for patients and providers using the platform.',
  alternates: getLocalizedStaticAlternates('en', '/privacy'),
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children
}