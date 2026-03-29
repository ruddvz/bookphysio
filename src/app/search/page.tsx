import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import DoctorCard, { type Doctor } from '@/components/DoctorCard'
import SearchFilters from './SearchFilters'

// ---------------------------------------------------------------------------
// Search Results Page — Server Component
// ---------------------------------------------------------------------------

const MOCK_DOCTORS: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Priya Sharma',
    credentials: 'BPT, MPT (Sports)',
    specialty: 'Sports Physiotherapist',
    rating: 4.9,
    reviewCount: 187,
    location: 'Andheri West, Mumbai',
    distance: '1.2 km',
    nextSlot: 'Today at 2:30 PM',
    visitTypes: ['In-clinic', 'Home Visit'],
    fee: 700,
    icpVerified: true,
  },
  {
    id: '2',
    name: 'Dr. Rohit Mehta',
    credentials: 'BPT, MPT (Ortho)',
    specialty: 'Orthopedic Physiotherapist',
    rating: 4.7,
    reviewCount: 132,
    location: 'Bandra, Mumbai',
    distance: '3.4 km',
    nextSlot: 'Today at 4:00 PM',
    visitTypes: ['In-clinic', 'Online'],
    fee: 800,
    icpVerified: true,
  },
  {
    id: '3',
    name: 'Dr. Ananya Krishnan',
    credentials: 'BPT, MPT (Neuro)',
    specialty: 'Neurological Physiotherapist',
    rating: 4.8,
    reviewCount: 94,
    location: 'Koramangala, Bangalore',
    distance: '2.1 km',
    nextSlot: 'Tomorrow at 10:00 AM',
    visitTypes: ['In-clinic', 'Home Visit', 'Online'],
    fee: 900,
    icpVerified: true,
  },
  {
    id: '4',
    name: 'Dr. Vikram Singh',
    credentials: 'BPT',
    specialty: 'Sports Physiotherapist',
    rating: 4.6,
    reviewCount: 68,
    location: 'Lajpat Nagar, Delhi',
    distance: '4.2 km',
    nextSlot: 'Today at 5:30 PM',
    visitTypes: ['In-clinic'],
    fee: 600,
    icpVerified: false,
  },
  {
    id: '5',
    name: 'Dr. Sneha Patel',
    credentials: 'BPT, MPT (Paeds)',
    specialty: 'Paediatric Physiotherapist',
    rating: 4.9,
    reviewCount: 211,
    location: 'Powai, Mumbai',
    distance: '5.1 km',
    nextSlot: 'Today at 11:00 AM',
    visitTypes: ['In-clinic', 'Home Visit'],
    fee: 1000,
    icpVerified: true,
  },
  {
    id: '6',
    name: 'Dr. Arun Nair',
    credentials: 'BPT, MPT (Cardio)',
    specialty: 'Cardiopulmonary Physiotherapist',
    rating: 4.5,
    reviewCount: 45,
    location: 'T. Nagar, Chennai',
    distance: '6.8 km',
    nextSlot: 'Tomorrow at 9:00 AM',
    visitTypes: ['In-clinic', 'Online'],
    fee: 750,
    icpVerified: true,
  },
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
    <div style={{ backgroundColor: '#F7F8F9', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1 }}>
        {/* Inner container */}
        <div
          className="search-container"
          style={{
            maxWidth: '1142px',
            margin: '0 auto',
            padding: '32px 60px',
          }}
        >
          {/* Results header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#333333',
                  margin: 0,
                  lineHeight: '28px',
                }}
              >
                47 physios near {displayLocation}
              </h1>
              {condition && (
                <p
                  style={{
                    fontSize: '14px',
                    color: '#666666',
                    margin: '4px 0 0',
                  }}
                >
                  showing results for:{' '}
                  <span style={{ fontWeight: 500, color: '#333333' }}>
                    {condition}
                  </span>
                </p>
              )}
            </div>

            {/* Map View — placeholder, disabled */}
            <button
              disabled
              aria-label="Map view (coming soon)"
              title="Map view coming soon"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '24px',
                border: '1px solid #E5E5E5',
                backgroundColor: '#F5F5F5',
                color: '#999999',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'not-allowed',
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M1 3.5l4.5-2 5 2 4.5-2v11l-4.5 2-5-2-4.5 2v-11z"
                  stroke="#999999"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
                <path
                  d="M5.5 1.5v11M10.5 3.5v11"
                  stroke="#999999"
                  strokeWidth="1.2"
                />
              </svg>
              Map View
            </button>
          </div>

          {/* Two-column layout */}
          <div
            className="search-layout"
            style={{
              display: 'flex',
              gap: '24px',
              alignItems: 'flex-start',
            }}
          >
            {/* Sidebar — hidden on mobile via CSS */}
            <div className="search-sidebar">
              <SearchFilters />
            </div>

            {/* Results column */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {MOCK_DOCTORS.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Responsive layout overrides — Server Component safe */}
      <style>{`
        @media (max-width: 768px) {
          .search-container {
            padding: 24px 24px !important;
          }
          .search-sidebar {
            display: none !important;
          }
          .search-layout {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}
