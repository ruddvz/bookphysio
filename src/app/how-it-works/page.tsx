'use client'

import { useState } from 'react'
import Image from 'next/image'
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
  ShieldCheck,
  Clock,
  Home,
} from 'lucide-react'

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
] as const

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
] as const

const TAB_CONTENT = {
  patient: {
    tabLabel: 'For Patients',
    heading: 'How to book a physiotherapist online in India',
    description: 'Book a physio session in 4 clear steps with no calls, no waiting, and no guesswork about who to trust.',
    trust: [
      { icon: ShieldCheck, text: 'IAP-verified physiotherapists only' },
      { icon: Clock, text: 'Instant booking confirmation via OTP' },
      { icon: Home, text: 'In-clinic and home visit options' },
    ],
    steps: PATIENT_STEPS,
    character: PATIENT_CHARACTER,
    primaryCtaHref: '/search',
    primaryCtaLabel: 'Start searching',
    secondaryHeading: 'Get back to feeling your best.',
    secondaryDescription: 'Verified experts for in-clinic and home visit consultations across 18 major Indian cities.',
  },
  provider: {
    tabLabel: 'For Physiotherapists',
    heading: 'How to join BookPhysio as a physiotherapist',
    description: 'Create your verified profile, open your calendar, and start accepting bookings online without juggling calls or spreadsheets.',
    trust: [
      { icon: ShieldCheck, text: 'Credential-verified listing' },
      { icon: Clock, text: 'Real-time calendar management' },
      { icon: Home, text: 'Manage clinic + home visit bookings' },
    ],
    steps: PROVIDER_STEPS,
    character: PROVIDER_CHARACTER,
    primaryCtaHref: '/doctor-signup',
    primaryCtaLabel: 'Join as a provider',
    secondaryHeading: "Grow your practice with India's best physio network.",
    secondaryDescription: 'Join hundreds of verified physiotherapists building their digital presence with BookPhysio.',
  },
} as const

export default function HowItWorksPage() {
  const [activeTab, setActiveTab] = useState<'patient' | 'provider'>('patient')
  const content = TAB_CONTENT[activeTab]
  const tabId = activeTab === 'patient' ? 'tab-patient' : 'tab-provider'
  const panelId = activeTab === 'patient' ? 'panel-patient' : 'panel-provider'

  return (
    <>
      <Navbar locale="en" localeSwitchPath="/how-it-works" />

      <main className="bg-[#FAFAFA] min-h-screen">
        <section className="bg-white border-b border-slate-200/70 overflow-hidden">
          <div className="max-w-[1142px] mx-auto px-6 py-12 lg:py-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E6F4F3] text-[#00766C] rounded-full text-[11px] font-semibold uppercase tracking-[0.18em] mb-5">
              How it works
            </div>

            <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 p-1 border border-slate-200" role="tablist" aria-label="How BookPhysio works for different users">
              {(['patient', 'provider'] as const).map((tab) => {
                const tabContent = TAB_CONTENT[tab]
                const isActive = activeTab === tab
                const currentTabId = tab === 'patient' ? 'tab-patient' : 'tab-provider'
                const currentPanelId = tab === 'patient' ? 'panel-patient' : 'panel-provider'

                return (
                  <button
                    key={tab}
                    id={currentTabId}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={currentPanelId}
                    onClick={() => setActiveTab(tab)}
                    className={`py-2 px-5 rounded-full text-[13px] font-semibold transition-colors ${
                      isActive
                        ? 'bg-white text-[#00766C] shadow-sm'
                        : 'text-slate-500 hover:text-[#1A1C29]'
                    }`}
                  >
                    {tabContent.tabLabel}
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        <div role="tabpanel" id={panelId} aria-labelledby={tabId} className="outline-none">
          <section className="bg-white overflow-hidden">
            <div className="max-w-[1142px] mx-auto px-6 py-10 lg:py-14">
              <div className="grid lg:grid-cols-[1fr_300px] gap-10 items-center">
                <div>
                  <h1 className="text-[30px] lg:text-[40px] font-bold tracking-tight text-[#1A1C29] leading-tight mb-4">
                    {content.heading}
                  </h1>
                  <p className="text-[15px] lg:text-[17px] leading-relaxed max-w-[560px] text-slate-600 mb-8">
                    {content.description}
                  </p>

                  <div className="flex flex-col gap-2.5">
                    {content.trust.map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#E6F4F3] border border-[#00766C]/20 flex items-center justify-center shrink-0">
                          <Icon size={12} className="text-[#00766C]" />
                        </div>
                        <span className="text-[14px] text-slate-600">{text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="hidden lg:flex justify-center items-end">
                  <div className="relative">
                    <div className="w-[220px] h-[220px] rounded-full bg-[#E6F4F3]" />
                    <Image
                      src={content.character}
                      alt=""
                     
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

          <section className="py-12 lg:py-16">
            <div className="max-w-[1142px] mx-auto px-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {content.steps.map((step) => (
                  <div
                    key={step.title}
                    className="relative rounded-2xl border border-slate-200 bg-white p-6 lg:p-8 shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-all duration-200 hover:shadow-[0_4px_12px_rgba(15,23,42,0.07)] hover:border-[#00766C]/30 group"
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
                    <div className="absolute left-0 top-6 bottom-6 w-[3px] rounded-full bg-[#00766C] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="pb-12 lg:pb-16">
            <div className="max-w-[1142px] mx-auto px-6">
              <div className="rounded-2xl bg-[#1A1C29] p-8 lg:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#00766C]/10 rounded-full blur-[80px] pointer-events-none" />

                <div className="max-w-xl text-center md:text-left relative z-10">
                  <h2 className="text-[24px] lg:text-[28px] font-bold text-white tracking-tight leading-tight">
                    {content.secondaryHeading}
                  </h2>
                  <p className="mt-3 text-[15px] text-slate-400 leading-relaxed">
                    {content.secondaryDescription}
                  </p>
                </div>

                <Link
                  href={content.primaryCtaHref}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#00766C] px-7 py-3.5 text-[15px] font-semibold text-white hover:bg-[#005A52] transition-colors shadow-[0_4px_16px_rgba(0,118,108,0.25)] w-full md:w-auto shrink-0 relative z-10"
                >
                  {content.primaryCtaLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer locale="en" localeSwitchPath="/how-it-works" />
    </>
  )
}
