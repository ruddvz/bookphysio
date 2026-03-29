import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BookingCard from './BookingCard'
import { MapPin, ShieldCheck, GraduationCap, Languages, Star } from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type VisitType = 'in_clinic' | 'home_visit' | 'online'

interface Education { degree: string; institution: string; year: number }
interface Review { name: string; rating: number; date: string; text: string }

interface Doctor {
  id: string; name: string; credentials: string; specialty: string
  rating: number; reviewCount: number; location: string
  icpNumber: string; icpVerified: boolean
  fee: Record<VisitType, number>; visitTypes: readonly VisitType[]
  bio: string; specializations: string[]; education: Education[]
  languages: string[]; reviews: Review[]
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_DOCTOR: Doctor = {
  id: '1', name: 'Dr. Priya Sharma', credentials: 'BPT, MPT (Sports)',
  specialty: 'Sports Physiotherapist', rating: 4.9, reviewCount: 187,
  location: 'Andheri West, Mumbai', icpNumber: 'ICP-MH-2017-04821', icpVerified: true,
  fee: { in_clinic: 700, home_visit: 900, online: 600 },
  visitTypes: ['in_clinic', 'home_visit', 'online'] as const,
  bio: 'Dr. Priya Sharma is a highly experienced Sports Physiotherapist with over 8 years of clinical practice. She specialises in sports injury rehabilitation, musculoskeletal pain, and post-surgical recovery, helping athletes and active individuals return to peak performance.',
  specializations: ['Back Pain', 'Sports Injuries', 'Post-Surgery Rehab', 'Knee Pain', 'Shoulder Pain'],
  education: [
    { degree: 'BPT', institution: 'KMC Manipal', year: 2015 },
    { degree: 'MPT (Sports)', institution: 'NIMHANS Bangalore', year: 2017 },
  ],
  languages: ['English', 'Hindi', 'Marathi'],
  reviews: [
    { name: 'Rahul M.', rating: 5, date: '15 Mar 2026', text: 'Excellent treatment. My knee pain is completely gone after 6 sessions.' },
    { name: 'Priya K.', rating: 5, date: '2 Mar 2026', text: 'Very professional and knowledgeable. Highly recommend for sports injuries.' },
    { name: 'Amit S.', rating: 4, date: '20 Feb 2026', text: 'Good experience overall. The home visit option was very convenient.' },
  ],
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating)
  const hasHalf = rating - fullStars >= 0.5
  return (
    <span aria-label={`Rating: ${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => {
        if (i < fullStars) return <span key={i} className="text-[#F5A623]">★</span>
        if (i === fullStars && hasHalf) return <span key={i} className="text-[#F5A623]">½</span>
        return <span key={i} className="text-[#DDDDDD]">★</span>
      })}
    </span>
  )
}

const cardClass = 'bg-white rounded-[8px] border border-[#E5E5E5] p-6 mb-6'

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

interface DoctorPageProps { params: Promise<{ id: string }> }

export default async function DoctorPage({ params }: DoctorPageProps) {
  const _p = await params
  const doctor = MOCK_DOCTOR

  return (
    <>
      <Navbar />

      <main className="bg-[#F7F8F9] min-h-screen pt-10 pb-20">
        <div className="max-w-[1142px] mx-auto px-6 lg:px-[60px]">
          <div className="grid grid-cols-1 md:grid-cols-[65%_35%] gap-8 items-start">

            {/* LEFT COLUMN */}
            <div>
              {/* 1. Hero row */}
              <div className={cardClass}>
                <div className="flex gap-5 items-start">
                  {/* Avatar */}
                  <div className="w-[120px] h-[120px] rounded-full bg-[#00766C] text-white flex items-center justify-center text-[36px] font-bold shrink-0" aria-hidden="true">
                    {doctor.name.split(' ').slice(1, 3).map((w) => w[0]).join('')}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h1 className="text-[24px] font-bold text-[#333333] mb-1">{doctor.name}</h1>
                    <p className="text-[14px] text-[#666666] mb-1">{doctor.credentials}</p>
                    <p className="text-[15px] font-medium text-[#00766C] mb-3">{doctor.specialty}</p>

                    {/* Rating + ICP badge */}
                    <div className="flex items-center gap-3 flex-wrap mb-2.5">
                      <div className="flex items-center gap-1">
                        <StarRating rating={doctor.rating} />
                        <span className="text-[14px] font-semibold text-[#333333] ml-1">{doctor.rating}</span>
                        <span className="text-[14px] text-[#666666]">({doctor.reviewCount} reviews)</span>
                      </div>
                      {doctor.icpVerified && (
                        <span className="inline-flex items-center gap-1 bg-[#E6F4F3] text-[#005A52] text-[12px] font-semibold px-2.5 py-1 rounded-full">
                          <ShieldCheck className="w-3.5 h-3.5" /> ICP Verified
                        </span>
                      )}
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 text-[14px] text-[#666666]">
                      <MapPin className="w-4 h-4" />
                      {doctor.location}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. About */}
              <section className={cardClass} aria-labelledby="about-heading">
                <h2 id="about-heading" className="text-[18px] font-bold text-[#333333] mb-3">About</h2>
                <p className="text-[15px] text-[#555555] leading-[1.7]">{doctor.bio}</p>
              </section>

              {/* 3. Specializations */}
              <section className={cardClass} aria-labelledby="specializations-heading">
                <h2 id="specializations-heading" className="text-[18px] font-bold text-[#333333] mb-4">Specializations</h2>
                <div className="flex flex-wrap gap-2">
                  {doctor.specializations.map((spec) => (
                    <span key={spec} className="bg-[#F5F5F5] text-[#333333] text-[13px] font-medium px-3.5 py-1.5 rounded-[8px]">
                      {spec}
                    </span>
                  ))}
                </div>
              </section>

              {/* 4. Education */}
              <section className={cardClass} aria-labelledby="education-heading">
                <h2 id="education-heading" className="text-[18px] font-bold text-[#333333] mb-4">Education</h2>
                <ul className="list-none m-0 p-0">
                  {doctor.education.map((edu) => (
                    <li key={`${edu.degree}-${edu.year}`} className="flex items-center gap-3 pb-3 border-b border-[#F5F5F5] mb-3 last:border-0 last:mb-0 last:pb-0">
                      <div className="w-9 h-9 rounded-full bg-[#E6F4F3] flex items-center justify-center shrink-0" aria-hidden="true">
                        <GraduationCap className="w-5 h-5 text-[#00766C]" />
                      </div>
                      <div>
                        <p className="text-[15px] font-semibold text-[#333333] mb-0.5">{edu.degree}</p>
                        <p className="text-[13px] text-[#666666]">{edu.institution} · {edu.year}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              {/* 5. ICP & Languages */}
              <section className={cardClass} aria-labelledby="credentials-heading">
                <h2 id="credentials-heading" className="text-[18px] font-bold text-[#333333] mb-4">
                  Credentials &amp; Languages
                </h2>
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#00766C] text-white text-[12px] font-bold shrink-0" aria-hidden="true">✓</span>
                  <span className="text-[14px] text-[#333333]"><strong>ICP Registration:</strong> {doctor.icpNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Languages className="w-5 h-5 text-[#00766C] shrink-0" />
                  <span className="text-[14px] text-[#333333]"><strong>Languages:</strong> {doctor.languages.join(', ')}</span>
                </div>
              </section>

              {/* 6. Reviews */}
              <section className="bg-white rounded-[8px] border border-[#E5E5E5] p-6" aria-labelledby="reviews-heading">
                <h2 id="reviews-heading" className="flex items-center gap-2 text-[18px] font-bold text-[#333333] mb-5">
                  <Star className="w-5 h-5 text-[#F5A623]" />
                  Patient Reviews
                </h2>
                <div className="flex flex-col gap-4">
                  {doctor.reviews.map((review, idx) => (
                    <article key={idx} className="p-4 bg-[#F7F8F9] rounded-[8px] border border-[#E5E5E5]">
                      <div className="flex justify-between items-start mb-2 flex-wrap gap-1">
                        <div>
                          <span className="text-[14px] font-semibold text-[#333333]">{review.name}</span>
                          <span className="ml-2"><StarRating rating={review.rating} /></span>
                        </div>
                        <span className="text-[12px] text-[#999999]">{review.date}</span>
                      </div>
                      <p className="text-[14px] text-[#555555] leading-relaxed">{review.text}</p>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN — Booking card (sticky) */}
            <aside aria-label="Book a session">
              <BookingCard doctorId={doctor.id} fee={doctor.fee} visitTypes={doctor.visitTypes} />
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
