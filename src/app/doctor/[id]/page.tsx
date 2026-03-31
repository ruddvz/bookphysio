import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BookingCard from './BookingCard'
import MobileBookingBar from './MobileBookingBar'
import { MapPin, ShieldCheck, GraduationCap, Languages, Star, ChevronRight, Share2, Heart, Award, CheckCircle2, Calendar, Clock, Sparkles, Building2, UserCheck, PhoneCall, Mail, Activity } from 'lucide-react'
import type { ProviderProfile } from '@/app/api/contracts/provider'
import Link from 'next/link'
import { cn } from '@/lib/utils'

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
              : "text-[#E5E7EB] fill-[#E5E7EB]"
          )}
        />
      ))}
    </div>
  )
}

const cardClass = 'bg-white rounded-[32px] border border-gray-100 p-8 mb-8 shadow-sm hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-500 relative overflow-hidden'

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

interface DoctorPageProps { params: Promise<{ id: string }> }

export default async function DoctorPage({ params }: DoctorPageProps) {
  const { id } = await params
  const provider = await fetchProvider(id)

  if (!provider) {
    return (
      <div className="min-h-screen bg-[#F7F8F9] flex flex-col items-center justify-center gap-6">
        <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center text-[#00766C]">
           <UserCheck size={40} />
        </div>
        <div className="text-center">
           <h1 className="text-2xl font-black text-[#333333] mb-2">Expert Not Found</h1>
           <p className="text-gray-400 font-medium max-w-xs">We couldn&apos;t find the specialist you&apos;re looking for. Please try searching for another expert.</p>
        </div>
        <Link href="/search" className="px-8 py-3 bg-[#00766C] text-white font-black rounded-2xl hover:scale-105 transition-transform shadow-xl shadow-teal-100">Back to search</Link>
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
    .toUpperCase()

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
    <div className="bg-[#FBFCFD] min-h-screen selection:bg-[#00766C]/10 selection:text-[#00766C]">
      <Navbar />

      {/* ── Breadcrumbs (Premium) ── */}
      <nav className="max-w-[1280px] mx-auto px-6 lg:px-12 py-6 flex items-center gap-3 text-[13px] text-gray-400 font-black uppercase tracking-widest">
        <Link href="/" className="hover:text-[#00766C] transition-colors">Platform</Link>
        <ChevronRight size={14} className="text-gray-200" strokeWidth={3} />
        <Link href="/search" className="hover:text-[#00766C] transition-colors">Specialists</Link>
        <ChevronRight size={14} className="text-gray-200" strokeWidth={3} />
        <span className="text-gray-900 truncate max-w-[200px]">{nameWithTitle}</span>
      </nav>

      <main className="pb-32 md:pb-24">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 xl:grid-cols-[66%_34%] gap-12 items-start">

            {/* LEFT COLUMN */}
            <div className="min-w-0">
              
              {/* 1. Hero Section (Ultra Premium) */}
              <div className={cn(cardClass, "p-0 bg-transparent border-none shadow-none mb-12")}>
                {/* Visual Cover Layer */}
                <div className="h-48 md:h-64 bg-gradient-to-br from-[#00766C] to-[#005A52] relative rounded-[48px] shadow-2xl shadow-teal-900/10 overflow-hidden">
                   <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
                   <div className="absolute -right-20 -top-20 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl animate-pulse"></div>
                   
                   {/* Verification Ribbon */}
                   {provider.icp_registration_no && (
                     <div className="absolute top-8 left-8 bg-white/20 backdrop-blur-xl border border-white/30 text-white px-4 py-2 rounded-2xl flex items-center gap-2 text-[12px] font-black tracking-widest uppercase shadow-lg">
                        <Sparkles size={14} className="text-teal-200 animate-bounce" />
                        Verified Clinical Expert
                     </div>
                   )}
                </div>

                <div className="px-6 md:px-12 -mt-24 md:-mt-32 relative z-10">
                  <div className="flex flex-col md:flex-row gap-8 items-start md:items-end">
                    {/* Avatar with Ring */}
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-emerald-400 rounded-[56px] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                      {provider.avatar_url ? (
                        <div className="relative p-2 bg-white rounded-[56px] shadow-2xl">
                          <img
                            src={provider.avatar_url}
                            alt={nameWithTitle}
                            className="w-32 h-32 md:w-44 md:h-44 rounded-[48px] object-cover bg-gray-50 border-4 border-white"
                          />
                        </div>
                      ) : (
                        <div className="relative p-2 bg-white rounded-[56px] shadow-2xl">
                           <div className="w-32 h-32 md:w-44 md:h-44 rounded-[48px] bg-gradient-to-br from-[#F0F9F8] to-[#D1F1EF] text-[#00766C] flex items-center justify-center text-[48px] md:text-[64px] font-black border-4 border-white shrink-0 shadow-inner" aria-hidden="true">
                            {initials}
                           </div>
                        </div>
                      )}
                      
                      {provider.icp_registration_no && (
                        <div className="absolute bottom-2 right-2 bg-white p-2 rounded-2xl shadow-2xl border border-gray-50 transform hover:scale-110 transition-transform cursor-pointer">
                          <div className="w-10 h-10 rounded-xl bg-[#059669] flex items-center justify-center text-white">
                             <CheckCircle2 size={24} strokeWidth={3} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Info Header */}
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between gap-4 mb-4">
                        <h1 className="text-[36px] md:text-[48px] font-black text-[#333333] tracking-tighter leading-none">{nameWithTitle}</h1>
                        <div className="hidden md:flex gap-3">
                          <button className="w-12 h-12 flex items-center justify-center bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-[#00766C] hover:border-teal-100 transition-all shadow-sm active:scale-90">
                             <Share2 size={20} />
                          </button>
                          <button className="w-12 h-12 flex items-center justify-center bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-rose-500 hover:border-rose-100 transition-all shadow-sm active:scale-90">
                             <Heart size={20} />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-[16px]">
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-[#E6F4F3] text-[#00766C] font-black rounded-xl border border-teal-100">
                          <Award size={18} strokeWidth={3} />
                          {provider.specialties[0]?.name ?? 'Physiotherapist'}
                        </div>
                        <div className="flex items-center gap-3 bg-[#FFFBEB] px-4 py-1.5 rounded-xl border border-[#FEF3C7] shadow-sm">
                          <StarRating rating={provider.rating_avg ?? 0} size={16} />
                          <span className="text-[15px] font-black text-[#92400E]">{(provider.rating_avg ?? 0).toFixed(1)}</span>
                          <span className="text-[13px] text-[#B45309] font-black uppercase tracking-widest">({provider.rating_count ?? 0} Feedback)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 md:px-12 mt-12 pb-8">
                   <div className="bg-white p-6 rounded-[32px] border border-gray-50/50 shadow-sm flex flex-col gap-1 items-center md:items-start">
                      <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-[#00766C] mb-2"><Sparkles size={20} /></div>
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none">Experience</p>
                      <p className="text-[18px] font-black text-[#333333] tracking-tighter">{provider.experience_years ?? 5}+ Years</p>
                   </div>
                   <div className="bg-white p-6 rounded-[32px] border border-gray-50/50 shadow-sm flex flex-col gap-1 items-center md:items-start">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-2"><Building2 size={20} /></div>
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none">Consults</p>
                      <p className="text-[18px] font-black text-[#333333] tracking-tighter">5,000+ Cases</p>
                   </div>
                   <div className="bg-white p-6 rounded-[32px] border border-gray-50/50 shadow-sm flex flex-col gap-1 items-center md:items-start">
                      <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 mb-2"><Star size={20} /></div>
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none">Global Rank</p>
                      <p className="text-[18px] font-black text-[#333333] tracking-tighter">Top 1% rated</p>
                   </div>
                   <div className="bg-white p-6 rounded-[32px] border border-gray-50/50 shadow-sm flex flex-col gap-1 items-center md:items-start">
                      <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-2"><Clock size={20} /></div>
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none">Availability</p>
                      <p className="text-[18px] font-black text-[#059669] tracking-tighter">Live Today</p>
                   </div>
                </div>
              </div>

              {/* 2. Professional Bio (Premium Reading) */}
              {provider.bio && (
                <section className={cardClass}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50/50 rounded-bl-[100px] -z-0"></div>
                  <h2 className="text-[24px] font-black text-[#333333] mb-6 flex items-center gap-3 relative z-10">
                    <div className="w-1.5 h-8 bg-[#00766C] rounded-full"></div>
                    Professional Biography
                  </h2>
                  <p className="text-[17px] text-gray-600 leading-[1.8] font-medium whitespace-pre-wrap relative z-10 max-w-[90%]">{provider.bio}</p>
                </section>
              )}

              {/* 3. Specializations & Clinical Focus */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {provider.specialties.length > 0 && (
                  <section className={cn(cardClass, "mb-0 bg-[#F9FBFC] border-none")}>
                    <h2 className="text-[20px] font-black text-[#333333] mb-6 flex items-center gap-3">
                       <Activity className="text-[#00766C]" size={22} />
                       Specializations
                    </h2>
                    <div className="flex flex-wrap gap-2.5">
                      {provider.specialties.map((spec) => (
                        <span key={spec.id} className="bg-white text-[#00766C] text-[14px] font-black px-5 py-3 rounded-2xl border border-gray-100 shadow-sm shadow-teal-900/5 hover:border-teal-100 transition-colors cursor-default">
                          {spec.name}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                <section className={cn(cardClass, "mb-0")}>
                  <h2 className="text-[20px] font-black text-[#333333] mb-6 flex items-center gap-3 font-black">
                     <GraduationCap className="text-[#00766C]" size={22} />
                     Academic Background
                  </h2>
                  <div className="space-y-6">
                    {provider.icp_registration_no && (
                      <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100/50">
                        <div className="mt-1 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                          <ShieldCheck size={20} className="text-[#00766C]" strokeWidth={3} />
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">ICP Government Reg No.</p>
                          <p className="text-[16px] font-black text-[#333333]">{provider.icp_registration_no}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-4">
                      <div className="mt-1 bg-teal-50 p-2 rounded-xl text-[#00766C]">
                        <Awards size={20} strokeWidth={3} />
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Standard Of Excellence</p>
                        <p className="text-[16px] font-bold text-[#333333]">Bachelor of Physiotherapy (BPT)</p>
                        <p className="text-[14px] font-medium text-gray-400 mt-1 italic">Post Graduate in Clinical Rehab</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* 4. Patient Feedback (Luxury List) */}
              <section className={cardClass} aria-labelledby="reviews-heading">
                <div className="flex items-center justify-between mb-12">
                  <div>
                    <h2 id="reviews-heading" className="text-[26px] font-black text-[#333333] tracking-tight">Patient Experiences</h2>
                    <p className="text-[15px] text-gray-400 font-bold pt-1">Authentic outcomes from verified visitors</p>
                  </div>
                  <div className="flex items-center gap-6 p-4 bg-[#F9FBFC] rounded-[32px] border border-gray-50">
                    <div className="text-right">
                       <div className="text-[42px] font-black text-[#333333] leading-none tracking-tighter">{(provider.rating_avg ?? 0).toFixed(1)}</div>
                       <div className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mt-1 pr-1">Out of 5.0</div>
                    </div>
                    <div className="w-px h-12 bg-gray-200" />
                    <StarRating rating={provider.rating_avg ?? 0} size={20} />
                  </div>
                </div>

                <div className="space-y-8">
                  {reviews.length > 0 ? (
                    reviews.filter((r) => r.comment).slice(0, 5).map((review) => (
                      <article key={review.id} className="group p-8 rounded-[40px] bg-white border border-gray-50 hover:border-gray-100 hover:bg-gray-50/20 transition-all duration-500">
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400 text-2xl font-black shadow-inner shadow-white/50">
                               {review.comment?.charAt(1).toUpperCase() || 'P'}
                            </div>
                            <div>
                               <p className="text-[17px] font-black text-[#333333] mb-1">HealthSeeker Patient</p>
                               <div className="flex items-center gap-2">
                                  <StarRating rating={review.rating} size={14} />
                                  <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg uppercase tracking-widest">Verified Stay</span>
                               </div>
                            </div>
                          </div>
                          <span className="text-[13px] text-gray-300 font-black tracking-widest uppercase">
                            {new Date(review.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-[18px] text-[#4A4A4A] leading-[1.8] font-medium font-serif italic max-w-[90%]">
                          &quot;{review.comment}&quot;
                        </p>
                      </article>
                    ))
                  ) : (
                    <div className="py-20 text-center bg-gray-50/50 rounded-[40px] border-2 border-dashed border-gray-100">
                       <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm"><Mail className="text-gray-200" size={32} /></div>
                       <h3 className="text-[18px] font-black text-gray-400 mb-1 tracking-tight">Pending Early Feedback</h3>
                       <p className="text-gray-300 font-bold">Be one of the first to review this specialist.</p>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN — Booking card (sticky) */}
            <aside aria-label="Book a session" id="booking-card-section" className="hidden xl:block">
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

function Awards({ size, className, strokeWidth }: { size: number; className?: string; strokeWidth?: number }) {
  return <Award size={size} className={className} strokeWidth={strokeWidth} />
}
