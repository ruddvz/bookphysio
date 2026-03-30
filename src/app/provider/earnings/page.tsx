'use client'

import { IndianRupee, TrendingUp, Wallet, Receipt, Download, ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react'
import { useState } from 'react'

const TRANSACTIONS = [
  { id: '1', date: '28 Mar 2026', patient: 'Rahul Sharma', amount: 800, gst: 144, net: 656, status: 'paid' },
  { id: '2', date: '27 Mar 2026', patient: 'Priya Patel', amount: 1200, gst: 216, net: 984, status: 'pending' },
  { id: '3', date: '25 Mar 2026', patient: 'Amit Kumar', amount: 800, gst: 144, net: 656, status: 'paid' },
  { id: '4', date: '24 Mar 2026', patient: 'Sneha Gupta', amount: 1500, gst: 270, net: 1230, status: 'paid' },
  { id: '5', date: '22 Mar 2026', patient: 'Vikram Singh', amount: 1000, gst: 180, net: 820, status: 'paid' },
]

const SUMMARY = {
  thisMonth: TRANSACTIONS.reduce((acc, t) => acc + t.amount, 0),
  gstCollected: TRANSACTIONS.reduce((acc, t) => acc + t.gst, 0),
  payoutAvailable: 4500, // Static mock for now
}

export default function ProviderEarnings() {
  const [transactions] = useState(TRANSACTIONS)

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
        <div className="bg-white rounded-[12px] border border-[#E5E5E5] shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#E6F4F3] text-[#00766C]">
              <IndianRupee className="w-5 h-5" />
            </div>
            <p className="text-[14px] font-medium text-[#666666]">This Month</p>
          </div>
          <p className="text-[32px] font-bold text-[#333333]">₹{SUMMARY.thisMonth}</p>
          <div className="flex items-center gap-1 mt-2 text-[13px] text-[#00766C] font-medium">
            <ArrowUpRight className="w-4 h-4" />
            <span>12% from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-[12px] border border-[#E5E5E5] shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#FEF3C7] text-[#D97706]">
              <Receipt className="w-5 h-5" />
            </div>
            <p className="text-[14px] font-medium text-[#666666]">GST Collected</p>
          </div>
          <p className="text-[32px] font-bold text-[#333333]">₹{SUMMARY.gstCollected}</p>
          <p className="text-[13px] text-[#999999] mt-2">18% GST on all sessions</p>
        </div>

        <div className="bg-white rounded-[12px] border border-[#E5E5E5] shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#EFF6FF] text-[#2563EB]">
              <Wallet className="w-5 h-5" />
            </div>
            <p className="text-[14px] font-medium text-[#666666]">Payout Available</p>
          </div>
          <p className="text-[32px] font-bold text-[#333333]">₹{SUMMARY.payoutAvailable}</p>
          <button className="text-[13px] text-[#2563EB] font-semibold hover:underline mt-2">
            Withdraw Funds
          </button>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="bg-white rounded-[12px] border border-[#E5E5E5] p-8 mb-10 shadow-sm relative overflow-hidden group">
        <h3 className="text-[18px] font-semibold text-[#333333] mb-6">Revenue Growth</h3>
        <div className="h-[200px] w-full bg-[#F9FAFB] rounded-lg border border-dashed border-[#E5E5E5] flex flex-col items-center justify-center gap-3">
          <TrendingUp className="w-10 h-10 text-[#CED4DA]" />
          <div className="text-center">
            <p className="text-[15px] font-medium text-[#666666]">Detailed Analytics</p>
            <p className="text-[13px] text-[#9CA3AF]">Interactive charts arriving in Phase 9</p>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-5deg] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
             <span className="bg-[#00766C] text-white text-[12px] font-bold px-3 py-1 rounded-full shadow-lg">COMING SOON</span>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-[12px] border border-[#E5E5E5] overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-[#E5E5E5] flex items-center justify-between">
          <h3 className="text-[18px] font-semibold text-[#333333]">Recent Transactions</h3>
          <div className="flex items-center gap-2 text-[14px] text-[#666666] font-medium border border-[#E5E5E5] px-3 py-1.5 rounded-lg bg-[#F9FAFB]">
             <Calendar className="w-4 h-4 text-[#999999]" />
             Mar 2026
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E5E5]">
              <tr>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">Patient</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider text-right">Amount</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider text-right">GST (18%)</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider text-right">Net Earning</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {transactions.length > 0 ? (
                transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-6 py-4 text-[14px] text-[#333333]">{t.date}</td>
                    <td className="px-6 py-4 font-medium text-[14px] text-[#333333]">{t.patient}</td>
                    <td className="px-6 py-4 text-[14px] text-[#333333] text-right">₹{t.amount}</td>
                    <td className="px-6 py-4 text-[14px] text-[#666666] text-right">₹{t.gst}</td>
                    <td className="px-6 py-4 text-[14px] font-bold text-[#00766C] text-right">₹{t.net}</td>
                    <td className="px-6 py-4">
                      {t.status === 'paid' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E6F4F3] text-[#00766C] border border-[#00766C]/10">
                          Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#D97706] border border-[#D97706]/10">
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
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
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
