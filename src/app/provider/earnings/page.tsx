import { IndianRupee, TrendingUp, Wallet, Receipt, Download } from 'lucide-react'

const kpiCards = [
  { label: 'This Month', value: '₹0', icon: IndianRupee, color: 'bg-[#E6F4F3] text-[#00766C]' },
  { label: 'GST Collected', value: '₹0', icon: Receipt, color: 'bg-[#FEF3C7] text-[#D97706]' },
  { label: 'Available for Payout', value: '₹0', icon: Wallet, color: 'bg-[#EFF6FF] text-[#2563EB]' },
]

export default function ProviderEarnings() {
  return (
    <div className="max-w-[1040px] mx-auto px-6 py-12 animate-in fade-in duration-500 delay-100 fill-mode-both">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[32px] font-bold text-[#333333] tracking-tight mb-1">
            Earnings & Payouts
          </h1>
          <p className="text-[15px] text-[#666666]">Track your revenue and pending payouts.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 border border-[#E5E5E5] rounded-lg bg-white text-[14px] font-medium text-[#333333] hover:bg-[#F9FAFB] transition-colors cursor-pointer outline-none">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {kpiCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-[12px] border border-[#E5E5E5] shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-[14px] font-medium text-[#666666]">{label}</p>
            </div>
            <p className="text-[32px] font-bold text-[#333333]">{value}</p>
          </div>
        ))}
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-[12px] border border-[#E5E5E5] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E5E5]">
              <tr>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">Patient</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">Amount (₹)</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">GST (₹)</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">Net (₹)</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full bg-[#F3F4F6] flex items-center justify-center mb-4">
                      <TrendingUp className="w-7 h-7 text-[#9CA3AF]" />
                    </div>
                    <p className="text-[15px] font-medium text-[#333333] mb-1">No recent transactions</p>
                    <p className="text-[13px] text-[#9CA3AF]">Earnings will appear here after your first consultation.</p>
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
