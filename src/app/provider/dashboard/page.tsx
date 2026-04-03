'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { CalendarDays, Users, Clock, CircleAlert, UserCircle, Settings, ChevronUp, ChevronDown, Activity, TrendingUp, BarChart3, ArrowRight, Zap, Target, MoreHorizontal, Calendar, ArrowUpRight, DollarSign, CheckCircle2, MessageSquare } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/utils'
import {
  filterToday,
  filterThisWeek,
  getNextAppointment,
  formatAppointmentCount,
  formatSlotTime,
  patientDisplayName,
  type ProviderAppointment,
} from './provider-dashboard-utils'

const VISIT_TYPE_LABELS: Record<string, string> = {
  in_clinic: 'Clinic Visit',
  home_visit: 'Home Session',
}

const VISIT_TYPE_COLORS: Record<string, string> = {
  in_clinic: 'bg-bp-accent/10 text-bp-accent border-bp-accent/20',
  home_visit: 'bg-bp-secondary/10 text-bp-secondary border-bp-secondary/20',
}

function DashboardSkeleton() {
  return (
    <div className="max-w-[1240px] mx-auto px-6 md:px-10 py-16">
      <Skeleton className="h-12 w-64 mb-10 rounded-[24px] bg-bp-border/40" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 rounded-[40px] bg-bp-border/30" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-[40px] bg-bp-border/20" />
    </div>
  )
}

export default function ProviderDashboardHome() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<ProviderAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [checklistOpen, setChecklistOpen] = useState(true)

   const rawDisplayName = (user?.user_metadata?.full_name as string | undefined) ?? 'Doctor'
   const displayName = rawDisplayName.replace(/^Dr\.?\s+/i, '').split(' ')[0] ?? 'Doctor'

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

   async function fetchAppointments() {
    setLoading(true)
    setError(false)
      try {
         const response = await fetch('/api/appointments')
         if (!response.ok) {
            throw new Error('Failed to fetch appointments')
         }
         const data: { appointments?: ProviderAppointment[] } = await response.json()
         setAppointments(data.appointments ?? [])
      } catch (err) {
         console.error('Fetch error:', err)
         setError(true)
      } finally {
         setLoading(false)
      }
   }

  useEffect(() => {
      let isMounted = true

      async function loadInitialAppointments() {
         try {
            const response = await fetch('/api/appointments')
            if (!response.ok) {
               throw new Error('Failed to fetch appointments')
            }
            const data: { appointments?: ProviderAppointment[] } = await response.json()
            if (!isMounted) {
               return
            }
            setAppointments(data.appointments ?? [])
         } catch (err) {
            console.error('Fetch error:', err)
            if (!isMounted) {
               return
            }
            setError(true)
         } finally {
            if (isMounted) {
               setLoading(false)
            }
         }
      }

      void loadInitialAppointments()

      return () => {
         isMounted = false
      }
   }, [])

  if (loading) return <DashboardSkeleton />

   if (error) {
      return (
         <div className="max-w-[1240px] mx-auto px-6 md:px-10 py-10 md:py-16 animate-in fade-in duration-700">
            <EmptyState
               title="Clinical sync unavailable"
               description="We couldn&apos;t load your provider schedule right now. Please retry in a moment."
               icon={CircleAlert}
               className="border border-bp-border bg-white rounded-[40px] shadow-sm"
               action={
                  <div className="flex flex-wrap items-center justify-center gap-3">
                     <button
                        type="button"
                        onClick={() => {
                           void fetchAppointments()
                        }}
                        className="inline-flex items-center justify-center gap-3 rounded-[24px] bg-bp-primary px-8 py-4 text-[14px] font-bold text-white transition-all hover:bg-bp-accent active:scale-[0.98]"
                     >
                        Retry Sync
                     </button>
                     <Link
                        href="/provider/calendar"
                        className="inline-flex items-center justify-center gap-3 rounded-[24px] border border-bp-border bg-bp-surface px-8 py-4 text-[14px] font-bold text-bp-primary transition-all hover:border-bp-accent/30 hover:text-bp-accent active:scale-[0.98]"
                     >
                        Open Calendar
                     </Link>
                     <Link
                        href="/provider/ai-assistant"
                        className="inline-flex items-center justify-center gap-3 rounded-[24px] border border-bp-accent/20 bg-white px-8 py-4 text-[14px] font-bold text-bp-accent transition-all hover:bg-bp-accent/5 active:scale-[0.98]"
                     >
                        Ask BookPhysio AI
                     </Link>
                  </div>
               }
            />
         </div>
      )
   }

  const todayAppts = filterToday(appointments)
  const weekAppts = filterThisWeek(appointments)
  const nextAppt = getNextAppointment(todayAppts)

  // Unique patients this week
  const weekPatientCount = weekAppts.length

  // Sort timeline chronologically
  const timeline = [...todayAppts].sort((a, b) => {
    const as = a.availabilities?.starts_at ?? ''
    const bs = b.availabilities?.starts_at ?? ''
    return as < bs ? -1 : 1
  })

  return (
    <div className="max-w-[1240px] mx-auto px-6 md:px-10 py-10 md:py-16 animate-in fade-in duration-700">
      
      {/* ── Practitioner Briefing ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
        <div className="space-y-4">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-bp-border rounded-full text-[10px] font-bold uppercase text-bp-accent tracking-widest shadow-sm">
              <Activity size={12} strokeWidth={3} />
              Clinic Status: Operational
           </div>
           <h1 className="text-[36px] md:text-[48px] font-bold text-bp-primary leading-none tracking-tight">
             {greeting}, <span className="text-bp-accent">Dr. {displayName}</span> 🩺
           </h1>
           <p className="text-[15px] font-medium text-bp-body/60 max-w-[540px]">
             Manage your session flow, track performance insights, and stay connected with your patients in 12 verified practice cities.
           </p>
        </div>
        <div className="flex flex-wrap gap-3">
           <Link href="/provider/calendar" className="flex items-center justify-center gap-3 h-16 px-10 bg-bp-primary text-white text-[15px] font-bold rounded-[24px] hover:bg-bp-primary/95 transition-all hover:scale-[1.03] active:scale-[0.97] shadow-xl shadow-bp-primary/10">
              <Calendar size={18} strokeWidth={3} />
              Open Calendar
           </Link>
           <Link href="/provider/ai-assistant" className="flex items-center justify-center gap-3 h-16 px-8 bg-white border border-bp-border text-bp-primary text-[15px] font-bold rounded-[24px] hover:border-bp-accent/20 hover:text-bp-accent transition-all hover:scale-[1.02] active:scale-[0.97] shadow-sm">
              <MessageSquare size={18} strokeWidth={3} />
              Ask BookPhysio AI
           </Link>
        </div>
      </div>

      {/* ── Core Insight Hub (Stats) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        
        {/* Agenda Card */}
        <div className="group bg-white rounded-[40px] border border-bp-border p-8 shadow-[0_32px_64px_-24px_rgba(24,49,45,0.06)] relative overflow-hidden transition-all hover:border-bp-accent/10 hover:-translate-y-1">
           <div className="absolute top-0 right-0 w-32 h-32 bg-bp-accent/5 rounded-full blur-[40px] -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
           <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-8">
                 <div className="w-12 h-12 rounded-2xl bg-bp-accent/10 text-bp-primary flex items-center justify-center shadow-inner">
                    <CalendarDays size={22} strokeWidth={3} />
                 </div>
                 <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">Today</span>
              </div>
              <p className="text-[11px] font-bold text-bp-body/40 uppercase tracking-widest mb-1">Appointment Flow</p>
              <h3 className="text-[42px] font-bold text-bp-primary leading-none tracking-tight mb-2">{todayAppts.length}</h3>
              <p className="text-[14px] font-medium text-bp-body/60 mt-auto">Estimated <span className="text-bp-primary font-bold">{todayAppts.length * 45}m</span> in-session today</p>
           </div>
        </div>

        {/* Priority Highlight: Next Patient */}
        <div className="group bg-bp-primary rounded-[40px] p-8 shadow-[0_32px_64px_-24px_rgba(24,49,45,0.3)] relative overflow-hidden text-white transition-all hover:scale-[1.02]">
           <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-[60px] -mr-24 -mb-24"></div>
           <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-8">
                 <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md text-white flex items-center justify-center border border-white/10">
                    <Clock size={22} strokeWidth={3} />
                 </div>
                 {nextAppt && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest">
                       <Zap size={10} fill="currentColor" />
                       UP NEXT
                    </div>
                 )}
              </div>
              <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-1">Incoming Session</p>
              {nextAppt ? (
                 <>
                    <h3 className="text-[40px] font-bold leading-[0.9] tracking-tight mb-4">{formatSlotTime(nextAppt.availabilities?.starts_at || '')}</h3>
                    <div className="flex items-center gap-3 mt-auto">
                       <div className="w-8 h-8 rounded-full bg-white text-bp-primary flex items-center justify-center text-[11px] font-bold">{patientDisplayName(nextAppt).charAt(0)}</div>
                       <p className="text-[15px] font-bold truncate">{patientDisplayName(nextAppt)}</p>
                    </div>
                 </>
              ) : (
                 <>
                    <h3 className="text-[32px] font-bold leading-none tracking-tight mb-4 opacity-30">NO PENDING</h3>
                    <p className="text-[13px] font-medium text-white/50 mt-auto">Treatment agenda complete</p>
                 </>
              )}
           </div>
        </div>

        {/* Weekly Progress */}
        <div className="group bg-white rounded-[40px] border border-bp-border p-8 shadow-[0_32px_64px_-24px_rgba(24,49,45,0.06)] relative overflow-hidden transition-all hover:border-bp-accent/10">
           <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-8">
                 <div className="w-12 h-12 rounded-2xl bg-bp-surface text-bp-primary flex items-center justify-center border border-bp-border">
                    <TrendingUp size={22} strokeWidth={3} />
                 </div>
                 <BarChart3 className="text-bp-body/20" size={24} />
              </div>
              <p className="text-[11px] font-bold text-bp-body/40 uppercase tracking-widest mb-1">Weekly Reach</p>
              <h3 className="text-[42px] font-bold text-bp-primary leading-none tracking-tight mb-4">{weekPatientCount}</h3>
              <div className="mt-auto flex items-center justify-between gap-4">
                 <div className="flex-1 h-1.5 bg-bp-surface rounded-full overflow-hidden">
                    <div className="h-full bg-bp-accent rounded-full w-[65%]"></div>
                 </div>
                 <span className="text-[12px] font-black">65% Target</span>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10 items-start">
        
        {/* ── Schedule Timeline ── */}
        <section className="bg-white rounded-[40px] border border-bp-border p-8 md:p-10 shadow-[0_32px_64px_-24px_rgba(0,0,0,0.04)]">
           <div className="flex items-center justify-between mb-10">
              <div className="flex flex-col gap-1">
                 <h2 className="text-[20px] font-black text-bp-primary tracking-tight flex items-center gap-3">
                    <Target className="text-bp-accent" size={20} strokeWidth={3} />
                    Practice Agenda
                 </h2>
                 <p className="text-[11px] font-bold text-bp-body/40 uppercase tracking-widest">Confirmed Patient Roadmap</p>
              </div>
              <div className="flex gap-2">
                 {['Today', 'This Week'].map((lbl) => (
                    <button key={lbl} className={cn("px-4 py-2 rounded-xl text-[12px] font-black transition-all", 
                       lbl === 'Today' ? "bg-bp-accent text-white shadow-lg shadow-bp-primary/10" : "text-bp-body/40 hover:text-bp-body font-bold")}>
                       {lbl}
                    </button>
                 ))}
              </div>
           </div>

           {timeline.length === 0 ? (
              <EmptyState
                 title="Treatment calendar Clear"
                 description="No upcoming sessions found for this timeframe. Focus on your performance analytics."
                 icon={Calendar}
                 className="py-16 border-0 bg-bp-surface/50 rounded-[30px]"
              />
           ) : (
              <div className="space-y-4">
                 {timeline.map((appt) => (
                    <div key={appt.id} className="group p-5 bg-white border border-bp-border/50 rounded-[30px] hover:border-bp-accent/10 hover:shadow-xl transition-all duration-300 flex items-center gap-6">
                       <div className="flex-shrink-0 w-20 flex flex-col items-center justify-center p-2 bg-bp-surface rounded-2xl group-hover:bg-bp-accent/5 transition-colors">
                          <span className="text-[15px] font-black text-bp-primary group-hover:text-bp-accent transition-colors">{formatSlotTime(appt.availabilities?.starts_at || '')}</span>
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="text-[17px] font-black text-bp-primary truncate group-hover:translate-x-1 transition-transform">{patientDisplayName(appt)}</p>
                          <div className="flex items-center gap-3 mt-1">
                             <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-transparent", VISIT_TYPE_COLORS[appt.visit_type])}>
                                {VISIT_TYPE_LABELS[appt.visit_type]}
                             </span>
                             <div className="w-1 h-1 bg-bp-border rounded-full"></div>
                             <span className="text-[12px] font-bold text-bp-body/40">Regular Checkup</span>
                          </div>
                       </div>
                       <Link 
                         href="/provider/appointments" 
                         className="w-12 h-12 rounded-2xl bg-bp-surface flex items-center justify-center text-bp-body/20 group-hover:bg-bp-primary group-hover:text-white transition-all shadow-sm"
                       >
                          <ArrowRight size={20} strokeWidth={3} />
                       </Link>
                    </div>
                 ))}
              </div>
           )}
        </section>

        {/* ── Setup & Support Area ── */}
        <aside className="space-y-8 sticky top-28">
           
           {/* Setup Checklist (Clinical Onboarding) */}
           <div className="bg-bp-surface rounded-[40px] p-8 md:p-10 border border-bp-border">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-[18px] font-black text-bp-primary tracking-tight">Practice Readiness</h3>
                 <div className="p-2 bg-white rounded-xl border border-bp-border text-bp-accent">
                    <CheckCircle2 size={16} strokeWidth={3} />
                 </div>
              </div>
              
              <div className="space-y-6">
                 {[
                    { label: 'Clinical Profile', sub: 'Qualifications & Photo', href: '/provider/profile', done: true },
                    { label: 'Work Availability', sub: 'Clinical Hours & Buffer', href: '/provider/availability', done: false },
                    { label: 'Account Verification', sub: 'KYC & License Check', href: '/provider/profile', done: false },
                 ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 group/item">
                       <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2", 
                          item.done ? "bg-bp-accent border-bp-accent text-white" : "bg-white border-bp-border text-transparent"
                       )}>
                          <CheckCircle2 size={12} strokeWidth={4} />
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className={cn("text-[14px] font-bold", item.done ? "text-bp-body/40 line-through" : "text-bp-primary")}>{item.label}</p>
                          <p className="text-[11px] font-bold text-bp-body/20 uppercase underline-offset-4">{item.sub}</p>
                       </div>
                       {!item.done && (
                          <Link href={item.href} className="p-2 rounded-xl bg-white border border-bp-border text-bp-body/20 hover:text-bp-accent hover:border-bp-accent/50 transition-all">
                             <ArrowRight size={14} strokeWidth={3} />
                          </Link>
                       )}
                    </div>
                 ))}
              </div>
           </div>

           {/* Earnings Insight Preview */}
           <div className="bg-bp-primary rounded-[40px] p-8 md:p-10 shadow-2xl shadow-gray-900/10 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[40px] -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
              
              <div className="relative z-10">
                 <div className="flex items-center justify-between mb-8">
                    <p className="text-[11px] font-black text-white/30 uppercase tracking-widest leading-none">Earnings Outlook</p>
                    <div className="p-3 bg-white/5 rounded-2xl text-emerald-400">
                       <DollarSign size={18} strokeWidth={3} />
                    </div>
                 </div>
                 
                 <div className="space-y-6">
                    <div>
                       <h4 className="text-[32px] font-black tracking-tight leading-none mb-1">₹48,250</h4>
                       <p className="text-[13px] font-bold text-white/40">Gross Practice Revenue (Period)</p>
                    </div>
                    <Link href="/provider/earnings" className="flex items-center justify-between w-full p-5 bg-white/5 border border-white/5 rounded-3xl group/btn hover:bg-white/10 transition-all">
                       <span className="text-[14px] font-black uppercase tracking-widest text-white/80">View Analytics</span>
                       <ArrowUpRight size={20} className="text-white/20 group-hover/btn:text-white group-hover/btn:rotate-12 transition-all" />
                    </Link>
                 </div>
              </div>
           </div>
        </aside>
      </div>
    </div>
  )
}
