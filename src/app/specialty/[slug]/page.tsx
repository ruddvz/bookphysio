import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
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

const SPECIALTY_MAP: Record<string, { label: string; description: string }> = {
  'sports-physio': { 
    label: 'Sports Physiotherapists', 
    description: 'Expert care for sports injuries, performance enhancement, and athletic rehabilitation.' 
  },
  'neuro-physio': { 
    label: 'Neurological Physiotherapists', 
    description: 'Specialized therapy for stroke, Parkinson\'s, multiple sclerosis, and other neurological conditions.' 
  },
  'ortho-physio': { 
    label: 'Orthopedic Physiotherapists', 
    description: 'Treatment for bone, joint, and muscle conditions including arthritis, fractures, and back pain.' 
  },
  'paediatric-physio': { 
    label: 'Paediatric Physiotherapists', 
    description: 'Compassionate physical therapy for children, supporting developmental milestones and growth.' 
  },
  'womens-health': { 
    label: "Women's Health Physiotherapists", 
    description: 'Tailored support for prenatal care, postpartum recovery, and pelvic health.' 
  },
  'geriatric-physio': { 
    label: 'Geriatric Physiotherapists', 
    description: 'Enhancing mobility and quality of life for seniors through specialized geriatric care.' 
  },
  'post-surgery-rehab': { 
    label: 'Post-Surgery Rehabilitation', 
    description: 'Structured recovery programs to regain strength and mobility after orthopedic or neuro surgery.' 
  },
  'pain-management': { 
    label: 'Pain Management Specialists', 
    description: 'Evidence-based approaches to chronic pain relief and functional restoration.' 
  },
}

const MOCK_DOCTORS: Doctor[] = [
  { id: '1', name: 'Dr. Priya Sharma', credentials: 'BPT, MPT (Sports)', specialty: 'Sports Physiotherapist', rating: 4.9, reviewCount: 187, location: 'Andheri West, Mumbai', distance: '1.2 km', nextSlot: 'Today at 2:30 PM', visitTypes: ['In-clinic', 'Home Visit'], fee: 700, icpVerified: true },
  { id: '2', name: 'Dr. Rohit Mehta', credentials: 'BPT, MPT (Ortho)', specialty: 'Orthopedic Physiotherapist', rating: 4.7, reviewCount: 132, location: 'Bandra, Mumbai', distance: '3.4 km', nextSlot: 'Today at 4:00 PM', visitTypes: ['In-clinic'], fee: 800, icpVerified: true },
  { id: '3', name: 'Dr. Ananya Krishnan', credentials: 'BPT, MPT (Neuro)', specialty: 'Neurological Physiotherapist', rating: 4.8, reviewCount: 94, location: 'Koramangala, Bangalore', distance: '2.1 km', nextSlot: 'Tomorrow at 10:00 AM', visitTypes: ['In-clinic', 'Home Visit'], fee: 900, icpVerified: true },
  { id: '4', name: 'Dr. Vikram Singh', credentials: 'BPT', specialty: 'Sports Physiotherapist', rating: 4.6, reviewCount: 68, location: 'Lajpat Nagar, Delhi', distance: '4.2 km', nextSlot: 'Today at 5:30 PM', visitTypes: ['In-clinic'], fee: 600, icpVerified: false },
  { id: '5', name: 'Dr. Sneha Patel', credentials: 'BPT, MPT (Paeds)', specialty: 'Paediatric Physiotherapist', rating: 4.9, reviewCount: 211, location: 'Powai, Mumbai', distance: '5.1 km', nextSlot: 'Today at 11:00 AM', visitTypes: ['In-clinic', 'Home Visit'], fee: 1000, icpVerified: true },
]

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const specialty = SPECIALTY_MAP[slug]
  
  if (!specialty) return { title: 'Not Found | BookPhysio.in' }
  
  const title = `Best ${specialty.label} in India | Verified Experts | BookPhysio.in`
  const description = `Find and book verified ${specialty.label} near you. ${specialty.description} Same-day appointments available for clinic and home visits.`
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://bookphysio.in/specialty/${slug}`,
      siteName: 'BookPhysio.in',
      locale: 'en_IN',
      type: 'website',
    },
    alternates: {
      canonical: `https://bookphysio.in/specialty/${slug}`,
    }
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function SpecialtyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const specialty = SPECIALTY_MAP[slug]

  if (!specialty) {
    notFound()
  }

  // Filter doctors by specialty (simulation)
  // In a real app, this would be an API call
  const filteredDoctors = MOCK_DOCTORS.filter(doc => {
    if (slug === 'sports-physio') return doc.specialty.includes('Sports')
    if (slug === 'neuro-physio') return doc.specialty.includes('Neuro')
    if (slug === 'ortho-physio') return doc.specialty.includes('Ortho')
    if (slug === 'paediatric-physio') return doc.specialty.includes('Paediatric')
    return true // Default show all for others in mock
  })

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="bg-bp-surface flex-grow">
        {/* Hero banner */}
        <section className="bg-gradient-to-br from-bp-accent to-bp-primary">
          <div className="max-w-[1142px] mx-auto px-6 md:px-[60px] py-16">
            <div className="flex items-center gap-4 mb-4">
               <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                 <Stethoscope className="w-6 h-6 text-white" />
               </div>
               <span className="text-white/80 text-[14px] font-semibold uppercase tracking-wider">Verified Specialization</span>
            </div>
            <h1 className="text-[40px] md:text-[48px] font-bold text-white mb-4 leading-tight tracking-tight">
              {specialty.label}
            </h1>
            <p className="text-[18px] text-white/90 max-w-[700px] leading-relaxed">
              {specialty.description} Book verified physiotherapists for in-clinic and home visit sessions.
            </p>
          </div>
        </section>

        {/* Content area */}
        <section>
          <div className="max-w-[1142px] mx-auto px-6 md:px-[60px] py-12">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-bp-border">
              <h2 className="text-[20px] font-bold text-bp-primary">
                {filteredDoctors.length} {specialty.label} available
              </h2>
              <div className="text-[14px] text-bp-body">
                Showing results for <span className="font-semibold text-bp-accent">India</span>
              </div>
            </div>

            {filteredDoctors.length > 0 ? (
              <div className="flex flex-col gap-6">
                {filteredDoctors.map((doctor) => (
                  <DoctorCard key={doctor.id} doctor={doctor} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[8px] border border-bp-border p-16 text-center shadow-sm">
                <div className="w-16 h-16 bg-[#F3F4F6] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Stethoscope className="w-8 h-8 text-[#9CA3AF]" />
                </div>
                <h3 className="text-[18px] font-semibold text-bp-primary mb-2">No providers found</h3>
                <p className="text-[15px] text-bp-body max-w-[400px] mx-auto">
                  We couldn't find any {specialty.label.toLowerCase()} matching your criteria. Try adjusting your filters or searching in a different area.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
