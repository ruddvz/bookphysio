import type { Metadata } from 'next'
import { getLocalizedStaticAlternates } from '@/lib/i18n/static-pages'

export const metadata: Metadata = {
  title: 'भारत में फिजियोथेरेपिस्ट कैसे बुक करें | BookPhysio.in',
  description:
    'चार आसान चरणों में फिजियो खोजें, तुलना करें और बुक करें। मरीजों और फिजियोथेरेपिस्ट्स दोनों के लिए हिंदी गाइड।',
  alternates: getLocalizedStaticAlternates('hi', '/how-it-works'),
}

export default function HindiHowItWorksLayout({ children }: { children: React.ReactNode }) {
  return children
}