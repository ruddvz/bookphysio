'use client'

import { useState } from 'react'
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
    text: 'Configure your working hours, slot duration, and visit types (In-clinic, Home, Online).',
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

  return (
    <>
      <Navbar />

      <main className="bg-white min-h-screen">
        <section className="bg-[#F9FBFB] py-24">
          <div className="max-w-[1142px] mx-auto px-6 text-center">
            <h1 className="text-[48px] font-bold text-[#333333] mb-6 tracking-tight">
               How BookPhysio Works
            </h1>
            <p className="text-[20px] text-[#666666] max-w-[600px] mx-auto mb-10">
               Booking expert physiotherapy is as easy as searching, picking a slot, and getting care at your convenience.
            </p>
            
            <div className="inline-flex p-1 bg-[#E6F4F3] rounded-[32px] mb-16 shadow-inner mx-auto">
               <button 
                 onClick={() => setActiveTab('patient')}
                 className={`px-10 py-3 rounded-[28px] font-bold text-[16px] transition-all ${activeTab === 'patient' ? 'bg-[#00766C] text-white shadow-lg' : 'text-[#00766C] hover:bg-white/50'}`}
               >
                 For Patients
               </button>
               <button 
                 onClick={() => setActiveTab('provider')}
                 className={`px-10 py-3 rounded-[28px] font-bold text-[16px] transition-all ${activeTab === 'provider' ? 'bg-[#00766C] text-white shadow-lg' : 'text-[#00766C] hover:bg-white/50'}`}
               >
                 For Physiotherapists
               </button>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="max-w-[1142px] mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {(activeTab === 'patient' ? PATIENT_STEPS : PROVIDER_STEPS).map((step, idx) => (
                <div key={idx} className="relative group text-center p-8 bg-white border border-[#E5E5E5] rounded-[16px] hover:border-[#00766C] transition-all hover:shadow-xl">
                  <div className="w-16 h-16 mx-auto rounded-full bg-[#E6F4F3] flex items-center justify-center mb-6 group-hover:bg-[#00766C] transition-colors">
                    <step.icon className="w-8 h-8 text-[#00766C] group-hover:text-white" />
                  </div>
                  <div className="text-[13px] font-bold text-[#9CA3AF] mb-2 uppercase tracking-wide">Step {idx + 1}</div>
                  <h3 className="text-[22px] font-bold text-[#333333] mb-4 group-hover:text-[#00766C]">{step.title}</h3>
                  <p className="text-[16px] leading-relaxed text-[#666666]">{step.text}</p>
                  
                  {idx < 3 && (
                    <div className="hidden lg:block absolute top-12 left-[calc(100%-20px)] w-20 z-10 text-[#00766C] opacity-20">
                       <ArrowRight className="w-10 h-10" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-[#E6F4F3]/30">
          <div className="max-w-[1142px] mx-auto px-6">
             <div className="bg-white rounded-[24px] p-10 md:p-16 border border-[#E5E5E5] flex flex-col md:flex-row items-center justify-between gap-10 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#E6F4F3] rounded-bl-full opacity-50"></div>
                <div className="relative z-10 flex-1">
                   <h2 className="text-[36px] font-bold text-[#333333] mb-4 leading-tight">
                     {activeTab === 'patient' ? 'Get back to feeling your best.' : 'Grow your practice with India\'s best physio network.'}
                   </h2>
                   <p className="text-[18px] text-[#666666] mb-8 max-w-[500px]">
                     {activeTab === 'patient' ? 'Verified experts for in-clinic, home visit, and online consultations across major Indian cities.' : 'Join hundreds of verified physiotherapists building their digital presence with BookPhysio.'}
                   </p>
                   <button className="px-10 py-4 bg-[#00766C] text-white font-bold rounded-[32px] text-[18px] hover:bg-[#005A52] transition-colors shadow-lg">
                      {activeTab === 'patient' ? 'Find a Physiotherapist' : 'List your practice now'}
                   </button>
                </div>
                <div className="w-full md:w-1/3 h-64 bg-[#F3F4F6] rounded-[24px] border border-dashed border-[#CED4DA] flex items-center justify-center text-[#9CA3AF] text-sm">
                   Illustration Placeholder
                </div>
             </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
