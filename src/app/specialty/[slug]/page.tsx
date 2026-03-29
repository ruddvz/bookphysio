import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import DoctorCard, { type Doctor } from '@/components/DoctorCard'

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

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
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

export default async function SpecialtyPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const displayName = SPECIALTY_MAP[slug] ?? 'Physiotherapists'

  return (
    <>
      <Navbar />

      <main style={{ backgroundColor: '#F7F8F9', minHeight: '100vh' }}>
        {/* Hero banner */}
        <section style={{ backgroundColor: '#00766C' }}>
          <div
            style={{
              maxWidth: '1142px',
              margin: '0 auto',
              padding: '56px 60px',
            }}
            className="specialty-hero-inner"
          >
            <h1
              style={{
                fontSize: '36px',
                fontWeight: 700,
                color: '#FFFFFF',
                margin: '0 0 12px',
                lineHeight: 1.2,
              }}
            >
              Book {displayName}
            </h1>
            <p
              style={{
                fontSize: '16px',
                color: 'rgba(255,255,255,0.85)',
                margin: 0,
                fontWeight: 400,
              }}
            >
              Verified physios &middot; Same-day appointments &middot; In-clinic, Home Visit &amp; Online
            </p>
          </div>
        </section>

        {/* Content area */}
        <section>
          <div
            style={{
              maxWidth: '1142px',
              margin: '0 auto',
              padding: '40px 60px',
            }}
            className="specialty-content-inner"
          >
            <h2
              style={{
                fontSize: '22px',
                fontWeight: 600,
                color: '#333333',
                margin: '0 0 24px',
              }}
            >
              {MOCK_DOCTORS.length} {displayName} available
            </h2>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              {MOCK_DOCTORS.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Responsive padding */}
      <style>{`
        @media (max-width: 768px) {
          .specialty-hero-inner,
          .specialty-content-inner {
            padding-left: 24px !important;
            padding-right: 24px !important;
          }
        }
      `}</style>

      <Footer />
    </>
  )
}
