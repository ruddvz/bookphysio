import type { Metadata } from 'next'
import { HiAboutPageClient } from './HiAboutPageClient'

export const metadata: Metadata = {
  title: 'BookPhysio.in के बारे में',
  description:
    'BookPhysio.in भारत का फिजियोथेरेपी-केंद्रित बुकिंग प्लेटफॉर्म है।',
  alternates: { canonical: 'https://bookphysio.in/hi/about' },
}

export default function HindiAboutPage() {
  return <HiAboutPageClient />
}
