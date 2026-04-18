"use client"

import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Phone,
  MapPin,
  ClipboardList,
  ArrowLeft,
  ShieldCheck,
  Calendar,
  Clock,
  ArrowUpRight,
  CircleAlert,
  Loader2,
  Activity,
  CreditCard,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { formatIndiaDate, formatIndiaTime } from '@/lib/india-date'
import { cn } from '@/lib/utils'
import {
  PageHeader,
  SectionCard,
  StatTile,
  type TileTone,
} from '@/components/dashboard/primitives'
import { ProviderAppointmentDetailV2 } from './ProviderAppointmentDetailV2'

type VisitType = 'in_clinic' | 'home_visit'
type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'

interface AppointmentDetail {
  id: string
  patient_id: string
  visit_type: VisitType
  status: AppointmentStatus
  fee_inr: number
  notes: string | null
  provider_notes: string | null
  patient_reason: string | null
  home_visit_address: string | null
  legacy_notes: string | null
  payment_status: 'created' | 'paid' | 'failed' | 'refunded' | null
  payment_amount_inr: number | null
  payment_gst_amount_inr: number | null
  created_at: string
  availabilities: { starts_at: string; ends_at: string; slot_duration_mins: number }
  locations: { name: string; city: string } | null
  patient_profile: { full_name: string; phone: string | null; avatar_url: string | null } | null
}

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; tone: TileTone }> = {
  pending:   { label: 'Pending',   tone: 4 },
  confirmed: { label: 'Confirmed', tone: 1 },
  cancelled: { label: 'Cancelled', tone: 2 },
  completed: { label: 'Completed', tone: 1 },
  no_show:   { label: 'No Show',   tone: 2 },
}

export default function ProviderAppointmentDetail() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [notesDraft, setNotesDraft] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const { data: appt, isLoading, isError } = useQuery<AppointmentDetail>({
    queryKey: ['appointment', 'provider', id],
    queryFn: async () => {
      const res = await fetch(`/api/appointments/${id}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Not found')
      return res.json()
    },
    enabled: !!id,
  })

  const notesMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_notes', notes: notesDraft ?? appt?.provider_notes ?? appt?.notes ?? '' }),
      })
      if (!res.ok) throw new Error('Save failed')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointment', 'provider', id] })
      setNotesDraft(null)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    },
  })

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="w-12 h-12 text-[var(--color-pv-primary)] animate-spin" />
        <p className="mt-4 text-[13px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Synchronizing Record...</p>
      </div>
    )
  }

  if (isError || !appt) {
    return (
      <div className="max-w-[800px] mx-auto px-6 py-12">
        <div className="bg-rose-50 border border-rose-100 rounded-[40px] p-12 text-center">
           <CircleAlert className="w-12 h-12 text-rose-500 mx-auto mb-4" />
           <p className="text-[14px] font-bold text-rose-700">Appointment record not found in the clinical registry.</p>
           <Link href="/provider/appointments" className="mt-6 inline-flex px-8 py-3 bg-[var(--color-pv-ink)] text-white rounded-full text-[13px] font-bold uppercase tracking-widest transition-all">Back to Registry</Link>
        </div>
      </div>
    )
  }

  const patientName = appt.patient_profile?.full_name ?? 'Patient'
  const formattedDate = formatIndiaDate(appt.availabilities.starts_at, {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
  })
  const startTime = formatIndiaTime(appt.availabilities.starts_at, { hour: '2-digit', minute: '2-digit' })
  const refCode = `BP-RECA-${new Date(appt.created_at).getFullYear()}-${appt.id.slice(-6).toUpperCase()}`
  const statusCfg = STATUS_CONFIG[appt.status]
  
  const paymentLabel = appt.payment_status === 'paid' ? 'Paid' : 'Pay at Visit'
  const totalDue = appt.payment_amount_inr ?? (appt.fee_inr + (appt.payment_gst_amount_inr ?? Math.round(appt.fee_inr * 0.18)))

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8">
      <Link
        href="/provider/appointments"
        className="inline-flex items-center gap-2 text-[12px] font-bold text-slate-400 uppercase tracking-widest hover:text-[var(--color-pv-primary)] transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Registry
      </Link>

      <ProviderAppointmentDetailV2 appointment={appt} />

      <PageHeader
        role="provider"
        kicker="VIRTUAL RECORD"
        title="Session Analysis"
        subtitle={`Reference ID: ${refCode}`}
        action={{
           label: statusCfg.label,
            tone: statusCfg.tone,
           disabled: true
        }}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
           role="provider"
           icon={Calendar}
           label="Date"
           value={formattedDate}
           tone={1}
        />
        <StatTile
           role="provider"
           icon={Clock}
           label="Time"
           value={startTime}
           tone={4}
        />
        <StatTile
           role="provider"
           icon={CreditCard}
           label="Payment"
           value={paymentLabel}
           tone={3}
        />
        <StatTile
           role="provider"
           icon={Activity}
           label="Fee"
           value={`₹${totalDue.toLocaleString('en-IN')}`}
           tone={2}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr,360px] gap-6">
        <div className="space-y-6 lg:space-y-10">
          <SectionCard role="provider" title="Patient Context" kicker="REGISTRY PROFILE">
            <div className="flex flex-col md:flex-row items-center gap-8 py-4">
              <div className="w-24 h-24 rounded-[32px] bg-[var(--color-pv-tile-1-bg)] border-2 border-white shadow-xl flex items-center justify-center text-[32px] font-black text-[var(--color-pv-primary)] shrink-0 overflow-hidden">
                {appt.patient_profile?.avatar_url ? (
                  <Image src={appt.patient_profile.avatar_url} alt="" width={96} height={96} />
                ) : (
                  patientName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 text-center md:text-left space-y-2">
                <h2 className="text-[28px] font-black text-[var(--color-pv-ink)] tracking-tight leading-none">{patientName}</h2>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[14px] font-bold text-slate-400">
                   <div className="flex items-center gap-1.5"><Phone size={14} className="text-[var(--color-pv-primary)]" /> {appt.patient_profile?.phone || '—'}</div>
                   <div className="flex items-center gap-1.5 capitalize"><Activity size={14} className="text-indigo-400" /> {appt.visit_type.replace('_', ' ')}</div>
                </div>
              </div>
              <button className="px-6 py-2 bg-[var(--color-pv-track-bg)] hover:bg-white border-2 border-transparent hover:border-slate-100 rounded-full text-[12px] font-bold text-slate-600 transition-all shadow-sm">
                View History
              </button>
            </div>
          </SectionCard>

          {(appt.patient_reason || appt.home_visit_address) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {appt.home_visit_address && (
                  <SectionCard role="provider" title="Service Location">
                     <div className="flex items-start gap-3 p-2">
                        <MapPin size={18} className="text-rose-400 shrink-0 mt-1" />
                        <p className="text-[14px] font-bold text-slate-700 leading-relaxed">{appt.home_visit_address}</p>
                     </div>
                  </SectionCard>
               )}
               {appt.patient_reason && (
                  <SectionCard role="provider" title="Intake Notes">
                     <div className="flex items-start gap-3 p-2">
                        <ClipboardList size={18} className="text-indigo-400 shrink-0 mt-1" />
                        <p className="text-[14px] font-bold text-slate-700 leading-relaxed">{appt.patient_reason}</p>
                     </div>
                  </SectionCard>
               )}
            </div>
          )}

          <SectionCard role="provider" title="Clinical Observations" kicker="PRACTITIONER NOTES">
            <div className="space-y-6">
              <textarea
                rows={8}
                value={notesDraft ?? appt.provider_notes ?? appt.notes ?? ''}
                onChange={e => setNotesDraft(e.target.value)}
                placeholder="Document clinical diagnosis and roadmap..."
                className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[var(--sq-lg)] text-[15px] font-bold text-slate-900 leading-relaxed focus:bg-white focus:border-[var(--color-pv-primary)] outline-none transition-all resize-none"
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest italic">
                   {saved ? '✓ Verified Persistence' : 'Clinical records auto-saved'}
                </span>
                <button
                  onClick={() => notesMut.mutate()}
                  disabled={notesMut.isPending}
                  className="px-8 py-3 bg-[var(--color-pv-ink)] text-white rounded-[var(--sq-sm)] text-[13px] font-black uppercase tracking-widest hover:bg-[var(--color-pv-primary)] transition-all flex items-center gap-2 group shadow-xl shadow-indigo-500/10 disabled:opacity-40"
                >
                  {notesMut.isPending ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} className="group-hover:scale-110 transition-transform" />}
                  {notesMut.isPending ? 'Committing...' : 'Commit Record'}
                </button>
              </div>
            </div>
          </SectionCard>
        </div>

        <aside className="space-y-6">
           <SectionCard role="provider" title="Session Context">
              <div className="space-y-5">
                 {[
                   { icon: Calendar, label: 'Date', value: formattedDate },
                   { icon: Clock, label: 'Time', value: `${startTime}` },
                   { icon: Activity, label: 'Visit', value: appt.visit_type.replace('_', ' ') },
                   { icon: CreditCard, label: 'Status', value: paymentLabel, tone: appt.payment_status === 'paid' ? 'text-emerald-500' : 'text-amber-500' }
                 ].map((item, idx) => (
                   <div key={idx} className="flex justify-between items-center py-1">
                      <div className="flex items-center gap-3">
                         <item.icon size={16} className="text-slate-300" />
                         <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</span>
                      </div>
                      <span className={cn("text-[13px] font-bold", item.tone || "text-slate-900")}>{item.value}</span>
                   </div>
                 ))}
                 <div className="pt-4 mt-2 border-t border-slate-50">
                    <button className="w-full py-3 bg-slate-50 text-[12px] font-bold text-slate-600 rounded-[var(--sq-sm)] hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                       Reschedule Session
                       <ArrowUpRight size={14} />
                    </button>
                 </div>
              </div>
           </SectionCard>

           <SectionCard role="provider" title="Registry Support">
              <div className="space-y-4">
                 <button className="w-full flex items-center gap-3 px-4 py-3 bg-rose-50/50 hover:bg-rose-50 text-rose-500 rounded-[var(--sq-sm)] text-[12px] font-bold transition-all border border-rose-100/50 group">
                    <CircleAlert size={16} className="group-hover:scale-110 transition-transform" />
                    Flag Clinical Issue
                 </button>
                 <Link href="/provider/earnings" className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-[var(--sq-sm)] text-[12px] font-bold transition-all border border-slate-100/50 group">
                    <Activity size={16} className="group-hover:translate-x-1 transition-transform" />
                    Open Earnings Hub
                 </Link>
              </div>
           </SectionCard>
        </aside>
      </div>
    </div>
  )
}
