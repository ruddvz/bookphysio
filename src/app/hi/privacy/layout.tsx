import type { Metadata } from 'next'
import { getLocalizedStaticAlternates } from '@/lib/i18n/static-pages'

export const metadata: Metadata = {
  title: 'प्राइवेसी पॉलिसी | BookPhysio.in',
  description:
    'जानिए BookPhysio मरीज, प्रदाता, बुकिंग, भुगतान और AI-संबंधित डेटा को कैसे संभालता और सुरक्षित रखता है।',
  alternates: getLocalizedStaticAlternates('hi', '/privacy'),
}

export default function HindiPrivacyLayout({ children }: { children: React.ReactNode }) {
  return children
}