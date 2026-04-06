'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Search, UserCheck, CalendarDays, Sparkles, Building2, CalendarRange, WalletCards, ArrowRight, Activity } from 'lucide-react'

const PATIENT_STEPS = [
  {
    icon: Search,
    title: 'Search',
    text: 'Enter your condition or a physiotherapist name and select your location.',
    color: 'bg-[#EEF0FD] text-[#6B7BF5]',
  },
  {
    icon: UserCheck,
    title: 'Choose Provider',
    text: 'Compare expert physiotherapists by specialty, rating, fees, and distance.',
    color: 'bg-violet-50 text-violet-600',
  },
  {
    icon: CalendarDays,
    title: 'Pick a Slot',
    text: 'Select your preferred date and time from the live availability of the provider.',
    color: 'bg-[#E4F9F6] text-[#39D0B8]',
  },
  {
    icon: Activity,
    title: 'Book Instantly',
    text: 'Confirm your booking with a quick session request and get expert care.',
    color: 'bg-rose-50 text-rose-600',
  },
]

const PROVIDER_STEPS = [
  {
    icon: Building2,
    title: 'Register Practice',
    text: 'Create your professional profile with your credentials and clinic details.',
    color: 'bg-[#EEF0FD] text-[#6B7BF5]',
  },
  {
    icon: CalendarRange,
    title: 'Set Availability',
    text: 'Configure your working hours, slot duration, and visit types.',
    color: 'bg-violet-50 text-violet-600',
  },
  {
    icon: CalendarDays,
    title: 'Accept Bookings',
    text: 'Manage all your incoming appointments from a single dashboard.',
    color: 'bg-[#E4F9F6] text-[#39D0B8]',
  },
  {
    icon: WalletCards,
    title: 'Track Earnings',
    text: 'Monitor your weekly and monthly revenue automatically.',
    color: 'bg-rose-50 text-rose-600',
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

      <main className="min-h-screen bg-[#FAF9F6]">
        {/* Hero Section */}
        <section className="pt-32 pb-20 relative overflow-hidden bg-white rounded-b-[3rem] shadow-[0_4px_24px_rgba(45,43,85,0.02)]">
          <div className="absolute inset-x-0 -top-40 h-[600px] w-full bg-[radial-gradient(ellipse_at_top,#EEF0FD_0%,transparent_70%)] opacity-60"></div>
          
          <div className="mx-auto max-w-5xl px-6 text-center relative z-10">
            <div className="bp-kicker mx-auto mb-6">How it works</div>
            <h1 className="mt-4 text-[42px] font-bold tracking-tight text-[#1A1C29] md:text-[56px] leading-[1.1]">
              How to Book a Physiotherapist<br /><span className="text-[#6B7BF5]">Online in India</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-[18px] leading-relaxed text-[#55586B]">
              Book a physio session in 4 clear steps - no calls, no waiting, and no guesswork about who to trust. It's fast, frictionless, and secure.
            </p>

            <div className="mt-12 mx-auto inline-flex items-center gap-1.5 rounded-full bg-[#F4F2FA] p-1.5 shadow-sm border border-[#E2E4EB]">
              <button
                onClick={() => setActiveTab('patient')}
                className={`py-3 px-8 rounded-full font-bold text-[15px] transition-all duration-300 ${
                  activeTab === 'patient'
                    ? 'bg-white text-[#6B7BF5] shadow-sm ring-1 ring-black/5'
                    : 'text-[#8F93A3] hover:text-[#1A1C29]'
                }`}
              >
                For Patients
              </button>
              <button
                onClick={() => setActiveTab('provider')}
                className={`py-3 px-8 rounded-full font-bold text-[15px] transition-all duration-300 ${
                  activeTab === 'provider'
                    ? 'bg-white text-[#6B7BF5] shadow-sm ring-1 ring-black/5'
                    : 'text-[#8F93A3] hover:text-[#1A1C29]'
                }`}
              >
                For Providers
              </button>
            </div>
          </div>
        </section>

        {/* 4 Steps Section */}
        <section className="py-24 md:py-32 overflow-hidden relative">
          <div className="bp-container relative z-10">
            {/* Horizontal Line Connector (Desktop) */}
            <div className="hidden lg:block absolute top-[44px] left-[12%] right-[12%] h-[2px] bg-[#E2E4EB] -z-10" />

            <div className="grid gap-12 lg:gap-6 lg:grid-cols-4">
              {activeSteps.map((step, idx) => (
                <div key={idx} className="relative group flex flex-col items-center text-center px-2">
                  
                  {/* Arrow overlay on line */}
                  {idx < 3 && (
                    <div className="hidden lg:block absolute top-[35px] -right-[12px] z-0 text-[#C8CDFE]">
                      <ArrowRight size={22} />
                    </div>
                  )}

                  {/* Step Pill */}
                  <div className="bg-[#FAF9F6] border-2 border-white text-[#6B7BF5] font-black text-[12px] uppercase tracking-wider px-4 py-1.5 rounded-full mb-4 shadow-sm relative z-10">
                    Step 0{idx + 1}
                  </div>

                  {/* Icon Circle */}
                  <div className="w-[88px] h-[88px] rounded-full flex items-center justify-center mb-6 shadow-sm border-4 border-white relative z-10 bg-white group-hover:-translate-y-1 transition-transform">
                    <div className={`w-[60px] h-[60px] rounded-full flex items-center justify-center ${step.color}`}>
                      <step.icon size={26} strokeWidth={2.5} />
                    </div>
                  </div>

                  {/* Text content */}
                  <h3 className="text-[#1A1C29] text-[20px] font-bold mb-3">{step.title}</h3>
                  <p className="text-[#55586B] text-[15px] leading-relaxed max-w-[240px]">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Action Banner */}
        <section className="pb-24">
          <div className="mx-auto max-w-5xl px-6">
             <div className="bp-card overflow-hidden p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 bg-white border border-[#E2E4EB] rounded-[2.5rem] relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_top_right,#EEF0FD_0%,transparent_70%)] opacity-80" />
                
                <div className="relative z-10 max-w-xl text-center md:text-left">
                   <h2 className="text-[32px] md:text-[38px] font-bold text-[#1A1C29] mb-4 leading-tight">
                     {activeTab === 'patient' 
                        ? 'Get back to feeling your best.' 
                        : 'Grow your practice with India\'s best physio network.'}
                   </h2>
                   <p className="text-[17px] text-[#55586B] mb-8">
                     {activeTab === 'patient' 
                        ? 'Verified experts for in-clinic and home visit consultations across 18 major Indian cities.' 
                        : 'Join hundreds of verified physiotherapists building their digital presence with BookPhysio.'}
                   </p>
                   <Link
                     href={primaryCtaHref}
                     className="inline-flex items-center justify-center gap-2 rounded-full bg-[#6B7BF5] px-8 py-4 text-[16px] font-bold text-white transition-all hover:bg-[#5363D7] hover:-translate-y-0.5 shadow-[0_8px_20px_rgba(107,123,245,0.3)] w-full md:w-auto"
                   >
                      {primaryCtaLabel}
                      <ArrowRight className="h-5 w-5" />
                   </Link>
                </div>
             </div>
          </div>
        </section>
      </main>

      <Footer locale="en" localeSwitchPath="/how-it-works" />
    </>
  )
}
