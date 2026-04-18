import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { CityV2TrustChips } from '@/components/specialties/CityV2TrustChips'
import { House, IndianRupee, MapPin, Search, ShieldCheck } from 'lucide-react'

export async function generateStaticParams() {
  return [
    { slug: 'mumbai' },
    { slug: 'delhi' },
    { slug: 'bangalore' },
    { slug: 'chennai' },
    { slug: 'hyderabad' },
    { slug: 'pune' },
    { slug: 'kolkata' },
    { slug: 'ahmedabad' },
    { slug: 'jaipur' },
    { slug: 'surat' },
  ]
}

const CITY_MAP: Record<string, { label: string; description: string }> = {
  mumbai: { label: 'Mumbai', description: 'Find top-rated physiotherapists in Mumbai for home visits and clinic sessions across Andheri, Bandra, and more.' },
  delhi: { label: 'Delhi', description: 'Best physiotherapy services in Delhi NCR. Verified experts specializing in sports rehab and orthopedic care.' },
  bangalore: { label: 'Bangalore', description: 'Expert physiotherapy care in Bangalore. Home visits and clinic appointments available in Koramangala, Indiranagar, and more.' },
  chennai: { label: 'Chennai', description: 'High-quality physiotherapy treatments in Chennai. Book verified experts for specialized rehab and recovery.' },
  hyderabad: { label: 'Hyderabad', description: 'Verified physiotherapists in Hyderabad. Specialized care for various conditions with same-day booking.' },
  pune: { label: 'Pune', description: 'Get professional physiotherapy in Pune. Verified experts for sports, ortho, and neuro recovery.' },
  kolkata: { label: 'Kolkata', description: 'Experienced physiotherapists in Kolkata. Book home and clinic visits for comprehensive recovery therapy.' },
  ahmedabad: { label: 'Ahmedabad', description: 'Reliable physiotherapy services in Ahmedabad. Top-rated specialists for orthopedic and sports rehab.' },
  jaipur: { label: 'Jaipur', description: 'Expert physical therapists in Jaipur. Professional care for joint pain, post-surgery, and sports injuries.' },
  surat: { label: 'Surat', description: 'Quality physiotherapy treatments in Surat. Trusted specialists for in-clinic and home recovery care.' },
}


export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const city = CITY_MAP[slug]
  if (!city) return { title: 'Not Found | BookPhysio.in' }

  const title = `Best Physiotherapists in ${city.label} | BookPhysio.in`
  const description = `${city.description} Book verified physiotherapists for in-clinic and home visit sessions in ${city.label}.`

  return {
    title,
    description,
    openGraph: { title, description, url: `https://bookphysio.in/city/${slug}`, siteName: 'BookPhysio.in', locale: 'en_IN', type: 'website' },
    alternates: { canonical: `https://bookphysio.in/city/${slug}` },
  }
}

function buildCitySchemas(slug: string, cityLabel: string) {
  const pageUrl = `https://bookphysio.in/city/${slug}`

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bookphysio.in' },
      { '@type': 'ListItem', position: 2, name: `Physiotherapists in ${cityLabel}`, item: pageUrl },
    ],
  }

  const medicalBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    name: `BookPhysio ${cityLabel}`,
    description: `Find and book verified physiotherapists in ${cityLabel} for home visits and in-clinic sessions.`,
    url: pageUrl,
    areaServed: {
      '@type': 'City',
      name: cityLabel,
    },
    medicalSpecialty: 'PhysicalTherapy',
    parentOrganization: {
      '@id': 'https://bookphysio.in/#organization',
    },
  }

  return { breadcrumbSchema, medicalBusinessSchema }
}

export default async function CityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const city = CITY_MAP[slug]
  if (!city) notFound()

  const { breadcrumbSchema, medicalBusinessSchema } = buildCitySchemas(slug, city.label)

  const citySignals = [
    {
      label: 'All providers',
      value: 'IAP Verified',
      helper: 'Every provider is credential-checked before going live.',
      icon: ShieldCheck,
      tint: 'bg-[#E6F4F3] text-[#00766C]',
    },
    {
      label: 'Visit formats',
      value: 'Clinic + Home',
      helper: 'Choose in-clinic sessions or home visit recovery.',
      icon: House,
      tint: 'bg-[#E7EEFB] text-[#2F5EC4]',
    },
    {
      label: 'Pricing',
      value: 'Transparent',
      helper: 'Fees shown upfront before you book. No surprises.',
      icon: IndianRupee,
      tint: 'bg-[#FEE9DD] text-[#C4532A]',
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalBusinessSchema) }}
      />
      <Navbar />

      <main className="flex-grow">
        {/* Hero */}
        <section className="bg-white border-b border-slate-200/70">
          <div className="max-w-[1142px] mx-auto px-6 lg:px-10 py-12 lg:py-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#E6F4F3] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#00766C]">
              <MapPin className="h-3.5 w-3.5" />
              Local recovery network
            </div>
            <h1 className="mt-5 text-[30px] lg:text-[40px] font-bold tracking-tight text-[#1A1C29] leading-tight">
              Physiotherapists in {city.label}
            </h1>
            <p className="mt-4 text-[15px] lg:text-[17px] text-slate-600 max-w-[720px] leading-relaxed">
              {city.description}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {citySignals.map(({ label, value, helper, icon: Icon, tint }) => (
                <div
                  key={label}
                  className="rounded-[var(--sq-lg)] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]"
                >
                  <div className={`flex h-11 w-11 items-center justify-center rounded-full ${tint}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {label}
                  </p>
                  <p className="mt-1 text-[24px] font-bold tracking-tight text-[#1A1C29]">{value}</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">{helper}</p>
                </div>
              ))}
            </div>

            <CityV2TrustChips cityLabel={city.label} />
          </div>
        </section>

        {/* Listing */}
        <section className="py-12 lg:py-16">
          <div className="max-w-[1142px] mx-auto px-6 lg:px-10">
            <div className="bg-white border border-slate-200 rounded-[var(--sq-lg)] shadow-[0_1px_3px_rgba(15,23,42,0.04)] p-12 lg:p-16 text-center">
              <div className="w-14 h-14 rounded-full bg-[#E6F4F3] flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-[#00766C]" />
              </div>
              <h3 className="text-[18px] font-semibold text-[#1A1C29] mb-2">
                Find physiotherapists in {city.label}
              </h3>
              <p className="text-[15px] text-slate-600 max-w-md mx-auto leading-relaxed">
                Search for verified physiotherapists in {city.label}. Compare profiles, visit formats, and pricing before you book.
              </p>
              <div className="mt-6">
                <Link
                  href={`/search?location=${encodeURIComponent(city.label)}`}
                  className="inline-flex px-6 py-2.5 bg-[#00766C] hover:bg-[#005A52] text-white text-[14px] font-semibold rounded-full transition-colors"
                >
                  Search in {city.label}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
