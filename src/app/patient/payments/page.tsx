'use client'

import { useQuery } from '@tanstack/react-query'
import { CreditCard, Download, Activity, Wallet, Receipt, AlertCircle, CheckCircle2, XCircle, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  PageHeader,
  StatTile,
  SectionCard,
  ListRow,
  EmptyState,
} from '@/components/dashboard/primitives'
import { useUiV2 } from '@/hooks/useUiV2'
import { PatientPaymentsLedger } from './PatientPaymentsLedger'

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
  paid:      { label: 'Paid',      color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: CheckCircle2 },
  created:   { label: 'Pending',   color: 'text-amber-600 bg-amber-50 border-amber-100',       icon: Clock        },
  failed:    { label: 'Failed',    color: 'text-rose-600 bg-rose-50 border-rose-100',          icon: XCircle      },
  refunded:  { label: 'Refunded', color: 'text-blue-600 bg-blue-50 border-blue-100',          icon: Download     },
} as const

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function PatientPayments() {
  const uiV2 = useUiV2()
  const { data, isLoading, isError, refetch } = useQuery<{ payments: Payment[] }>({
    queryKey: ['patient-payments'],
    queryFn: async () => {
      const res = await fetch('/api/payments')
      if (!res.ok) throw new Error('Failed to load')
      return res.json()
    },
  })

  const payments = data?.payments ?? []
  
  const totalPaid = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount_inr, 0)
    
  const pendingAmount = payments
    .filter(p => p.status === 'created')
    .reduce((sum, p) => sum + p.amount_inr, 0)

  const thisMonthPaid = payments
    .filter(p => p.status === 'paid' && new Date(p.created_at).getMonth() === new Date().getMonth())
    .reduce((sum, p) => sum + p.amount_inr, 0)

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8">
      <PageHeader
        role="patient"
        kicker="FINANCE"
        title="Payment history"
        subtitle="Track all your consultation payments and receipts"
      />

      {/* Stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          role="patient"
          icon={Wallet}
          label="Total Spent"
          value={`₹${totalPaid.toLocaleString('en-IN')}`}
          tone={1}
        />
        <StatTile
          role="patient"
          icon={Activity}
          label="This Month"
          value={`₹${thisMonthPaid.toLocaleString('en-IN')}`}
          tone={2}
        />
        <StatTile
          role="patient"
          icon={Clock}
          label="Pending"
          value={`₹${pendingAmount.toLocaleString('en-IN')}`}
          tone={3}
        />
        <StatTile
          role="patient"
          icon={Receipt}
          label="Tax Paid"
          value={`₹${payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.gst_amount_inr, 0).toLocaleString('en-IN')}`}
          tone={5}
        />
      </div>

      <SectionCard role="patient" title="Recent transactions">
        {isLoading ? (
          <div className="space-y-4 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 w-full animate-pulse bg-slate-50 rounded-[var(--sq-sm)]" />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            role="patient"
            icon={AlertCircle}
            title="Couldn't load payments"
            description="There was an error fetching your transaction history."
            cta={{ label: 'Retry', onClick: () => refetch() }}
          />
        ) : payments.length === 0 ? (
          <EmptyState
            role="patient"
            icon={CreditCard}
            title="No payments yet"
            description="Your transaction records will appear here after your first consultation."
            cta={{ label: 'Book a visit', href: '/search' }}
          />
        ) : uiV2 ? (
          <PatientPaymentsLedger payments={payments} />
        ) : (
          <div className="divide-y divide-[var(--color-pt-border-soft)]">
            {payments.map((p) => {
              const cfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.created
              return (
                <ListRow
                  key={p.id}
                  role="patient"
                  icon={Receipt}
                  tone={p.status === 'paid' ? 1 : 1}
                  primary={p.provider_name ? (p.provider_name.startsWith('Dr.') ? p.provider_name : `Dr. ${p.provider_name}`) : 'Provider'}
                  secondary={`${formatDate(p.starts_at || p.created_at)} · ${p.visit_type === 'in_clinic' ? 'Clinic visit' : 'Home session'}`}
                  right={
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-[14px] font-bold text-slate-900">
                          ₹{p.amount_inr.toLocaleString('en-IN')}
                        </div>
                        <div className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full border mt-1 inline-block", cfg.color)}>
                          {cfg.label}
                        </div>
                      </div>
                      <Link
                         href={`/patient/appointments/${p.appointment_id}`}
                         className="p-2 text-slate-300 hover:text-[var(--color-pt-primary)] transition-colors"
                      >
                         <ArrowRight size={18} />
                      </Link>
                    </div>
                  }
                />
              )
            })}
          </div>
        )}
      </SectionCard>
    </div>
  )
}

