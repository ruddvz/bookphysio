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
  const city = typeof params.city === 'string' ? params.city : (typeof params.location === 'string' ? params.location : null)
  const condition = typeof params.condition === 'string' ? params.condition : null

  const parts: string[] = []
  if (specialty) parts.push(specialty)
  if (condition && !specialty) parts.push(condition)
  parts.push('Physiotherapists')
  if (city) parts.push(`in ${city}`)

  const heading = parts.join(' ')
  const title = `${heading} | BookPhysio.in`
  const description = city
    ? `Search and book verified ${specialty ?? 'physiotherapists'} in ${city}. Filter by home visit, specialty, price and same-day slots.`
    : 'Search and book verified physiotherapists across India. Filter by city, specialty, home visit availability, and same-day slots.'
  const canonicalParams = new URLSearchParams()
  if (specialty) canonicalParams.set('specialty', specialty)
  if (city) canonicalParams.set('city', city)
  if (condition) canonicalParams.set('condition', condition)
  const qs = canonicalParams.toString()
  const canonical = `https://bookphysio.in/search${qs ? `?${qs}` : ''}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'BookPhysio.in',
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
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
