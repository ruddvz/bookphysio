'use client'

import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Phone, MapPin, ClipboardList, CheckCircle2, ArrowLeft, MoreHorizontal, Zap, ShieldCheck, Calendar, Clock, ArrowUpRight, CircleAlert, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { formatIndiaDate, formatIndiaTime } from '@/lib/india-date'
import { cn } from '@/lib/utils'

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

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; cls: string }> = {
  pending:   { label: 'Pending',   cls: 'bg-yellow-50 border-yellow-100 text-yellow-700' },
  confirmed: { label: 'Confirmed', cls: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
  cancelled: { label: 'Cancelled', cls: 'bg-red-50 border-red-100 text-red-700' },
  completed: { label: 'Completed', cls: 'bg-bp-accent/10 border-bp-accent/20 text-bp-accent' },
  no_show:   { label: 'No Show',   cls: 'bg-bp-surface border-bp-border text-bp-body' },
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
      <div className="max-w-[1000px] mx-auto px-6 py-16 flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-bp-accent" />
      </div>
    )
  }

  if (isError || !appt) {
    return (
      <div className="max-w-[1000px] mx-auto px-6 md:px-10 py-10">
        <Link href="/provider/appointments" className="inline-flex items-center gap-3 text-bp-body/40 hover:text-bp-accent font-black text-[11px] uppercase tracking-[0.2em] transition-colors no-underline">
          <div className="w-8 h-8 rounded-full border border-bp-border flex items-center justify-center">
            <ArrowLeft size={14} strokeWidth={3} />
          </div>
          Back to Registry
        </Link>
        <p className="text-bp-body/40 mt-6">Appointment not found.</p>
      </div>
    )
  }

  const patientName = appt.patient_profile?.full_name ?? 'Patient'
  const patientInitials = patientName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const formattedDate = formatIndiaDate(appt.availabilities.starts_at, {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
  })
  const startTime = formatIndiaTime(appt.availabilities.starts_at, { hour: '2-digit', minute: '2-digit' })
  const endTime = formatIndiaTime(appt.availabilities.ends_at, { hour: '2-digit', minute: '2-digit' })
  const refCode = `BP-RECA-${new Date(appt.created_at).getFullYear()}-${appt.id.slice(-6).toUpperCase()}`
  const statusCfg = STATUS_CONFIG[appt.status]
  const locationLabel = appt.visit_type === 'home_visit'
    ? appt.home_visit_address ?? 'Home Visit'
    : appt.locations ? `${appt.locations.name}, ${appt.locations.city}` : 'Clinic'
  const locationCaption = appt.visit_type === 'home_visit' ? 'Visit Address' : 'Facility Location'
  const providerNotes = appt.provider_notes ?? appt.notes
  const legacyNotes = appt.legacy_notes
  const gstAmount = appt.payment_gst_amount_inr ?? Math.round(appt.fee_inr * 0.18)
  const totalDue = appt.payment_amount_inr ?? (appt.fee_inr + gstAmount)
  const paymentStatus = appt.payment_status
  const paymentLabel = paymentStatus === 'paid'
    ? 'Paid'
    : paymentStatus === 'refunded'
      ? 'Refunded'
      : paymentStatus === 'failed'
        ? 'Payment Failed'
        : paymentStatus === 'created'
          ? 'Payment Pending'
          : 'Pay at Visit'
  const paymentSummaryLabel = paymentStatus === 'paid'
    ? 'Collected Online incl. GST'
    : paymentStatus === 'refunded'
      ? 'Refunded payment record'
      : paymentStatus === 'failed'
        ? 'Online payment failed'
        : paymentStatus === 'created'
          ? 'Online payment initiated'
          : 'Amount Due at Visit incl. GST'

  return (
    <div className="max-w-[1000px] mx-auto px-6 md:px-10 py-10 md:py-16 animate-in fade-in duration-700">
      <div className="mb-10">
        <Link href="/provider/appointments" className="inline-flex items-center gap-3 text-bp-body/40 hover:text-bp-accent font-black text-[11px] uppercase tracking-[0.2em] transition-colors group no-underline">
          <div className="w-8 h-8 rounded-full border border-bp-border flex items-center justify-center group-hover:border-bp-accent/20 group-hover:bg-bp-accent/10 transition-all">
            <ArrowLeft size={14} strokeWidth={3} />
          </div>
          Back to Registry
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-bp-accent/10 border border-bp-accent/20 rounded-full text-[10px] font-black uppercase text-bp-accent tracking-widest shadow-sm">
            <ShieldCheck size={12} strokeWidth={3} />
            Verified Clinical Record
          </div>
          <h1 className="text-[36px] md:text-[42px] font-black text-bp-primary leading-none tracking-tighter">
            Consultation <span className="text-bp-accent">Analysis</span>
          </h1>
          <p className="text-[15px] font-bold text-bp-body/40">{refCode}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className={cn('px-6 py-3 border rounded-2xl text-[13px] font-black uppercase tracking-widest flex items-center gap-3', statusCfg.cls)}>
            <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
            {statusCfg.label}
          </div>
          <button aria-label="Appointment actions" title="Appointment actions" className="w-12 h-12 rounded-2xl bg-white border border-bp-border flex items-center justify-center text-bp-body/40 hover:text-bp-primary transition-colors shadow-sm">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">
        <div className="space-y-8">
          {/* Patient Card */}
          <div className="bg-white rounded-[44px] border border-bp-border p-8 md:p-10 shadow-[0_32px_64px_-24px_rgba(0,0,0,0.06)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-bp-accent/10/30 rounded-full blur-[80px] -mr-32 -mt-32" />
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-10 pb-10 border-b border-bp-border/50">
                <div className="w-20 h-20 rounded-[32px] bg-bp-accent/10 flex items-center justify-center text-bp-accent text-[32px] font-black shadow-inner">
                  {appt.patient_profile?.avatar_url
                    ? <Image src={appt.patient_profile.avatar_url} alt={patientName} width={80} height={80} className="w-full h-full rounded-[32px] object-cover" />
                    : patientInitials
                  }
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-black text-bp-body/40 uppercase tracking-[0.2em] mb-1">Patient Registry</p>
                  <h2 className="text-[28px] font-black text-bp-primary tracking-tighter leading-none mb-2">{patientName}</h2>
                  <div className="flex items-center gap-4 text-[13px] font-bold text-bp-body/40">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-emerald-500" />
                      Verified Patient
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                {appt.patient_profile?.phone && (
                  <div className="p-6 bg-bp-surface rounded-3xl border border-bp-border group hover:bg-white hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-bp-accent shadow-sm">
                        <Phone size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-bp-body/30 uppercase tracking-widest mb-0.5">Contact</p>
                        <p className="text-[15px] font-black text-bp-primary">{appt.patient_profile.phone}</p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="p-6 bg-bp-surface rounded-3xl border border-bp-border group hover:bg-white hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-bp-secondary shadow-sm">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-bp-body/30 uppercase tracking-widest mb-0.5">Session Type</p>
                      <p className="text-[15px] font-black text-bp-primary capitalize">{appt.visit_type.replace('_', ' ')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {(appt.patient_reason || appt.home_visit_address || legacyNotes) && (
                <div className="space-y-4 mb-12">
                  <div className="flex items-center gap-3">
                    <ClipboardList className="text-bp-accent" size={18} strokeWidth={3} />
                    <h3 className="text-[18px] font-black text-bp-primary tracking-tight">Patient Intake</h3>
                  </div>

                  {appt.home_visit_address && (
                    <div className="p-6 bg-bp-secondary/10/60 rounded-3xl border border-bp-secondary/20">
                      <p className="text-[10px] font-black text-bp-secondary uppercase tracking-widest mb-2">Home Visit Address</p>
                      <p className="text-[15px] font-bold text-bp-primary leading-relaxed">{appt.home_visit_address}</p>
                    </div>
                  )}

                  {appt.patient_reason && (
                    <div className="p-6 bg-bp-surface rounded-3xl border border-bp-border">
                      <p className="text-[10px] font-black text-bp-body/40 uppercase tracking-widest mb-2">Patient Notes</p>
                      <p className="text-[15px] font-bold text-bp-primary leading-relaxed">{appt.patient_reason}</p>
                    </div>
                  )}

                  {legacyNotes && (
                    <div className="p-6 bg-amber-50/80 rounded-3xl border border-amber-100">
                      <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2">Legacy Booking Notes</p>
                      <p className="text-[15px] font-bold text-bp-primary leading-relaxed">{legacyNotes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Clinical Notes */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-[18px] font-black text-bp-primary flex items-center gap-3 tracking-tight">
                    <ClipboardList className="text-bp-accent" size={20} strokeWidth={3} />
                    Provider Notes
                  </h3>
                  <span className="text-[11px] font-black text-bp-body/30 uppercase tracking-widest">
                    {saved ? '✓ Saved' : 'Auto-Saving Enabled'}
                  </span>
                </div>
                <div className="relative">
                  <textarea
                    rows={8}
                    value={notesDraft ?? providerNotes ?? ''}
                    onChange={e => setNotesDraft(e.target.value)}
                    placeholder="Document clinical diagnosis, treatment provided, differential observations, and rehabilitation roadmap..."
                    className="w-full p-8 bg-bp-surface/50 border border-bp-border rounded-[32px] text-[16px] font-bold text-bp-primary leading-relaxed placeholder:text-bp-body/30 focus:bg-white focus:ring-4 focus:ring-bp-accent/5 focus:border-bp-accent/20 outline-none transition-all resize-none shadow-inner"
                  />
                  <div className="absolute bottom-4 right-4">
                    <button
                      onClick={() => notesMut.mutate()}
                      disabled={notesMut.isPending}
                      className="flex items-center gap-3 px-8 py-4 bg-bp-primary text-white rounded-[20px] text-[14px] font-black hover:bg-bp-accent transition-all shadow-xl active:scale-[0.97] disabled:opacity-70"
                    >
                      {notesMut.isPending ? 'Saving...' : 'Commit Record'}
                      <CheckCircle2 size={18} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Session Context Sidebar */}
        <aside className="space-y-8">
          <div className="bg-bp-primary rounded-[40px] p-8 md:p-10 shadow-2xl shadow-gray-900/10 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[40px] -mr-16 -mt-16 transition-transform group-hover:scale-110" />
            <div className="relative z-10 space-y-8">
              <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em] leading-none">Session Context</p>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-bp-accent/70 border border-white/5 shadow-sm">
                    <Calendar size={22} strokeWidth={3} />
                  </div>
                  <div>
                    <p className="text-[15px] font-black">{formattedDate}</p>
                    <p className="text-[12px] font-bold text-white/40 uppercase tracking-widest">Appointment Date</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-bp-accent/70 border border-white/5 shadow-sm">
                    <Clock size={22} strokeWidth={3} />
                  </div>
                  <div>
                    <p className="text-[15px] font-black">{startTime} — {endTime}</p>
                    <p className="text-[12px] font-bold text-white/40 uppercase tracking-widest">
                      Duration: {appt.availabilities.slot_duration_mins}m
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-bp-accent/70 border border-white/5 shadow-sm">
                    <MapPin size={22} strokeWidth={3} />
                  </div>
                  <div>
                    <p className="text-[15px] font-black">{locationLabel}</p>
                    <p className="text-[12px] font-bold text-white/40 uppercase tracking-widest">{locationCaption}</p>
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t border-white/5">
                <div className="flex items-center justify-between gap-4 mb-8">
                  <div>
                    <p className="text-[15px] font-black">₹{totalDue.toLocaleString('en-IN')}</p>
                    <p className="text-[11px] font-black text-white/30 uppercase tracking-widest">{paymentSummaryLabel}</p>
                  </div>
                  <div className={cn(
                    'px-3 py-1.5 rounded-xl text-[10px] font-black uppercase shadow-lg',
                    paymentStatus === 'paid'
                      ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                      : paymentStatus === 'refunded'
                        ? 'bg-bp-accent text-white shadow-bp-accent/20'
                        : paymentStatus === 'failed'
                          ? 'bg-red-500 text-white shadow-red-500/20'
                          : paymentStatus === 'created'
                            ? 'bg-yellow-300 text-bp-primary shadow-yellow-400/20'
                            : 'bg-amber-400 text-bp-primary shadow-amber-500/20'
                  )}>
                    {paymentLabel}
                  </div>
                </div>
                <Link href="/provider/earnings" className="flex items-center justify-between w-full p-5 bg-white/5 border border-white/5 rounded-3xl group/btn hover:bg-white/10 transition-all font-black text-white/80 no-underline">
                  <span className="text-[13px] font-black uppercase tracking-widest leading-none">Open Earnings</span>
                  <ArrowUpRight size={18} className="text-white/20 group-hover/btn:text-white group-hover/btn:rotate-12 transition-all" />
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[40px] p-8 border border-bp-border flex flex-col gap-4">
            <button className="flex items-center gap-4 px-6 py-4 rounded-2xl text-[14px] font-bold text-bp-body hover:bg-bp-surface hover:text-bp-primary transition-all border-none bg-transparent cursor-pointer">
              <div className="w-10 h-10 rounded-xl border border-bp-border flex items-center justify-center bg-white"><Zap size={18} /></div>
              Reschedule Session
            </button>
            <button className="flex items-center gap-4 px-6 py-4 rounded-2xl text-[14px] font-bold text-orange-400 hover:bg-bp-secondary/10 transition-all border-none bg-transparent cursor-pointer">
              <div className="w-10 h-10 rounded-xl border border-bp-secondary/20 flex items-center justify-center bg-white"><CircleAlert size={18} /></div>
              Flag Issue
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}
