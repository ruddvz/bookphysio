import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import DoctorCard, { type Doctor } from '@/components/DoctorCard'
import { MapPin } from 'lucide-react'

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

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const CITY_MAP: Record<string, string> = {
  mumbai: 'Mumbai',
  delhi: 'Delhi',
  bangalore: 'Bangalore',
  chennai: 'Chennai',
  hyderabad: 'Hyderabad',
  pune: 'Pune',
  kolkata: 'Kolkata',
  ahmedabad: 'Ahmedabad',
  jaipur: 'Jaipur',
  surat: 'Surat',
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
  const cityName = CITY_MAP[slug] ?? 'India'
  return {
    title: `Book Physiotherapists in ${cityName} | BookPhysio.in`,
    description: `Find verified physiotherapists in ${cityName}. Book online, in-clinic, or home visits.`,
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function CityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cityName = CITY_MAP[slug] ?? 'your city'

  return (
    <>
      <Navbar />

      <main className="bg-[#F7F8F9] min-h-screen">
        {/* Hero banner */}
        <section className="bg-gradient-to-br from-[#00766C] to-[#005A52]">
          <div className="max-w-[1142px] mx-auto px-6 md:px-[60px] py-14">
            <h1 className="text-[36px] font-bold text-white mb-3 leading-tight tracking-tight flex items-center gap-3">
              <MapPin className="w-8 h-8 text-white/80" />
              Physiotherapists in {cityName}
            </h1>
            <p className="text-[16px] text-white/85">
              Book verified physios for in-clinic, home visit, and online sessions
            </p>
          </div>
        </section>

        {/* Content area */}
        <section>
          <div className="max-w-[1142px] mx-auto px-6 md:px-[60px] py-10">
            <h2 className="text-[22px] font-semibold text-[#333333] mb-6">
              {MOCK_DOCTORS.length} physios available in {cityName}
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
