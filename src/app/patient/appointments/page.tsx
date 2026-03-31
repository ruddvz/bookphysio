'use client'

import { CalendarDays, ArrowRight, AlertCircle, Calendar, Clock, MapPin, Search, ChevronRight, Activity, Filter, CheckCircle2 } from 'lucide-react'
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
  cancelled: 'bg-gray-50 text-gray-400 border-gray-100',
  no_show: 'bg-gray-50 text-gray-400 border-gray-100',
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
  online: 'Online Consult',
}

function AppointmentsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-[32px] border border-gray-100 p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-4">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-gray-100 rounded-full text-[10px] font-black uppercase text-[#00766C] tracking-widest shadow-sm">
              <Activity size={12} strokeWidth={3} />
              Appointment Management
           </div>
           <h1 className="text-[36px] md:text-[42px] font-black text-[#333333] leading-none tracking-tighter">
             My Treatment <span className="text-[#00766C]">Sessions</span>
           </h1>
           <p className="text-[15px] font-bold text-gray-400">View and manage your clinical recovery appointments.</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="h-14 px-6 bg-white border border-gray-100 rounded-[20px] text-[14px] font-black text-[#333333] flex items-center gap-3 hover:bg-gray-50 transition-all shadow-sm">
              <Filter size={18} />
              Filter
           </button>
           <Link href="/search" className="h-14 px-6 bg-[#00766C] text-white rounded-[20px] text-[14px] font-black flex items-center gap-3 hover:bg-[#005A52] transition-all shadow-lg active:scale-95 shadow-teal-900/10">
              <Search size={18} strokeWidth={3} />
              Book New
           </Link>
        </div>
      </div>

      {/* Modern Tabs */}
      <div className="mb-10 p-1 bg-gray-50 rounded-[24px] inline-flex items-center gap-1 border border-gray-100">
        {(['upcoming', 'past'] as const).map((t) => (
          <button
            key={t}
            onClick={() => switchTab(t)}
            className={cn(
              "px-8 py-3.5 rounded-[20px] text-[14px] font-black tracking-tight transition-all duration-300 capitalize",
              tab === t
                ? "bg-white text-[#00766C] shadow-sm ring-1 ring-black/5"
                : "text-gray-400 hover:text-gray-600"
            )}
          >
            {t} Sessions
          </button>
        ))}
      </div>

      <div className="relative">
        {loading ? (
          <AppointmentsSkeleton />
        ) : error ? (
          <div className="bg-white border border-gray-100 rounded-[40px] shadow-sm py-20 px-10 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-6 opacity-20" />
            <h3 className="text-[20px] font-black text-[#333333] mb-2">Sync Interrupted</h3>
            <p className="text-[15px] font-bold text-gray-400 mb-8">We couldn&apos;t retrieve your clinical records right now.</p>
            <button
              type="button"
              onClick={fetchAppointments}
              className="px-10 py-4 bg-[#00766C] text-white rounded-full text-[14px] font-black uppercase tracking-widest hover:bg-[#005A52] transition-colors shadow-lg active:scale-95 shadow-teal-900/10"
            >
              Retry Connection
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 bg-white border-2 border-dashed border-gray-100 rounded-[40px]">
            <EmptyState
              title={`No ${tab} appointments Found`}
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
                    className="inline-flex items-center gap-3 px-10 py-5 bg-[#333333] text-white rounded-[24px] font-black text-[16px] hover:bg-[#00766C] transition-all hover:scale-[1.03] shadow-xl"
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
                className="group bg-white rounded-[36px] border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300 hover:shadow-xl hover:border-teal-500/10 hover:-translate-y-1"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-6 flex-1 min-w-0">
                  {/* Provider Brand */}
                  <div className="w-16 h-16 rounded-[24px] bg-teal-50 flex items-center justify-center text-[#00766C] text-[24px] font-black shadow-sm group-hover:scale-105 transition-transform">
                     {providerDisplayName(appt).charAt(4) === ' ' ? providerDisplayName(appt).charAt(4+1) : providerDisplayName(appt).charAt(0)}
                  </div>
                  
                  {/* Details */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-[19px] md:text-[22px] font-black text-[#333333] tracking-tight truncate leading-none pt-1">
                        {providerDisplayName(appt)}
                      </h3>
                      <div className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm", STATUS_COLORS[appt.status])}>
                         {STATUS_LABELS[appt.status] || appt.status}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 text-[14px] font-bold text-gray-400 flex-wrap">
                       <span className="text-[#333333]/70">{appt.providers?.specialties?.[0]?.name ?? 'Physiotherapist'}</span>
                       <span className="text-gray-200">·</span>
                       <div className="flex items-center gap-1.5 py-0.5 px-2 bg-gray-50 rounded-lg text-[12px] uppercase tracking-widest">
                          {VISIT_TYPE_LABELS[appt.visit_type] || appt.visit_type}
                       </div>
                    </div>

                    <div className="flex items-center gap-6 pt-3">
                       <div className="flex items-center gap-2 text-[14px] font-black text-[#00766C]">
                          <Clock size={16} />
                          {appt.availabilities?.starts_at ? formatApptDate(appt.availabilities.starts_at) : 'Review Pending'}
                       </div>
                       <div className="h-4 w-px bg-gray-100 hidden sm:block"></div>
                       <div className="flex items-center gap-2 text-[14px] font-black text-[#333333]">
                          <span className="text-gray-300 text-[12px] font-bold uppercase tracking-widest">Fee</span>
                          ₹{appt.fee_inr}
                       </div>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/patient/appointments/${appt.id}`}
                  className="px-8 py-4 rounded-[20px] bg-white border border-gray-100 text-[#333333] text-[14px] font-black flex items-center justify-center gap-3 hover:bg-gray-50 transition-all shadow-sm active:scale-95 group/view md:w-auto w-full"
                >
                  View Details
                  <ChevronRight size={18} strokeWidth={3} className="text-[#00766C] group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quality Signifier */}
      <div className="mt-20 flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center"><CheckCircle2 size={18} /></div>
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-600">IAP Verified Care</span>
         </div>
         <div className="h-6 w-px bg-gray-200 hidden md:block"></div>
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-teal-600 font-black">256</div>
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-600">AES Encrypted Data</span>
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
