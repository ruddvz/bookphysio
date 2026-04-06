import type { Metadata } from 'next'
import { getLocalizedStaticAlternates } from '@/lib/i18n/static-pages'

export const metadata: Metadata = {
  title: 'सवाल-जवाब | BookPhysio.in',
  description:
    'बुकिंग, होम विज़िट, IAP/State Council सत्यापन, भुगतान और कैंसलेशन से जुड़े आम सवालों के जवाब हिंदी में पढ़ें।',
  alternates: getLocalizedStaticAlternates('hi', '/faq'),
}

export default function HindiFAQLayout({ children }: { children: React.ReactNode }) {
  return children
}