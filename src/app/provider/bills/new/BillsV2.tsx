'use client'

import { Badge } from '@/components/dashboard/primitives/Badge'
import { Sparkline } from '@/components/dashboard/primitives/Sparkline'

export interface GstLineItemChipsProps {
  subtotal: number
  includeGst: boolean
}

function formatInr(n: number): string {
  return `₹${n.toLocaleString('en-IN')}`
}

/**
 * v2 GST summary chips for the invoice builder (slice 16.31).
 */
export function GstLineItemChips({ subtotal, includeGst }: GstLineItemChipsProps) {
  const gst = Math.round(subtotal * 0.18)
  const total = includeGst ? subtotal + gst : subtotal

  return (
    <div
      data-testid="gst-line-item-chips"
      className="flex flex-wrap items-center gap-2 pt-2"
      aria-label="GST and totals"
    >
      <Badge role="provider" variant="soft" tone={1}>
        Subtotal {formatInr(subtotal)}
      </Badge>
      {includeGst ? (
        <>
          <Badge role="provider" variant="warning">
            GST 18% +{formatInr(gst)}
          </Badge>
          <Badge role="provider" variant="success">
            Total {formatInr(total)}
          </Badge>
        </>
      ) : (
        <Badge role="provider" variant="soft" tone={3}>
          GST waived
        </Badge>
      )}
      <Badge role="provider" variant="outline">
        GSTIN compliant
      </Badge>
    </div>
  )
}

export interface BillV2SidebarProps {
  invoiceNumber: string
  patientName: string
}

/**
 * v2 billing context sidebar with sparkline (slice 16.31).
 */
export function BillV2Sidebar({ invoiceNumber, patientName }: BillV2SidebarProps) {
  return (
    <div
      data-testid="bill-v2-sidebar"
      className="rounded-[var(--sq-lg)] border border-[var(--color-pv-border-soft)] bg-[var(--color-pv-surface)] p-4 sm:p-5"
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        Billing Trend · Last 7 sessions
      </p>
      <div className="mt-3">
        <Sparkline
          role="provider"
          values={[400, 550, 620, 480, 700, 820, 760]}
          width={220}
          height={36}
          ariaLabel="Billing trend last 7 sessions"
        />
      </div>
      <dl className="mt-4 space-y-2 text-[13px]">
        <div className="flex justify-between gap-4">
          <dt className="font-semibold text-slate-500">Invoice number</dt>
          <dd data-testid="bill-sidebar-invoice" className="font-bold text-slate-900 truncate">
            {invoiceNumber}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="font-semibold text-slate-500">Patient name</dt>
          <dd data-testid="bill-sidebar-patient" className="font-bold text-slate-900 truncate">
            {patientName || '—'}
          </dd>
        </div>
      </dl>
    </div>
  )
}
