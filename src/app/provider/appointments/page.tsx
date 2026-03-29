import { CalendarDays, Search, Filter, Clock, Video, MapPin } from 'lucide-react'

export default function ProviderAppointments() {
  return (
    <div className="max-w-[1040px] mx-auto px-6 py-12 animate-in fade-in duration-500 delay-100 fill-mode-both">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-[32px] font-bold text-[#333333] tracking-tight mb-1">
            Appointments
          </h1>
          <p className="text-[15px] text-[#666666]">Manage your upcoming and past consultations.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input 
              type="search" 
              placeholder="Search..." 
              className="w-[200px] pl-10 pr-4 py-2.5 rounded-full border border-[#E5E5E5] bg-white text-[14px] text-[#333333] focus:border-[#00766C] focus:ring-1 focus:ring-[#00766C] outline-none transition-shadow"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-[#E5E5E5] rounded-lg bg-white text-[14px] font-medium text-[#333333] hover:bg-[#F9FAFB] transition-colors cursor-pointer outline-none">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[12px] border border-[#E5E5E5] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E5E5]">
              <tr>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">Patient</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">Time</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full bg-[#F3F4F6] flex items-center justify-center mb-4">
                      <CalendarDays className="w-7 h-7 text-[#9CA3AF]" />
                    </div>
                    <p className="text-[15px] font-medium text-[#333333] mb-1">No appointments found</p>
                    <p className="text-[13px] text-[#9CA3AF]">Past and upcoming appointments will appear here.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
