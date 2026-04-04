import type { Metadata } from 'next'
import { getLocalizedStaticAlternates } from '@/lib/i18n/static-pages'

export const metadata: Metadata = {
  title: 'सेवा की शर्तें | BookPhysio.in',
  description:
    'BookPhysio के उपयोग, बुकिंग जिम्मेदारियों, प्रदाता सत्यापन और प्लेटफॉर्म सीमाओं से जुड़ी शर्तें हिंदी में पढ़ें।',
  alternates: getLocalizedStaticAlternates('hi', '/terms'),
}

export default function HindiTermsLayout({ children }: { children: React.ReactNode }) {
  return children
}