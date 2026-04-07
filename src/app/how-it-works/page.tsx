'use client'

import { useState } from 'react'
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

const PATIENT_STEPS = [
  {
    icon: Search,
    title: 'Search',
    text: 'Enter your condition or a physiotherapist name and select your location.',
    tint: 'bg-[#E6F4F3] text-[#00766C]',
  },
  {
    icon: UserCheck,
    title: 'Choose Provider',
    text: 'Compare expert physiotherapists by specialty, rating, fees, and distance.',
    tint: 'bg-[#EDEAF8] text-[#5B4BC4]',
  },
  {
    icon: CalendarDays,
    title: 'Pick a Slot',
    text: 'Select your preferred date and time from the live availability of the provider.',
    tint: 'bg-[#FEE9DD] text-[#C4532A]',
  },
  {
    icon: Activity,
    title: 'Book Instantly',
    text: 'Confirm your booking with a quick session request and get expert care.',
    tint: 'bg-[#FFE4EC] text-[#B53A63]',
  },
]

const PROVIDER_STEPS = [
  {
    icon: Building2,
    title: 'Register Practice',
    text: 'Create your professional profile with your credentials and clinic details.',
    tint: 'bg-[#E6F4F3] text-[#00766C]',
  },
  {
    icon: CalendarRange,
    title: 'Set Availability',
    text: 'Configure your working hours, slot duration, and visit types.',
    tint: 'bg-[#EDEAF8] text-[#5B4BC4]',
  },
  {
    icon: CalendarDays,
    title: 'Accept Bookings',
    text: 'Manage all your incoming appointments from a single dashboard.',
    tint: 'bg-[#FEE9DD] text-[#C4532A]',
  },
  {
    icon: WalletCards,
    title: 'Track Earnings',
    text: 'Monitor your weekly and monthly revenue automatically.',
    tint: 'bg-[#FFE4EC] text-[#B53A63]',
  },
]

export default function HowItWorksPage() {
  const [activeTab, setActiveTab] = useState<'patient' | 'provider'>('patient')
  const activeSteps = activeTab === 'patient' ? PATIENT_STEPS : PROVIDER_STEPS
  const primaryCtaHref = activeTab === 'patient' ? '/search' : '/doctor-signup'
  const primaryCtaLabel = activeTab === 'patient' ? 'Start searching' : 'Join as a provider'

  return (
    <>
      <Navbar locale="en" localeSwitchPath="/how-it-works" />

      <main className="bg-[#FAFAFA] min-h-screen">
        {/* Hero */}
        <section className="bg-white border-b border-slate-200/70">
          <div className="max-w-[1142px] mx-auto px-6 py-12 lg:py-16 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E6F4F3] text-[#00766C] rounded-full text-[11px] font-semibold uppercase tracking-[0.18em] mb-5">
              How it works
            </div>
            <h1 className="text-[30px] lg:text-[40px] font-bold tracking-tight text-[#1A1C29] leading-tight">
              Book a physiotherapist <br className="hidden sm:inline" />
              <span className="text-[#00766C]">online in India</span>
            </h1>
            <p className="mt-4 text-[15px] lg:text-[17px] leading-relaxed max-w-[680px] mx-auto text-slate-600">
              Four clear steps — no calls, no waiting, and no guesswork about who to trust.
            </p>

            {/* Tabs */}
            <div className="mt-8 inline-flex items-center gap-1 rounded-full bg-slate-100 p-1 border border-slate-200">
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
        </section>

        {/* Steps */}
        <section className="py-12 lg:py-16">
          <div className="max-w-[1142px] mx-auto px-6">
            <div className="grid gap-4 lg:gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {activeSteps.map((step, idx) => (
                <div
                  key={step.title}
                  className="relative rounded-2xl border border-slate-200 bg-white p-5 lg:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-all duration-200 hover:shadow-[0_4px_12px_rgba(15,23,42,0.06)] hover:border-[#00766C]/30"
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center ${step.tint}`}
                    >
                      <step.icon className="w-5 h-5" strokeWidth={2.2} />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Step 0{idx + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 text-[16px] font-semibold text-[#1A1C29]">{step.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="pb-12 lg:pb-16">
          <div className="max-w-[1142px] mx-auto px-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:p-10 shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="max-w-xl text-center md:text-left">
                <h2 className="text-[22px] lg:text-[26px] font-bold text-[#1A1C29] tracking-tight leading-tight">
                  {activeTab === 'patient'
                    ? 'Get back to feeling your best.'
                    : "Grow your practice with India's best physio network."}
                </h2>
                <p className="mt-2 text-[14px] text-slate-600 leading-relaxed">
                  {activeTab === 'patient'
                    ? 'Verified experts for in-clinic and home visit consultations across 18 major Indian cities.'
                    : 'Join hundreds of verified physiotherapists building their digital presence with BookPhysio.'}
                </p>
              </div>
              <Link
                href={primaryCtaHref}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#00766C] px-6 py-3 text-[14px] font-semibold text-white hover:bg-[#005A52] transition-colors shadow-[0_4px_12px_rgba(0,118,108,0.18)] w-full md:w-auto"
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
