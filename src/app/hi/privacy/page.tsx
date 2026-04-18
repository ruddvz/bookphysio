import type { Metadata } from 'next'
import { HiPrivacyPageClient } from './HiPrivacyPageClient'

export const metadata: Metadata = {
  title: 'प्राइवेसी पॉलिसी — BookPhysio.in',
  alternates: { canonical: 'https://bookphysio.in/hi/privacy' },
}

export default function HindiPrivacyPage() {
  return <HiPrivacyPageClient />
}
