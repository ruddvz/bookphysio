import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BookingCard from './BookingCard'
import MobileBookingBar from './MobileBookingBar'
import { MapPin, ShieldCheck, GraduationCap, Languages, Star, ChevronRight, Share2, Heart, Award, CheckCircle2, Calendar } from 'lucide-react'
import type { ProviderProfile } from '@/app/api/contracts/provider'
import Link from 'next/link'

export async function generateStaticParams(): Promise<{ id: string }[]> {
  return [{ id: 'placeholder' }]
}

// ---------------------------------------------------------------------------
// Types used by this page
// ---------------------------------------------------------------------------

type VisitType = 'in_clinic' | 'home_visit' | 'online'

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

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={size}
          className={cn(
            i < Math.floor(rating) 
              ? "text-[#F5A623] fill-[#F5A623]" 
              : i < rating 
              ? "text-[#F5A623] fill-[#F5A623] opacity-50" 
              : "text-[#DDDDDD] fill-[#DDDDDD]"
          )}
        />
      ))}
    </div>
  )
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

const cardClass = 'bg-white rounded-xl border border-[#E5E5E5] p-6 mb-6 shadow-sm hover:shadow-md transition-shadow'

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

interface DoctorPageProps { params: Promise<{ id: string }> }

export default async function DoctorPage({ params }: DoctorPageProps) {
  const { id } = await params
  const provider = await fetchProvider(id)

  if (!provider) {
    return (
      <div className="min-h-screen bg-[#F7F8F9] flex flex-col items-center justify-center gap-4">
        <p className="text-[#666666] text-[18px] font-medium">Physiotherapist not found.</p>
        <Link href="/search" className="text-[#00766C] font-bold hover:underline">Back to search</Link>
      </div>
    )
  }

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

  const baseFee = provider.consultation_fee_inr ?? 500
  const feeMap: Record<VisitType, number> = {
    in_clinic: baseFee,
    home_visit: Math.round(baseFee * 1.3),
    online: Math.round(baseFee * 0.9),
  }

  const reviews = (provider as unknown as { reviews?: Review[] }).reviews ?? []

  return (
    <div className="bg-[#FBFCFD] min-h-screen">
      <Navbar />

      {/* Breadcrumbs */}
      <nav className="max-w-[1142px] mx-auto px-6 lg:px-[60px] py-4 flex items-center gap-2 text-[13px] text-gray-500 font-medium">
        <Link href="/" className="hover:text-[#00766C]">Home</Link>
        <ChevronRight size={14} className="text-gray-300" />
        <Link href="/search" className="hover:text-[#00766C]">Search</Link>
        <ChevronRight size={14} className="text-gray-300" />
        <span className="text-gray-900 truncate max-w-[200px]">{nameWithTitle}</span>
      </nav>

      <main className="pb-28 md:pb-20">
        <div className="max-w-[1142px] mx-auto px-6 lg:px-[60px]">
          <div className="grid grid-cols-1 md:grid-cols-[68%_32%] gap-8 items-start">

            {/* LEFT COLUMN */}
            <div className="min-w-0">
              
              {/* 1. Hero Section */}
              <div className={cn(cardClass, "relative overflow-hidden p-0")}>
                <div className="h-24 bg-gradient-to-r from-[#00766C] to-[#005A52]" />
                <div className="p-6 md:p-8 -mt-12 flex flex-col md:flex-row gap-6 items-start md:items-end">
                  {/* Avatar */}
                  <div className="relative">
                    {provider.avatar_url ? (
                      <img
                        src={provider.avatar_url}
                        alt={nameWithTitle}
                        className="w-32 h-32 md:w-36 md:h-36 rounded-2xl object-cover border-4 border-white shadow-xl bg-white"
                      />
                    ) : (
                      <div className="w-32 h-32 md:w-36 md:h-36 rounded-2xl bg-gradient-to-br from-[#00766C] to-[#005A52] text-white flex items-center justify-center text-[40px] font-bold border-4 border-white shadow-xl shrink-0" aria-hidden="true">
                        {initials}
                      </div>
                    )}
                    {provider.icp_registration_no && (
                      <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-full shadow-lg">
                        <CheckCircle2 className="w-6 h-6 text-[#059669]" fill="#D1FAE5" />
                      </div>
                    )}
                  </div>

                  {/* Info Header */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between w-full">
                      <h1 className="text-[28px] md:text-[32px] font-black text-[#333333] tracking-tight">{nameWithTitle}</h1>
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                           <Share2 size={18} />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                           <Heart size={18} />
                        </button>
                      </div>
                    </div>
                    <p className="text-[17px] font-bold text-[#00766C] flex items-center gap-2">
                      <Award size={18} />
                      {provider.specialties[0]?.name ?? 'Physiotherapist'}
                    </p>
                    
                    <div className="flex items-center gap-3 flex-wrap pt-2">
                      <div className="flex items-center gap-2 bg-[#FFFBEB] px-3 py-1.5 rounded-full border border-[#FEF3C7]">
                        <StarRating rating={provider.rating_avg ?? 0} />
                        <span className="text-[14px] font-black text-[#92400E]">{(provider.rating_avg ?? 0).toFixed(1)}</span>
                        <span className="text-[13px] text-[#B45309] font-medium">({provider.rating_count ?? 0} reviews)</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-[14px] text-gray-600 font-medium">
                        <MapPin size={16} className="text-gray-400" />
                        {provider.city ?? 'Location varies'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats Banner */}
                <div className="bg-gray-50 border-t border-gray-100 px-8 py-4 flex gap-8 overflow-x-auto no-scrollbar">
                  <div>
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Experience</p>
                    <p className="text-[15px] font-bold text-[#333333]">{provider.experience_years ?? 5}+ Years</p>
                  </div>
                  <div className="w-px h-8 bg-gray-200" />
                  <div>
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Pricing</p>
                    <p className="text-[15px] font-bold text-[#333333]">₹{baseFee} / session</p>
                  </div>
                   <div className="w-px h-8 bg-gray-200" />
                  <div>
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Availability</p>
                    <p className="text-[15px] font-bold text-[#059669] flex items-center gap-1">
                      <Calendar size={14} /> Available Today
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Professional Bio */}
              {provider.bio && (
                <section className={cardClass}>
                  <h2 className="text-[20px] font-black text-[#333333] mb-4 flex items-center gap-2">
                    About {nameWithTitle}
                  </h2>
                  <p className="text-[16px] text-[#4A4A4A] leading-[1.8] font-medium whitespace-pre-wrap">{provider.bio}</p>
                </section>
              )}

              {/* 3. Specializations & Clinical Focus */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {provider.specialties.length > 0 && (
                  <section className={cn(cardClass, "mb-0")}>
                    <h2 className="text-[18px] font-black text-[#333333] mb-4">Specializations</h2>
                    <div className="flex flex-wrap gap-2">
                      {provider.specialties.map((spec) => (
                        <span key={spec.id} className="bg-[#E6F4F3] text-[#00766C] text-[13px] font-bold px-4 py-2 rounded-xl">
                          {spec.name}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                <section className={cn(cardClass, "mb-0")}>
                  <h2 className="text-[18px] font-black text-[#333333] mb-4">Credentials</h2>
                  <div className="space-y-3">
                    {provider.icp_registration_no && (
                      <div className="flex items-start gap-3">
                        <div className="mt-1 bg-teal-50 p-1 rounded-md">
                          <ShieldCheck size={16} className="text-[#00766C]" />
                        </div>
                        <div>
                          <p className="text-[12px] font-black text-gray-400 uppercase tracking-tight leading-none mb-1">ICP Registration</p>
                          <p className="text-[14px] font-bold text-[#333333]">{provider.icp_registration_no}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <div className="mt-1 bg-teal-50 p-1 rounded-md">
                        <GraduationCap size={16} className="text-[#00766C]" />
                      </div>
                      <div>
                        <p className="text-[12px] font-black text-gray-400 uppercase tracking-tight leading-none mb-1">Education</p>
                        <p className="text-[14px] font-bold text-[#333333]">Bachelor of Physiotherapy (BPT)</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* 4. Patient Feedback */}
              <section className={cardClass} aria-labelledby="reviews-heading">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 id="reviews-heading" className="text-[20px] font-black text-[#333333]">Patient Feedback</h2>
                    <p className="text-[14px] text-gray-500 font-medium pt-1">Verified reviews from actual patients</p>
                  </div>
                  <div className="text-right">
                    <div className="text-[32px] font-black text-[#333333] leading-none">{(provider.rating_avg ?? 0).toFixed(1)}</div>
                    <StarRating rating={provider.rating_avg ?? 0} size={18} />
                  </div>
                </div>

                <div className="space-y-6">
                  {reviews.length > 0 ? (
                    reviews.filter((r) => r.comment).slice(0, 5).map((review) => (
                      <article key={review.id} className="pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold">
                              P
                            </div>
                            <div>
                               <p className="text-[14px] font-bold text-[#333333]">Verified Patient</p>
                               <StarRating rating={review.rating} size={12} />
                            </div>
                          </div>
                          <span className="text-[12px] text-gray-400 font-bold">
                            {new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-[15px] text-[#555555] leading-relaxed font-medium pl-13">"{review.comment}"</p>
                      </article>
                    ))
                  ) : (
                    <div className="py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                       <p className="text-gray-400 font-bold">No verified reviews yet for this provider.</p>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN — Booking card (sticky) */}
            <aside aria-label="Book a session" id="booking-card-section" className="hidden md:block">
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
    </div>
  )
}
