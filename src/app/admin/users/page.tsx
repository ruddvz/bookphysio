import { Search, MoreVertical, Ban, Eye } from 'lucide-react'

export default function AdminUsers() {
  return (
    <div className="flex flex-col gap-8">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-[32px] font-bold text-[#333333] tracking-tight mb-2">
            User Management
          </h1>
          <p className="text-[16px] text-[#666666]">
            Manage patients and platform providers.
          </p>
        </div>
        
        <div className="relative shrink-0">
          <input 
            type="search" 
            placeholder="Search phone, name or ID..." 
            className="w-full md:w-[320px] pl-11 pr-4 py-2.5 rounded-full border border-[#E5E5E5] bg-white text-[14px] text-[#333333] focus:border-[#00766C] focus:ring-1 focus:ring-[#00766C] outline-none transition-shadow"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#E5E5E5]">
        <nav className="flex gap-8">
          <button className="py-4 text-[15px] font-semibold text-[#00766C] border-b-2 border-[#00766C] outline-none cursor-pointer">
            Patients
          </button>
          <button className="py-4 text-[15px] font-medium text-[#666666] border-b-2 border-transparent hover:text-[#333333] hover:border-[#E5E5E5] transition-colors outline-none cursor-pointer">
            Providers
          </button>
          <button className="py-4 text-[15px] font-medium text-[#666666] border-b-2 border-transparent hover:text-[#333333] hover:border-[#E5E5E5] transition-colors outline-none cursor-pointer">
            Suspended
          </button>
        </nav>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-[12px] border border-[#E5E5E5] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E5E5]">
              <tr>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">Last Active</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              
              {/* Row 1 */}
              <tr className="hover:bg-[#F9FAFB] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#E6F4F3] text-[#00766C] font-bold">
                      RV
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-[#333333]">Rahul Verma</p>
                      <p className="text-[13px] text-[#9CA3AF]">ID: USR-8892</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-[14px] text-[#333333] mb-0.5">+91 98765 00000</p>
                  <p className="text-[13px] text-[#666666]">rahul@example.com</p>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-semibold bg-blue-50 text-blue-700">
                    Patient
                  </span>
                </td>
                <td className="px-6 py-4 text-[14px] text-[#666666]">
                  10 mins ago
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      title="View Details"
                      className="p-2 text-[#666666] hover:text-[#00766C] hover:bg-[#E6F4F3] rounded-lg transition-colors outline-none cursor-pointer"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button 
                      title="Suspend User"
                      className="p-2 text-[#666666] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg transition-colors outline-none cursor-pointer"
                    >
                      <Ban className="w-5 h-5" />
                    </button>
                    <button 
                      title="More Actions"
                      className="p-2 text-[#666666] hover:bg-[#E5E5E5] rounded-lg transition-colors outline-none cursor-pointer"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
              
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#E5E5E5] bg-white">
          <p className="text-[14px] text-[#666666]">
            Showing <span className="font-semibold text-[#333333]">1</span> to <span className="font-semibold text-[#333333]">1</span> of <span className="font-semibold text-[#333333]">8,921</span> users
          </p>
          <div className="flex gap-2">
            <button disabled className="px-4 py-2 text-[14px] font-medium text-[#9CA3AF] border border-[#E5E5E5] rounded-lg bg-[#F9FAFB] cursor-not-allowed">
              Previous
            </button>
            <button className="px-4 py-2 text-[14px] font-medium text-[#333333] border border-[#E5E5E5] rounded-lg hover:bg-[#F9FAFB] transition-colors outline-none cursor-pointer">
              Next
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
