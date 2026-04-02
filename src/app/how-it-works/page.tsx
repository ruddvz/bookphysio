'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Search, UserCheck, CalendarDays, Sparkles, Building2, CalendarRange, WalletCards, ArrowRight } from 'lucide-react'

const PATIENT_STEPS = [
  {
    icon: Search,
    title: 'Search',
    text: 'Enter your condition or a physiotherapist name and select your location.',
  },
  {
    icon: UserCheck,
    title: 'Choose Provider',
    text: 'Compare expert physiotherapists by specialty, rating, fees, and distance.',
  },
  {
    icon: CalendarDays,
    title: 'Pick a Slot',
    text: 'Select your preferred date and time from the live availability of the provider.',
  },
  {
    icon: Sparkles,
    title: 'Book Instantly',
    text: 'Confirm your booking with a quick session request and get expert care.',
  },
]

const PROVIDER_STEPS = [
  {
    icon: Building2,
    title: 'Register Practice',
    text: 'Create your professional profile with your credentials, ICP number, and clinic details.',
  },
  {
    icon: CalendarRange,
    title: 'Set Availability',
    text: 'Configure your working hours, slot duration, and visit types (In-clinic, Home).',
  },
  {
    icon: CalendarDays,
    title: 'Accept Bookings',
    text: 'Manage all your incoming appointments from a single, intuitive dashboard.',
  },
  {
    icon: WalletCards,
    title: 'Track Earnings',
    text: 'Monitor your weekly and monthly revenue with automatic GST calculations.',
  },
]

export default function HowItWorksPage() {
  const [activeTab, setActiveTab] = useState<'patient' | 'provider'>('patient')
  const activeSteps = activeTab === 'patient' ? PATIENT_STEPS : PROVIDER_STEPS
  const primaryCtaHref = activeTab === 'patient' ? '/search' : '/doctor-signup'
  const primaryCtaLabel = activeTab === 'patient' ? 'Find a Physiotherapist' : 'List your practice now'

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-white">
        <section className="border-b border-[#D9E7E5] bg-[#F9FBFB] py-16 md:py-20">
          <div className="mx-auto max-w-[1142px] px-6 text-center">
            <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-[#00766C]">How it works</p>
            <h1 className="mt-4 text-[42px] font-bold tracking-tight text-[#333333] md:text-[56px]">
              Simple, fast, transparent.
            </h1>
            <p className="mx-auto mt-5 max-w-[640px] text-[18px] leading-8 text-[#666666] md:text-[20px]">
              Book a physio session in 4 clear steps - no calls, no waiting, and no guesswork about who to trust.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href={primaryCtaHref}
                className="inline-flex items-center gap-2 rounded-full bg-[#00766C] px-7 py-3 text-[16px] font-bold text-white transition-colors hover:bg-[#005A52]"
              >
                {activeTab === 'patient' ? 'Start searching' : 'Join as a physiotherapist'}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <span className="rounded-full border border-[#D9E7E5] bg-white px-4 py-3 text-[14px] font-medium text-[#5F6C69]">
                Verified providers in major Indian cities
              </span>
            </div>

            <div className="mx-auto mt-10 inline-flex rounded-[32px] bg-[#E6F4F3] p-1 shadow-inner">
              <button
                onClick={() => setActiveTab('patient')}
                aria-pressed={activeTab === 'patient'}
                className={`px-8 py-3 rounded-[28px] font-bold text-[16px] transition-all ${activeTab === 'patient' ? 'bg-[#00766C] text-white shadow-lg' : 'text-[#00766C] hover:bg-white/50'}`}
              >
                For Patients
              </button>
              <button
                onClick={() => setActiveTab('provider')}
                aria-pressed={activeTab === 'provider'}
                className={`px-8 py-3 rounded-[28px] font-bold text-[16px] transition-all ${activeTab === 'provider' ? 'bg-[#00766C] text-white shadow-lg' : 'text-[#00766C] hover:bg-white/50'}`}
              >
                For Physiotherapists
              </button>
            </div>
          </div>
        </section>

        <section className="pb-16 pt-8 md:pb-20 md:pt-10">
          <div className="mx-auto max-w-[1142px] px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {activeSteps.map((step, idx) => (
                <div key={idx} className="relative group rounded-[20px] border border-[#E5E5E5] bg-white p-6 text-left transition-all hover:border-[#00766C] hover:shadow-xl md:p-8">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E6F4F3] transition-colors group-hover:bg-[#00766C]">
                    <step.icon className="h-7 w-7 text-[#00766C] group-hover:text-white" />
                  </div>
                  <div className="mt-5 text-[12px] font-bold uppercase tracking-[0.18em] text-[#8C9693]">Step {idx + 1}</div>
                  <h3 className="mt-2 text-[22px] font-bold text-[#333333] group-hover:text-[#00766C]">{step.title}</h3>
                  
                  <p className="text-[16px] leading-relaxed text-[#666666]">{step.text}</p>
                  
                  {idx < 3 && (
                    <div className="absolute left-[calc(100%-20px)] top-10 z-10 hidden w-20 text-[#00766C] opacity-35 lg:block">
                       <ArrowRight className="h-10 w-10" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#E6F4F3]/30 py-16 md:py-20">
          <div className="mx-auto max-w-[1142px] px-6">
             <div className="relative overflow-hidden rounded-[24px] border border-[#E5E5E5] bg-white p-10 shadow-sm md:flex md:items-center md:justify-between md:gap-10 md:p-16">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#E6F4F3] rounded-bl-full opacity-50"></div>
                <div className="relative z-10 flex-1">
                   <h2 className="text-[36px] font-bold text-[#333333] mb-4 leading-tight">
                     {activeTab === 'patient' ? 'Get back to feeling your best.' : 'Grow your practice with India\'s best physio network.'}
                   </h2>
                   <p className="text-[18px] text-[#666666] mb-8 max-w-[500px]">
                     {activeTab === 'patient' ? 'Verified experts for in-clinic and home visit consultations across major Indian cities.' : 'Join hundreds of verified physiotherapists building their digital presence with BookPhysio.'}
                   </p>
                   <Link
                     href={primaryCtaHref}
                     className="inline-flex items-center gap-2 rounded-[32px] bg-[#00766C] px-10 py-4 text-[18px] font-bold text-white transition-colors hover:bg-[#005A52] shadow-lg"
                   >
                      {primaryCtaLabel}
                      <ArrowRight className="h-5 w-5" />
                   </Link>
                </div>
                <div className="flex h-64 w-full flex-col justify-center rounded-[24px] border border-[#D9E7E5] bg-[#F3F7F6] p-6 text-left md:w-1/3">
                   <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#00766C]">Workflow snapshot</p>
                   <p className="mt-3 text-[18px] font-semibold text-[#333333]">
                     {activeTab === 'patient' ? 'Search, compare, pick a slot, and confirm.' : 'Register, set hours, accept bookings, and track revenue.'}
                   </p>
                   <ul className="mt-5 space-y-3 text-[14px] text-[#5F6C69]">
                     {activeSteps.map((step, index) => (
                       <li key={step.title} className="flex items-center gap-3">
                         <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[12px] font-bold text-[#00766C]">
                           {index + 1}
                         </span>
                         {step.title}
                       </li>
                     ))}
                   </ul>
                </div>
             </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
