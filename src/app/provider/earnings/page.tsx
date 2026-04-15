"use client"

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  Download,
  FileText,
  IndianRupee,
  Receipt,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import {
  PageHeader,
  StatTile,
  SectionCard,
  EmptyState,
} from '@/components/dashboard/primitives'

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

function formatDate(iso: string): string {
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
  const { data, isLoading, isError, refetch } = useQuery({
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
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-20 bg-slate-100 rounded-[var(--sq-lg)] w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-100 rounded-[var(--sq-lg)]" />)}
          </div>
          <div className="h-64 bg-slate-100 rounded-[var(--sq-lg)]" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <EmptyState
          role="provider"
          icon={TrendingUp}
          title="Ledger sync error"
          description="We couldn't fetch your financial data at this time."
          cta={{ label: 'Reload workspace', onClick: refetch }}
        />
      </div>
    )
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8">
      <PageHeader
        role="provider"
        kicker="FINANCIALS"
        title="Ledger & Earnings"
        subtitle="Monitor clinical revenue, settlement logs, and taxation performance"
        action={{
          label: 'Export Statement',
          icon: Download,
          onClick: () => { /* export logic */ }
        }}
      />

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <StatTile
          role="provider"
          tone={1}
          icon={IndianRupee}
          label="Total Revenue"
          value={`₹${totalRevenue.toLocaleString('en-IN')}`}
          delta={{ value: 'Gross cumulative', positive: true }}
        />
        <StatTile
          role="provider"
          tone={3}
          icon={Receipt}
          label="Tax Collected"
          value={`₹${totalGst.toLocaleString('en-IN')}`}
          delta={{ value: '18% GST', positive: true }}
        />
        <StatTile
          role="provider"
          tone={4}
          icon={Wallet}
          label="Net Payout"
          value={`₹${paidOut.toLocaleString('en-IN')}`}
          delta={{ value: 'Settled amount', positive: true }}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr,340px] gap-6">
        <div className="space-y-6 lg:space-y-8">
          {/* Revenue Chart Placeholder */}
          <SectionCard
             role="provider"
             title="Revenue Growth"
             action={{ label: 'Live Analytics', href: '#' }}
          >
             <div className="h-[240px] border-2 border-dashed border-slate-100 rounded-[var(--sq-lg)] flex flex-col items-center justify-center text-center p-8">
                <TrendingUp className="text-slate-200 mb-4" size={32} />
               <p className="text-[14px] font-bold text-slate-400">Interactive charts will be activated after 10 confirmed sessions.</p>
             </div>
          </SectionCard>

          {/* Clinical Ledger Table */}
          <SectionCard
             role="provider"
             title="Clinical Ledger"
             className="overflow-hidden"
          >
            <div className="overflow-x-auto -mx-6">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--color-pv-track-bg)] border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Profile</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Revenue</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Settled</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {transactions.length > 0 ? (
                    transactions.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4 text-[13px] font-bold text-slate-700">{t.date}</td>
                        <td className="px-6 py-4 text-[13px] font-bold text-slate-900">{t.patient}</td>
                        <td className="px-6 py-4 text-[13px] font-bold text-slate-700 text-right">₹{t.amount.toLocaleString('en-IN')}</td>
                        <td className="px-6 py-4 text-[14px] font-bold text-[var(--color-pv-primary)] text-right">₹{t.net.toLocaleString('en-IN')}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                            t.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${t.status === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 border-0">
                        <EmptyState
                          role="provider"
                          icon={Wallet}
                          title="No transactions yet"
                          description="Perform sessions to see your earnings log here."
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard role="provider" title="Quick Actions">
            <div className="space-y-3">
              <Link
                href="/provider/bills/new"
                className="flex items-center gap-3 w-full p-4 rounded-[var(--sq-sm)] border border-slate-100 hover:border-[var(--color-pv-primary)] hover:bg-slate-50 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-white transition-all">
                  <FileText size={18} />
                </div>
                <div className="text-left">
                  <div className="text-[14px] font-bold text-slate-900">Issue Invoice</div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-widest font-bold">New billing log</div>
                </div>
              </Link>
            </div>
          </SectionCard>

          <SectionCard role="provider" title="Payout Details">
            <div className="space-y-4">
              <div className="p-4 rounded-[var(--sq-sm)] bg-[var(--color-pv-track-bg)] border border-slate-100">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Last payout</div>
                <div className="text-[18px] font-bold text-slate-900">₹0.00</div>
              </div>
              <p className="text-[12px] text-slate-500 leading-relaxed">
                Settlements are processed every Thursday for the previous week&apos;s completed clinical sessions.
              </p>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
