'use client'

import { useQuery } from '@tanstack/react-query'
import { CreditCard, Download, Loader2, AlertCircle, CheckCircle2, XCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Payment {
  id: string
  appointment_id: string
  amount_inr: number
  gst_amount_inr: number
  status: 'created' | 'paid' | 'failed' | 'refunded'
  razorpay_payment_id: string | null
  created_at: string
  visit_type: string
  provider_name: string | null
  starts_at: string | null
}

const STATUS_CONFIG = {
  paid:      { label: 'Paid',      cls: 'bg-green-100 text-green-700',  icon: CheckCircle2 },
  created:   { label: 'Pending',   cls: 'bg-yellow-100 text-yellow-700', icon: Clock       },
  failed:    { label: 'Failed',    cls: 'bg-red-100 text-red-700',      icon: XCircle     },
  refunded:  { label: 'Refunded', cls: 'bg-blue-100 text-blue-700',    icon: Download    },
} as const

export default function PatientPayments() {
  const { data, isLoading, isError } = useQuery<{ payments: Payment[] }>({
    queryKey: ['patient-payments'],
    queryFn: async () => {
      const res = await fetch('/api/payments')
      if (!res.ok) throw new Error('Failed to load')
      return res.json()
    },
  })

  const payments = data?.payments ?? []

  return (
    <div className="max-w-[1040px] mx-auto px-6 py-12 animate-in fade-in duration-500 delay-100 fill-mode-both">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[32px] font-bold text-[#333333] tracking-tight mb-1">Payment History</h1>
          <p className="text-[15px] text-[#666666]">Track all your consultation payments and receipts.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#00766C]" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <AlertCircle className="w-10 h-10 text-red-400" />
          <p className="text-[15px] text-[#666666]">Could not load payment history.</p>
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-[12px] border border-[#E5E5E5] overflow-hidden shadow-sm">
          <div className="py-16 text-center">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-[#F3F4F6] flex items-center justify-center mb-4">
                <CreditCard className="w-7 h-7 text-[#9CA3AF]" />
              </div>
              <p className="text-[15px] font-medium text-[#333333] mb-1">No payment history</p>
              <p className="text-[13px] text-[#9CA3AF]">Your payment records will appear here after your first consultation.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[12px] border border-[#E5E5E5] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E5E5]">
                <tr>
                  <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">Doctor</th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">Amount (₹)</th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">GST (₹)</th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider text-right">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {payments.map(p => {
                  const cfg = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.created
                  const StatusIcon = cfg.icon
                  const dateStr = p.starts_at
                    ? new Date(p.starts_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                  const providerLabel = p.provider_name
                    ? (p.provider_name.startsWith('Dr.') ? p.provider_name : `Dr. ${p.provider_name}`)
                    : '—'
                  const visitLabel = p.visit_type === 'in_clinic' ? 'In Clinic' : 'Home Visit'

                  return (
                    <tr key={p.id} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="px-6 py-4 text-[14px] text-[#333333]">{dateStr}</td>
                      <td className="px-6 py-4 text-[14px] font-medium text-[#333333]">{providerLabel}</td>
                      <td className="px-6 py-4 text-[14px] text-[#666666]">{visitLabel}</td>
                      <td className="px-6 py-4 text-[14px] font-semibold text-[#333333]">
                        ₹{(p.amount_inr).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-[14px] text-[#666666]">
                        ₹{(p.gst_amount_inr).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn('inline-flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-1 rounded-full', cfg.cls)}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/patient/appointments/${p.appointment_id}`}
                          className="text-[13px] font-semibold text-[#00766C] hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
