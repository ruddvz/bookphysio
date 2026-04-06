import type { Metadata } from 'next'
import { getLocalizedStaticAlternates } from '@/lib/i18n/static-pages'

export const metadata: Metadata = {
  title: 'FAQ — Physiotherapy Booking Questions | BookPhysio.in',
  description: 'Answers to common questions about booking physiotherapists, home visits, IAP verification, payments, and cancellations on BookPhysio.in.',
  alternates: getLocalizedStaticAlternates('en', '/faq'),
}

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return children
}
