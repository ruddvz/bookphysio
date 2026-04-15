import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BookingCard from './BookingCard'
import ClinicGallery from './ClinicGallery'
import MobileBookingBar from './MobileBookingBar'
import { GraduationCap, Star, ChevronRight, Award, CheckCircle2, Clock, Sparkles, Building2, Activity, Mail } from 'lucide-react'
import type { ProviderProfile, ProviderReview } from '@/app/api/contracts/provider'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { formatIndiaDate } from '@/lib/india-date'
import { cn } from '@/lib/utils'
import { getVisitTypeConsultationFee, isVisitType, type VisitType } from '@/lib/booking/policy'

export async function generateStaticParams(): Promise<{ id: string }[]> {
  return [{ id: 'placeholder' }]
}

// ---------------------------------------------------------------------------
// Dynamic SEO metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const result = await fetchProvider(id)

  if (result.status !== 'found') {
    return { title: 'Physiotherapist Not Found | BookPhysio.in' }
  }

  const provider = result.provider
  const rawName = provider.full_name.trim().replace(/^dr\.?\s*/i, '')
  const name = `Dr. ${rawName}, PT`
  const specialty = provider.specialties[0]?.name ?? 'Physiotherapist'
  const city = provider.city ?? 'India'
  const title = `${name} — ${specialty} in ${city} | BookPhysio.in`
  const description = provider.bio
    ? provider.bio.slice(0, 155).replace(/\s+\S*$/, '…')
    : `Book an appointment with ${name}, a verified ${specialty.toLowerCase()} in ${city}. View ratings, clinic photos, and real‑time availability on BookPhysio.in.`
  const url = `https://bookphysio.in/doctor/${id}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'BookPhysio.in',
      locale: 'en_IN',
      type: 'profile',
      ...(provider.avatar_url ? { images: [{ url: provider.avatar_url, width: 400, height: 400, alt: name }] } : {}),
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}

// ---------------------------------------------------------------------------
// ISR — Revalidate doctor profiles every 5 minutes for fresh data
// ---------------------------------------------------------------------------
export const revalidate = 300

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

type FetchProviderResult =
  | { status: 'missing' }
  | { status: 'unavailable' }
  | { status: 'found'; provider: ProviderProfile }

async function fetchProvider(id: string): Promise<FetchProviderResult> {
  if (id === 'placeholder') {
    return { status: 'missing' }
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  try {
    const res = await fetch(`${baseUrl}/api/providers/${id}`, {
      next: { revalidate: 300 },
    })
    if (res.status === 404) {
      return { status: 'missing' }
    }

    if (!res.ok) {
      return { status: 'unavailable' }
    }

    return {
      status: 'found',
      provider: await res.json() as ProviderProfile,
    }
  } catch {
    return { status: 'unavailable' }
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

const cardClass = 'bg-white rounded-[var(--sq-lg)] border border-slate-200 p-6 lg:p-8 mb-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-all duration-200 hover:shadow-[0_4px_12px_rgba(15,23,42,0.06)] relative'

// ---------------------------------------------------------------------------
// Review highlights — "Why patients love Dr. X"
// ---------------------------------------------------------------------------

interface ReviewHighlight {
  emoji: string
  label: string
  detail: string
}

interface SentimentCategory {
  emoji: string
  label: string
  keywords: string[]
  detail: string
}

const SENTIMENT_CATEGORIES: SentimentCategory[] = [
  {
    emoji: '🤝', label: 'Caring & Attentive',
    keywords: ['caring', 'attentive', 'patient', 'listened', 'understanding', 'empathetic', 'kind', 'gentle', 'compassionate'],
    detail: 'Patients praise the personal attention',
  },
  {
    emoji: '✅', label: 'Effective Treatment',
    keywords: ['effective', 'helped', 'improved', 'better', 'relief', 'recovered', 'cured', 'healed', 'pain free', 'pain-free', 'results'],
    detail: 'Patients report positive treatment outcomes',
  },
  {
    emoji: '📋', label: 'Clear Communication',
    keywords: ['explained', 'clear', 'thorough', 'detailed', 'informative', 'transparent', 'plan', 'answered'],
    detail: 'Takes time to explain the treatment plan',
  },
  {
    emoji: '⏰', label: 'Punctual & Professional',
    keywords: ['on time', 'punctual', 'professional', 'organized', 'prompt', 'efficient', 'well-organized'],
    detail: 'Patients appreciate the punctuality',
  },
  {
    emoji: '🏡', label: 'Great Home Visits',
    keywords: ['home visit', 'came home', 'visited home', 'home session', 'at home', 'doorstep'],
    detail: 'Praised for convenient home visit service',
  },
  {
    emoji: '💪', label: 'Expert Techniques',
    keywords: ['technique', 'skilled', 'expert', 'knowledgeable', 'experienced', 'specialized', 'exercise', 'stretching'],
    detail: 'Patients value the clinical expertise',
  },
]

function computeAverageRating(ratedReviews: ProviderReview[]): number {
  if (ratedReviews.length === 0) return 0
  return ratedReviews.reduce((sum, r) => sum + r.rating, 0) / ratedReviews.length
}

function extractNormalizedComments(reviews: ProviderReview[]): string[] {
  return reviews
    .map((r) => (r.comment ?? '').toLowerCase())
    .filter((c) => c.length > 10)
}

const MIN_COMMENTS_FOR_HIGHER_THRESHOLD = 3
const LOW_THRESHOLD = 1
const DEFAULT_THRESHOLD = 2

function matchSentimentCategories(comments: string[], categories: SentimentCategory[]): Map<SentimentCategory, number> {
  const matches = new Map<SentimentCategory, number>()
  const threshold = comments.length <= MIN_COMMENTS_FOR_HIGHER_THRESHOLD ? LOW_THRESHOLD : DEFAULT_THRESHOLD

  for (const category of categories) {
    const matchCount = comments.filter((c) =>
      category.keywords.some((kw) => c.includes(kw)),
    ).length
    if (matchCount >= threshold) {
      matches.set(category, matchCount)
    }
  }
  return matches
}

function deriveReviewHighlights(reviews: ProviderReview[], provider: ProviderProfile): ReviewHighlight[] {
  if (reviews.length < 2) return []

  const highlights: ReviewHighlight[] = []
  const ratedReviews = reviews.filter((r) => r.rating > 0)
  const comments = extractNormalizedComments(reviews)

  // High average rating
  if (ratedReviews.length >= 2) {
    const avg = computeAverageRating(ratedReviews)
    if (avg >= 4.5) {
      highlights.push({ emoji: '⭐', label: 'Highly Rated', detail: `${avg.toFixed(1)} avg from ${ratedReviews.length} reviews` })
    } else if (avg >= 4.0) {
      highlights.push({ emoji: '👍', label: 'Well Reviewed', detail: `${avg.toFixed(1)} avg from ${ratedReviews.length} reviews` })
    }
  }

  // Experience
  if (provider.experience_years && provider.experience_years >= 5) {
    highlights.push({ emoji: '🏥', label: 'Experienced', detail: `${provider.experience_years}+ years of practice` })
  }

  // Sentiment-based highlights
  const sentimentMatches = matchSentimentCategories(comments, SENTIMENT_CATEGORIES)
  for (const [category] of sentimentMatches) {
    if (highlights.length >= 6) break
    highlights.push({ emoji: category.emoji, label: category.label, detail: category.detail })
  }

  // Fallbacks
  if (provider.specialties.length >= 2 && highlights.length < 4) {
    highlights.push({ emoji: '🎯', label: 'Multi-Specialist', detail: `${provider.specialties.length} areas of expertise` })
  }
  if (ratedReviews.length >= 3 && ratedReviews.every((r) => r.rating >= 4) && highlights.length < 6) {
    highlights.push({ emoji: '🔄', label: 'Consistently Excellent', detail: 'All patients rate 4+ stars' })
  }
  const commentedReviews = reviews.filter((r) => r.comment && r.comment.length > 30)
  if (commentedReviews.length >= 3 && highlights.length < 6) {
    highlights.push({ emoji: '💬', label: 'Detailed Feedback', detail: `${commentedReviews.length} patients wrote detailed reviews` })
  }

  return highlights.slice(0, 6)
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

interface DoctorPageProps { params: Promise<{ id: string }> }

export default async function DoctorPage({ params }: DoctorPageProps) {
  const { id } = await params
  const providerResult = await fetchProvider(id)

  if (providerResult.status === 'unavailable') {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center gap-5 px-6">
        <div className="w-14 h-14 bg-[#FFF4E8] rounded-full flex items-center justify-center text-[#FF6B35]">
          <Activity size={28} />
        </div>
        <div className="text-center">
          <h1 className="text-[22px] font-bold text-[#1A1C29] mb-1.5">Expert profile unavailable</h1>
          <p className="text-[14px] text-slate-600 max-w-sm leading-relaxed">
            We couldn&apos;t load this expert right now. Please try again shortly or return to search.
          </p>
        </div>
        <Link
          href="/search"
          className="rounded-full bg-[#00766C] px-6 py-3 text-[14px] font-semibold text-white hover:bg-[#005A52] transition-colors shadow-[0_4px_12px_rgba(0,118,108,0.18)]"
        >
          Back to search
        </Link>
      </div>
    )
  }

  if (providerResult.status === 'missing') {
    notFound()
  }

  const provider = providerResult.provider

  const baseName = provider.full_name.trim().replace(/^dr\.?\s*/i, '')
  const nameWithTitle = `Dr. ${baseName}, PT`

  const initials = baseName
    .split(' ')
    .slice(0, 2)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()

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

  // Derive structured review highlights (only show when enough data exists)
  const reviewHighlights = deriveReviewHighlights(reviews, provider)

  const isStateVerified = provider.iap_registration_no?.startsWith('STATE_')
  const stateName = isStateVerified ? provider.iap_registration_no?.split('_')[1] : null
  const hasRegistration = !!provider.iap_registration_no
  const verificationSource = isStateVerified ? `${stateName} Council` : 'IAP'

  // JSON-LD structured data ---------------------------------------------------
  const specialtyName = provider.specialties[0]?.name ?? 'Physiotherapist'
  const profileUrl = `https://bookphysio.in/doctor/${id}`

  const localBusinessLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    name: nameWithTitle,
    description: provider.bio ?? `${nameWithTitle} — ${specialtyName} in ${provider.city ?? 'India'}`,
    url: profileUrl,
    ...(provider.avatar_url ? { image: provider.avatar_url } : {}),
    ...(provider.city ? { address: { '@type': 'PostalAddress', addressLocality: provider.city, addressCountry: 'IN' } } : {}),
    priceRange: `₹${baseFee}`,
    ...(provider.rating_count > 0 ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: provider.rating_avg, reviewCount: provider.rating_count, bestRating: 5 } } : {}),
    medicalSpecialty: specialtyName,
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bookphysio.in/' },
      { '@type': 'ListItem', position: 2, name: 'Search', item: 'https://bookphysio.in/search' },
      { '@type': 'ListItem', position: 3, name: nameWithTitle, item: profileUrl },
    ],
  }

  return (
    <div className="bg-bp-surface min-h-screen selection:bg-bp-primary/10 selection:text-bp-primary font-sans">
      {/* Structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

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
                <div className="h-40 md:h-56 bg-bp-primary relative rounded-[var(--sq-lg)] shadow-2xl shadow-bp-primary/5 overflow-hidden">
                   <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
                   <div className="absolute -right-20 -top-20 w-80 h-80 bg-bp-accent/20 rounded-full blur-3xl animate-pulse"></div>
                   <div className="absolute left-10 bottom-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
                   
                   {/* Verification Ribbon */}
                   {provider.verified && (
                     <div className="absolute top-6 left-6 bg-white/10 backdrop-blur-xl border border-white/20 text-white px-4 py-2 rounded-[var(--sq-lg)] flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase shadow-lg">
                        <Sparkles size={14} className="text-bp-accent animate-bounce" />
                        Verified Provider Profile
                     </div>
                   )}
                </div>

                <div className="px-4 md:px-10 -mt-20 md:-mt-24 relative z-10">
                  <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-end">
                    {/* Avatar with Ring */}
                    <div className="relative group">
                      <div className="absolute inset-0 bg-bp-accent rounded-[var(--sq-lg)] blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-700"></div>
                      {provider.avatar_url ? (
                        <div className="relative p-1.5 bg-white rounded-[var(--sq-lg)] shadow-2xl border border-bp-border/40">
                          <Image
                            src={provider.avatar_url}
                            alt={nameWithTitle}
                            width={160}
                            height={160}
                            className="w-28 h-28 md:w-40 md:h-40 rounded-[var(--sq-lg)] object-cover bg-bp-surface border-4 border-white"
                            priority
                          />
                        </div>
                      ) : (
                        <div className="relative p-1.5 bg-white rounded-[var(--sq-lg)] shadow-2xl border border-bp-border/40">
                           <div className="w-28 h-28 md:w-40 md:h-40 rounded-[var(--sq-lg)] bg-gradient-to-br from-bp-surface to-bp-border/20 text-bp-primary flex items-center justify-center text-[40px] md:text-[56px] font-bold border-4 border-white shrink-0 shadow-inner" aria-hidden="true">
                            {initials}
                           </div>
                        </div>
                      )}
                      
                      {provider.verified && (
                        <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-[var(--sq-lg)] shadow-xl border border-bp-border/30 transform hover:scale-110 transition-transform">
                          <div className="w-8 h-8 rounded-[var(--sq-sm)] bg-bp-primary flex items-center justify-center text-white">
                             <CheckCircle2 size={18} strokeWidth={3} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Info Header */}
                    <div className="flex-1 pb-2">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                          <h1 className="text-[36px] md:text-[52px] font-bold text-bp-primary tracking-tighter leading-none mb-3">
                            {nameWithTitle}
                          </h1>
                          <p className="text-bp-primary font-bold text-[16px] flex items-center gap-2">
                            <GraduationCap size={18} className="text-bp-accent" />
                            {provider.verified 
                              ? `${verificationSource} Verified physiotherapist` 
                              : hasRegistration 
                                ? `${verificationSource} registration under review` 
                                : 'Physiotherapy provider'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2.5 px-3.5 py-1.5 bg-bp-primary text-white font-bold rounded-[var(--sq-sm)] border border-bp-primary/10 text-[14px] shadow-lg shadow-bp-primary/10">
                          <Award size={16} strokeWidth={3} className="text-bp-accent" />
                          {provider.specialties[0]?.name ?? 'Physiotherapist'}
                        </div>
                        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-[var(--sq-sm)] border border-bp-border/40 shadow-sm">
                          <StarRating rating={provider.rating_avg ?? 0} size={15} />
                          <span className="text-[15px] font-bold text-bp-primary">{(provider.rating_avg ?? 0).toFixed(1)}</span>
                          <span className="text-[12px] text-bp-body/40 font-bold uppercase tracking-widest leading-none pt-0.5">({provider.rating_count ?? 0})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 px-4 md:px-10 mt-12 pb-12">
                   <div className="bg-[#FBFCFD] p-6 rounded-[var(--sq-lg)] border border-bp-border/10 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.05)] flex flex-col items-center lg:items-start group hover:border-bp-primary/40 hover:bg-white transition-all duration-500 hover:-translate-y-1">
                      <div className="w-12 h-12 bg-white rounded-[var(--sq-lg)] flex items-center justify-center text-bp-primary mb-5 shadow-sm group-hover:bg-bp-primary group-hover:text-white transition-all duration-500"><Sparkles size={22} strokeWidth={2.5} /></div>
                      <p className="text-[11px] font-bold text-bp-body/30 uppercase tracking-[0.2em] leading-none mb-2.5">Experience</p>
                      <p className="text-[22px] font-bold text-bp-primary tracking-tighter leading-none">{provider.experience_years ?? 5}+ <span className="text-[14px] text-bp-body/40 tracking-normal font-bold">Years</span></p>
                   </div>
                   <div className="bg-[#FBFCFD] p-6 rounded-[var(--sq-lg)] border border-bp-border/10 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.05)] flex flex-col items-center lg:items-start group hover:border-bp-primary/40 hover:bg-white transition-all duration-500 hover:-translate-y-1">
                      <div className="w-12 h-12 bg-white rounded-[var(--sq-lg)] flex items-center justify-center text-bp-primary mb-5 shadow-sm group-hover:bg-bp-primary group-hover:text-white transition-all duration-500"><Building2 size={22} strokeWidth={2.5} /></div>
                     <p className="text-[11px] font-bold text-bp-body/30 uppercase tracking-[0.2em] leading-none mb-2.5">Patient Reviews</p>
                     <p className="text-[22px] font-bold text-bp-primary tracking-tighter leading-none">{provider.rating_count > 0 ? provider.rating_count : 'New'} <span className="text-[14px] text-bp-body/40 tracking-normal font-bold">{provider.rating_count === 1 ? 'Review' : 'Reviews'}</span></p>
                   </div>
                   <div className="bg-[#FBFCFD] p-6 rounded-[var(--sq-lg)] border border-bp-border/10 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.05)] flex flex-col items-center lg:items-start group hover:border-bp-primary/40 hover:bg-white transition-all duration-500 hover:-translate-y-1">
                      <div className="w-12 h-12 bg-white rounded-[var(--sq-lg)] flex items-center justify-center text-bp-primary mb-5 shadow-sm group-hover:bg-bp-primary group-hover:text-white transition-all duration-500"><Star size={22} strokeWidth={2.5} /></div>
                     <p className="text-[11px] font-bold text-bp-body/30 uppercase tracking-[0.2em] leading-none mb-2.5">Verification</p>
                     <p className="text-[22px] font-bold text-bp-primary tracking-tighter leading-none whitespace-pre-wrap">{provider.verified ? verificationSource : (hasRegistration ? verificationSource : 'Profile')}<br/><span className="text-[14px] text-bp-body/40 tracking-normal font-bold">{provider.verified ? 'Verified' : 'Pending'}</span></p>
                   </div>
                   <div className="bg-[#FBFCFD] p-6 rounded-[var(--sq-lg)] border border-bp-border/10 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.05)] flex flex-col items-center lg:items-start group hover:border-bp-primary/40 hover:bg-white transition-all duration-500 hover:-translate-y-1">
                      <div className="w-12 h-12 bg-emerald-50 rounded-[var(--sq-lg)] flex items-center justify-center text-emerald-600 mb-5 shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500"><Clock size={22} strokeWidth={2.5} /></div>
                     <p className="text-[11px] font-bold text-bp-body/30 uppercase tracking-[0.2em] leading-none mb-2.5">Availability</p>
                     <p className="text-[22px] font-bold text-emerald-600 tracking-tighter leading-none">{provider.next_available_slot ? 'Slots' : 'Check'} <span className="text-[14px] opacity-60 tracking-normal font-bold">{provider.next_available_slot ? 'Open' : 'Schedule'}</span></p>
                   </div>
                </div>
              </div>

              {/* 2. Professional Bio (Premium Reading) */}
              {provider.bio && (
                <section className={cn(cardClass, "border-bp-border/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.03)] overflow-hidden relative")}>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-bp-surface/50 rounded-bl-[120px] -z-0 pointer-events-none"></div>
                  <div className="absolute top-12 left-0 w-1 h-12 bg-bp-accent rounded-r-full"></div>
                  
                  <h2 className="text-[28px] font-bold text-bp-primary mb-8 flex items-center gap-4 relative z-10 tracking-tight">
                    Professional Biography
                  </h2>
                  <div className="prose prose-teal max-w-none relative z-10">
                     <p className="text-[18px] text-bp-body leading-[1.8] font-medium whitespace-pre-wrap max-w-[95%] first-letter:text-5xl first-letter:font-bold first-letter:text-bp-primary first-letter:mr-3 first-letter:float-left">
                        {provider.bio}
                     </p>
                  </div>
                </section>
              )}

              {/* 2.5 Clinic Gallery */}
              <ClinicGallery images={provider.gallery_images ?? []} />


              {/* 3. Specializations & Clinical Focus */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {provider.specialties.length > 0 && (
                  <section className={cn(cardClass, "mb-0 border-bp-border/10 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.02)]")}>
                    <h2 className="text-[20px] font-bold text-bp-primary mb-8 flex items-center gap-4 tracking-tight">
                       <div className="w-10 h-10 bg-bp-surface rounded-[var(--sq-sm)] flex items-center justify-center text-bp-accent">
                          <Activity size={20} strokeWidth={2.5} />
                       </div>
                       Clinical Expertise
                    </h2>
                    <div className="flex flex-wrap gap-2.5">
                      {provider.specialties.map((spec) => (
                        <span key={spec.id} className="bg-white text-bp-primary text-[14px] font-bold px-5 py-3 rounded-[var(--sq-sm)] border border-bp-border/40 shadow-sm hover:border-bp-primary hover:shadow-md transition-all duration-300 cursor-default">
                          {spec.name}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                <section className={cn(cardClass, "mb-0 border-bp-border/10 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.02)]")}>
                  <h2 className="text-[20px] font-bold text-bp-primary mb-8 flex items-center gap-4 tracking-tight">
                     <div className="w-10 h-10 bg-bp-surface rounded-[var(--sq-sm)] flex items-center justify-center text-bp-accent">
                        <GraduationCap size={20} strokeWidth={2.5} />
                     </div>
                     Professional Credentials
                  </h2>
                  <div className="space-y-6">
                    {hasRegistration && (
                      <div className="flex items-center gap-5 p-5 rounded-[var(--sq-sm)] bg-[#FBFCFD] border border-bp-border/30 group hover:border-bp-accent/40 transition-colors duration-500">
                        <div className="bg-white p-3.5 rounded-[var(--sq-lg)] border border-bp-border shadow-sm group-hover:scale-110 transition-transform duration-500">
                          <CheckCircle2 size={24} className="text-emerald-600" strokeWidth={3} />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-bp-body/30 uppercase tracking-[0.2em] mb-1.5 leading-none">{verificationSource} Registration</p>
                          <p className="text-[16px] font-bold text-emerald-600 tracking-tight flex items-center gap-1.5">Validated on Record</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-4">
                      <div className="mt-1 bg-bp-accent/10 p-2 rounded-[var(--sq-sm)] text-bp-accent">
                        <Award size={20} strokeWidth={3} />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-bp-body/40 uppercase tracking-widest mb-1">Listed Qualification</p>
                        <p className="text-[16px] font-bold text-bp-primary">
                          {provider.qualification ? `${provider.qualification} — ${provider.title ?? 'PT'}` : (provider.title ?? 'Physiotherapist')}
                        </p>
                        <p className="text-[14px] font-medium text-bp-body/40 mt-1 italic">Additional academic details may be shared by the provider during consultation.</p>
                      </div>
                    </div>

                    {provider.certifications && provider.certifications.length > 0 && (
                      <div className="flex items-start gap-4">
                        <div className="mt-1 bg-bp-accent/10 p-2 rounded-xl text-bp-accent">
                          <CheckCircle2 size={20} strokeWidth={3} />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-bp-body/40 uppercase tracking-widest mb-2">Certifications</p>
                          <div className="flex flex-wrap gap-2">
                            {provider.certifications.map((cert, index) => (
                              <span key={`${cert}-${index}`} className="rounded-full border border-bp-border bg-bp-surface px-3 py-1 text-[12px] font-bold text-bp-primary">
                                {cert}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {provider.equipment_tags && provider.equipment_tags.length > 0 && (
                      <div className="flex items-start gap-4">
                        <div className="mt-1 bg-bp-accent/10 p-2 rounded-xl text-bp-accent">
                          <Activity size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-bp-body/40 uppercase tracking-widest mb-2">Equipment & Modalities</p>
                          <div className="flex flex-wrap gap-2">
                            {provider.equipment_tags.map((tag, index) => (
                              <span key={`${tag}-${index}`} className="rounded-full border border-bp-border bg-white px-3 py-1 text-[12px] font-bold text-bp-body">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* Why Patients Love Section */}
              {reviewHighlights.length > 0 && (
                <section className={cn(cardClass, 'border-bp-accent/20 bg-gradient-to-br from-[#E6F4F3]/60 to-white')} aria-labelledby="why-patients-love">
                  <h2 id="why-patients-love" className="text-[22px] font-bold text-bp-primary tracking-tight mb-6 px-2 lg:px-4">
                    Why patients love {nameWithTitle}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-2 lg:px-4">
                    {reviewHighlights.map((h) => (
                      <div key={h.label} className="flex items-start gap-4 p-5 bg-white rounded-[var(--sq-lg)] border border-bp-border/30 shadow-sm">
                        <span className="text-[24px] leading-none mt-0.5">{h.emoji}</span>
                        <div>
                          <p className="text-[15px] font-bold text-bp-primary tracking-tight">{h.label}</p>
                          <p className="text-[13px] text-bp-body/50 font-medium mt-0.5">{h.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 4. Patient Feedback (Luxury List) */}
              <section className={cn(cardClass, "border-bp-border/10 bg-[#FBFCFD] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.03)]")} aria-labelledby="reviews-heading">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 relative z-10 px-2 lg:px-4">
                  <div className="max-w-md">
                    <h2 id="reviews-heading" className="text-[28px] font-bold text-bp-primary mb-2 tracking-tight">
                      Patient Transformations
                    </h2>
                    <p className="text-[15px] text-bp-body/50 font-bold leading-relaxed">
                       Verified outcomes and recovery stories from patients under professional care.
                    </p>
                  </div>
                  <div className="flex items-center gap-8 p-6 bg-white rounded-[var(--sq-lg)] border border-bp-border/30 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-bp-primary/[0.03] rounded-bl-[60px] -z-0"></div>
                    <div className="text-right relative z-10">
                       <div className="text-[44px] font-bold text-bp-primary leading-none tracking-tighter">{(provider.rating_avg ?? 0).toFixed(1)}</div>
                       <div className="text-[11px] font-bold text-bp-body/30 uppercase tracking-[0.2em] mt-2 pr-1">Out of 5.0</div>
                    </div>
                    <div className="w-px h-12 bg-bp-border/60" />
                    <div className="flex flex-col gap-1.5 relative z-10">
                      <StarRating rating={provider.rating_avg ?? 0} size={18} />
                      <span className="text-[11px] font-bold text-bp-primary/70 uppercase tracking-widest">{provider.rating_count ?? 0} Clinical Reviews</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8 px-2 lg:px-4">
                  {reviews.length > 0 ? (
                    reviews.filter((r) => r.comment).slice(0, 5).map((review) => (
                      <article key={review.id} className="group p-8 lg:p-10 rounded-[var(--sq-lg)] bg-white border border-bp-border/20 hover:border-bp-primary/30 hover:shadow-[0_12px_48px_-8px_rgba(0,118,108,0.05)] transition-all duration-700 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-8 relative z-10">
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-[var(--sq-lg)] bg-bp-surface border border-bp-border/40 flex items-center justify-center text-bp-primary text-xl font-bold shadow-inner shadow-black/[0.02]">
                               {review.comment?.charAt(0).toUpperCase() || 'P'}
                            </div>
                            <div>
                               <p className="text-[16px] font-bold text-bp-primary tracking-tight mb-1">Verified Patient</p>
                               <div className="flex items-center gap-3">
                                  <StarRating rating={review.rating} size={14} />
                                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-100/50">Clinical Feedback</span>
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
                    <div className="py-24 text-center bg-white rounded-[var(--sq-lg)] border-2 border-dashed border-bp-border/40">
                       <div className="w-20 h-20 bg-bp-surface rounded-[var(--sq-xl)] flex items-center justify-center mx-auto mb-6 shadow-sm border border-bp-border/20"><Mail className="text-bp-border" size={32} /></div>
                       <h3 className="text-[18px] font-bold text-bp-primary/70 mb-2 tracking-tight">Clinical Outcomes Pending</h3>
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
