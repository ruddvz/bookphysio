import type { Metadata } from 'next'
import { getLocalizedStaticAlternates } from '@/lib/i18n/static-pages'

export const metadata: Metadata = {
  title: 'BookPhysio के बारे में | भारत का फिजियो बुकिंग प्लेटफॉर्म',
  description:
    'जानिए BookPhysio कैसे मरीजों को सत्यापित फिजियोथेरेपिस्ट्स, स्पष्ट फीस, और बेहतर रिकवरी निर्णयों से जोड़ता है।',
  alternates: getLocalizedStaticAlternates('hi', '/about'),
}

export default function HindiAboutLayout({ children }: { children: React.ReactNode }) {
  return children
}