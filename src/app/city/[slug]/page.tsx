import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import DoctorCard, { type Doctor } from '@/components/DoctorCard'
import { MapPin, Search } from 'lucide-react'

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
  const city = CITY_MAP[slug]
  
  if (!city) return { title: 'Not Found | BookPhysio.in' }
  
  const title = `Best Physiotherapists in ${city.label} | BookPhysio.in`
  const description = `${city.description} Book verified physiotherapists for in-clinic and home visit sessions in ${city.label}.`
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://bookphysio.in/city/${slug}`,
      siteName: 'BookPhysio.in',
      locale: 'en_IN',
      type: 'website',
    },
    alternates: {
      canonical: `https://bookphysio.in/city/${slug}`,
    }
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function CityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const city = CITY_MAP[slug]

  if (!city) {
    notFound()
  }

  // Filter doctors by city (simulation)
  const filteredDoctors = MOCK_DOCTORS.filter(doc => doc.location.toLowerCase().includes(city.label.toLowerCase()))

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="bg-bp-surface flex-grow">
        {/* Hero banner */}
        <section className="bg-gradient-to-br from-bp-accent to-bp-primary">
          <div className="max-w-[1142px] mx-auto px-6 md:px-[60px] py-16">
            <div className="flex items-center gap-4 mb-4">
               <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                 <MapPin className="w-6 h-6 text-white" />
               </div>
               <span className="text-white/80 text-[14px] font-semibold uppercase tracking-wider">Top rated doctors</span>
            </div>
            <h1 className="text-[40px] md:text-[48px] font-bold text-white mb-4 leading-tight tracking-tight">
              Physiotherapists in {city.label}
            </h1>
            <p className="text-[18px] text-white/90 max-w-[700px] leading-relaxed">
              {city.description} Book verified physiotherapists for in-clinic and home visit sessions.
            </p>
          </div>
        </section>

        {/* Content area */}
        <section>
          <div className="max-w-[1142px] mx-auto px-6 md:px-[60px] py-12">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-bp-border">
              <h2 className="text-[20px] font-bold text-bp-primary">
                {filteredDoctors.length} {filteredDoctors.length === 1 ? 'physio' : 'physios'} available in {city.label}
              </h2>
              <div className="text-[14px] text-bp-body">
                Verified by <span className="font-semibold text-bp-accent">BookPhysio</span>
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
                  <Search className="w-8 h-8 text-[#9CA3AF]" />
                </div>
                <h3 className="text-[18px] font-semibold text-bp-primary mb-2">No providers currently in {city.label}</h3>
                <p className="text-[15px] text-bp-body max-w-[400px] mx-auto">
                   We&apos;re currently onboarding specialists in {city.label}. Please try a nearby city or browse our other physiotherapy specialists.
                </p>
                <div className="mt-8">
                   <button className="px-6 py-2.5 bg-bp-accent text-white font-semibold rounded-[24px] hover:bg-bp-primary transition-colors">
                     Explore Other Cities
                   </button>
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
