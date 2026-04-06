'use client'

import { IndianRupee, TrendingUp, Wallet, Receipt, Download, Calendar, Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

interface AppointmentRow {
  id: string
  fee_inr: number
  status: string
  created_at: string
  visit_type: string
  payment_status: 'created' | 'paid' | 'failed' | 'refunded' | null
  payment_amount_inr: number | null
  payment_gst_amount_inr: number | null
  patient: { full_name: string; avatar_url: string | null } | null
  availabilities: { starts_at: string } | null
}

interface Transaction {
  id: string
  date: string
  patient: string
  amount: number
  gst: number
  net: number
  status: 'paid' | 'pending'
}

async function fetchAppointments(): Promise<{ appointments: AppointmentRow[] }> {
  const res = await fetch('/api/appointments')
  if (!res.ok) throw new Error('Failed to fetch appointments')
  return res.json()
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function buildTransactions(appointments: AppointmentRow[]): Transaction[] {
  return appointments
    .filter((a) => ['completed', 'confirmed'].includes(a.status))
    .sort((a, b) => {
      const dateA = a.availabilities?.starts_at || a.created_at
      const dateB = b.availabilities?.starts_at || b.created_at
      return new Date(dateB).getTime() - new Date(dateA).getTime()
    })
    .map((a) => {
      const gst = a.payment_gst_amount_inr ?? Math.round(a.fee_inr * 0.18)
      const net = a.payment_amount_inr != null ? a.payment_amount_inr - gst : a.fee_inr

      return {
        id: a.id,
        date: formatDate(a.availabilities?.starts_at || a.created_at),
        patient: a.patient?.full_name || 'Unknown',
        amount: a.fee_inr,
        gst,
        net,
        status: a.payment_status === 'paid' ? 'paid' as const : 'pending' as const,
      }
    })
}

export default function ProviderEarnings() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['provider-appointments-earnings'],
    queryFn: fetchAppointments,
  })

  const transactions = buildTransactions(data?.appointments ?? [])
  const settledTransactions = transactions.filter((transaction) => transaction.status === 'paid')

  const totalRevenue = settledTransactions.reduce((sum, t) => sum + t.amount, 0)
  const totalGst = settledTransactions.reduce((sum, t) => sum + t.gst, 0)
  const paidOut = settledTransactions.reduce((sum, t) => sum + t.net, 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-bp-accent" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="max-w-[1040px] mx-auto px-6 py-12">
        <p className="text-center text-red-500 font-bold">Failed to load earnings data. Please refresh.</p>
      </div>
    )
  }

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
            <p className="text-[14px] font-medium text-bp-body">Total Revenue</p>
          </div>
          <p className="text-[32px] font-bold text-bp-primary">₹{totalRevenue.toLocaleString('en-IN')}</p>
          <p className="text-[13px] text-bp-body/60 mt-2">{settledTransactions.length} settled sessions</p>
        </div>

        <div className="bg-white rounded-[12px] border border-bp-border shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#FEF3C7] text-[#D97706]">
              <Receipt className="w-5 h-5" />
            </div>
            <p className="text-[14px] font-medium text-bp-body">GST Collected</p>
          </div>
          <p className="text-[32px] font-bold text-bp-primary">₹{totalGst.toLocaleString('en-IN')}</p>
          <p className="text-[13px] text-bp-body/60 mt-2">18% GST on all sessions</p>
        </div>

        <div className="bg-white rounded-[12px] border border-bp-border shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#EFF6FF] text-[#2563EB]">
              <Wallet className="w-5 h-5" />
            </div>
            <p className="text-[14px] font-medium text-bp-body">Net Earnings</p>
          </div>
          <p className="text-[32px] font-bold text-bp-primary">₹{paidOut.toLocaleString('en-IN')}</p>
          <p className="text-[13px] text-bp-body/60 mt-2">After GST deduction</p>
        </div>
      </div>

      {/* Revenue Chart Placeholder */}
      <div className="bg-white rounded-[12px] border border-bp-border p-8 mb-10 shadow-sm relative overflow-hidden group">
        <h3 className="text-[18px] font-semibold text-bp-primary mb-6">Revenue Growth</h3>
        <div className="h-[200px] w-full bg-[#F9FAFB] rounded-lg border border-dashed border-bp-border flex flex-col items-center justify-center gap-3">
          <TrendingUp className="w-10 h-10 text-[#CED4DA]" />
          <div className="text-center">
            <p className="text-[15px] font-medium text-bp-body">Detailed Analytics</p>
            <p className="text-[13px] text-[#9CA3AF]">Interactive charts coming soon</p>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-[12px] border border-bp-border overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-bp-border flex items-center justify-between">
          <h3 className="text-[18px] font-semibold text-bp-primary">Recent Transactions</h3>
          <div className="flex items-center gap-2 text-[14px] text-bp-body font-medium border border-bp-border px-3 py-1.5 rounded-lg bg-[#F9FAFB]">
            <Calendar className="w-4 h-4 text-bp-body/60" />
            {transactions.length} total
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
                    <td className="px-6 py-4 text-[14px] text-bp-primary text-right">₹{t.amount.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-[14px] text-bp-body text-right">₹{t.gst.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-[14px] font-bold text-bp-accent text-right">₹{t.net.toLocaleString('en-IN')}</td>
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
                      <p className="text-[15px] font-medium text-bp-primary mb-1">No transactions yet</p>
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
