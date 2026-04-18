'use client'

import { Receipt, Building2, Home, Video } from 'lucide-react'
import Link from 'next/link'
import { useUiV2 } from '@/hooks/useUiV2'
import { Badge } from '@/components/dashboard/primitives/Badge'
import {
  groupPaymentsByMonth,
  statusBadgeVariant,
  formatInr,
  formatPaymentDate,
  providerDisplayName,
  visitTypeLabel,
  PAYMENT_STATUS_LABEL,
  type PaymentItem,
} from './payments-utils'

export interface PatientPaymentsLedgerProps {
  payments: PaymentItem[]
}

function VisitIcon({ visitType }: { visitType: string }) {
  if (visitType === 'home_visit') return <Home size={14} aria-hidden />
  if (visitType === 'video') return <Video size={14} aria-hidden />
  return <Building2 size={14} aria-hidden />
}

/**
 * Month-grouped v2 payments ledger for the patient surface.
 *
 * Self-gates behind `useUiV2()` — returns `null` in v1 so the existing
 * SectionCard list renders byte-identically. Each row shows provider name,
 * visit type, date, total amount, and a GST breakdown line. Status uses the
 * shared `Badge` primitive so colour tokens stay consistent with the patient
 * dashboard family.
 */
export function PatientPaymentsLedger({ payments }: PatientPaymentsLedgerProps) {
  const v2 = useUiV2()
  if (!v2) return null

  const months = groupPaymentsByMonth(payments)
  if (months.length === 0) return null

  return (
    <ol
      data-testid="patient-payments-ledger"
      aria-label="Payment ledger grouped by month"
      className="flex flex-col gap-6"
      data-ui-version="v2"
    >
      {months.map((month) => (
        <li key={month.key} className="flex flex-col gap-2">
          {/* Month header */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className="inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-pt-primary)]"
              />
              <span className="text-[13px] font-bold tracking-tight text-[var(--color-pt-ink)]">
                {month.label}
              </span>
            </div>
            {month.totalPaid > 0 && (
              <span
                data-testid="month-total"
                className="text-[13px] font-bold tabular-nums text-[var(--color-pt-primary)]"
              >
                {formatInr(month.totalPaid)} paid
              </span>
            )}
          </div>

          {/* Payment rows */}
          <div className="flex flex-col divide-y divide-[var(--color-pt-border-soft)] overflow-hidden rounded-[var(--sq-lg)] border border-[var(--color-pt-border-soft)] bg-white">
            {month.items.map((payment) => {
              const status = payment.status
              const statusLabel = PAYMENT_STATUS_LABEL[status] ?? status
              const variant = statusBadgeVariant(status)
              const base = payment.amount_inr - payment.gst_amount_inr

              return (
                <article
                  key={payment.id}
                  data-testid="ledger-row"
                  data-payment-id={payment.id}
                  className="flex items-center gap-4 px-4 py-3.5"
                >
                  {/* Receipt icon */}
                  <div
                    aria-hidden
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--sq-sm)] bg-[var(--color-pt-tile-1-bg)] text-[var(--color-pt-primary)]"
                  >
                    <Receipt size={16} strokeWidth={2.2} />
                  </div>

                  {/* Provider + status + date */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[14px] font-bold tracking-tight text-[var(--color-pt-ink)]">
                        {providerDisplayName(payment)}
                      </span>
                      <Badge role="patient" variant={variant}>
                        {statusLabel}
                      </Badge>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[12px] font-medium text-[var(--color-pt-muted)]">
                      <VisitIcon visitType={payment.visit_type} />
                      <span>{visitTypeLabel(payment.visit_type)}</span>
                      <span aria-hidden>·</span>
                      <span>{formatPaymentDate(payment.starts_at ?? payment.created_at)}</span>
                    </div>
                  </div>

                  {/* Amount + GST breakdown + view link */}
                  <div className="flex shrink-0 flex-col items-end gap-0.5">
                    <span className="text-[15px] font-bold tabular-nums text-[var(--color-pt-ink)]">
                      {formatInr(payment.amount_inr)}
                    </span>
                    {payment.gst_amount_inr > 0 && (
                      <span
                        data-testid="gst-line"
                        className="text-[11px] font-medium tabular-nums text-[var(--color-pt-muted)]"
                        aria-label={`base ${formatInr(base)}, GST ${formatInr(payment.gst_amount_inr)}`}
                      >
                        incl. GST {formatInr(payment.gst_amount_inr)}
                      </span>
                    )}
                    <Link
                      href={`/patient/appointments/${payment.appointment_id}`}
                      className="mt-0.5 text-[11px] font-bold text-[var(--color-pt-primary)] hover:underline"
                      aria-label={`View appointment for ${providerDisplayName(payment)}`}
                    >
                      View →
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        </li>
      ))}
    </ol>
  )
}
