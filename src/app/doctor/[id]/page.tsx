import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BookingCard from './BookingCard'
import ClinicGallery from './ClinicGallery'
import MobileBookingBar from './MobileBookingBar'
import ProfileHero from './ProfileHero'
import BioSection from './BioSection'
import CredentialsSection from './CredentialsSection'
import ReviewsSection from './ReviewsSection'
import { Activity } from 'lucide-react'
import type { ProviderProfile } from '@/app/api/contracts/provider'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getVisitTypeConsultationFee, isVisitType, type VisitType } from '@/lib/booking/policy'

export async function generateStaticParams(): Promise<{ id: string }[]> {
  return [{ id: 'placeholder' }]
}

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
      cache: 'no-store',
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

  const isStateVerified = provider.iap_registration_no?.startsWith('STATE_')
  const stateName = isStateVerified ? provider.iap_registration_no?.split('_')[1] : null
  const hasRegistration = !!provider.iap_registration_no
  const verificationSource = isStateVerified ? `${stateName} Council` : 'IAP'

  return (
    <div className="bg-bp-surface min-h-screen selection:bg-bp-primary/10 selection:text-bp-primary font-sans">
      <Navbar />

      <ProfileHero
        provider={provider}
        nameWithTitle={nameWithTitle}
        initials={initials}
        verificationSource={verificationSource}
        hasRegistration={hasRegistration}
      />

      <main className="pb-32 md:pb-24">
        <div className="max-w-[1142px] mx-auto px-6">
          <div className="grid grid-cols-1 xl:grid-cols-[64%_36%] gap-8 items-start">

            {/* LEFT COLUMN */}
            <div className="min-w-0">
              {/* Professional Bio */}
              {provider.bio && <BioSection bio={provider.bio} />}

              {/* Clinic Gallery */}
              <ClinicGallery images={provider.gallery_images ?? []} />

              {/* Specializations & Credentials */}
              <CredentialsSection
                provider={provider}
                verificationSource={verificationSource}
                hasRegistration={hasRegistration}
              />

              {/* Patient Reviews */}
              <ReviewsSection provider={provider} nameWithTitle={nameWithTitle} />
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
