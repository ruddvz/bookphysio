'use client'

import { useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, MapPin, Download, RefreshCw, X, Stethoscope, CreditCard, ArrowLeft, Video, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { cn } from '@/lib/utils'

type VisitType = 'in_clinic' | 'home_visit' | 'online'
type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'

interface AppointmentDetail {
  id: string
  visit_type: VisitType
  status: AppointmentStatus
  fee_inr: number
  telehealth_room_id: string | null
  notes: string | null
  created_at: string
  availabilities: { starts_at: string; ends_at: string; slot_duration_mins: number }
  locations: { name: string; address: string; city: string } | null
  providers: { users: { full_name: string; avatar_url: string | null } }
}

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; cls: string }> = {
  pending:   { label: 'Pending',   cls: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Confirmed', cls: 'bg-blue-100 text-blue-700'    },
  cancelled: { label: 'Cancelled', cls: 'bg-red-100 text-red-700'      },
  completed: { label: 'Completed', cls: 'bg-green-100 text-green-700'  },
  no_show:   { label: 'No Show',   cls: 'bg-gray-100 text-gray-600'    },
}

function canJoinNow(startsAt: string): boolean {
  const diff = new Date(startsAt).getTime() - Date.now()
  return diff <= 15 * 60 * 1000 && diff > -60 * 60 * 1000
}

export default function PatientAppointmentDetail() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [confirmCancel, setConfirmCancel] = useState(false)

  const { data: appt, isLoading, isError } = useQuery<AppointmentDetail>({
    queryKey: ['appointment', id],
    queryFn: async () => {
      const res = await fetch(`/api/appointments/${id}`)
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
      queryClient.invalidateQueries({ queryKey: ['appointment', id] })
      queryClient.invalidateQueries({ queryKey: ['patient-appointments'] })
      setConfirmCancel(false)
    },
  })

  if (isLoading) {
    return (
      <div className="max-w-[800px] mx-auto px-6 py-12 flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#00766C]" />
      </div>
    )
  }

  if (isError || !appt) {
    return (
      <div className="max-w-[800px] mx-auto px-6 py-12">
        <Link href="/patient/appointments" className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#666666] hover:text-[#333333] no-underline mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Appointments
        </Link>
        <p className="text-[#666666] mt-4">Appointment not found.</p>
      </div>
    )
  }

  const doctorName = appt.providers.users.full_name.startsWith('Dr.')
    ? appt.providers.users.full_name
    : `Dr. ${appt.providers.users.full_name}`
  const formattedDate = new Date(appt.availabilities.starts_at).toLocaleString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
  const refCode = `BP-${new Date(appt.created_at).getFullYear()}-${appt.id.slice(-6).toUpperCase()}`
  const status = STATUS_CONFIG[appt.status]
  const joinEnabled = appt.visit_type === 'online' && appt.status === 'confirmed' && canJoinNow(appt.availabilities.starts_at)
  const canCancel = ['pending', 'confirmed'].includes(appt.status)
  const gst = appt.fee_inr - Math.round(appt.fee_inr / 1.18)

  return (
    <div className="max-w-[800px] mx-auto px-6 py-12 animate-in fade-in duration-500 delay-100 fill-mode-both">
      <Link href="/patient/appointments" className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#666666] hover:text-[#333333] no-underline mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Appointments
      </Link>

      <h1 className="text-[32px] font-bold text-[#333333] tracking-tight mb-1">Appointment Detail</h1>
      <p className="text-[15px] text-[#666666] mb-8">
        Ref: <span className="font-mono">{refCode}</span>
      </p>

      <div className="bg-white rounded-[12px] border border-[#E5E5E5] shadow-sm p-8 mb-6">
        {/* Doctor Info */}
        <div className="flex gap-6 items-start mb-8">
          <div className="w-20 h-20 rounded-full bg-[#E6F4F3] flex items-center justify-center shrink-0 overflow-hidden">
            {appt.providers.users.avatar_url
              ? <img src={appt.providers.users.avatar_url} alt={doctorName} className="w-full h-full object-cover" />
              : <Stethoscope className="w-9 h-9 text-[#00766C]" />
            }
          </div>
          <div className="flex-1">
            <h2 className="text-[24px] font-bold text-[#333333] mb-1">{doctorName}</h2>
            <p className="text-[15px] text-[#666666] mb-4">Physiotherapist</p>

            <div className="flex flex-col gap-2">
              <p className="flex items-center gap-2 text-[16px] font-semibold text-[#00766C]">
                <CalendarDays className="w-5 h-5 shrink-0" />
                {formattedDate}
              </p>

              {appt.visit_type === 'in_clinic' && appt.locations && (
                <p className="flex items-center gap-2 text-[15px] text-[#333333]">
                  <MapPin className="w-4 h-4 text-[#666666] shrink-0" />
                  {appt.locations.name} · {appt.locations.city}
                </p>
              )}

              {appt.visit_type === 'home_visit' && (
                <p className="flex items-center gap-2 text-[15px] text-[#333333]">
                  <MapPin className="w-4 h-4 text-[#666666] shrink-0" />
                  Home Visit · Your registered address
                </p>
              )}

              {appt.visit_type === 'online' && (
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="flex items-center gap-2 text-[15px] text-[#333333]">
                    <Video className="w-4 h-4 text-[#4F46E5] shrink-0" />
                    Online Session
                  </span>
                  {joinEnabled ? (
                    <Link
                      href={`/patient/telehealth/${appt.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-full text-[13px] font-semibold transition-colors"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Join Session
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#4F46E5]/30 text-white rounded-full text-[13px] font-semibold cursor-not-allowed">
                      <Video className="w-3.5 h-3.5" />
                      Join Session
                    </span>
                  )}
                  {!joinEnabled && (
                    <span className="text-[12px] text-[#999999]">Available 15 min before</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="border-t border-[#E5E5E5] pt-5 mb-5">
          <span className={cn('inline-block text-[12px] font-semibold px-3 py-1 rounded-full', status.cls)}>
            {status.label}
          </span>
        </div>

        {/* Payment */}
        <div className="border-t border-[#E5E5E5] pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="flex items-center gap-2 text-[14px] text-[#666666] mb-1">
              <CreditCard className="w-4 h-4" />
              Total Paid
            </p>
            <p className="text-[24px] font-bold text-[#333333]">₹{appt.fee_inr.toLocaleString('en-IN')}</p>
            <p className="text-[12px] text-[#999999] mt-0.5">Incl. ₹{gst.toLocaleString('en-IN')} GST (18%)</p>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 px-5 py-2.5 border border-[#E5E5E5] rounded-lg bg-white text-[14px] font-semibold text-[#333333] hover:bg-[#F9FAFB] transition-colors cursor-pointer outline-none"
          >
            <Download className="w-4 h-4" />
            Download Receipt
          </button>
        </div>
      </div>

      {/* Session Notes */}
      {appt.notes && (
        <div className="bg-white rounded-[12px] border border-[#E5E5E5] shadow-sm p-6 mb-6">
          <h3 className="text-[15px] font-semibold text-[#333333] mb-2">Session Notes</h3>
          <p className="text-[14px] text-[#666666] leading-relaxed">{appt.notes}</p>
        </div>
      )}

      {/* Actions */}
      {canCancel && (
        <div className="flex flex-wrap gap-4">
          {!confirmCancel ? (
            <>
              <button
                type="button"
                className="flex items-center gap-2 px-6 py-3 bg-[#00766C] hover:bg-[#005A52] text-white rounded-full text-[15px] font-semibold transition-colors cursor-pointer outline-none"
              >
                <RefreshCw className="w-4 h-4" />
                Reschedule
              </button>
              <button
                type="button"
                onClick={() => setConfirmCancel(true)}
                className="flex items-center gap-2 px-6 py-3 border border-[#DC2626] text-[#DC2626] hover:bg-[#FEF2F2] rounded-full text-[15px] font-semibold transition-colors cursor-pointer outline-none"
              >
                <X className="w-4 h-4" />
                Cancel Appointment
              </button>
            </>
          ) : (
            <div className="flex items-center gap-4 p-4 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-[14px] text-[#DC2626] font-medium">Cancel this appointment?</p>
              <button
                type="button"
                onClick={() => cancelMut.mutate()}
                disabled={cancelMut.isPending}
                className="px-4 py-2 bg-[#DC2626] text-white text-[13px] font-semibold rounded-lg disabled:opacity-50 cursor-pointer"
              >
                {cancelMut.isPending ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmCancel(false)}
                className="px-4 py-2 text-[13px] font-semibold text-[#666666] hover:text-[#333333] cursor-pointer"
              >
                Keep It
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
