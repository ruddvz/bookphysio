'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap-client'
import {
  Search,
  UserCheck,
  CalendarDays,
  Building2,
  CalendarRange,
  WalletCards,
  ArrowRight,
  Activity,
  ShieldCheck,
  Clock,
  Home,
} from 'lucide-react'

// Character paths — swap these for new poses when illustrations are ready
const PATIENT_CHARACTER = '/images/physio-female.png'
const PROVIDER_CHARACTER = '/images/physio-male.png'

const PATIENT_STEPS = [
  {
    num: '01',
    icon: Search,
    title: 'Search',
    text: 'Enter your condition or a physiotherapist name and select your location.',
    tint: 'bg-[#E6F4F3] text-[#00766C]',
  },
  {
    num: '02',
    icon: UserCheck,
    title: 'Choose Provider',
    text: 'Compare expert physiotherapists by specialty, rating, fees, and distance.',
    tint: 'bg-[#EDEAF8] text-[#5B4BC4]',
  },
  {
    num: '03',
    icon: CalendarDays,
    title: 'Pick a Slot',
    text: 'Select your preferred date and time from the live availability of the provider.',
    tint: 'bg-[#FEE9DD] text-[#C4532A]',
  },
  {
    num: '04',
    icon: Activity,
    title: 'Book Instantly',
    text: 'Confirm your booking with a quick session request and get expert care.',
    tint: 'bg-[#FFE4EC] text-[#B53A63]',
  },
]

const PROVIDER_STEPS = [
  {
    num: '01',
    icon: Building2,
    title: 'Register Practice',
    text: 'Create your professional profile with your credentials and clinic details.',
    tint: 'bg-[#E6F4F3] text-[#00766C]',
  },
  {
    num: '02',
    icon: CalendarRange,
    title: 'Set Availability',
    text: 'Configure your working hours, slot duration, and visit types.',
    tint: 'bg-[#EDEAF8] text-[#5B4BC4]',
  },
  {
    num: '03',
    icon: CalendarDays,
    title: 'Accept Bookings',
    text: 'Manage all your incoming appointments from a single dashboard.',
    tint: 'bg-[#FEE9DD] text-[#C4532A]',
  },
  {
    num: '04',
    icon: WalletCards,
    title: 'Track Earnings',
    text: 'Monitor your weekly and monthly revenue automatically.',
    tint: 'bg-[#FFE4EC] text-[#B53A63]',
  },
]

const PATIENT_TRUST = [
  { icon: ShieldCheck, text: 'IAP-verified physiotherapists only' },
  { icon: Clock,       text: 'Instant booking confirmation via OTP' },
  { icon: Home,        text: 'In-clinic and home visit options' },
]

const PROVIDER_TRUST = [
  { icon: ShieldCheck, text: 'Credential-verified listing' },
  { icon: Clock,       text: 'Real-time calendar management' },
  { icon: Home,        text: 'Manage clinic + home visit bookings' },
]

export default function HowItWorksPage() {
  const [activeTab, setActiveTab] = useState<'patient' | 'provider'>('patient')
  const activeSteps = activeTab === 'patient' ? PATIENT_STEPS : PROVIDER_STEPS
  const primaryCtaHref = activeTab === 'patient' ? '/search' : '/doctor-signup'
  const primaryCtaLabel = activeTab === 'patient' ? 'Start searching' : 'Join as a provider'
  const trust = activeTab === 'patient' ? PATIENT_TRUST : PROVIDER_TRUST
  const character = activeTab === 'patient' ? PATIENT_CHARACTER : PROVIDER_CHARACTER

  const heroScope = useRef<HTMLElement>(null)
  const stepsScope = useRef<HTMLElement>(null)
  const ctaScope = useRef<HTMLElement>(null)

  // Hero entrance — runs once on mount
  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.from('[data-hiw-hero]', {
      y: 20, opacity: 0, duration: 0.6, ease: 'power2.out', stagger: 0.1,
    })
  }, { scope: heroScope })

  // Step cards — re-animate whenever activeTab changes
  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.from('[data-hiw-step]', {
      y: 24, opacity: 0, duration: 0.5, ease: 'power2.out', stagger: 0.08,
      scrollTrigger: { trigger: stepsScope.current, start: 'top 82%', once: true },
    })
  }, { scope: stepsScope, dependencies: [activeTab, ScrollTrigger] })

  // CTA reveal
  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.from('[data-hiw-cta]', {
      y: 20, opacity: 0, duration: 0.6, ease: 'power2.out',
      scrollTrigger: { trigger: ctaScope.current, start: 'top 85%', once: true },
    })
  }, { scope: ctaScope, dependencies: [ScrollTrigger] })

  return (
    <>
      <Navbar locale="en" localeSwitchPath="/how-it-works" />

      <main className="bg-[#FAFAFA] min-h-screen">

        {/* Hero — split layout with physio character */}
        <section ref={heroScope} className="bg-white border-b border-slate-200/70 overflow-hidden">
          <div className="max-w-[1142px] mx-auto px-6 py-12 lg:py-16">
            <div className="grid lg:grid-cols-[1fr_300px] gap-10 items-center">

              {/* Left: kicker + heading + trust points + tabs */}
              <div>
                <div data-hiw-hero className="inline-flex items-center gap-2 px-3 py-1 bg-[#E6F4F3] text-[#00766C] rounded-full text-[11px] font-semibold uppercase tracking-[0.18em] mb-5">
                  How it works
                </div>
                <h1 data-hiw-hero className="text-[30px] lg:text-[40px] font-bold tracking-tight text-[#1A1C29] leading-tight mb-4">
                  How to book a physiotherapist{' '}
                  <span className="text-[#00766C]">online in India</span>
                </h1>
                <p data-hiw-hero className="text-[15px] lg:text-[17px] leading-relaxed max-w-[560px] text-slate-600 mb-8">
                  Book a physio session in 4 clear steps with no calls, no waiting, and no guesswork about who to trust.
                </p>

                {/* Trust points */}
                <div className="flex flex-col gap-2.5 mb-8">
                  {trust.map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-[var(--sq-xs)] bg-[#E6F4F3] border border-[#00766C]/20 flex items-center justify-center shrink-0">
                        <Icon size={12} className="text-[#00766C]" />
                      </div>
                      <span className="text-[14px] text-slate-600">{text}</span>
                    </div>
                  ))}
                </div>

                {/* Tabs */}
                <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 p-1 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setActiveTab('patient')}
                    className={`py-2 px-5 rounded-full text-[13px] font-semibold transition-colors ${
                      activeTab === 'patient'
                        ? 'bg-white text-[#00766C] shadow-sm'
                        : 'text-slate-500 hover:text-[#1A1C29]'
                    }`}
                  >
                    For Patients
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('provider')}
                    className={`py-2 px-5 rounded-full text-[13px] font-semibold transition-colors ${
                      activeTab === 'provider'
                        ? 'bg-white text-[#00766C] shadow-sm'
                        : 'text-slate-500 hover:text-[#1A1C29]'
                    }`}
                  >
                    For Providers
                  </button>
                </div>
              </div>

              {/* Right: physio character — decorative, context communicated by tab labels */}
              <div className="hidden lg:flex justify-center items-end">
                <div className="relative">
                  <div className="w-[220px] h-[220px] rounded-[60px] bg-[#E6F4F3]" aria-hidden="true" />
                  <Image
                    src={character}
                    alt=""
                    aria-hidden="true"
                    width={200}
                    height={300}
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 object-contain object-bottom"
                    sizes="(min-width: 1024px) 200px, 0px"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Steps — 2×2 grid with teal left-accent on hover */}
        <section ref={stepsScope} className="py-12 lg:py-16">
          <div className="max-w-[1142px] mx-auto px-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {activeSteps.map((step) => (
                <div
                  key={step.title}
                  data-hiw-step
                  className="relative rounded-[var(--sq-lg)] border border-slate-200 bg-white p-6 lg:p-8 shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-all duration-200 hover:shadow-[0_4px_12px_rgba(15,23,42,0.07)] hover:border-[#00766C]/30 group"
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${step.tint}`}>
                      <step.icon className="w-5 h-5" strokeWidth={2.2} />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 group-hover:text-[#00766C]/50 transition-colors">
                      Step {step.num}
                    </span>
                  </div>
                  <h3 className="text-[18px] font-bold text-[#1A1C29] mb-2 group-hover:text-[#00766C] transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-[14px] leading-relaxed text-slate-500">{step.text}</p>

                  {/* Teal left accent on hover */}
                  <div className="absolute left-0 top-6 bottom-6 w-[3px] rounded-full bg-[#00766C] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA — dark */}
        <section ref={ctaScope} className="pb-12 lg:pb-16">
          <div className="max-w-[1142px] mx-auto px-6">
            <div data-hiw-cta className="rounded-[var(--sq-xl)] bg-[#1A1C29] p-8 lg:p-12 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
              {/* Background glow */}
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#00766C]/10 rounded-full blur-[80px] pointer-events-none" aria-hidden="true" />

              {/* Character — desktop only */}
              <div className="hidden lg:block shrink-0 relative z-10 select-none">
                <Image
                  src={PROVIDER_CHARACTER}
                  alt=""
                  aria-hidden="true"
                  width={140}
                  height={210}
                  className="object-contain object-bottom drop-shadow-2xl"
                  sizes="(min-width: 1024px) 140px, 0px"
                />
              </div>

              <div className="flex-1 text-center md:text-left relative z-10">
                <h2 className="text-[24px] lg:text-[28px] font-bold text-white tracking-tight leading-tight">
                  {activeTab === 'patient'
                    ? 'Get back to feeling your best.'
                    : "Grow your practice with India's best physio network."}
                </h2>
                <p className="mt-3 text-[15px] text-slate-400 leading-relaxed">
                  {activeTab === 'patient'
                    ? 'Verified experts for in-clinic and home visit consultations across 18 major Indian cities.'
                    : 'Join hundreds of verified physiotherapists building their digital presence with BookPhysio.'}
                </p>
              </div>

              <Link
                href={primaryCtaHref}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#00766C] px-7 py-3.5 text-[15px] font-semibold text-white hover:bg-[#005A52] transition-colors shadow-[0_4px_16px_rgba(0,118,108,0.25)] w-full md:w-auto shrink-0 relative z-10"
              >
                {primaryCtaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer locale="en" localeSwitchPath="/how-it-works" />
    </>
  )
}
