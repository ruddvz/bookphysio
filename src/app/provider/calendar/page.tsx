import Link from 'next/link'
import { CalendarDays, ChevronLeft, ChevronRight, Settings } from 'lucide-react'

export default function ProviderCalendar() {
  return (
    <div className="max-w-[1040px] mx-auto px-6 py-12 animate-in fade-in duration-500 delay-100 fill-mode-both">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-[32px] font-bold text-[#333333] tracking-tight">
          Calendar
        </h1>
        <Link
          href="/provider/availability"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00766C] hover:bg-[#005A52] text-white rounded-full no-underline text-[14px] font-semibold transition-colors"
        >
          <Settings className="w-4 h-4" />
          Manage Availability
        </Link>
      </div>

      <div className="bg-white rounded-[12px] border border-[#E5E5E5] shadow-sm h-[600px] flex flex-col overflow-hidden">
        {/* Calendar Header */}
        <div className="p-6 border-b border-[#E5E5E5] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="w-9 h-9 flex items-center justify-center border border-[#E5E5E5] rounded-lg bg-white hover:bg-[#F9FAFB] transition-colors cursor-pointer outline-none">
              <ChevronLeft className="w-5 h-5 text-[#333333]" />
            </button>
            <span className="text-[18px] font-semibold text-[#333333]">March 2026</span>
            <button className="w-9 h-9 flex items-center justify-center border border-[#E5E5E5] rounded-lg bg-white hover:bg-[#F9FAFB] transition-colors cursor-pointer outline-none">
              <ChevronRight className="w-5 h-5 text-[#333333]" />
            </button>
          </div>
          <div className="flex gap-1">
            <button className="px-4 py-2 bg-[#333333] text-white rounded-lg text-[14px] font-medium cursor-pointer outline-none">
              Day
            </button>
            <button className="px-4 py-2 border border-[#E5E5E5] bg-transparent text-[#666666] rounded-lg text-[14px] font-medium hover:bg-[#F9FAFB] transition-colors cursor-pointer outline-none">
              Week
            </button>
          </div>
        </div>

        {/* Empty Calendar Grid */}
        <div className="flex-1 flex items-center justify-center bg-[#F9FAFB]">
          <div className="text-center px-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-white border border-[#E5E5E5] flex items-center justify-center mb-5">
              <CalendarDays className="w-8 h-8 text-[#9CA3AF]" />
            </div>
            <p className="text-[16px] font-semibold text-[#374151] mb-2">No appointments today</p>
            <p className="text-[14px] text-[#6B7280]">Sync your Google Calendar or add availability to get booked.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
