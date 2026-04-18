'use client'

import { useParams, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, MapPin, Download, RefreshCw, X, Stethoscope, CreditCard, ArrowLeft, Loader2, CalendarPlus } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { canPatientCancelAppointment } from '@/lib/appointments/cancellation'
import { formatIndiaDateTime } from '@/lib/india-date'
import { cn } from '@/lib/utils'
import { useUiV2 } from '@/hooks/useUiV2'
import RescheduleModal from './RescheduleModal'
import { PatientAppointmentDetailV2 } from './PatientAppointmentDetailV2'

type VisitType = 'in_clinic' | 'home_visit'
type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'

interface AppointmentDetail {
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

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; cls: string }> = {
  pending:   { label: 'Pending',   cls: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Confirmed', cls: 'bg-bp-accent/10 text-bp-accent'    },
  cancelled: { label: 'Cancelled', cls: 'bg-red-100 text-red-700'      },
  completed: { label: 'Completed', cls: 'bg-green-100 text-green-700'  },
  no_show:   { label: 'No Show',   cls: 'bg-bp-surface text-bp-body'    },
}

const SECTION_CARD_CLS = "bg-white rounded-[32px] border border-bp-border shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-8 mb-6"

export default function PatientAppointmentDetail() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const rescheduleParam = searchParams.get('reschedule') === 'true'
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [showReschedule, setShowReschedule] = useState(rescheduleParam)
  const uiV2 = useUiV2()

  const { data: appt, isLoading, isError } = useQuery<AppointmentDetail>({
    queryKey: ['appointment', 'patient', id],
    queryFn: async () => {
      const res = await fetch(`/api/appointments/${id}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Not found')
      return res.json()
    },
    enabled: !!id,
  })

  const cancelMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      })
      if (!res.ok) throw new Error('Cancel failed')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointment', 'patient', id] })
      queryClient.invalidateQueries({ queryKey: ['patient-appointments'] })
      setConfirmCancel(false)
    },
  })

  // Compute reschedule eligibility — gate modal rendering behind this
  const canReschedule = appt
    ? appt.payment_status !== 'paid' && canPatientCancelAppointment(appt.status, appt.availabilities.starts_at)
    : false

  if (isLoading) {
    return (
      <div className="max-w-[800px] mx-auto px-6 py-12 flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-bp-accent" />
      </div>
    )
  }

  if (isError || !appt) {
    return (
      <div className="max-w-[800px] mx-auto px-6 py-12">
        <Link href="/patient/appointments" className="inline-flex items-center gap-1.5 text-[14px] font-medium text-bp-body hover:text-bp-primary no-underline mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Appointments
        </Link>
        <p className="text-bp-body mt-4">Appointment not found.</p>
      </div>
    )
  }

  const providerName = appt.providers?.users?.full_name ?? 'Doctor'
  const doctorName = providerName.startsWith('Dr.')
    ? providerName
    : `Dr. ${providerName}`
  const formattedDate = formatIndiaDateTime(appt.availabilities.starts_at, {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
  const refCode = `BP-${new Date(appt.created_at).getFullYear()}-${appt.id.slice(-6).toUpperCase()}`
  const status = STATUS_CONFIG[appt.status]
  const canCancel = canReschedule
  const gst = appt.payment_gst_amount_inr ?? Math.round(appt.fee_inr * 0.18)
  const totalDue = appt.payment_amount_inr ?? (appt.fee_inr + gst)
  const paymentStatus = appt.payment_status
  const summaryAmountLabel = paymentStatus === 'paid'
    ? 'Total Paid'
    : paymentStatus === 'refunded'
      ? 'Refund Total'
      : paymentStatus === 'created'
        ? 'Payment Pending'
        : paymentStatus === 'failed'
          ? 'Payment Failed'
          : 'Amount Due'
  const summaryCopy = paymentStatus === 'paid'
    ? `Paid online · Consultation ₹${appt.fee_inr.toLocaleString('en-IN')} + GST ₹${gst.toLocaleString('en-IN')}`
    : paymentStatus === 'refunded'
      ? `Refund issued · Original payment ₹${totalDue.toLocaleString('en-IN')}`
      : paymentStatus === 'created'
        ? `Online payment initiated · Amount ₹${totalDue.toLocaleString('en-IN')}`
        : paymentStatus === 'failed'
          ? `Online payment failed · Consultation ₹${appt.fee_inr.toLocaleString('en-IN')} + GST ₹${gst.toLocaleString('en-IN')}`
          : `Consultation ₹${appt.fee_inr.toLocaleString('en-IN')} + GST ₹${gst.toLocaleString('en-IN')} · Pay during the visit`
  const providerNotes = appt.provider_notes ?? appt.notes

  const rescheduleModal = showReschedule && canCancel ? (
    <RescheduleModal
      appointmentId={appt.id}
      providerId={appt.provider_id}
      providerName={doctorName}
      currentSlotDate={appt.availabilities.starts_at}
      onClose={() => setShowReschedule(false)}
      onSuccess={() => setShowReschedule(false)}
    />
  ) : null

  if (uiV2) {
    return (
      <>
        <PatientAppointmentDetailV2
          appt={appt}
          doctorName={doctorName}
          refCode={refCode}
          canReschedule={canCancel}
          confirmCancel={confirmCancel}
          onReschedule={() => setShowReschedule(true)}
          onRequestCancel={() => setConfirmCancel(true)}
          onKeepIt={() => setConfirmCancel(false)}
          onConfirmCancel={() => cancelMut.mutate()}
          cancelPending={cancelMut.isPending}
        />
        {rescheduleModal}
      </>
    )
  }

  return (
    <div className="max-w-[800px] mx-auto px-6 py-12 animate-in fade-in duration-500 delay-100 fill-mode-both">
      <Link href="/patient/appointments" className="inline-flex items-center gap-1.5 text-[14px] font-medium text-bp-accent hover:text-bp-primary no-underline mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Appointments
      </Link>

      <h1 className="text-[32px] sm:text-[40px] font-bold text-bp-primary tracking-tighter mb-1">Appointment Detail</h1>
      <p className="text-[15px] text-bp-body mb-10">
        Ref: <span className="font-mono bg-bp-surface px-2 py-0.5 rounded-md">{refCode}</span>
      </p>

      <div className={SECTION_CARD_CLS}>
        {/* Doctor Info */}
        <div className="flex flex-col sm:flex-row gap-6 items-start mb-8">
          <div className="w-24 h-24 rounded-[32px] bg-bp-accent/10 border border-[#E0EFEE] flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
            {appt.providers?.users?.avatar_url
              ? <Image src={appt.providers.users.avatar_url} width={96} height={96} alt={doctorName} className="w-full h-full object-cover" />
              : <Stethoscope className="w-10 h-10 text-bp-accent" />
            }
          </div>
          <div className="flex-1">
            <h2 className="text-[24px] font-bold text-bp-primary tracking-tight mb-1">{doctorName}</h2>
            <p className="text-[15px] text-bp-body font-medium mb-4">Physiotherapist Specialist</p>

            <div className="flex flex-col gap-3">
              <p className="flex items-center gap-2.5 text-[18px] font-bold text-bp-accent">
                <CalendarDays className="w-5 h-5 shrink-0" />
                {formattedDate}
              </p>

              {appt.visit_type === 'in_clinic' && appt.locations && (
                <p className="flex items-start gap-2.5 text-[15px] text-bp-primary font-medium leading-snug">
                  <MapPin className="w-5 h-5 text-bp-body shrink-0 mt-0.5" />
                  <span>
                    <span className="block font-bold">{appt.locations.name}</span>
                    <span className="text-bp-body">{appt.locations.address}, {appt.locations.city}</span>
                  </span>
                </p>
              )}

              {appt.visit_type === 'home_visit' && (
                <p className="flex items-center gap-2.5 text-[15px] text-bp-primary font-medium">
                  <MapPin className="w-5 h-5 text-bp-body shrink-0" />
                  Home Visit · {appt.home_visit_address ?? 'Your registered address'}
                </p>
              )}
            </div>
          </div>
          <div className="shrink-0">
            <span className={cn('inline-flex items-center text-[12px] font-bold tracking-wider uppercase px-4 py-1.5 rounded-full border', 
              appt.status === 'confirmed' ? 'bg-bp-accent/10 text-bp-accent border-bp-accent/10' : 
              appt.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
              appt.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
              'bg-bp-surface text-bp-body border-bp-border'
            )}>
              {status.label}
            </span>
          </div>
        </div>

        {/* Payment Detail Section */}
        <div className="border-t border-[#F0F0F0] pt-8 mt-8 flex flex-col sm:flex-row justify-between items-end gap-6">
          <div className="w-full sm:w-auto">
            <p className="flex items-center gap-2 text-[14px] text-bp-body font-semibold mb-2">
              <CreditCard className="w-4 h-4 text-bp-accent" />
              Payment Summary
            </p>
            <div className="space-y-1">
              <div className="flex justify-between sm:block">
                <span className="text-[14px] text-bp-body/60 sm:hidden">{summaryAmountLabel}</span>
                <p className="text-[32px] font-bold text-bp-primary leading-none tracking-tighter">₹{totalDue.toLocaleString('en-IN')}</p>
              </div>
              <p className="text-[12px] text-bp-body/60 font-medium">{summaryCopy}</p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => window.print()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 border-2 border-bp-border rounded-[20px] bg-white text-[14px] font-bold text-bp-primary hover:bg-[#F9FAFB] hover:border-bp-primary/20 transition-all cursor-pointer outline-none"
          >
            <Download className="w-4 h-4" />
            {paymentStatus === 'paid' ? 'Download Receipt' : 'Download Confirmation'}
          </button>
        </div>
      </div>

      {/* Book Follow-Up CTA — shown for completed/confirmed appointments */}
      {(appt.status === 'completed' || appt.status === 'confirmed') && (
        <div className={cn(SECTION_CARD_CLS, 'flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#E6F4F3] border-bp-accent/20')}>
          <div>
            <p className="text-[16px] font-bold text-bp-primary tracking-tight">Need another session?</p>
            <p className="text-[14px] text-bp-body/70 font-medium mt-0.5">Book a follow-up with {doctorName}</p>
          </div>
          <Link
            href={`/book/${appt.provider_id}`}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-bp-accent hover:bg-bp-primary text-white rounded-full text-[14px] font-bold shadow-[0_4px_12px_rgba(0,118,108,0.2)] transition-all hover:-translate-y-0.5"
          >
            <RefreshCw className="w-4 h-4" />
            Book follow-up
          </Link>
        </div>
      )}

      {appt.patient_reason && (
        <div className={cn(SECTION_CARD_CLS, "bg-bp-surface border-none")}>
          <h3 className="text-[16px] font-bold text-bp-primary tracking-tight mb-3">Your Booking Notes</h3>
          <p className="text-[15px] text-[#444444] leading-relaxed">{appt.patient_reason}</p>
        </div>
      )}

      {providerNotes && (
        <div className={cn(SECTION_CARD_CLS, "bg-bp-surface border-none")}>
          <h3 className="text-[16px] font-bold text-bp-primary tracking-tight mb-3">Physiotherapist Notes</h3>
          <p className="text-[15px] text-[#444444] leading-relaxed italic">&ldquo;{providerNotes}&rdquo;</p>
        </div>
      )}

      {/* Actions */}
      {canCancel && (
        <div className="flex flex-col sm:flex-row gap-4 mt-12">
          {!confirmCancel ? (
            <>
              <button
                type="button"
                onClick={() => setShowReschedule(true)}
                className="flex-[2] flex items-center justify-center gap-2 px-8 py-5 bg-bp-accent hover:bg-bp-primary text-white rounded-[32px] text-[16px] font-bold tracking-tight shadow-[0_8px_16px_rgba(0,118,108,0.15)] transition-all hover:-translate-y-0.5 cursor-pointer outline-none"
              >
                <RefreshCw className="w-5 h-5" />
                Reschedule with {doctorName}
              </button>
              <button
                type="button"
                onClick={() => setConfirmCancel(true)}
                className="flex-1 flex items-center justify-center gap-2 px-8 py-5 border-2 border-[#DC2626] text-[#DC2626] hover:bg-[#FEF2F2] rounded-[32px] text-[16px] font-bold tracking-tight transition-all cursor-pointer outline-none"
              >
                <X className="w-5 h-5" />
                Cancel
              </button>
            </>
          ) : (
            <div className="w-full p-8 bg-red-50 border-2 border-red-100 rounded-[32px] animate-in slide-in-from-top-4 duration-300">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-center sm:text-left">
                  <p className="text-[18px] text-[#DC2626] font-bold mb-1">Are you sure you want to cancel?</p>
                  <p className="text-[14px] text-red-600/70 font-medium">This action cannot be undone once confirmed.</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => cancelMut.mutate()}
                    disabled={cancelMut.isPending}
                    className="flex-1 sm:flex-initial px-8 py-3 bg-[#DC2626] text-white text-[15px] font-bold rounded-full shadow-lg shadow-red-200 disabled:opacity-50 cursor-pointer transition-transform hover:scale-105"
                  >
                    {cancelMut.isPending ? 'Processing...' : 'Yes, Cancel'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmCancel(false)}
                    className="flex-1 sm:flex-initial px-8 py-3 bg-white text-[15px] font-bold text-bp-body border border-bp-border rounded-full cursor-pointer hover:bg-bp-surface transition-colors"
                  >
                    Keep It
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Book follow-up — visible for completed or cancelled appointments */}
      {(appt.status === 'completed' || appt.status === 'cancelled') && (
        <div className="mt-8">
          <Link
            href={`/book/${appt.provider_id}`}
            className="w-full flex items-center justify-center gap-2.5 px-8 py-5 bg-bp-accent hover:bg-bp-primary text-white rounded-[32px] text-[16px] font-bold tracking-tight shadow-[0_8px_16px_rgba(0,118,108,0.15)] transition-all hover:-translate-y-0.5"
          >
            <CalendarPlus className="w-5 h-5" />
            Book follow-up with {doctorName}
          </Link>
        </div>
      )}

      {rescheduleModal}
    </div>
  )
}
