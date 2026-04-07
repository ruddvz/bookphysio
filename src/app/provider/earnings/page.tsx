'use client'

import { IndianRupee, TrendingUp, Wallet, Receipt, Download, Calendar, Loader2, FileText, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useState, useRef, useCallback } from 'react'

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

interface BillForm {
  patientName: string
  patientPhone: string
  date: string
  services: string
  amount: string
  notes: string
  includeGst: boolean
}

interface ProviderProfile {
  full_name: string | null
  consultation_fee_inr: number | null
  iap_registration_no: string | null
}

const EMPTY_BILL: BillForm = {
  patientName: '',
  patientPhone: '',
  date: new Date().toISOString().slice(0, 10),
  services: '',
  amount: '',
  notes: '',
  includeGst: true,
}

async function fetchAppointments(): Promise<{ appointments: AppointmentRow[] }> {
  const res = await fetch('/api/appointments')
  if (!res.ok) throw new Error('Failed to fetch appointments')
  return res.json()
}

async function fetchProviderProfile(): Promise<ProviderProfile> {
  const res = await fetch('/api/profile')
  if (!res.ok) throw new Error('Failed to fetch profile')
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

function BillPreview({ bill, providerName, providerReg }: {
  bill: BillForm
  providerName: string
  providerReg: string | null
}) {
  const amount = parseInt(bill.amount, 10) || 0
  const gst = bill.includeGst ? Math.round(amount * 0.18) : 0
  const total = amount + gst

  return (
    <div className="print-bill bg-white p-8 max-w-[600px] mx-auto">
      <div className="text-center border-b border-slate-200 pb-6 mb-6">
        <h2 className="text-[24px] font-bold text-slate-900">{providerName}</h2>
        {providerReg && <p className="text-[13px] text-slate-500">Reg. No: {providerReg}</p>}
        <p className="text-[12px] text-slate-400 mt-1">Physiotherapy Services</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 text-[14px]">
        <div>
          <p className="text-slate-500 text-[12px] uppercase font-semibold mb-1">Patient</p>
          <p className="font-semibold text-slate-900">{bill.patientName || '-'}</p>
          <p className="text-slate-500">{bill.patientPhone || '-'}</p>
        </div>
        <div className="text-right">
          <p className="text-slate-500 text-[12px] uppercase font-semibold mb-1">Date</p>
          <p className="font-semibold text-slate-900">{bill.date ? formatDate(bill.date) : '-'}</p>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-slate-500 text-[12px] uppercase font-semibold mb-2">Services Provided</p>
        <p className="text-[14px] text-slate-900 whitespace-pre-wrap">{bill.services || '-'}</p>
      </div>

      <div className="border-t border-slate-200 pt-4 space-y-2 text-[14px]">
        <div className="flex justify-between">
          <span className="text-slate-500">Subtotal</span>
          <span className="font-semibold text-slate-900">{'\u20B9'}{amount.toLocaleString('en-IN')}</span>
        </div>
        {bill.includeGst && (
          <div className="flex justify-between">
            <span className="text-slate-500">GST (18%)</span>
            <span className="font-semibold text-slate-900">{'\u20B9'}{gst.toLocaleString('en-IN')}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-slate-200 pt-2 text-[16px]">
          <span className="font-bold text-slate-900">Total</span>
          <span className="font-bold text-emerald-600">{'\u20B9'}{total.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {bill.notes && (
        <div className="mt-6 pt-4 border-t border-slate-200">
          <p className="text-slate-500 text-[12px] uppercase font-semibold mb-1">Notes</p>
          <p className="text-[13px] text-slate-700">{bill.notes}</p>
        </div>
      )}

      <div className="mt-8 pt-4 border-t border-dashed border-slate-200 text-center">
        <p className="text-[11px] text-slate-400">
          BookPhysio.in is a booking platform only. This bill is a free service for providers.
        </p>
      </div>
    </div>
  )
}

function GenerateBillModal({ onClose, providerName, providerReg }: {
  onClose: () => void
  providerName: string
  providerReg: string | null
}) {
  const [bill, setBill] = useState<BillForm>({ ...EMPTY_BILL })
  const [showPreview, setShowPreview] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const updateField = useCallback(<K extends keyof BillForm>(field: K, value: BillForm[K]) => {
    setBill((prev) => ({ ...prev, [field]: value }))
  }, [])

  function handleGeneratePdf() {
    setShowPreview(true)
    setTimeout(() => {
      window.print()
    }, 300)
  }

  const canGenerate = bill.patientName.trim().length >= 2 && bill.amount.trim().length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-[16px] shadow-2xl w-full max-w-[640px] max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-[18px] font-bold text-slate-900">Generate Bill</h2>
          <button type="button" onClick={onClose} aria-label="Close bill dialog" title="Close bill dialog" className="p-2 rounded-lg hover:bg-slate-50 text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {showPreview ? (
          <div ref={printRef}>
            <BillPreview bill={bill} providerName={providerName} providerReg={providerReg} />
            <div className="p-6 flex gap-3 print:hidden">
              <button type="button" onClick={() => setShowPreview(false)} className="flex-1 px-4 py-3 border border-slate-200 rounded-lg text-[14px] font-medium text-slate-900 hover:bg-slate-50 transition-colors">
                Edit
              </button>
              <button type="button" onClick={() => window.print()} className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg text-[14px] font-semibold hover:bg-emerald-700 transition-colors">
                Print / Save PDF
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="bill-patient-name" className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Patient Name *</label>
                <input id="bill-patient-name" type="text" value={bill.patientName} onChange={(e) => updateField('patientName', e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-lg text-[14px] text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 outline-none transition-all" placeholder="Full name" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="bill-patient-phone" className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Patient Phone</label>
                <input id="bill-patient-phone" type="tel" value={bill.patientPhone} onChange={(e) => updateField('patientPhone', e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-lg text-[14px] text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 outline-none transition-all" placeholder="+91 XXXXX XXXXX" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="bill-date" className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Date</label>
                <input id="bill-date" type="date" value={bill.date} onChange={(e) => updateField('date', e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-lg text-[14px] text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="bill-amount" className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Amount ({'\u20B9'}) *</label>
                <input id="bill-amount" type="number" inputMode="numeric" min="0" value={bill.amount} onChange={(e) => updateField('amount', e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-lg text-[14px] text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 outline-none transition-all" placeholder="e.g. 900" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="bill-services" className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Services Provided</label>
              <textarea id="bill-services" rows={3} value={bill.services} onChange={(e) => updateField('services', e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-lg text-[14px] text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 outline-none transition-all resize-none" placeholder="e.g. Shoulder rehab session, ultrasound therapy" />
            </div>

            <label className="flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={bill.includeGst}
                onChange={(e) => updateField('includeGst', e.target.checked)}
                className="w-4 h-4 accent-emerald-600"
              />
              <span className="text-[14px] text-slate-900 font-medium">Include GST (18%)</span>
            </label>

            <div className="space-y-1.5">
              <label htmlFor="bill-notes" className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Notes</label>
              <textarea id="bill-notes" rows={2} value={bill.notes} onChange={(e) => updateField('notes', e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-lg text-[14px] text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 outline-none transition-all resize-none" placeholder="Additional notes (optional)" />
            </div>

            <p className="text-[12px] text-slate-400 italic">
              BookPhysio.in is a booking platform only. This bill is a free service for providers.
            </p>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border border-slate-200 rounded-lg text-[14px] font-medium text-slate-900 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button type="button" onClick={handleGeneratePdf} disabled={!canGenerate} className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg text-[14px] font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" />
                Generate PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProviderEarnings() {
  const [showBillModal, setShowBillModal] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['provider-appointments-earnings'],
    queryFn: fetchAppointments,
  })

  const { data: profile } = useQuery({
    queryKey: ['provider-profile-bill'],
    queryFn: fetchProviderProfile,
    staleTime: 60000,
  })

  const transactions = buildTransactions(data?.appointments ?? [])
  const settledTransactions = transactions.filter((transaction) => transaction.status === 'paid')

  const totalRevenue = settledTransactions.reduce((sum, t) => sum + t.amount, 0)
  const totalGst = settledTransactions.reduce((sum, t) => sum + t.gst, 0)
  const paidOut = settledTransactions.reduce((sum, t) => sum + t.net, 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
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
          <h1 className="text-[32px] font-bold text-slate-900 tracking-tight mb-1">
            Earnings & Payouts
          </h1>
          <p className="text-[15px] text-slate-500">Track your revenue and pending payouts.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowBillModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-[14px] font-semibold hover:bg-emerald-700 transition-colors cursor-pointer outline-none"
          >
            <FileText className="w-4 h-4" />
            Generate Bill
          </button>
          <button type="button" className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-lg bg-white text-[14px] font-medium text-slate-900 hover:bg-[#F9FAFB] transition-colors cursor-pointer outline-none">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-[12px] border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-600">
              <IndianRupee className="w-5 h-5" />
            </div>
            <p className="text-[14px] font-medium text-slate-500">Total Revenue</p>
          </div>
          <p className="text-[32px] font-bold text-slate-900">{'\u20B9'}{totalRevenue.toLocaleString('en-IN')}</p>
          <p className="text-[13px] text-slate-500/60 mt-2">{settledTransactions.length} settled sessions</p>
        </div>

        <div className="bg-white rounded-[12px] border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#FEF3C7] text-[#D97706]">
              <Receipt className="w-5 h-5" />
            </div>
            <p className="text-[14px] font-medium text-slate-500">GST Collected</p>
          </div>
          <p className="text-[32px] font-bold text-slate-900">{'\u20B9'}{totalGst.toLocaleString('en-IN')}</p>
          <p className="text-[13px] text-slate-500/60 mt-2">18% GST on all sessions</p>
        </div>

        <div className="bg-white rounded-[12px] border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#EFF6FF] text-[#2563EB]">
              <Wallet className="w-5 h-5" />
            </div>
            <p className="text-[14px] font-medium text-slate-500">Net Earnings</p>
          </div>
          <p className="text-[32px] font-bold text-slate-900">{'\u20B9'}{paidOut.toLocaleString('en-IN')}</p>
          <p className="text-[13px] text-slate-500/60 mt-2">After GST deduction</p>
        </div>
      </div>

      {/* Revenue Chart Placeholder */}
      <div className="bg-white rounded-[12px] border border-slate-200 p-8 mb-10 shadow-sm relative overflow-hidden group">
        <h3 className="text-[18px] font-semibold text-slate-900 mb-6">Revenue Growth</h3>
        <div className="h-[200px] w-full bg-[#F9FAFB] rounded-lg border border-dashed border-slate-200 flex flex-col items-center justify-center gap-3">
          <TrendingUp className="w-10 h-10 text-[#CED4DA]" />
          <div className="text-center">
            <p className="text-[15px] font-medium text-slate-500">Detailed Analytics</p>
            <p className="text-[13px] text-[#9CA3AF]">Interactive charts coming soon</p>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-[12px] border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-[18px] font-semibold text-slate-900">Recent Transactions</h3>
          <div className="flex items-center gap-2 text-[14px] text-slate-500 font-medium border border-slate-200 px-3 py-1.5 rounded-lg bg-[#F9FAFB]">
            <Calendar className="w-4 h-4 text-slate-500/60" />
            {transactions.length} total
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-[#F9FAFB] border-b border-slate-200">
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
                    <td className="px-6 py-4 text-[14px] text-slate-900">{t.date}</td>
                    <td className="px-6 py-4 font-medium text-[14px] text-slate-900">{t.patient}</td>
                    <td className="px-6 py-4 text-[14px] text-slate-900 text-right">{'\u20B9'}{t.amount.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-[14px] text-slate-500 text-right">{'\u20B9'}{t.gst.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-[14px] font-bold text-emerald-600 text-right">{'\u20B9'}{t.net.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4">
                      {t.status === 'paid' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
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
                      <p className="text-[15px] font-medium text-slate-900 mb-1">No transactions yet</p>
                      <p className="text-[13px] text-[#9CA3AF]">Earnings will appear here after your first consultation.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showBillModal && (
        <GenerateBillModal
          onClose={() => setShowBillModal(false)}
          providerName={profile?.full_name ?? 'Provider'}
          providerReg={profile?.iap_registration_no ?? null}
        />
      )}
    </div>
  )
}
