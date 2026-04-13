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

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bookphysio.in' },
    { '@type': 'ListItem', position: 2, name: 'Find Physiotherapists' },
  ],
}

export default function SearchPage() {
  return (
    <div className="bg-[#F7F8F9] min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Navbar />

      <main className="flex-1">
        <Suspense fallback={
          <div className="max-w-[1142px] mx-auto px-4 sm:px-6 md:px-10 py-20 text-center text-[#999]">
            <div className="w-8 h-8 rounded-full border-2 border-[#E5E7EB] border-t-[#00766C] animate-spin mx-auto mb-4" />
            <p className="text-[14px] font-medium">Loading search results...</p>
          </div>
        }>
          <SearchContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}
