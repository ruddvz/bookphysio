import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import DoctorCard, { type Doctor } from '@/components/DoctorCard'
import { Globe2, House, IndianRupee, Stethoscope } from 'lucide-react'

export async function generateStaticParams() {
  return [
    { slug: 'sports-physio' },
    { slug: 'neuro-physio' },
    { slug: 'ortho-physio' },
    { slug: 'paediatric-physio' },
    { slug: 'womens-health' },
    { slug: 'geriatric-physio' },
    { slug: 'post-surgery-rehab' },
    { slug: 'pain-management' },
  ]
}

const SPECIALTY_MAP: Record<string, { label: string; description: string }> = {
  'sports-physio': { label: 'Sports Physiotherapists', description: 'Expert care for sports injuries, performance enhancement, and athletic rehabilitation.' },
  'neuro-physio': { label: 'Neurological Physiotherapists', description: "Specialized therapy for stroke, Parkinson's, multiple sclerosis, and other neurological conditions." },
  'ortho-physio': { label: 'Orthopedic Physiotherapists', description: 'Treatment for bone, joint, and muscle conditions including arthritis, fractures, and back pain.' },
  'paediatric-physio': { label: 'Paediatric Physiotherapists', description: 'Compassionate physical therapy for children, supporting developmental milestones and growth.' },
  'womens-health': { label: "Women's Health Physiotherapists", description: 'Tailored support for prenatal care, postpartum recovery, and pelvic health.' },
  'geriatric-physio': { label: 'Geriatric Physiotherapists', description: 'Enhancing mobility and quality of life for seniors through specialized geriatric care.' },
  'post-surgery-rehab': { label: 'Post-Surgery Rehabilitation', description: 'Structured recovery programs to regain strength and mobility after orthopedic or neuro surgery.' },
  'pain-management': { label: 'Pain Management Specialists', description: 'Evidence-based approaches to chronic pain relief and functional restoration.' },
}

const MOCK_DOCTORS: Doctor[] = [
  { id: '1', profileHref: '/search?city=Mumbai&specialty=Sports%20Physio', primaryActionLabel: 'Browse live providers', secondaryActionLabel: 'See matching providers', name: 'Dr. Priya Sharma', credentials: 'BPT, MPT (Sports)', specialty: 'Sports Physiotherapist', rating: 4.9, reviewCount: 187, location: 'Andheri West, Mumbai', distance: '1.2 km', nextSlot: 'Today at 2:30 PM', visitTypes: ['In-clinic', 'Home Visit'], fee: 700, icpVerified: true },
  { id: '2', profileHref: '/search?city=Mumbai&specialty=Ortho%20Physio', primaryActionLabel: 'Browse live providers', secondaryActionLabel: 'See matching providers', name: 'Dr. Rohit Mehta', credentials: 'BPT, MPT (Ortho)', specialty: 'Orthopedic Physiotherapist', rating: 4.7, reviewCount: 132, location: 'Bandra, Mumbai', distance: '3.4 km', nextSlot: 'Today at 4:00 PM', visitTypes: ['In-clinic'], fee: 800, icpVerified: true },
  { id: '3', profileHref: '/search?city=Bangalore&specialty=Neuro%20Physio', primaryActionLabel: 'Browse live providers', secondaryActionLabel: 'See matching providers', name: 'Dr. Ananya Krishnan', credentials: 'BPT, MPT (Neuro)', specialty: 'Neurological Physiotherapist', rating: 4.8, reviewCount: 94, location: 'Koramangala, Bangalore', distance: '2.1 km', nextSlot: 'Tomorrow at 10:00 AM', visitTypes: ['In-clinic', 'Home Visit'], fee: 900, icpVerified: true },
  { id: '4', profileHref: '/search?city=Delhi&specialty=Sports%20Physio', primaryActionLabel: 'Browse live providers', secondaryActionLabel: 'See matching providers', name: 'Dr. Vikram Singh', credentials: 'BPT', specialty: 'Sports Physiotherapist', rating: 4.6, reviewCount: 68, location: 'Lajpat Nagar, Delhi', distance: '4.2 km', nextSlot: 'Today at 5:30 PM', visitTypes: ['In-clinic'], fee: 600, icpVerified: false },
  { id: '5', profileHref: '/search?city=Mumbai&specialty=Paediatric%20Physio', primaryActionLabel: 'Browse live providers', secondaryActionLabel: 'See matching providers', name: 'Dr. Sneha Patel', credentials: 'BPT, MPT (Paeds)', specialty: 'Paediatric Physiotherapist', rating: 4.9, reviewCount: 211, location: 'Powai, Mumbai', distance: '5.1 km', nextSlot: 'Today at 11:00 AM', visitTypes: ['In-clinic', 'Home Visit'], fee: 1000, icpVerified: true },
]

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const specialty = SPECIALTY_MAP[slug]
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
  const specialty = SPECIALTY_MAP[slug]
  if (!specialty) notFound()

  const specialtyMatchers: Record<string, (doctor: Doctor) => boolean> = {
    'sports-physio': (doctor) => doctor.specialty.includes('Sports'),
    'neuro-physio': (doctor) => doctor.specialty.includes('Neuro'),
    'ortho-physio': (doctor) => doctor.specialty.includes('Ortho'),
    'paediatric-physio': (doctor) => doctor.specialty.includes('Paediatric'),
    'womens-health': (doctor) => doctor.specialty.includes("Women's"),
    'geriatric-physio': (doctor) => doctor.specialty.includes('Geriatric'),
    'post-surgery-rehab': (doctor) => doctor.specialty.includes('Post-Surgery'),
    'pain-management': (doctor) => doctor.specialty.includes('Pain'),
  }

  const filteredDoctors = MOCK_DOCTORS.filter(specialtyMatchers[slug] ?? (() => false))

  const citiesCovered = new Set(
    filteredDoctors.map((doctor) => doctor.location.split(',').at(-1)?.trim() ?? doctor.location)
  ).size
  const homeVisitCount = filteredDoctors.filter((doctor) => doctor.visitTypes.includes('Home Visit')).length
  const startingFee = filteredDoctors.length > 0 ? Math.min(...filteredDoctors.map((doctor) => doctor.fee)) : null

  const specialtySignals = [
    {
      label: 'Cities with matches',
      value: filteredDoctors.length > 0 ? `${citiesCovered}` : '0',
      helper: 'Coverage shown across our current verified provider network.',
      icon: Globe2,
      tint: 'bg-[#E7EEFB] text-[#2F5EC4]',
    },
    {
      label: 'Home visit options',
      value: filteredDoctors.length > 0 ? `${homeVisitCount}` : '0',
      helper: 'Choose home-based care where clinicians offer it.',
      icon: House,
      tint: 'bg-[#E6F4F3] text-[#00766C]',
    },
    {
      label: 'Starting fee',
      value: startingFee ? `₹${startingFee}` : 'Soon',
      helper: 'Transparent pricing from the first shortlist view.',
      icon: IndianRupee,
      tint: 'bg-[#FEE9DD] text-[#C4532A]',
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA]">
      <Navbar />

      <main className="flex-grow">
        {/* Hero */}
        <section className="bg-white border-b border-slate-200/70">
          <div className="max-w-[1142px] mx-auto px-6 lg:px-10 py-12 lg:py-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#E6F4F3] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#00766C]">
              <Stethoscope className="h-3.5 w-3.5" />
              Verified specialization
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
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]"
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
            <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 lg:p-7 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#00766C]">
                    Specialty shortlist
                  </p>
                  <h2 className="mt-2 text-[22px] lg:text-[24px] font-bold tracking-tight text-[#1A1C29]">
                    {filteredDoctors.length} {specialty.label.toLowerCase()} currently available
                  </h2>
                  <p className="mt-2 text-[14px] leading-relaxed text-slate-600 max-w-[680px]">
                    Review credentials, compare visit styles, and secure the right kind of rehabilitation support with clearer context before you book.
                  </p>
                </div>
                <div className="text-[13px] text-slate-500">
                  Showing results for <span className="font-semibold text-[#00766C]">India</span>
                </div>
              </div>
            </div>

            {filteredDoctors.length > 0 ? (
              <div className="flex flex-col gap-5">
                {filteredDoctors.map((doctor) => (
                  <DoctorCard key={doctor.id} doctor={doctor} />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-[0_1px_3px_rgba(15,23,42,0.04)] p-12 lg:p-16 text-center">
                <div className="w-14 h-14 rounded-full bg-[#E6F4F3] flex items-center justify-center mx-auto mb-4">
                  <Stethoscope className="w-6 h-6 text-[#00766C]" />
                </div>
                <h3 className="text-[18px] font-semibold text-[#1A1C29] mb-2">No providers found</h3>
                <p className="text-[15px] text-slate-600 max-w-md mx-auto leading-relaxed">
                  We couldn&apos;t find any {specialty.label.toLowerCase()} matching your criteria. Try adjusting your filters or searching in a different area.
                </p>
                <div className="mt-6">
                  <Link
                    href="/search"
                    className="inline-flex rounded-full bg-[#00766C] px-6 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#005A52]"
                  >
                    Explore all providers
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
