import { CalendarDays, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function PatientAppointments() {
  return (
    <div className="max-w-[1142px] mx-auto px-6 py-12 animate-in fade-in duration-500 delay-100 fill-mode-both">
      <h1 className="text-[32px] font-bold text-[#333333] tracking-tight mb-8">
        Appointments
      </h1>

      {/* Tabs */}
      <div className="mb-8 border-b border-[#E5E5E5]">
        <nav className="flex gap-8" aria-label="Tabs">
          <button className="py-4 text-[15px] font-semibold text-[#00766C] border-b-2 border-[#00766C] outline-none cursor-pointer">
            Upcoming
          </button>
          <button className="py-4 text-[15px] font-medium text-[#666666] border-b-2 border-transparent hover:text-[#333333] hover:border-[#E5E5E5] transition-colors outline-none cursor-pointer">
            Past
          </button>
        </nav>
      </div>

      {/* Empty State */}
      <div className="bg-white border border-[#E5E5E5] rounded-[12px] shadow-sm py-16 px-8 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#F3F4F6] flex items-center justify-center mb-5">
          <CalendarDays className="w-8 h-8 text-[#9CA3AF]" />
        </div>
        <h2 className="text-[20px] font-bold text-[#333333] mb-2">
          No upcoming appointments
        </h2>
        <p className="text-[15px] text-[#666666] mb-6">
          When you book an appointment, it will show up here.
        </p>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#00766C] hover:bg-[#005A52] text-white rounded-full no-underline font-semibold text-[15px] transition-colors"
        >
          Find a Physiotherapist
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
