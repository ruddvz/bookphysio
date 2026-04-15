import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Globe2, House, IndianRupee, Stethoscope } from 'lucide-react'
import { SPECIALTIES } from '@/lib/specialties'

export async function generateStaticParams() {
  return SPECIALTIES.map((s) => ({ slug: s.slug }))
}

const SPECIALTY_META: Record<string, { label: string; description: string }> = Object.fromEntries(
  SPECIALTIES.map((s) => [
    s.slug,
    {
      label: `${s.label} Physiotherapists`,
      description: s.tagline,
    },
  ])
)

function buildSpecialtySchemas(slug: string, specialtyLabel: string, description: string) {
  const pageUrl = `https://bookphysio.in/specialty/${slug}`

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bookphysio.in' },
      { '@type': 'ListItem', position: 2, name: specialtyLabel, item: pageUrl },
    ],
  }

  const medicalSpecialtySchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: `${specialtyLabel} in India`,
    description,
    url: pageUrl,
    about: {
      '@type': 'MedicalSpecialty',
      name: 'PhysicalTherapy',
    },
    provider: {
      '@id': 'https://bookphysio.in/#organization',
    },
  }

  return { breadcrumbSchema, medicalSpecialtySchema }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const specialty = SPECIALTY_META[slug]
  if (!specialty) return { title: 'Not Found | BookPhysio.in' }

  const title = `Best ${specialty.label} in India | Verified Experts | BookPhysio.in`
  const description = `Find and book verified ${specialty.label} near you. ${specialty.description} Same-day appointments available for clinic and home visits.`

  return {
    title,
    description,
    openGraph: { title, description, url: `https://bookphysio.in/specialty/${slug}`, siteName: 'BookPhysio.in', locale: 'en_IN', type: 'website' },
    alternates: { canonical: `https://bookphysio.in/specialty/${slug}` },
  }
}

export default async function SpecialtyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const specialty = SPECIALTY_META[slug]
  if (!specialty) notFound()

  const { breadcrumbSchema, medicalSpecialtySchema } = buildSpecialtySchemas(slug, specialty.label, specialty.description)

  const specialtySignals = [
    {
      label: 'Network',
      value: 'Pan-India',
      helper: 'We are onboarding verified specialists across major Indian cities.',
      icon: Globe2,
      tint: 'bg-[#E7EEFB] text-[#2F5EC4]',
    },
    {
      label: 'Visit formats',
      value: 'Clinic + Home',
      helper: 'Choose home-based care or in-clinic sessions.',
      icon: House,
      tint: 'bg-[#E6F4F3] text-[#00766C]',
    },
    {
      label: 'Pricing',
      value: 'Transparent',
      helper: 'Fees shown upfront from the first shortlist view.',
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalSpecialtySchema) }}
      />
      <Navbar />

      <main className="flex-grow">
        {/* Hero */}
        <section className="bg-white border-b border-slate-200/70">
          <div className="max-w-[1142px] mx-auto px-6 lg:px-10 py-12 lg:py-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#E6F4F3] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#00766C]">
              <Stethoscope className="h-3.5 w-3.5" />
              Verified specialisation
            </div>
            <h1 className="mt-5 text-[30px] lg:text-[40px] font-bold tracking-tight text-[#1A1C29] leading-tight">
              {specialty.label}
            </h1>
            <p className="mt-4 text-[15px] lg:text-[17px] text-slate-600 max-w-[720px] leading-relaxed">
              {specialty.description}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {specialtySignals.map(({ label, value, helper, icon: Icon, tint }) => (
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
          </div>
        </section>

        {/* Listing */}
        <section className="py-12 lg:py-16">
          <div className="max-w-[1142px] mx-auto px-6 lg:px-10">
            <div className="bg-white border border-slate-200 rounded-[var(--sq-lg)] shadow-[0_1px_3px_rgba(15,23,42,0.04)] p-12 lg:p-16 text-center">
              <div className="w-14 h-14 rounded-full bg-[#E6F4F3] flex items-center justify-center mx-auto mb-4">
                <Stethoscope className="w-6 h-6 text-[#00766C]" />
              </div>
              <h3 className="text-[18px] font-semibold text-[#1A1C29] mb-2">
                Find {specialty.label.toLowerCase()}
              </h3>
              <p className="text-[15px] text-slate-600 max-w-md mx-auto leading-relaxed">
                {specialty.description} Search for verified specialists and book a session.
              </p>
              <div className="mt-6">
                <Link
                  href={`/search?specialty=${encodeURIComponent(slug)}`}
                  className="inline-flex rounded-full bg-[#00766C] px-6 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#005A52]"
                >
                  Search {specialty.label.toLowerCase()}
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
