import type { Metadata } from 'next'
import { Suspense } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SearchContent from './SearchContent'

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams
  const specialty = typeof params.specialty === 'string' ? params.specialty : null
  const city = typeof params.city === 'string' ? params.city : null

  const titleParts: string[] = []
  if (specialty) titleParts.push(specialty)
  titleParts.push('Physiotherapists')
  if (city) titleParts.push(`in ${city}`)

  const title = `${titleParts.join(' ')} | BookPhysio.in`
  const description = city
    ? `Find and book verified ${specialty ? specialty.toLowerCase() + ' ' : ''}physiotherapists in ${city}. Compare ratings, prices, and availability.`
    : 'Search and book verified physiotherapists across India. Filter by city, specialty, home visit availability, and same-day slots.'

  return {
    title,
    description,
    alternates: { canonical: 'https://bookphysio.in/search' },
    openGraph: {
      title,
      description,
      url: 'https://bookphysio.in/search',
      siteName: 'BookPhysio.in',
      locale: 'en_IN',
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default function SearchPage() {
  return (
    <div className="bg-[#F7F8F9] min-h-screen flex flex-col">
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
