import type { Metadata } from 'next'
import { Suspense } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SearchContent from './SearchContent'

export const metadata: Metadata = {
  title: 'Find Physiotherapists Near You | BookPhysio.in',
  description:
    'Search and book verified physiotherapists across India. Filter by city, specialty, home visit availability, and same-day slots.',
  alternates: {
    canonical: 'https://bookphysio.in/search',
  },
  openGraph: {
    title: 'Find Physiotherapists Near You | BookPhysio.in',
    description:
      'Search and book verified physiotherapists across India. Filter by city, specialty, home visit availability, and same-day slots.',
    url: 'https://bookphysio.in/search',
    siteName: 'BookPhysio.in',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find Physiotherapists Near You | BookPhysio.in',
    description:
      'Search and book verified physiotherapists across India. Filter by city, specialty, home visit availability, and same-day slots.',
  },
}

export default function SearchPage() {
  return (
    <div className="bg-bp-surface min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <Suspense fallback={
          <div className="max-w-[1142px] mx-auto px-6 md:px-[60px] py-24 text-center text-bp-body/60">
            Loading search results...
          </div>
        }>
          <SearchContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}
