'use client'

import { useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, MapPin, Download, RefreshCw, X, Stethoscope, CreditCard, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { cn } from '@/lib/utils'

type VisitType = 'in_clinic' | 'home_visit'
type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'

interface AppointmentDetail {
  id: string
  visit_type: VisitType
  status: AppointmentStatus
  fee_inr: number
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

const SECTION_CARD_CLS = "bg-white rounded-[32px] border border-[#E5E5E5] shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-8 mb-6"

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
  const canCancel = ['pending', 'confirmed'].includes(appt.status)
  const gst = appt.fee_inr - Math.round(appt.fee_inr / 1.18)

  return (
    <div className="max-w-[800px] mx-auto px-6 py-12 animate-in fade-in duration-500 delay-100 fill-mode-both">
      <Link href="/patient/appointments" className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#00766C] hover:text-[#005A52] no-underline mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Appointments
      </Link>

      <h1 className="text-[32px] sm:text-[40px] font-black text-bp-primary tracking-tighter mb-1">Appointment Detail</h1>
      <p className="text-[15px] text-[#666666] mb-10">
        Ref: <span className="font-mono bg-[#F5F5F5] px-2 py-0.5 rounded-md">{refCode}</span>
      </p>

      <div className={SECTION_CARD_CLS}>
        {/* Doctor Info */}
        <div className="flex flex-col sm:flex-row gap-6 items-start mb-8">
          <div className="w-24 h-24 rounded-[32px] bg-[#E6F4F3] border border-[#E0EFEE] flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
            {appt.providers.users.avatar_url
              ? <img src={appt.providers.users.avatar_url} alt={doctorName} className="w-full h-full object-cover" />
              : <Stethoscope className="w-10 h-10 text-[#00766C]" />
            }
          </div>
          <div className="flex-1">
            <h2 className="text-[24px] font-black text-bp-primary tracking-tight mb-1">{doctorName}</h2>
            <p className="text-[15px] text-[#666666] font-medium mb-4">Physiotherapist Specialist</p>

            <div className="flex flex-col gap-3">
              <p className="flex items-center gap-2.5 text-[18px] font-bold text-[#00766C]">
                <CalendarDays className="w-5 h-5 shrink-0" />
                {formattedDate}
              </p>

              {appt.visit_type === 'in_clinic' && appt.locations && (
                <p className="flex items-start gap-2.5 text-[15px] text-bp-primary font-medium leading-snug">
                  <MapPin className="w-5 h-5 text-[#666666] shrink-0 mt-0.5" />
                  <span>
                    <span className="block font-bold">{appt.locations.name}</span>
                    <span className="text-[#666666]">{appt.locations.address}, {appt.locations.city}</span>
                  </span>
                </p>
              )}

              {appt.visit_type === 'home_visit' && (
                <p className="flex items-center gap-2.5 text-[15px] text-bp-primary font-medium">
                  <MapPin className="w-5 h-5 text-[#666666] shrink-0" />
                  Home Visit · Your registered address
                </p>
              )}
            </div>
          </div>
          <div className="shrink-0">
            <span className={cn('inline-flex items-center text-[12px] font-black tracking-wider uppercase px-4 py-1.5 rounded-full border', 
              appt.status === 'confirmed' ? 'bg-[#E6F4F3] text-[#00766C] border-[#00766C]/10' : 
              appt.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
              appt.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
              'bg-gray-50 text-gray-600 border-gray-200'
            )}>
              {status.label}
            </span>
          </div>
        </div>

        {/* Payment Detail Section */}
        <div className="border-t border-[#F0F0F0] pt-8 mt-8 flex flex-col sm:flex-row justify-between items-end gap-6">
          <div className="w-full sm:w-auto">
            <p className="flex items-center gap-2 text-[14px] text-[#666666] font-semibold mb-2">
              <CreditCard className="w-4 h-4 text-[#00766C]" />
              Payment Summary
            </p>
            <div className="space-y-1">
              <div className="flex justify-between sm:block">
                <span className="text-[14px] text-[#999999] sm:hidden">Total Amount</span>
                <p className="text-[32px] font-black text-bp-primary leading-none tracking-tighter">₹{appt.fee_inr.toLocaleString('en-IN')}</p>
              </div>
              <p className="text-[12px] text-[#999999] font-medium">Incl. ₹{gst.toLocaleString('en-IN')} GST (18%) · Secure Payment</p>
            </div>
          </div>
          
          <button
            type="button"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#E5E5E5] rounded-[20px] bg-white text-[14px] font-bold text-bp-primary hover:bg-[#F9FAFB] hover:border-bp-primary/20 transition-all cursor-pointer outline-none"
          >
            <Download className="w-4 h-4" />
            Download Receipt
          </button>
        </div>
      </div>

      {/* Session Notes */}
      {appt.notes && (
        <div className={cn(SECTION_CARD_CLS, "bg-[#F7F8F9] border-none")}>
          <h3 className="text-[16px] font-black text-bp-primary tracking-tight mb-3">Physiotherapist Notes</h3>
          <p className="text-[15px] text-[#444444] leading-relaxed italic">"{appt.notes}"</p>
        </div>
      )}

      {/* Actions */}
      {canCancel && (
        <div className="flex flex-col sm:flex-row gap-4 mt-12">
          {!confirmCancel ? (
            <>
              <button
                type="button"
                className="flex-[2] flex items-center justify-center gap-2 px-8 py-5 bg-[#00766C] hover:bg-[#005A52] text-white rounded-[32px] text-[16px] font-black tracking-tight shadow-[0_8px_16px_rgba(0,118,108,0.15)] transition-all hover:-translate-y-0.5 cursor-pointer outline-none"
              >
                <RefreshCw className="w-5 h-5" />
                Reschedule Session
              </button>
              <button
                type="button"
                onClick={() => setConfirmCancel(true)}
                className="flex-1 flex items-center justify-center gap-2 px-8 py-5 border-2 border-[#DC2626] text-[#DC2626] hover:bg-[#FEF2F2] rounded-[32px] text-[16px] font-black tracking-tight transition-all cursor-pointer outline-none"
              >
                <X className="w-5 h-5" />
                Cancel
              </button>
            </>
          ) : (
            <div className="w-full p-8 bg-red-50 border-2 border-red-100 rounded-[32px] animate-in slide-in-from-top-4 duration-300">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-center sm:text-left">
                  <p className="text-[18px] text-[#DC2626] font-black mb-1">Are you sure you want to cancel?</p>
                  <p className="text-[14px] text-red-600/70 font-medium">This action cannot be undone once confirmed.</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => cancelMut.mutate()}
                    disabled={cancelMut.isPending}
                    className="flex-1 sm:flex-initial px-8 py-3 bg-[#DC2626] text-white text-[15px] font-black rounded-full shadow-lg shadow-red-200 disabled:opacity-50 cursor-pointer transition-transform hover:scale-105"
                  >
                    {cancelMut.isPending ? 'Processing...' : 'Yes, Cancel'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmCancel(false)}
                    className="flex-1 sm:flex-initial px-8 py-3 bg-white text-[15px] font-black text-[#666666] border border-[#E5E5E5] rounded-full cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    Keep It
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
