import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import DoctorCard, { type Doctor } from '@/components/DoctorCard'
import { Stethoscope } from 'lucide-react'

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

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const SPECIALTY_MAP: Record<string, string> = {
  'sports-physio': 'Sports Physiotherapists',
  'neuro-physio': 'Neurological Physiotherapists',
  'ortho-physio': 'Orthopedic Physiotherapists',
  'paediatric-physio': 'Paediatric Physiotherapists',
  'womens-health': "Women's Health Physiotherapists",
  'geriatric-physio': 'Geriatric Physiotherapists',
  'post-surgery-rehab': 'Post-Surgery Rehabilitation',
  'pain-management': 'Pain Management Specialists',
}

const MOCK_DOCTORS: Doctor[] = [
  { id: '1', name: 'Dr. Priya Sharma', credentials: 'BPT, MPT (Sports)', specialty: 'Sports Physiotherapist', rating: 4.9, reviewCount: 187, location: 'Andheri West, Mumbai', distance: '1.2 km', nextSlot: 'Today at 2:30 PM', visitTypes: ['In-clinic', 'Home Visit'], fee: 700, icpVerified: true },
  { id: '2', name: 'Dr. Rohit Mehta', credentials: 'BPT, MPT (Ortho)', specialty: 'Orthopedic Physiotherapist', rating: 4.7, reviewCount: 132, location: 'Bandra, Mumbai', distance: '3.4 km', nextSlot: 'Today at 4:00 PM', visitTypes: ['In-clinic', 'Online'], fee: 800, icpVerified: true },
  { id: '3', name: 'Dr. Ananya Krishnan', credentials: 'BPT, MPT (Neuro)', specialty: 'Neurological Physiotherapist', rating: 4.8, reviewCount: 94, location: 'Koramangala, Bangalore', distance: '2.1 km', nextSlot: 'Tomorrow at 10:00 AM', visitTypes: ['In-clinic', 'Home Visit', 'Online'], fee: 900, icpVerified: true },
  { id: '4', name: 'Dr. Vikram Singh', credentials: 'BPT', specialty: 'Sports Physiotherapist', rating: 4.6, reviewCount: 68, location: 'Lajpat Nagar, Delhi', distance: '4.2 km', nextSlot: 'Today at 5:30 PM', visitTypes: ['In-clinic'], fee: 600, icpVerified: false },
  { id: '5', name: 'Dr. Sneha Patel', credentials: 'BPT, MPT (Paeds)', specialty: 'Paediatric Physiotherapist', rating: 4.9, reviewCount: 211, location: 'Powai, Mumbai', distance: '5.1 km', nextSlot: 'Today at 11:00 AM', visitTypes: ['In-clinic', 'Home Visit'], fee: 1000, icpVerified: true },
  { id: '6', name: 'Dr. Arun Nair', credentials: 'BPT, MPT (Cardio)', specialty: 'Cardiopulmonary Physiotherapist', rating: 4.5, reviewCount: 45, location: 'T. Nagar, Chennai', distance: '6.8 km', nextSlot: 'Tomorrow at 9:00 AM', visitTypes: ['In-clinic', 'Online'], fee: 750, icpVerified: true },
]

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const displayName = SPECIALTY_MAP[slug] ?? 'Physiotherapists'
  return {
    title: `Book ${displayName} in India | BookPhysio.in`,
    description: `Find and book verified ${displayName} near you. Same-day appointments available.`,
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function SpecialtyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const displayName = SPECIALTY_MAP[slug] ?? 'Physiotherapists'

  return (
    <>
      <Navbar />

      <main className="bg-[#F7F8F9] min-h-screen">
        {/* Hero banner */}
        <section className="bg-gradient-to-br from-[#00766C] to-[#005A52]">
          <div className="max-w-[1142px] mx-auto px-6 md:px-[60px] py-14">
            <h1 className="text-[36px] font-bold text-white mb-3 leading-tight tracking-tight flex items-center gap-3">
              <Stethoscope className="w-8 h-8 text-white/80" />
              Book {displayName}
            </h1>
            <p className="text-[16px] text-white/85">
              Verified physios &middot; Same-day appointments &middot; In-clinic, Home Visit &amp; Online
            </p>
          </div>
        </section>

        {/* Content area */}
        <section>
          <div className="max-w-[1142px] mx-auto px-6 md:px-[60px] py-10">
            <h2 className="text-[22px] font-semibold text-[#333333] mb-6">
              {MOCK_DOCTORS.length} {displayName} available
            </h2>

            <div className="flex flex-col gap-4">
              {MOCK_DOCTORS.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
