import type { Metadata } from 'next'
import { HiTermsPageClient } from './HiTermsPageClient'

export const metadata: Metadata = {
  title: 'सेवा की शर्तें — BookPhysio.in',
  alternates: { canonical: 'https://bookphysio.in/hi/terms' },
}

export default function HindiTermsPage() {
  return <HiTermsPageClient />
}
