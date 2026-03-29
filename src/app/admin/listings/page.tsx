import { FileCheck, Eye, CheckCircle, XCircle, Clock } from 'lucide-react'

export default function AdminListings() {
  return (
    <div className="flex flex-col gap-8">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-bold text-[#333333] tracking-tight mb-1">
            Provider Approval Queue
          </h1>
          <p className="text-[15px] text-[#666666]">Review and approve provider applications.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-[#FFF7ED] border border-[#FED7AA] rounded-full">
          <Clock className="w-4 h-4 text-[#C2410C]" />
          <span className="text-[14px] font-semibold text-[#C2410C]">342 Pending</span>
        </div>
      </div>

      <div className="bg-white rounded-[12px] border border-[#E5E5E5] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E5E5]">
              <tr>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">Provider</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">ICP #</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">City</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">Submitted</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              <tr className="hover:bg-[#F9FAFB] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#E6F4F3] flex items-center justify-center text-[#00766C] font-bold text-[13px]">
                      AK
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-[#333333]">Dr. Arun K</p>
                      <p className="text-[13px] text-[#9CA3AF]">Sports Physiotherapy</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-[14px] font-mono text-[#666666]">ICP-MH-12345</td>
                <td className="px-6 py-4 text-[14px] text-[#666666]">Mumbai</td>
                <td className="px-6 py-4 text-[14px] text-[#666666]">2 hours ago</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-semibold bg-orange-50 text-orange-700">
                    <Clock className="w-3 h-3" />
                    Pending
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 text-[#666666] hover:text-[#00766C] hover:bg-[#E6F4F3] rounded-lg transition-colors cursor-pointer outline-none" title="View Documents">
                      <Eye className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-[#666666] hover:text-[#059669] hover:bg-[#F0FDF4] rounded-lg transition-colors cursor-pointer outline-none" title="Approve">
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-[#666666] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg transition-colors cursor-pointer outline-none" title="Reject">
                      <XCircle className="w-5 h-5" />
                    </button>
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
