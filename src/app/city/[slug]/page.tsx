import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import DoctorCard, { type Doctor } from '@/components/DoctorCard'
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

const MOCK_DOCTORS: Doctor[] = [
  { id: '1', profileHref: '/search?city=Mumbai&specialty=Sports%20Physio', primaryActionLabel: 'Browse live providers', secondaryActionLabel: 'See matching providers', name: 'Dr. Priya Sharma', credentials: 'BPT, MPT (Sports)', specialty: 'Sports Physiotherapist', rating: 4.9, reviewCount: 187, location: 'Andheri West, Mumbai', distance: '1.2 km', nextSlot: 'Today at 2:30 PM', visitTypes: ['In-clinic', 'Home Visit'], fee: 700, icpVerified: true },
  { id: '2', profileHref: '/search?city=Mumbai&specialty=Ortho%20Physio', primaryActionLabel: 'Browse live providers', secondaryActionLabel: 'See matching providers', name: 'Dr. Rohit Mehta', credentials: 'BPT, MPT (Ortho)', specialty: 'Orthopedic Physiotherapist', rating: 4.7, reviewCount: 132, location: 'Bandra, Mumbai', distance: '3.4 km', nextSlot: 'Today at 4:00 PM', visitTypes: ['In-clinic'], fee: 800, icpVerified: true },
  { id: '3', profileHref: '/search?city=Bangalore&specialty=Neuro%20Physio', primaryActionLabel: 'Browse live providers', secondaryActionLabel: 'See matching providers', name: 'Dr. Ananya Krishnan', credentials: 'BPT, MPT (Neuro)', specialty: 'Neurological Physiotherapist', rating: 4.8, reviewCount: 94, location: 'Koramangala, Bangalore', distance: '2.1 km', nextSlot: 'Tomorrow at 10:00 AM', visitTypes: ['In-clinic', 'Home Visit'], fee: 900, icpVerified: true },
  { id: '4', profileHref: '/search?city=Delhi&specialty=Sports%20Physio', primaryActionLabel: 'Browse live providers', secondaryActionLabel: 'See matching providers', name: 'Dr. Vikram Singh', credentials: 'BPT', specialty: 'Sports Physiotherapist', rating: 4.6, reviewCount: 68, location: 'Lajpat Nagar, Delhi', distance: '4.2 km', nextSlot: 'Today at 5:30 PM', visitTypes: ['In-clinic'], fee: 600, icpVerified: false },
  { id: '5', profileHref: '/search?city=Mumbai&specialty=Paediatric%20Physio', primaryActionLabel: 'Browse live providers', secondaryActionLabel: 'See matching providers', name: 'Dr. Sneha Patel', credentials: 'BPT, MPT (Paeds)', specialty: 'Paediatric Physiotherapist', rating: 4.9, reviewCount: 211, location: 'Powai, Mumbai', distance: '5.1 km', nextSlot: 'Today at 11:00 AM', visitTypes: ['In-clinic', 'Home Visit'], fee: 1000, icpVerified: true },
]

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

export default async function CityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const city = CITY_MAP[slug]
  if (!city) notFound()

  const filteredDoctors = MOCK_DOCTORS.filter((doc) => doc.location.toLowerCase().includes(city.label.toLowerCase()))
  const verifiedCount = filteredDoctors.filter((doctor) => doctor.icpVerified).length
  const homeVisitCount = filteredDoctors.filter((doctor) => doctor.visitTypes.includes('Home Visit')).length
  const startingFee = filteredDoctors.length > 0 ? Math.min(...filteredDoctors.map((doctor) => doctor.fee)) : null

  const citySignals = [
    {
      label: 'Verified clinicians',
      value: filteredDoctors.length > 0 ? `${verifiedCount}` : '0',
      helper: 'Credential-checked profiles you can compare quickly.',
      icon: ShieldCheck,
      tint: 'bg-[#E6F4F3] text-[#00766C]',
    },
    {
      label: 'Home visit options',
      value: filteredDoctors.length > 0 ? `${homeVisitCount}` : '0',
      helper: 'Providers offering recovery support at home.',
      icon: House,
      tint: 'bg-[#E7EEFB] text-[#2F5EC4]',
    },
    {
      label: 'Starting fee',
      value: startingFee ? `₹${startingFee}` : 'Soon',
      helper: 'Transparent pricing before you commit to a session.',
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
                    Local availability
                  </p>
                  <h2 className="mt-2 text-[22px] lg:text-[24px] font-bold tracking-tight text-[#1A1C29]">
                    {filteredDoctors.length} {filteredDoctors.length === 1 ? 'physiotherapist' : 'physiotherapists'} currently listed in {city.label}
                  </h2>
                  <p className="mt-2 text-[14px] leading-relaxed text-slate-600 max-w-[680px]">
                    Compare verified profiles, visit formats, and pricing before you book a clinic session or home visit.
                  </p>
                </div>
                <div className="text-[13px] text-slate-500">
                  Verified by <span className="font-semibold text-[#00766C]">BookPhysio</span>
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
                  <Search className="w-6 h-6 text-[#00766C]" />
                </div>
                <h3 className="text-[18px] font-semibold text-[#1A1C29] mb-2">
                  No providers currently in {city.label}
                </h3>
                <p className="text-[15px] text-slate-600 max-w-md mx-auto leading-relaxed">
                  We&apos;re currently onboarding specialists in {city.label}. Please try a nearby city or browse our other physiotherapy specialists.
                </p>
                <div className="mt-6">
                  <Link
                    href="/search"
                    className="inline-flex px-6 py-2.5 bg-[#00766C] hover:bg-[#005A52] text-white text-[14px] font-semibold rounded-full transition-colors"
                  >
                    Explore other cities
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
