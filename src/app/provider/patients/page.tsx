import { Search, Users, Eye } from 'lucide-react'

export default function ProviderPatients() {
  return (
    <div className="max-w-[1040px] mx-auto px-6 py-12 animate-in fade-in duration-500 delay-100 fill-mode-both">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-[32px] font-bold text-bp-primary tracking-tight mb-1">
            Patient Records
          </h1>
          <p className="text-[15px] text-bp-body">View and manage your patient directory.</p>
        </div>
        <div className="relative shrink-0">
          <input 
            type="search" 
            placeholder="Search patients..." 
            className="w-full md:w-[280px] pl-11 pr-4 py-2.5 rounded-full border border-bp-border bg-white text-[14px] text-bp-primary focus:border-bp-accent focus:ring-1 focus:ring-[#00766C] outline-none transition-shadow"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
        </div>
      </div>

      <div className="bg-white rounded-[12px] border border-bp-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-[#F9FAFB] border-b border-bp-border">
              <tr>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">Patient</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">Phone (+91)</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">Last Visit</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">Total Visits</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="py-16 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full bg-[#F3F4F6] flex items-center justify-center mb-4">
                      <Users className="w-7 h-7 text-[#9CA3AF]" />
                    </div>
                    <p className="text-[15px] font-medium text-bp-primary mb-1">No patients in your directory</p>
                    <p className="text-[13px] text-[#9CA3AF]">Patients will appear here after their first appointment.</p>
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
