import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Search, UserCheck, CalendarDays, Sparkles } from 'lucide-react'

const STEPS = [
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

export default function HowItWorksPage() {
  return (
    <>
      <Navbar />

      <main className="bg-white min-h-screen py-20">
        <div className="max-w-[1142px] mx-auto px-6">
          <div className="text-center mb-20">
            <h1 className="text-[48px] font-bold text-[#333333] mb-6 tracking-tight">
              How BookPhysio Works
            </h1>
            <p className="text-[20px] text-[#666666] max-w-[600px] mx-auto">
              Booking expert physiotherapy has never been easier. Follow our simple four-tap process.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {STEPS.map((step, idx) => (
              <div key={idx} className="text-center p-8 bg-[#F9FBFB] rounded-[16px] border border-[#E6F4F3] hover:shadow-md transition-shadow">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#E6F4F3] flex items-center justify-center mb-6">
                  <step.icon className="w-8 h-8 text-[#00766C]" />
                </div>
                <div className="text-[13px] font-bold text-[#9CA3AF] mb-2 uppercase tracking-wider">Step {idx + 1}</div>
                <h3 className="text-[24px] font-bold text-[#00766C] mb-4">{step.title}</h3>
                <p className="text-[16px] leading-relaxed text-[#555555]">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
