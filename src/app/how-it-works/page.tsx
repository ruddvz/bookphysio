'use client'

import { useRef, useState, type KeyboardEvent } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import {
  Search,
  UserCheck,
  CalendarDays,
  Building2,
  CalendarRange,
  WalletCards,
  ArrowRight,
  Activity,
} from 'lucide-react'

type AudienceTab = 'patient' | 'provider'

type StepDefinition = {
  step: string
  icon: typeof Search
  title: string
  text: string
  tint: string
}

const TAB_ORDER: AudienceTab[] = ['patient', 'provider']

const PATIENT_STEPS: StepDefinition[] = [
  {
    step: '01',
    icon: Search,
    title: 'Search',
    text: 'Enter your condition or a physiotherapist name and select your location.',
    tint: 'bg-[#E6F4F3] text-[#00766C]',
  },
  {
    step: '02',
    icon: UserCheck,
    title: 'Choose Provider',
    text: 'Compare expert physiotherapists by specialty, rating, fees, and distance.',
    tint: 'bg-[#EDEAF8] text-[#5B4BC4]',
  },
  {
    step: '03',
    icon: CalendarDays,
    title: 'Pick a Slot',
    text: 'Select your preferred date and time from the live availability of the provider.',
    tint: 'bg-[#FEE9DD] text-[#C4532A]',
  },
  {
    step: '04',
    icon: Activity,
    title: 'Book Instantly',
    text: 'Confirm your booking with a quick session request and get expert care.',
    tint: 'bg-[#FFE4EC] text-[#B53A63]',
  },
]

const PROVIDER_STEPS: StepDefinition[] = [
  {
    step: '01',
    icon: Building2,
    title: 'Register Practice',
    text: 'Create your professional profile with your credentials and clinic details.',
    tint: 'bg-[#E6F4F3] text-[#00766C]',
  },
  {
    step: '02',
    icon: CalendarRange,
    title: 'Set Availability',
    text: 'Configure your working hours, slot duration, and visit types.',
    tint: 'bg-[#EDEAF8] text-[#5B4BC4]',
  },
  {
    step: '03',
    icon: CalendarDays,
    title: 'Accept Bookings',
    text: 'Manage all your incoming appointments from a single dashboard.',
    tint: 'bg-[#FEE9DD] text-[#C4532A]',
  },
  {
    step: '04',
    icon: WalletCards,
    title: 'Track Earnings',
    text: 'Monitor your weekly and monthly revenue automatically.',
    tint: 'bg-[#FFE4EC] text-[#B53A63]',
  },
]

const TAB_CONTENT = {
  patient: {
    heroTitle: 'How to book a physiotherapist online in India',
    heroDescription: 'Book a physio session in 4 clear steps with no calls, no waiting, and no guesswork about who to trust.',
    primaryCtaHref: '/search',
    primaryCtaLabel: 'Start searching',
    ctaTitle: 'Get back to feeling your best.',
    ctaDescription: 'Verified experts for in-clinic and home visit consultations across 18 major Indian cities.',
    steps: PATIENT_STEPS,
  },
  provider: {
    heroTitle: 'How to join BookPhysio as a verified provider',
    heroDescription: 'Set up your practice profile, publish real availability, and start accepting patient bookings in one guided flow.',
    primaryCtaHref: '/doctor-signup',
    primaryCtaLabel: 'Join as a provider',
    ctaTitle: "Grow your practice with India's best physio network.",
    ctaDescription: 'Join hundreds of verified physiotherapists building their digital presence with BookPhysio.',
    steps: PROVIDER_STEPS,
  },
} satisfies Record<
  AudienceTab,
  {
    heroTitle: string
    heroDescription: string
    primaryCtaHref: string
    primaryCtaLabel: string
    ctaTitle: string
    ctaDescription: string
    steps: StepDefinition[]
  }
>

export default function HowItWorksPage() {
  const [activeTab, setActiveTab] = useState<AudienceTab>('patient')
  const tabRefs = useRef<Record<AudienceTab, HTMLButtonElement | null>>({
    patient: null,
    provider: null,
  })

  const focusTab = (tab: AudienceTab) => {
    setActiveTab(tab)
    tabRefs.current[tab]?.focus()
  }

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, tab: AudienceTab) => {
    const currentIndex = TAB_ORDER.indexOf(tab)

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      focusTab(TAB_ORDER[(currentIndex + 1) % TAB_ORDER.length])
      return
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      focusTab(TAB_ORDER[(currentIndex - 1 + TAB_ORDER.length) % TAB_ORDER.length])
      return
    }

    if (event.key === 'Home') {
      event.preventDefault()
      focusTab(TAB_ORDER[0])
      return
    }

    if (event.key === 'End') {
      event.preventDefault()
      focusTab(TAB_ORDER[TAB_ORDER.length - 1])
    }
  }

  return (
    <>
      <Navbar locale="en" localeSwitchPath="/how-it-works" />

      <main className="min-h-screen bg-[#FAFAFA]">
        <section className="border-b border-slate-200/70 bg-white">
          <div className="mx-auto max-w-[1142px] px-6 py-12 text-center lg:py-16">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#E6F4F3] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#00766C]">
              How it works
            </div>
            <h1 className="text-[30px] font-bold leading-tight tracking-tight text-[#1A1C29] lg:text-[40px]">
              {TAB_CONTENT[activeTab].heroTitle}
            </h1>
            <p className="mx-auto mt-4 max-w-[680px] text-[15px] leading-relaxed text-slate-600 lg:text-[17px]">
              {TAB_CONTENT[activeTab].heroDescription}
            </p>

            <div
              className="mt-8 inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 p-1"
              role="tablist"
              aria-label="How it works audience"
            >
              <button
                id="tab-patient"
                ref={(node) => {
                  tabRefs.current.patient = node
                }}
                type="button"
                role="tab"
                aria-selected={activeTab === 'patient'}
                aria-controls="panel-patient"
                onClick={() => setActiveTab('patient')}
                onKeyDown={(event) => handleTabKeyDown(event, 'patient')}
                className={`rounded-full px-5 py-2 text-[13px] font-semibold transition-colors ${
                  activeTab === 'patient'
                    ? 'bg-white text-[#00766C] shadow-sm'
                    : 'text-slate-500 hover:text-[#1A1C29]'
                }`}
              >
                For Patients
              </button>
              <button
                id="tab-provider"
                ref={(node) => {
                  tabRefs.current.provider = node
                }}
                type="button"
                role="tab"
                aria-selected={activeTab === 'provider'}
                aria-controls="panel-provider"
                onClick={() => setActiveTab('provider')}
                onKeyDown={(event) => handleTabKeyDown(event, 'provider')}
                className={`rounded-full px-5 py-2 text-[13px] font-semibold transition-colors ${
                  activeTab === 'provider'
                    ? 'bg-white text-[#00766C] shadow-sm'
                    : 'text-slate-500 hover:text-[#1A1C29]'
                }`}
              >
                For Providers
              </button>
            </div>
          </div>
        </section>

        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-[1142px] px-6">
            {TAB_ORDER.map((tab) => {
              const content = TAB_CONTENT[tab]

              return (
                <div
                  key={tab}
                  id={`panel-${tab}`}
                  role="tabpanel"
                  aria-labelledby={`tab-${tab}`}
                  aria-hidden={activeTab !== tab}
                  hidden={activeTab !== tab}
                >
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                    {content.steps.map((step) => (
                      <div
                        key={`${tab}-${step.title}`}
                        className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-all duration-200 hover:border-[#00766C]/30 hover:shadow-[0_4px_12px_rgba(15,23,42,0.06)] lg:p-6"
                      >
                        <div className="flex items-start justify-between">
                          <div className={`flex h-11 w-11 items-center justify-center rounded-full ${step.tint}`}>
                            <step.icon className="h-5 w-5" strokeWidth={2.2} />
                          </div>
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            Step {step.step}
                          </span>
                        </div>
                        <h3 className="mt-4 text-[16px] font-semibold text-[#1A1C29]">{step.title}</h3>
                        <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">{step.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="pb-12 lg:pb-16">
          <div className="mx-auto max-w-[1142px] px-6">
            {TAB_ORDER.map((tab) => {
              const content = TAB_CONTENT[tab]

              return (
                <div
                  key={`${tab}-cta`}
                  aria-hidden={activeTab !== tab}
                  hidden={activeTab !== tab}
                >
                  <div className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] md:flex-row lg:p-10">
                    <div className="max-w-xl text-center md:text-left">
                      <h2 className="text-[22px] font-bold leading-tight tracking-tight text-[#1A1C29] lg:text-[26px]">
                        {content.ctaTitle}
                      </h2>
                      <p className="mt-2 text-[14px] leading-relaxed text-slate-600">
                        {content.ctaDescription}
                      </p>
                    </div>
                    <Link
                      href={content.primaryCtaHref}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#FF6B35] px-6 py-3 text-[14px] font-semibold text-white shadow-[0_4px_12px_rgba(255,107,53,0.22)] transition-colors hover:bg-[#E0552A] md:w-auto"
                    >
                      {content.primaryCtaLabel}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </main>

      <Footer locale="en" localeSwitchPath="/how-it-works" />
    </>
  )
}
