import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BookingCard from './BookingCard'
import ClinicGallery from './ClinicGallery'
import RecoveryBundles from './RecoveryBundles'
import MobileBookingBar from './MobileBookingBar'
import { MapPin, ShieldCheck, GraduationCap, Languages, Star, ChevronRight, Award, CheckCircle2, Calendar, Clock, Sparkles, Building2, UserCheck, PhoneCall, Activity, Mail } from 'lucide-react'
import type { ProviderProfile, ProviderReview } from '@/app/api/contracts/provider'
import Link from 'next/link'
import Image from 'next/image'
import { formatIndiaDate } from '@/lib/india-date'
import { cn } from '@/lib/utils'
import { getVisitTypeConsultationFee, isVisitType, type VisitType } from '@/lib/booking/policy'
import { formatPublicProviderLocation } from '@/lib/providers/public'

export async function generateStaticParams(): Promise<{ id: string }[]> {
  return [{ id: 'placeholder' }]
}

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

async function fetchProvider(id: string): Promise<ProviderProfile | null> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  try {
    const res = await fetch(`${baseUrl}/api/providers/${id}`, { 
      next: { revalidate: 3600 } // Cache for 1 hour to keep medical profiles fast
    })
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

const cardClass = 'bg-white rounded-[32px] border border-bp-border p-8 mb-8 shadow-sm hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-500 relative overflow-hidden'

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

interface DoctorPageProps { params: Promise<{ id: string }> }

export default async function DoctorPage({ params }: DoctorPageProps) {
  const { id } = await params
  const provider = await fetchProvider(id)

  if (!provider) {
    return (
      <div className="min-h-screen bg-bp-surface flex flex-col items-center justify-center gap-6">
        <div className="w-20 h-20 bg-bp-primary/10 rounded-full flex items-center justify-center text-bp-primary">
           <UserCheck size={40} />
        </div>
        <div className="text-center px-6">
           <h1 className="text-2xl font-black text-bp-primary mb-2">Expert Not Found</h1>
           <p className="text-bp-body font-medium max-w-xs">We couldn&apos;t find the specialist you&apos;re looking for. Please try searching for another expert.</p>
        </div>
        <Link href="/search" className="px-8 py-3 bg-bp-primary text-white font-black rounded-2xl hover:scale-105 transition-transform shadow-xl shadow-bp-primary/10">Back to search</Link>
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
    ? formatPublicProviderLocation(primaryLocation)
    : (provider.city ?? 'India')

  const visitTypes: VisitType[] = (provider.visit_types ?? []).filter(
    (visitType): visitType is VisitType => isVisitType(visitType)
  )

  const baseFee = provider.consultation_fee_inr ?? 500
  const feeMap: Record<VisitType, number> = {
    in_clinic: getVisitTypeConsultationFee(baseFee, 'in_clinic'),
    home_visit: getVisitTypeConsultationFee(baseFee, 'home_visit'),
  }
  const mobileFeeOptions = visitTypes.length > 0
    ? visitTypes.map((visitType) => feeMap[visitType]).filter((fee) => Number.isFinite(fee) && fee > 0)
    : [feeMap.in_clinic]
  const mobileBookingFee = mobileFeeOptions.length > 0 ? Math.min(...mobileFeeOptions) : feeMap.in_clinic
  const mobileFeeLabel = visitTypes.length > 1 ? 'Starting Fee' : 'Consult Fee'

  const reviews: ProviderReview[] = provider.reviews ?? []

  return (
    <div className="bg-bp-surface min-h-screen selection:bg-bp-primary/10 selection:text-bp-primary font-sans">
      <Navbar />

      {/* ── Breadcrumbs (Premium) ── */}
      <nav className="max-w-[1142px] mx-auto px-6 py-6 flex items-center gap-3 text-[12px] text-bp-body/60 font-bold uppercase tracking-widest">
        <Link href="/" className="hover:text-bp-primary transition-colors">Home</Link>
        <ChevronRight size={12} className="text-bp-border" strokeWidth={3} />
        <Link href="/search" className="hover:text-bp-primary transition-colors">Specialists</Link>
        <ChevronRight size={12} className="text-bp-border" strokeWidth={3} />
        <span className="text-bp-primary truncate max-w-[200px]">{nameWithTitle}</span>
      </nav>

      <main className="pb-32 md:pb-24">
        <div className="max-w-[1142px] mx-auto px-6">
          <div className="grid grid-cols-1 xl:grid-cols-[64%_36%] gap-8 items-start">

            {/* LEFT COLUMN */}
            <div className="min-w-0">
              
              {/* 1. Hero Section (Ultra Premium) */}
              <div className={cn(cardClass, "p-0 bg-transparent border-none shadow-none mb-10 overflow-visible")}>
                {/* Visual Cover Layer */}
                <div className="h-40 md:h-56 bg-bp-primary relative rounded-[40px] shadow-2xl shadow-bp-primary/5 overflow-hidden">
                   <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
                   <div className="absolute -right-20 -top-20 w-80 h-80 bg-bp-accent/20 rounded-full blur-3xl animate-pulse"></div>
                   <div className="absolute left-10 bottom-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
                   
                   {/* Verification Ribbon */}
                   {provider.verified && (
                     <div className="absolute top-6 left-6 bg-white/10 backdrop-blur-xl border border-white/20 text-white px-4 py-2 rounded-2xl flex items-center gap-2 text-[11px] font-black tracking-widest uppercase shadow-lg">
                        <Sparkles size={14} className="text-bp-accent animate-bounce" />
                        Verified Provider Profile
                     </div>
                   )}
                </div>

                <div className="px-4 md:px-10 -mt-20 md:-mt-24 relative z-10">
                  <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-end">
                    {/* Avatar with Ring */}
                    <div className="relative group">
                      <div className="absolute inset-0 bg-bp-accent rounded-[48px] blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-700"></div>
                      {provider.avatar_url ? (
                        <div className="relative p-1.5 bg-white rounded-[48px] shadow-2xl border border-bp-border/40">
                          <Image
                            src={provider.avatar_url}
                            alt={nameWithTitle}
                            width={160}
                            height={160}
                            className="w-28 h-28 md:w-40 md:h-40 rounded-[40px] object-cover bg-bp-surface border-4 border-white"
                            priority
                          />
                        </div>
                      ) : (
                        <div className="relative p-1.5 bg-white rounded-[48px] shadow-2xl border border-bp-border/40">
                           <div className="w-28 h-28 md:w-40 md:h-40 rounded-[40px] bg-gradient-to-br from-bp-surface to-bp-border/20 text-bp-primary flex items-center justify-center text-[40px] md:text-[56px] font-black border-4 border-white shrink-0 shadow-inner" aria-hidden="true">
                            {initials}
                           </div>
                        </div>
                      )}
                      
                      {provider.verified && (
                        <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-2xl shadow-xl border border-bp-border/30 transform hover:scale-110 transition-transform">
                          <div className="w-8 h-8 rounded-xl bg-bp-primary flex items-center justify-center text-white">
                             <CheckCircle2 size={18} strokeWidth={3} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Info Header */}
                    <div className="flex-1 pb-2">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                          <h1 className="text-[36px] md:text-[52px] font-black text-bp-primary tracking-tighter leading-none mb-3">
                            {nameWithTitle}
                          </h1>
                          <p className="text-bp-primary font-bold text-[16px] flex items-center gap-2">
                            <GraduationCap size={18} className="text-bp-accent" />
                            {provider.verified ? 'Verified physiotherapy provider' : provider.icp_registration_no ? 'ICP number listed on profile' : 'Physiotherapy provider'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2.5 px-3.5 py-1.5 bg-bp-primary text-white font-black rounded-xl border border-bp-primary/10 text-[14px] shadow-lg shadow-bp-primary/10">
                          <Award size={16} strokeWidth={3} className="text-bp-accent" />
                          {provider.specialties[0]?.name ?? 'Physiotherapist'}
                        </div>
                        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-bp-border/40 shadow-sm">
                          <StarRating rating={provider.rating_avg ?? 0} size={15} />
                          <span className="text-[15px] font-black text-bp-primary">{(provider.rating_avg ?? 0).toFixed(1)}</span>
                          <span className="text-[12px] text-bp-body/40 font-black uppercase tracking-widest leading-none pt-0.5">({provider.rating_count ?? 0})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 px-4 md:px-10 mt-12 pb-12">
                   <div className="bg-[#FBFCFD] p-6 rounded-[32px] border border-bp-border/10 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.05)] flex flex-col items-center lg:items-start group hover:border-bp-primary/40 hover:bg-white transition-all duration-500 hover:-translate-y-1">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-bp-primary mb-5 shadow-sm group-hover:bg-bp-primary group-hover:text-white transition-all duration-500"><Sparkles size={22} strokeWidth={2.5} /></div>
                      <p className="text-[11px] font-black text-bp-body/30 uppercase tracking-[0.2em] leading-none mb-2.5">Experience</p>
                      <p className="text-[22px] font-black text-bp-primary tracking-tighter leading-none">{provider.experience_years ?? 5}+ <span className="text-[14px] text-bp-body/40 tracking-normal font-bold">Years</span></p>
                   </div>
                   <div className="bg-[#FBFCFD] p-6 rounded-[32px] border border-bp-border/10 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.05)] flex flex-col items-center lg:items-start group hover:border-bp-primary/40 hover:bg-white transition-all duration-500 hover:-translate-y-1">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-bp-primary mb-5 shadow-sm group-hover:bg-bp-primary group-hover:text-white transition-all duration-500"><Building2 size={22} strokeWidth={2.5} /></div>
                     <p className="text-[11px] font-black text-bp-body/30 uppercase tracking-[0.2em] leading-none mb-2.5">Patient Reviews</p>
                     <p className="text-[22px] font-black text-bp-primary tracking-tighter leading-none">{provider.rating_count > 0 ? provider.rating_count : 'New'} <span className="text-[14px] text-bp-body/40 tracking-normal font-bold">{provider.rating_count === 1 ? 'Review' : 'Reviews'}</span></p>
                   </div>
                   <div className="bg-[#FBFCFD] p-6 rounded-[32px] border border-bp-border/10 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.05)] flex flex-col items-center lg:items-start group hover:border-bp-primary/40 hover:bg-white transition-all duration-500 hover:-translate-y-1">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-bp-primary mb-5 shadow-sm group-hover:bg-bp-primary group-hover:text-white transition-all duration-500"><Star size={22} strokeWidth={2.5} /></div>
                     <p className="text-[11px] font-black text-bp-body/30 uppercase tracking-[0.2em] leading-none mb-2.5">Verification</p>
                     <p className="text-[22px] font-black text-bp-primary tracking-tighter leading-none">{provider.verified ? 'Profile' : provider.icp_registration_no ? 'ICP' : 'Profile'} <span className="text-[14px] text-bp-body/40 tracking-normal font-bold">{provider.verified ? 'Verified' : provider.icp_registration_no ? 'Listed' : 'Listed'}</span></p>
                   </div>
                   <div className="bg-[#FBFCFD] p-6 rounded-[32px] border border-bp-border/10 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.05)] flex flex-col items-center lg:items-start group hover:border-bp-primary/40 hover:bg-white transition-all duration-500 hover:-translate-y-1">
                      <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-5 shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500"><Clock size={22} strokeWidth={2.5} /></div>
                     <p className="text-[11px] font-black text-bp-body/30 uppercase tracking-[0.2em] leading-none mb-2.5">Availability</p>
                     <p className="text-[22px] font-black text-emerald-600 tracking-tighter leading-none">{provider.next_available_slot ? 'Slots' : 'Check'} <span className="text-[14px] opacity-60 tracking-normal font-bold">{provider.next_available_slot ? 'Open' : 'Schedule'}</span></p>
                   </div>
                </div>
              </div>

              {/* 2. Professional Bio (Premium Reading) */}
              {provider.bio && (
                <section className={cn(cardClass, "border-bp-border/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.03)] overflow-hidden relative")}>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-bp-surface/50 rounded-bl-[120px] -z-0 pointer-events-none"></div>
                  <div className="absolute top-12 left-0 w-1 h-12 bg-bp-accent rounded-r-full"></div>
                  
                  <h2 className="text-[28px] font-black text-bp-primary mb-8 flex items-center gap-4 relative z-10 tracking-tight">
                    Professional Biography
                  </h2>
                  <div className="prose prose-teal max-w-none relative z-10">
                     <p className="text-[18px] text-bp-body leading-[1.8] font-medium whitespace-pre-wrap max-w-[95%] first-letter:text-5xl first-letter:font-black first-letter:text-bp-primary first-letter:mr-3 first-letter:float-left">
                        {provider.bio}
                     </p>
                  </div>
                </section>
              )}

              {/* 2.5 Clinic Gallery */}
              <ClinicGallery images={provider.gallery_images ?? []} />

              {/* 2.6 Recovery Bundles */}
              <RecoveryBundles />

              {/* 3. Specializations & Clinical Focus */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {provider.specialties.length > 0 && (
                  <section className={cn(cardClass, "mb-0 border-bp-border/10 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.02)]")}>
                    <h2 className="text-[20px] font-black text-bp-primary mb-8 flex items-center gap-4 tracking-tight">
                       <div className="w-10 h-10 bg-bp-surface rounded-xl flex items-center justify-center text-bp-accent">
                          <Activity size={20} strokeWidth={2.5} />
                       </div>
                       Clinical Expertise
                    </h2>
                    <div className="flex flex-wrap gap-2.5">
                      {provider.specialties.map((spec) => (
                        <span key={spec.id} className="bg-white text-bp-primary text-[14px] font-black px-5 py-3 rounded-[18px] border border-bp-border/40 shadow-sm hover:border-bp-primary hover:shadow-md transition-all duration-300 cursor-default">
                          {spec.name}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                <section className={cn(cardClass, "mb-0 border-bp-border/10 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.02)]")}>
                  <h2 className="text-[20px] font-black text-bp-primary mb-8 flex items-center gap-4 tracking-tight">
                     <div className="w-10 h-10 bg-bp-surface rounded-xl flex items-center justify-center text-bp-accent">
                        <GraduationCap size={20} strokeWidth={2.5} />
                     </div>
                     Professional Credentials
                  </h2>
                  <div className="space-y-6">
                    {provider.icp_registration_no && (
                      <div className="flex items-center gap-5 p-5 rounded-[24px] bg-[#FBFCFD] border border-bp-border/30 group hover:border-bp-accent/40 transition-colors duration-500">
                        <div className="bg-white p-3.5 rounded-2xl border border-bp-border shadow-sm group-hover:scale-110 transition-transform duration-500">
                          <ShieldCheck size={24} className="text-bp-accent" strokeWidth={3} />
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-bp-body/30 uppercase tracking-[0.2em] mb-1.5 leading-none">ICP Registration</p>
                          <p className="text-[18px] font-black text-bp-primary tracking-tight">{provider.icp_registration_no}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-4">
                      <div className="mt-1 bg-bp-accent/10 p-2 rounded-xl text-bp-accent">
                        <Awards size={20} strokeWidth={3} />
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-bp-body/40 uppercase tracking-widest mb-1">Listed Qualification</p>
                        <p className="text-[16px] font-bold text-bp-primary">{provider.title ?? 'Physiotherapist'}</p>
                        <p className="text-[14px] font-medium text-bp-body/40 mt-1 italic">Additional academic details may be shared by the provider during consultation.</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* 4. Patient Feedback (Luxury List) */}
              <section className={cn(cardClass, "border-bp-border/10 bg-[#FBFCFD] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.03)]")} aria-labelledby="reviews-heading">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 relative z-10 px-2 lg:px-4">
                  <div className="max-w-md">
                    <h2 id="reviews-heading" className="text-[28px] font-black text-bp-primary mb-2 tracking-tight">
                      Patient Transformations
                    </h2>
                    <p className="text-[15px] text-bp-body/50 font-bold leading-relaxed">
                       Verified outcomes and recovery stories from patients under professional care.
                    </p>
                  </div>
                  <div className="flex items-center gap-8 p-6 bg-white rounded-[32px] border border-bp-border/30 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-bp-primary/[0.03] rounded-bl-[60px] -z-0"></div>
                    <div className="text-right relative z-10">
                       <div className="text-[44px] font-black text-bp-primary leading-none tracking-tighter">{(provider.rating_avg ?? 0).toFixed(1)}</div>
                       <div className="text-[11px] font-bold text-bp-body/30 uppercase tracking-[0.2em] mt-2 pr-1">Out of 5.0</div>
                    </div>
                    <div className="w-px h-12 bg-bp-border/60" />
                    <div className="flex flex-col gap-1.5 relative z-10">
                      <StarRating rating={provider.rating_avg ?? 0} size={18} />
                      <span className="text-[11px] font-black text-bp-primary/70 uppercase tracking-widest">{provider.rating_count ?? 0} Clinical Reviews</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8 px-2 lg:px-4">
                  {reviews.length > 0 ? (
                    reviews.filter((r) => r.comment).slice(0, 5).map((review) => (
                      <article key={review.id} className="group p-8 lg:p-10 rounded-[40px] bg-white border border-bp-border/20 hover:border-bp-primary/30 hover:shadow-[0_12px_48px_-8px_rgba(0,118,108,0.05)] transition-all duration-700 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-8 relative z-10">
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-bp-surface border border-bp-border/40 flex items-center justify-center text-bp-primary text-xl font-black shadow-inner shadow-black/[0.02]">
                               {review.comment?.charAt(0).toUpperCase() || 'P'}
                            </div>
                            <div>
                               <p className="text-[16px] font-black text-bp-primary tracking-tight mb-1">Verified Patient</p>
                               <div className="flex items-center gap-3">
                                  <StarRating rating={review.rating} size={14} />
                                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-100/50">Clinical Feedback</span>
                               </div>
                            </div>
                          </div>
                          <span className="text-[12px] text-bp-body/30 font-bold tracking-widest uppercase">
                            {formatIndiaDate(review.created_at, { month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        
                        <blockquote className="relative z-10">
                           <p className="text-[18px] text-bp-primary/80 leading-[1.8] font-medium italic opacity-90 max-w-2xl group-hover:text-bp-primary transition-colors duration-500">
                             &quot;{review.comment}&quot;
                           </p>
                        </blockquote>
                      </article>
                    ))
                  ) : (
                    <div className="py-24 text-center bg-white rounded-[40px] border-2 border-dashed border-bp-border/40">
                       <div className="w-20 h-20 bg-bp-surface rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-bp-border/20"><Mail className="text-bp-border" size={32} /></div>
                       <h3 className="text-[18px] font-black text-bp-primary/70 mb-2 tracking-tight">Clinical Outcomes Pending</h3>
                       <p className="text-bp-body/40 text-[15px] font-bold max-w-sm mx-auto">Be among the first to document your professional recovery journey with {nameWithTitle}.</p>
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div id="booking-card-section" className="xl:hidden mt-10" aria-label="Book a session">
              <BookingCard
                doctorId={id}
                fee={feeMap}
                visitTypes={visitTypes.length > 0 ? visitTypes : ['in_clinic']}
              />
            </div>

            {/* RIGHT COLUMN — Booking card (sticky) */}
            <aside aria-label="Book a session" className="hidden xl:block">
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
        fee={mobileBookingFee}
        feeLabel={mobileFeeLabel}
        doctorName={nameWithTitle}
      />

      <Footer />
    </div>
  )
}

function Awards({ size, className, strokeWidth }: { size: number; className?: string; strokeWidth?: number }) {
  return <Award size={size} className={className} strokeWidth={strokeWidth} />
}
