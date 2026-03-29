import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BookingCard from './BookingCard'
import MobileBookingBar from './MobileBookingBar'
import { MapPin, ShieldCheck, GraduationCap, Languages, Star } from 'lucide-react'
import type { ProviderProfile } from '@/app/api/contracts/provider'

export function generateStaticParams() { return [] }

// ---------------------------------------------------------------------------
// Types used by this page
// ---------------------------------------------------------------------------

type VisitType = 'in_clinic' | 'home_visit' | 'online'

interface Education { degree: string; institution: string; year: number }

interface Review {
  id: string
  patient_id: string
  rating: number
  comment: string | null
  created_at: string
}

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

async function fetchProvider(id: string): Promise<ProviderProfile | null> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  try {
    const res = await fetch(`${baseUrl}/api/providers/${id}`, { cache: 'no-store' })
    if (!res.ok) return null
    return await res.json() as ProviderProfile
  } catch {
    return null
  }
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
  const { id } = await params
  const provider = await fetchProvider(id)

  if (!provider) notFound()

  // Normalise data from API shape
  const nameWithTitle = provider.full_name.startsWith('Dr.')
    ? provider.full_name
    : `Dr. ${provider.full_name}`

  const initials = nameWithTitle
    .replace('Dr. ', '')
    .split(' ')
    .slice(0, 2)
    .map((w: string) => w[0])
    .join('')

  const primaryLocation = provider.locations?.[0]
  const locationLabel = primaryLocation
    ? `${primaryLocation.address}, ${primaryLocation.city}`
    : (provider.city ?? 'India')

  const visitTypes: VisitType[] = provider.visit_types ?? []

  // Build fee map — use consultation_fee_inr as base, no per-type differentiation from API yet
  const baseFee = provider.consultation_fee_inr ?? 500
  const feeMap: Record<VisitType, number> = {
    in_clinic: baseFee,
    home_visit: Math.round(baseFee * 1.3),
    online: Math.round(baseFee * 0.9),
  }

  const reviews = (provider as unknown as { reviews?: Review[] }).reviews ?? []

  return (
    <>
      <Navbar />

      <main className="bg-[#F7F8F9] min-h-screen pt-10 pb-28 md:pb-20">
        <div className="max-w-[1142px] mx-auto px-6 lg:px-[60px]">
          <div className="grid grid-cols-1 md:grid-cols-[65%_35%] gap-8 items-start">

            {/* LEFT COLUMN */}
            <div>
              {/* 1. Hero row */}
              <div className={cardClass}>
                <div className="flex gap-5 items-start">
                  {/* Avatar */}
                  {provider.avatar_url ? (
                    <img
                      src={provider.avatar_url}
                      alt={nameWithTitle}
                      className="w-[120px] h-[120px] rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-[120px] h-[120px] rounded-full bg-[#00766C] text-white flex items-center justify-center text-[36px] font-bold shrink-0" aria-hidden="true">
                      {initials}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1">
                    <h1 className="text-[24px] font-bold text-[#333333] mb-1">{nameWithTitle}</h1>
                    <p className="text-[15px] font-medium text-[#00766C] mb-3">
                      {provider.specialties[0]?.name ?? 'Physiotherapist'}
                    </p>

                    {/* Rating + ICP badge */}
                    <div className="flex items-center gap-3 flex-wrap mb-2.5">
                      <div className="flex items-center gap-1.5 bg-[#FFF8EC] px-2.5 py-1 rounded-[6px]">
                        <Star className="w-4 h-4 text-[#F5A623] fill-[#F5A623]" />
                        <span className="text-[14px] font-bold text-[#333333]">{(provider.rating_avg ?? 0).toFixed(1)}</span>
                        <span className="text-[13px] text-[#666666]">({provider.rating_count ?? 0})</span>
                      </div>
                      {provider.icp_registration_no && (
                        <span className="inline-flex items-center gap-1 bg-[#E6F4F3] text-[#005A52] text-[12px] font-semibold px-2.5 py-1 rounded-full">
                          <ShieldCheck className="w-3.5 h-3.5" /> ICP Verified
                        </span>
                      )}
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 text-[14px] text-[#666666]">
                      <MapPin className="w-4 h-4" />
                      {locationLabel}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. About */}
              {provider.bio && (
                <section className={cardClass} aria-labelledby="about-heading">
                  <h2 id="about-heading" className="text-[18px] font-bold text-[#333333] mb-3">About</h2>
                  <p className="text-[15px] text-[#555555] leading-[1.7]">{provider.bio}</p>
                </section>
              )}

              {/* 3. Specializations */}
              {provider.specialties.length > 0 && (
                <section className={cardClass} aria-labelledby="specializations-heading">
                  <h2 id="specializations-heading" className="text-[18px] font-bold text-[#333333] mb-4">Specializations</h2>
                  <div className="flex flex-wrap gap-2">
                    {provider.specialties.map((spec) => (
                      <span key={spec.id} className="bg-[#F5F5F5] text-[#333333] text-[13px] font-medium px-3.5 py-1.5 rounded-[8px]">
                        {spec.name}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* 4. ICP & Credentials */}
              {(provider.icp_registration_no || provider.experience_years) && (
                <section className={cardClass} aria-labelledby="credentials-heading">
                  <h2 id="credentials-heading" className="text-[18px] font-bold text-[#333333] mb-4">
                    Credentials
                  </h2>
                  {provider.icp_registration_no && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#00766C] text-white text-[12px] font-bold shrink-0" aria-hidden="true">✓</span>
                      <span className="text-[14px] text-[#333333]">
                        <strong>ICP Registration:</strong> {provider.icp_registration_no}
                      </span>
                    </div>
                  )}
                  {provider.experience_years && (
                    <div className="flex items-center gap-2 mb-3">
                      <GraduationCap className="w-5 h-5 text-[#00766C] shrink-0" />
                      <span className="text-[14px] text-[#333333]">
                        <strong>Experience:</strong> {provider.experience_years} years
                      </span>
                    </div>
                  )}
                  {primaryLocation?.city && (
                    <div className="flex items-center gap-2">
                      <Languages className="w-5 h-5 text-[#00766C] shrink-0" />
                      <span className="text-[14px] text-[#333333]">
                        <strong>City:</strong> {primaryLocation.city}
                      </span>
                    </div>
                  )}
                </section>
              )}

              {/* 5. Reviews */}
              {reviews.length > 0 && (
                <section className="bg-white rounded-[8px] border border-[#E5E5E5] p-6" aria-labelledby="reviews-heading">
                  <h2 id="reviews-heading" className="flex items-center gap-2 text-[18px] font-bold text-[#333333] mb-5">
                    <Star className="w-5 h-5 text-[#F5A623]" />
                    Patient Reviews
                  </h2>
                  <div className="flex flex-col gap-4">
                    {reviews.filter((r) => r.comment).slice(0, 5).map((review) => (
                      <article key={review.id} className="p-4 bg-[#F7F8F9] rounded-[8px] border border-[#E5E5E5]">
                        <div className="flex justify-between items-start mb-2 flex-wrap gap-1">
                          <div>
                            <span className="text-[14px] font-semibold text-[#333333]">Patient</span>
                            <span className="ml-2"><StarRating rating={review.rating} /></span>
                          </div>
                          <span className="text-[12px] text-[#999999]">
                            {new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-[14px] text-[#555555] leading-relaxed">{review.comment}</p>
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* RIGHT COLUMN — Booking card (sticky) */}
            <aside aria-label="Book a session" id="booking-card-section">
              <BookingCard
                doctorId={id}
                fee={feeMap}
                visitTypes={visitTypes.length > 0 ? visitTypes : ['in_clinic']}
              />
            </aside>
          </div>
        </div>
      </main>

      <MobileBookingBar
        doctorId={id}
        fee={feeMap.in_clinic}
        doctorName={nameWithTitle}
      />

      <Footer />
    </>
  )
}
