import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import DoctorCard, { type Doctor } from '@/components/DoctorCard'
import SearchFilters from './SearchFilters'
import { Map } from 'lucide-react'

// ---------------------------------------------------------------------------
// Search Results Page — Server Component
// ---------------------------------------------------------------------------

const MOCK_DOCTORS: Doctor[] = [
  { id: '1', name: 'Dr. Priya Sharma', credentials: 'BPT, MPT (Sports)', specialty: 'Sports Physiotherapist', rating: 4.9, reviewCount: 187, location: 'Andheri West, Mumbai', distance: '1.2 km', nextSlot: 'Today at 2:30 PM', visitTypes: ['In-clinic', 'Home Visit'], fee: 700, icpVerified: true },
  { id: '2', name: 'Dr. Rohit Mehta', credentials: 'BPT, MPT (Ortho)', specialty: 'Orthopedic Physiotherapist', rating: 4.7, reviewCount: 132, location: 'Bandra, Mumbai', distance: '3.4 km', nextSlot: 'Today at 4:00 PM', visitTypes: ['In-clinic', 'Online'], fee: 800, icpVerified: true },
  { id: '3', name: 'Dr. Ananya Krishnan', credentials: 'BPT, MPT (Neuro)', specialty: 'Neurological Physiotherapist', rating: 4.8, reviewCount: 94, location: 'Koramangala, Bangalore', distance: '2.1 km', nextSlot: 'Tomorrow at 10:00 AM', visitTypes: ['In-clinic', 'Home Visit', 'Online'], fee: 900, icpVerified: true },
  { id: '4', name: 'Dr. Vikram Singh', credentials: 'BPT', specialty: 'Sports Physiotherapist', rating: 4.6, reviewCount: 68, location: 'Lajpat Nagar, Delhi', distance: '4.2 km', nextSlot: 'Today at 5:30 PM', visitTypes: ['In-clinic'], fee: 600, icpVerified: false },
  { id: '5', name: 'Dr. Sneha Patel', credentials: 'BPT, MPT (Paeds)', specialty: 'Paediatric Physiotherapist', rating: 4.9, reviewCount: 211, location: 'Powai, Mumbai', distance: '5.1 km', nextSlot: 'Today at 11:00 AM', visitTypes: ['In-clinic', 'Home Visit'], fee: 1000, icpVerified: true },
  { id: '6', name: 'Dr. Arun Nair', credentials: 'BPT, MPT (Cardio)', specialty: 'Cardiopulmonary Physiotherapist', rating: 4.5, reviewCount: 45, location: 'T. Nagar, Chennai', distance: '6.8 km', nextSlot: 'Tomorrow at 9:00 AM', visitTypes: ['In-clinic', 'Online'], fee: 750, icpVerified: true },
]

interface SearchPageProps {
  searchParams: Promise<{
    condition?: string
    location?: string
  }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { condition, location } = await searchParams
  const displayLocation = location ?? 'Mumbai'

  return (
    <div className="bg-[#F7F8F9] min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Inner container */}
        <div className="max-w-[1142px] mx-auto px-6 md:px-[60px] py-8">
          {/* Results header */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h1 className="text-[20px] font-bold text-[#333333] leading-7">
                47 physios near {displayLocation}
              </h1>
              {condition && (
                <p className="text-[14px] text-[#666666] mt-1">
                  showing results for:{' '}
                  <span className="font-medium text-[#333333]">{condition}</span>
                </p>
              )}
            </div>

            {/* Map View — placeholder, disabled */}
            <button
              disabled
              aria-label="Map view (coming soon)"
              title="Map view coming soon"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#E5E5E5] bg-[#F5F5F5] text-[#999999] text-[14px] font-medium cursor-not-allowed"
            >
              <Map className="w-4 h-4" />
              Map View
            </button>
          </div>

          {/* Two-column layout */}
          <div className="flex gap-6 items-start md:flex-row flex-col">
            {/* Sidebar — hidden on mobile */}
            <div className="hidden md:block">
              <SearchFilters />
            </div>

            {/* Results column */}
            <div className="flex-1 min-w-0 flex flex-col gap-3">
              {MOCK_DOCTORS.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
