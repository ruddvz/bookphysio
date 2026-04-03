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
          <h1 className="text-[32px] font-bold text-bp-primary tracking-tight mb-1">
            Earnings & Payouts
          </h1>
          <p className="text-[15px] text-bp-body">Track your revenue and pending payouts.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 border border-bp-border rounded-lg bg-white text-[14px] font-medium text-bp-primary hover:bg-[#F9FAFB] transition-colors cursor-pointer outline-none">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-[12px] border border-bp-border shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-bp-accent/10 text-bp-accent">
              <IndianRupee className="w-5 h-5" />
            </div>
            <p className="text-[14px] font-medium text-bp-body">This Month</p>
          </div>
          <p className="text-[32px] font-bold text-bp-primary">₹{SUMMARY.thisMonth}</p>
          <div className="flex items-center gap-1 mt-2 text-[13px] text-bp-accent font-medium">
            <ArrowUpRight className="w-4 h-4" />
            <span>12% from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-[12px] border border-bp-border shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#FEF3C7] text-[#D97706]">
              <Receipt className="w-5 h-5" />
            </div>
            <p className="text-[14px] font-medium text-bp-body">GST Collected</p>
          </div>
          <p className="text-[32px] font-bold text-bp-primary">₹{SUMMARY.gstCollected}</p>
          <p className="text-[13px] text-bp-body/60 mt-2">18% GST on all sessions</p>
        </div>

        <div className="bg-white rounded-[12px] border border-bp-border shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#EFF6FF] text-[#2563EB]">
              <Wallet className="w-5 h-5" />
            </div>
            <p className="text-[14px] font-medium text-bp-body">Payout Available</p>
          </div>
          <p className="text-[32px] font-bold text-bp-primary">₹{SUMMARY.payoutAvailable}</p>
          <button className="text-[13px] text-[#2563EB] font-semibold hover:underline mt-2">
            Withdraw Funds
          </button>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="bg-white rounded-[12px] border border-bp-border p-8 mb-10 shadow-sm relative overflow-hidden group">
        <h3 className="text-[18px] font-semibold text-bp-primary mb-6">Revenue Growth</h3>
        <div className="h-[200px] w-full bg-[#F9FAFB] rounded-lg border border-dashed border-bp-border flex flex-col items-center justify-center gap-3">
          <TrendingUp className="w-10 h-10 text-[#CED4DA]" />
          <div className="text-center">
            <p className="text-[15px] font-medium text-bp-body">Detailed Analytics</p>
            <p className="text-[13px] text-[#9CA3AF]">Interactive charts arriving in Phase 9</p>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-5deg] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
             <span className="bg-bp-accent text-white text-[12px] font-bold px-3 py-1 rounded-full shadow-lg">COMING SOON</span>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-[12px] border border-bp-border overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-bp-border flex items-center justify-between">
          <h3 className="text-[18px] font-semibold text-bp-primary">Recent Transactions</h3>
          <div className="flex items-center gap-2 text-[14px] text-bp-body font-medium border border-bp-border px-3 py-1.5 rounded-lg bg-[#F9FAFB]">
             <Calendar className="w-4 h-4 text-bp-body/60" />
             Mar 2026
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-[#F9FAFB] border-b border-bp-border">
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
                    <td className="px-6 py-4 text-[14px] text-bp-primary">{t.date}</td>
                    <td className="px-6 py-4 font-medium text-[14px] text-bp-primary">{t.patient}</td>
                    <td className="px-6 py-4 text-[14px] text-bp-primary text-right">₹{t.amount}</td>
                    <td className="px-6 py-4 text-[14px] text-bp-body text-right">₹{t.gst}</td>
                    <td className="px-6 py-4 text-[14px] font-bold text-bp-accent text-right">₹{t.net}</td>
                    <td className="px-6 py-4">
                      {t.status === 'paid' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-bp-accent/10 text-bp-accent border border-bp-accent/10">
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
                      <p className="text-[15px] font-medium text-bp-primary mb-1">No recent transactions</p>
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
