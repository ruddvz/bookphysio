'use client'

import { CalendarDays, ArrowRight, CircleAlert, Calendar, Clock, MapPin, Search, ChevronRight, Activity, Filter, CheckCircle2, CalendarPlus } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/utils'
import {
  filterByTab,
  parseTab,
  formatApptDate,
  providerDisplayName,
  type AppointmentItem,
  type AppointmentTab,
} from './appointments-utils'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-100',
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  completed: 'bg-blue-50 text-blue-700 border-blue-100',
  cancelled: 'bg-bp-surface text-bp-body/40 border-bp-border',
  no_show: 'bg-bp-surface text-bp-body/40 border-bp-border',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending Approval',
  confirmed: 'Confirmed',
  completed: 'Session Completed',
  cancelled: 'Cancelled',
  no_show: 'Missed Session',
}

const VISIT_TYPE_LABELS: Record<string, string> = {
  in_clinic: 'Clinic Visit',
  home_visit: 'Home Session',
}

function AppointmentsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-[32px] border border-bp-border p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex gap-6 flex-1 w-full">
            <Skeleton className="h-16 w-16 rounded-2xl shrink-0" />
            <div className="flex flex-col gap-2 flex-1 pt-1">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <div className="flex gap-2 mt-2">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </div>
          </div>
          <Skeleton className="h-14 w-32 rounded-2xl shrink-0" />
        </div>
      ))}
    </div>
  )
}

function PatientAppointmentsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [tab, setTab] = useState<AppointmentTab>(() => parseTab(searchParams.get('tab')))
  const [appointments, setAppointments] = useState<AppointmentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchAppointments = useCallback(() => {
    setLoading(true)
    setError(false)
    fetch('/api/appointments')
      .then((r) => r.json())
      .then((data: { appointments?: AppointmentItem[] }) => setAppointments(data.appointments ?? []))
      .catch((err) => {
        console.error('Fetch failed:', err)
        setError(true)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  function switchTab(next: AppointmentTab) {
    setTab(next)
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', next)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const filtered = filterByTab(appointments, tab)

  return (
    <div className="max-w-[1142px] mx-auto px-6 md:px-10 py-10 md:py-16 animate-in fade-in duration-700">
      
      {/* Header with Search/Filter */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-16">
        <div className="space-y-6">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-bp-border rounded-full text-[10px] font-black uppercase text-bp-accent tracking-widest shadow-sm">
              <Activity size={12} strokeWidth={3} />
              Session Tracker
           </div>
           <h1 className="text-[42px] md:text-[52px] font-black text-bp-primary leading-none tracking-tighter">
             My Treatment <span className="text-bp-accent italic">Journey</span>
           </h1>
           <p className="text-[16px] md:text-[18px] font-medium text-bp-body/60 max-w-[500px] leading-relaxed">
             Everything about your recovery in one place. View upcoming appointments and historical progress.
           </p>
        </div>
        <div className="flex items-center gap-4">
           <button className="h-16 px-8 bg-white border border-bp-border rounded-[24px] text-[14px] font-black text-bp-primary flex items-center gap-3 hover:border-bp-accent/20 hover:text-bp-accent transition-all shadow-sm active:scale-95">
              <Filter size={18} strokeWidth={2.5} />
              Advanced Filters
           </button>
           <Link href="/search" className="h-16 px-8 bg-bp-primary text-white rounded-[24px] text-[15px] font-black flex items-center gap-4 hover:bg-bp-primary/95 hover:scale-[1.03] transition-all shadow-xl shadow-bp-primary/10 active:scale-95">
              <CalendarPlus size={20} strokeWidth={3} />
              Book New Session
           </Link>
        </div>
      </div>

      {/* Modern Tabs */}
      <div className="mb-12 p-1.5 bg-bp-surface border border-bp-border rounded-[32px] inline-flex items-center gap-1.5 shadow-inner">
        {(['upcoming', 'past'] as const).map((t) => (
          <button
            key={t}
            onClick={() => switchTab(t)}
            className={cn(
              "px-10 py-4 rounded-[28px] text-[14px] font-black tracking-tight transition-all duration-500 capitalize relative overflow-hidden group",
              tab === t
                ? "bg-white text-bp-accent shadow-xl shadow-bp-primary/5 ring-1 ring-bp-border/50"
                : "text-bp-body/40 hover:text-bp-primary"
            )}
          >
            {tab === t && <span className="absolute inset-0 bg-bp-accent/5 animate-pulse"></span>}
            <span className="relative z-10 flex items-center gap-2">
               {t === 'upcoming' ? <CalendarDays size={16} /> : <Clock size={16} />}
               {t} Sessions
            </span>
          </button>
        ))}
      </div>

      <div className="relative">
        {loading ? (
          <AppointmentsSkeleton />
        ) : error ? (
          <div className="bg-white border border-bp-border rounded-[40px] shadow-sm py-20 px-10 text-center">
            <CircleAlert className="w-12 h-12 text-red-500 mx-auto mb-6 opacity-20" />
            <h3 className="text-[20px] font-black text-bp-primary mb-2">Sync Interrupted</h3>
            <p className="text-[15px] font-bold text-bp-body/40 mb-8">We couldn&apos;t retrieve your clinical records right now.</p>
            <button
              type="button"
              onClick={fetchAppointments}
              className="px-10 py-4 bg-bp-accent text-white rounded-full text-[14px] font-black uppercase tracking-widest hover:bg-bp-primary transition-colors shadow-lg active:scale-95 shadow-teal-900/10"
            >
              Retry Connection
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 bg-white border-2 border-dashed border-bp-border rounded-[40px]">
            <EmptyState
              title={`No ${tab} sessions found`}
              description={
                tab === 'upcoming'
                  ? 'Your treatment calendar is currently clear. Ready to book your next session?'
                  : 'Your therapeutic history will be logged here as you complete sessions.'
              }
              icon={Calendar}
              className="border-0 bg-transparent"
              action={
                tab === 'upcoming' && (
                  <Link
                    href="/search"
                    className="inline-flex items-center gap-3 px-10 py-5 bg-bp-primary text-white rounded-[24px] font-black text-[16px] hover:bg-bp-accent transition-all hover:scale-[1.03] shadow-xl"
                  >
                    Browse Specialists
                    <ArrowRight size={20} strokeWidth={3} />
                  </Link>
                )
              }
            />
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((appt) => (
              <div
                key={appt.id}
                className="group bg-white rounded-[36px] border border-bp-border p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300 hover:shadow-xl hover:border-bp-accent/10 hover:-translate-y-1"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-6 flex-1 min-w-0">
                  {/* Provider Brand */}
                  <div className="w-20 h-20 rounded-[32px] bg-bp-surface border border-bp-border flex items-center justify-center text-bp-accent text-[28px] font-black shadow-sm group-hover:scale-110 group-hover:bg-bp-accent/5 transition-all">
                     {providerDisplayName(appt).charAt(0)}
                  </div>
                  
                  {/* Details */}
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-center gap-4 flex-wrap">
                      <h3 className="text-[20px] md:text-[24px] font-black text-bp-primary tracking-tighter truncate leading-none">
                        {providerDisplayName(appt)}
                      </h3>
                      <div className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm", STATUS_COLORS[appt.status])}>
                         {STATUS_LABELS[appt.status] || appt.status}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 text-[13px] font-bold text-bp-body/40 flex-wrap uppercase tracking-wider">
                       <div className="flex items-center gap-1.5 px-3 py-1 bg-bp-surface rounded-full text-bp-body/60 border border-bp-border">
                          <Activity size={12} strokeWidth={3} className="text-bp-accent" />
                          {appt.providers?.specialties?.[0]?.name ?? 'Physiotherapist'}
                       </div>
                       <span className="text-bp-border">|</span>
                       <div className="flex items-center gap-1.5 py-1 px-3 bg-bp-surface rounded-full text-bp-body/60 border border-bp-border">
                          <MapPin size={12} strokeWidth={3} className="text-emerald-500" />
                          {VISIT_TYPE_LABELS[appt.visit_type] || appt.visit_type}
                       </div>
                    </div>

                    <div className="flex items-center gap-8 pt-4">
                       <div className="flex items-center gap-2.5 text-[15px] font-black text-bp-accent bg-bp-accent/5 px-4 py-2 rounded-2xl border border-bp-accent/10">
                          <Calendar size={16} strokeWidth={3} />
                          {appt.availabilities?.starts_at ? formatApptDate(appt.availabilities.starts_at) : 'Review Pending'}
                       </div>
                       <div className="flex items-center gap-3">
                          <span className="text-bp-body/20 text-[11px] font-black uppercase tracking-widest">Session Fee</span>
                          <span className="text-[18px] font-black text-bp-primary tracking-tighter">₹{appt.fee_inr}</span>
                       </div>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/patient/appointments/${appt.id}`}
                  className="h-16 px-10 rounded-[28px] bg-bp-primary text-white text-[15px] font-black flex items-center justify-center gap-3 hover:bg-bp-primary/95 transition-all shadow-xl shadow-bp-primary/10 active:scale-95 group/view md:w-auto w-full group-hover:scale-[1.03]"
                >
                  View Records
                  <ArrowRight size={20} strokeWidth={3} className="group-hover/view:translate-x-1.5 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quality Signifier */}
      <div className="mt-20 flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-bp-surface rounded-xl flex items-center justify-center"><CheckCircle2 size={18} /></div>
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-bp-body">IAP Verified Care</span>
         </div>
         <div className="h-6 w-px bg-gray-200 hidden md:block"></div>
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-bp-surface rounded-xl flex items-center justify-center text-bp-accent font-black">256</div>
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-bp-body">AES Encrypted Data</span>
         </div>
      </div>
    </div>
  )
}

export default function PatientAppointments() {
  return (
    <Suspense fallback={<div className="max-w-[1142px] mx-auto px-6 md:px-10 py-16"><AppointmentsSkeleton /></div>}>
      <PatientAppointmentsContent />
    </Suspense>
  )
}
