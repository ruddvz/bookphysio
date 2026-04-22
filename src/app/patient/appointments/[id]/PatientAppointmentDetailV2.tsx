'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  CalendarDays,
  CalendarPlus,
  CreditCard,
  Download,
  MapPin,
  RefreshCw,
  Stethoscope,
  X,
} from 'lucide-react'
import { Badge } from '@/components/dashboard/primitives/Badge'
import { Breadcrumbs } from '@/components/dashboard/primitives/Breadcrumbs'
import { formatIndiaDateTime } from '@/lib/india-date'
import { statusBadgeVariant, STATUS_LABEL } from '../appointments-utils'

type VisitType = 'in_clinic' | 'home_visit'
type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'

export interface PatientAppointmentDetailV2Props {
  appt: {
    id: string
    provider_id: string
    visit_type: VisitType
    status: AppointmentStatus
    fee_inr: number
    notes: string | null
    provider_notes: string | null
    patient_reason: string | null
    home_visit_address: string | null
    payment_status: 'created' | 'paid' | 'failed' | 'refunded' | null
    payment_amount_inr: number | null
    payment_gst_amount_inr: number | null
    created_at: string
    availabilities: { starts_at: string; ends_at: string; slot_duration_mins: number }
    locations: { name: string; address: string; city: string } | null
    providers: { users: { full_name: string; avatar_url: string | null } }
  }
  doctorName: string
  refCode: string
  canReschedule: boolean
  confirmCancel: boolean
  onReschedule: () => void
  onRequestCancel: () => void
  onKeepIt: () => void
  onConfirmCancel: () => void
  cancelPending: boolean
}

function paymentSummary(
  fee: number,
  gst: number,
  total: number,
  status: PatientAppointmentDetailV2Props['appt']['payment_status'],
): { amountLabel: string; copy: string } {
  if (status === 'paid') {
    return {
      amountLabel: 'Total Paid',
      copy: `Paid online · Consultation ₹${fee.toLocaleString('en-IN')} + GST ₹${gst.toLocaleString('en-IN')}`,
    }
  }
  if (status === 'refunded') {
    return {
      amountLabel: 'Refund Total',
      copy: `Refund issued · Original payment ₹${total.toLocaleString('en-IN')}`,
    }
  }
  if (status === 'created') {
    return {
      amountLabel: 'Payment Pending',
      copy: `Online payment initiated · Amount ₹${total.toLocaleString('en-IN')}`,
    }
  }
  if (status === 'failed') {
    return {
      amountLabel: 'Payment Failed',
      copy: `Online payment failed · Consultation ₹${fee.toLocaleString('en-IN')} + GST ₹${gst.toLocaleString('en-IN')}`,
    }
  }
  return {
    amountLabel: 'Amount Due',
    copy: `Consultation ₹${fee.toLocaleString('en-IN')} + GST ₹${gst.toLocaleString('en-IN')} · Pay during the visit`,
  }
}

export function PatientAppointmentDetailV2({
  appt,
  doctorName,
  refCode,
  canReschedule,
  confirmCancel,
  onReschedule,
  onRequestCancel,
  onKeepIt,
  onConfirmCancel,
  cancelPending,
}: PatientAppointmentDetailV2Props) {
  const formattedDate = formatIndiaDateTime(appt.availabilities.starts_at, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  const gst = appt.payment_gst_amount_inr ?? Math.round(appt.fee_inr * 0.18)
  const totalDue = appt.payment_amount_inr ?? (appt.fee_inr + gst)
  const { amountLabel, copy: summaryCopy } = paymentSummary(
    appt.fee_inr,
    gst,
    totalDue,
    appt.payment_status,
  )
  const providerNotes = appt.provider_notes ?? appt.notes
  const statusVariant = statusBadgeVariant(appt.status)
  const statusLabel = STATUS_LABEL[appt.status] ?? appt.status

  return (
    <div
      data-testid="patient-appointment-detail-v2"
      className="mx-auto max-w-[820px] px-4 py-8 sm:px-6 sm:py-10"
    >
      <Breadcrumbs
        role="patient"
        items={[
          { label: 'Appointments', href: '/patient/appointments' },
          { label: `Ref ${refCode}` },
        ]}
        className="mb-4"
      />

      <Link
        href="/patient/appointments"
        className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-bold text-[var(--color-pt-primary)] transition-opacity hover:opacity-80"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to visits
      </Link>

      <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-pt-muted)]">
            Visit detail
          </div>
          <h1 className="text-[26px] font-black tracking-tight text-[var(--color-pt-ink)] sm:text-[32px]">
            {doctorName}
          </h1>
          <p className="mt-1 flex items-center gap-2 text-[14px] font-medium text-[var(--color-pt-muted)]">
            Ref <span className="font-mono text-[var(--color-pt-ink)]">{refCode}</span>
          </p>
        </div>
        <Badge role="patient" variant={statusVariant} className="self-start sm:self-end">
          {statusLabel}
        </Badge>
      </header>

      <section
        aria-label="Visit summary"
        className="mb-5 rounded-[var(--sq-lg)] border border-[var(--color-pt-border-soft)] bg-white p-5 sm:p-6"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[var(--sq-lg)] border border-[var(--color-pt-border-soft)] bg-[var(--color-pt-tile-1-bg)]">
            {appt.providers?.users?.avatar_url ? (
              <Image
                src={appt.providers.users.avatar_url}
                width={80}
                height={80}
                alt={doctorName}
                className="h-full w-full object-cover"
              />
            ) : (
              <Stethoscope className="h-8 w-8 text-[var(--color-pt-primary)]" aria-hidden />
            )}
          </div>
          <div className="flex-1">
            <p className="flex items-center gap-2 text-[16px] font-bold text-[var(--color-pt-primary)]">
              <CalendarDays className="h-4 w-4" aria-hidden />
              {formattedDate}
            </p>
            {appt.visit_type === 'in_clinic' && appt.locations ? (
              <p className="mt-2 flex items-start gap-2 text-[13px] font-medium text-[var(--color-pt-ink)]">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-pt-muted)]" aria-hidden />
                <span>
                  <span className="block font-bold">{appt.locations.name}</span>
                  <span className="text-[var(--color-pt-muted)]">
                    {appt.locations.address}, {appt.locations.city}
                  </span>
                </span>
              </p>
            ) : null}
            {appt.visit_type === 'home_visit' ? (
              <p className="mt-2 flex items-center gap-2 text-[13px] font-medium text-[var(--color-pt-ink)]">
                <MapPin className="h-4 w-4 shrink-0 text-[var(--color-pt-muted)]" aria-hidden />
                Home visit · {appt.home_visit_address ?? 'Your registered address'}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section
        aria-label="Payment summary"
        className="mb-5 rounded-[var(--sq-lg)] border border-[var(--color-pt-border-soft)] bg-white p-5 sm:p-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--color-pt-muted)]">
              <CreditCard className="h-3.5 w-3.5 text-[var(--color-pt-primary)]" aria-hidden />
              {amountLabel}
            </p>
            <p className="mt-1 text-[28px] font-black tabular-nums tracking-tight text-[var(--color-pt-ink)] sm:text-[34px]">
              ₹{totalDue.toLocaleString('en-IN')}
            </p>
            <p className="mt-1 text-[12px] font-medium text-[var(--color-pt-muted)]">{summaryCopy}</p>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--color-pt-border)] bg-white px-5 py-2.5 text-[13px] font-bold text-[var(--color-pt-ink)] transition-colors hover:bg-[var(--color-pt-tile-1-bg)]"
          >
            <Download className="h-4 w-4" aria-hidden />
            {appt.payment_status === 'paid' ? 'Download receipt' : 'Download confirmation'}
          </button>
        </div>
      </section>

      {appt.patient_reason ? (
        <section
          aria-label="Your booking notes"
          className="mb-5 rounded-[var(--sq-lg)] border border-[var(--color-pt-border-soft)] bg-[var(--color-pt-surface)] p-5 sm:p-6"
        >
          <h2 className="mb-2 text-[13px] font-bold tracking-tight text-[var(--color-pt-ink)]">
            Your booking notes
          </h2>
          <p className="text-[14px] leading-relaxed text-[var(--color-pt-body)]">
            {appt.patient_reason}
          </p>
        </section>
      ) : null}

      {providerNotes ? (
        <section
          aria-label="Physiotherapist notes"
          className="mb-5 rounded-[var(--sq-lg)] border border-[var(--color-pt-border-soft)] bg-[var(--color-pt-surface)] p-5 sm:p-6"
        >
          <h2 className="mb-2 text-[13px] font-bold tracking-tight text-[var(--color-pt-ink)]">
            Physiotherapist notes
          </h2>
          <p className="text-[14px] italic leading-relaxed text-[var(--color-pt-body)]">
            &ldquo;{providerNotes}&rdquo;
          </p>
        </section>
      ) : null}

      {canReschedule ? (
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {!confirmCancel ? (
            <>
              <button
                type="button"
                onClick={onReschedule}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--color-pt-primary)] px-6 py-3.5 text-[14px] font-bold text-white shadow-md transition-opacity hover:opacity-90 sm:flex-[2]"
              >
                <RefreshCw className="h-4 w-4" aria-hidden />
                Reschedule with {doctorName}
              </button>
              <button
                type="button"
                onClick={onRequestCancel}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-rose-300 px-6 py-3.5 text-[14px] font-bold text-rose-600 transition-colors hover:bg-rose-50"
              >
                <X className="h-4 w-4" aria-hidden />
                Cancel visit
              </button>
            </>
          ) : (
            <div className="flex w-full flex-col gap-4 rounded-[var(--sq-lg)] border-2 border-rose-200 bg-rose-50 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[15px] font-bold text-rose-700">Cancel this visit?</p>
                <p className="text-[12px] font-medium text-rose-600/80">
                  You can rebook anytime — this action cannot be undone.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onConfirmCancel}
                  disabled={cancelPending}
                  className="inline-flex items-center justify-center rounded-full bg-rose-600 px-5 py-2.5 text-[13px] font-bold text-white shadow-md transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {cancelPending ? 'Processing…' : 'Yes, cancel'}
                </button>
                <button
                  type="button"
                  onClick={onKeepIt}
                  className="inline-flex items-center justify-center rounded-full border border-[var(--color-pt-border)] bg-white px-5 py-2.5 text-[13px] font-bold text-[var(--color-pt-ink)] transition-colors hover:bg-[var(--color-pt-tile-1-bg)]"
                >
                  Keep it
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {appt.status === 'completed' || appt.status === 'cancelled' ? (
        <div className="mt-6">
          <Link
            href={`/book/${appt.provider_id}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-pt-primary)] px-6 py-3.5 text-[14px] font-bold text-white shadow-md transition-opacity hover:opacity-90"
          >
            <CalendarPlus className="h-4 w-4" aria-hidden />
            Book follow-up with {doctorName}
          </Link>
        </div>
      ) : null}
    </div>
  )
}
