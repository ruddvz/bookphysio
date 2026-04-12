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
  Home,
  Clock,
} from 'lucide-react'

const PATIENT_STEPS = [
  {
    icon: Search,
    title: 'Search',
    text: 'Enter your condition or a physiotherapist name and select your location.',
    tint: 'bg-[#E6F4F3] text-[#00766C]',
    num: '01',
  },
  {
    icon: UserCheck,
    title: 'Choose Provider',
    text: 'Compare expert physiotherapists by specialty, rating, fees, and distance.',
    tint: 'bg-[#EDEAF8] text-[#5B4BC4]',
    num: '02',
  },
  {
    icon: CalendarDays,
    title: 'Pick a Slot',
    text: 'Select your preferred date and time from the live availability of the provider.',
    tint: 'bg-[#FEE9DD] text-[#C4532A]',
    num: '03',
  },
  {
    icon: Activity,
    title: 'Book Instantly',
    text: 'Confirm your booking with a quick session request and get expert care.',
    tint: 'bg-[#FFE4EC] text-[#B53A63]',
    num: '04',
  },
]

const PROVIDER_STEPS = [
  {
    icon: Building2,
    title: 'Register Practice',
    text: 'Create your professional profile with your credentials and clinic details.',
    tint: 'bg-[#E6F4F3] text-[#00766C]',
    num: '01',
  },
  {
    icon: CalendarRange,
    title: 'Set Availability',
    text: 'Configure your working hours, slot duration, and visit types.',
    tint: 'bg-[#EDEAF8] text-[#5B4BC4]',
    num: '02',
  },
  {
    icon: CalendarDays,
    title: 'Accept Bookings',
    text: 'Manage all your incoming appointments from a single dashboard.',
    tint: 'bg-[#FEE9DD] text-[#C4532A]',
    num: '03',
  },
  {
    icon: WalletCards,
    title: 'Track Earnings',
    text: 'Monitor your weekly and monthly revenue automatically.',
    tint: 'bg-[#FFE4EC] text-[#B53A63]',
    num: '04',
  },
]

const TRUST_ITEMS = [
  { icon: ShieldCheck, title: 'IAP verified', desc: 'Every provider checked against official registration records.' },
  { icon: Clock,       title: 'Book in 60s',  desc: 'From search to confirmed booking in under a minute.'        },
  { icon: Home,        title: 'Home visits',  desc: 'Filter by in-clinic or home visit on every search.'          },
]

const PATIENT_CHARACTER = '/images/physio-female.png'
const PROVIDER_CHARACTER = '/images/physio-male.png'

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
        <section
          className="relative overflow-hidden border-b border-slate-200/70"
          style={{ background: 'linear-gradient(160deg, #F0FBF9 0%, #FFFFFF 50%, #F5F8FF 100%)' }}
        >
          {/* Decorative backdrop */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div
              className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full opacity-20"
              style={{ background: 'radial-gradient(circle, #B2D8D5 0%, transparent 70%)' }}
            />
          </div>

          <div className="max-w-[1142px] mx-auto px-6 py-14 lg:py-20 relative z-10">
            <div className="grid lg:grid-cols-[1fr_280px] gap-10 items-center">
              {/* Left — copy + tabs */}
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#E6F4F3] text-[#00766C] rounded-full text-[11px] font-bold uppercase tracking-[0.16em] mb-5">
                  <ShieldCheck size={11} strokeWidth={3} />
                  How BookPhysio Works
                </div>

                <h1 className="text-[28px] lg:text-[42px] font-bold tracking-tight text-[#1A1C29] leading-[1.1] mb-4">
                  How to book a physiotherapist
                  <br className="hidden sm:inline" />
                  <span className="text-[#00766C]"> online in India</span>
                </h1>
                <p className="text-[15px] lg:text-[17px] leading-relaxed max-w-[600px] text-slate-500 mb-8">
                  Book a physio session in 4 clear steps with no calls, no waiting, and no guesswork about who to trust.
                </p>

                {/* Tabs */}
                <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 p-1 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setActiveTab('patient')}
                    className={`py-2.5 px-6 rounded-full text-[13px] font-semibold transition-all ${
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
                    className={`py-2.5 px-6 rounded-full text-[13px] font-semibold transition-all ${
                      activeTab === 'provider'
                        ? 'bg-white text-[#00766C] shadow-sm'
                        : 'text-slate-500 hover:text-[#1A1C29]'
                    }`}
                  >
                    For Physiotherapists
                  </button>
                </div>
              </div>

              {/* Right — physio character (desktop) */}
              <div className="hidden lg:flex justify-center items-end" aria-hidden="true">
                <div className="relative">
                  <div
                    className="w-[220px] h-[220px] rounded-full absolute bottom-0 left-1/2 -translate-x-1/2"
                    style={{ background: 'linear-gradient(145deg, #E6F4F3 0%, #B2D8D5 100%)' }}
                  />
                  <Image
                    src={activeTab === 'patient' ? PATIENT_CHARACTER : PROVIDER_CHARACTER}
                    alt=""
                    width={220}
                    height={320}
                    className="relative z-10 object-contain object-bottom"
                    sizes="(min-width: 1024px) 220px, 0px"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="py-14 lg:py-20">
          <div className="max-w-[1142px] mx-auto px-6">
            {/* Desktop connector line */}
            <div className="relative">
              <div className="hidden lg:block absolute top-[68px] left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-[#00766C]/10 via-[#00766C]/30 to-rose-400/10" />

              <div className="grid gap-4 lg:gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {activeSteps.map((step) => (
                  <div
                    key={step.title}
                    className="relative flex flex-col items-center text-center p-6 rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)] hover:shadow-[0_4px_16px_rgba(15,23,42,0.08)] hover:border-[#00766C]/30 transition-all duration-200 group"
                  >
                    {/* Step number */}
                    <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4 group-hover:text-[#00766C] transition-colors">
                      Step {step.num}
                    </div>

                    {/* Icon */}
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center mb-5 ${step.tint} group-hover:-translate-y-1 transition-transform duration-200`}
                    >
                      <step.icon className="w-6 h-6" strokeWidth={2} />
                    </div>

                    <h3 className="text-[16px] font-bold text-[#1A1C29] mb-2">{step.title}</h3>
                    <p className="text-[13px] leading-relaxed text-slate-500">{step.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Trust strip */}
        <section className="pb-10 lg:pb-14">
          <div className="max-w-[1142px] mx-auto px-6">
            <div className="rounded-2xl bg-[#E6F4F3] border border-[#B2D8D5]/60 p-6 lg:p-8 grid gap-6 sm:grid-cols-3">
              {TRUST_ITEMS.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
                    <Icon size={18} className="text-[#00766C]" />
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-[#1A1C29]">{title}</div>
                    <div className="text-[13px] text-slate-500 leading-snug mt-0.5">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="pb-14 lg:pb-20">
          <div className="max-w-[1142px] mx-auto px-6">
            <div
              className="rounded-2xl p-8 lg:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #005A52 0%, #00766C 60%, #009688 100%)' }}
            >
              {/* Background glow */}
              <div className="absolute right-0 top-0 w-[300px] h-[300px] rounded-full opacity-20 bg-white pointer-events-none" aria-hidden="true" />

              <div className="max-w-xl text-center md:text-left relative z-10">
                <h2 className="text-[24px] lg:text-[30px] font-bold text-white tracking-tight leading-tight mb-3">
                  {activeTab === 'patient'
                    ? 'Get back to feeling your best.'
                    : "Grow your practice with India's best physio network."}
                </h2>
                <p className="text-[14px] text-white/75 leading-relaxed">
                  {activeTab === 'patient'
                    ? 'Verified experts for in-clinic and home visit consultations across 18 major Indian cities.'
                    : 'Join hundreds of verified physiotherapists building their digital presence with BookPhysio.'}
                </p>
              </div>

              <Link
                href={primaryCtaHref}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-[14px] font-bold text-[#00766C] hover:bg-[#F0FBF9] transition-colors shadow-lg w-full md:w-auto shrink-0 relative z-10 group"
              >
                {primaryCtaLabel}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer locale="en" localeSwitchPath="/how-it-works" />
    </>
  )
}
