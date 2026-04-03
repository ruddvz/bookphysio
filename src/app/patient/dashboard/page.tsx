'use client'

import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import { Heart, Search, Calendar, Users, ArrowRight, CircleAlert, CalendarPlus, Activity, TrendingUp, ShieldCheck, Zap, MoreHorizontal, Clock, ArrowUpRight, MessageSquare, ChevronRight } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatApptDate, providerDisplayName } from './dashboard-utils'
import { DashboardSkeleton } from './DashboardSkeleton'
import { cn } from '@/lib/utils'

type VisitType = 'in_clinic' | 'home_visit'

interface Appointment {
  id: string
  status: string
  visit_type: VisitType
  fee_inr: number
  availabilities: { starts_at: string } | null
  providers: {
    users: { full_name: string } | null
    specialties?: { name: string }[]
  } | null
  locations: { city: string } | null
}

const VISIT_TYPE_LABELS: Record<VisitType, string> = {
  in_clinic: 'In Clinic',
  home_visit: 'Home Visit',
}

const VISIT_TYPE_COLORS: Record<VisitType, string> = {
  in_clinic: 'bg-bp-accent/10 text-bp-accent border-bp-accent/20',
  home_visit: 'bg-[#FF6B35]/10 text-[#FF6B35] border-[#FF6B35]/20',
}

export default function PatientDashboardHome() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
   const [referralCopied, setReferralCopied] = useState(false)

  const displayName = (user?.user_metadata?.full_name as string | undefined)?.split(' ')[0] ?? 'there'

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

   async function handleCopyReferralLink() {
      const referralLink = `${window.location.origin}/signup?ref=bp-${user?.id?.slice(-6) ?? 'demo'}`

      try {
         if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(referralLink)
         } else {
            const textarea = document.createElement('textarea')
            textarea.value = referralLink
            textarea.setAttribute('readonly', 'true')
            textarea.style.position = 'absolute'
            textarea.style.left = '-9999px'
            document.body.appendChild(textarea)
            textarea.select()
            document.execCommand('copy')
            document.body.removeChild(textarea)
         }

         setReferralCopied(true)
         window.setTimeout(() => setReferralCopied(false), 2200)
      } catch {
         setReferralCopied(false)
      }
   }

  const fetchAppointments = useCallback(() => {
    setLoading(true)
    setError(false)
    fetch('/api/appointments')
      .then((r) => r.json())
      .then((data: { appointments?: Appointment[] }) => setAppointments(data.appointments ?? []))
      .catch((err) => {
        console.error('Fetch error:', err)
        setError(true)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  const now = new Date()
  const upcoming = appointments.filter((a) => {
    const start = a.availabilities?.starts_at
    return a.status !== 'cancelled' && start && new Date(start) >= now
  })
  const past = appointments.filter((a) => {
    const start = a.availabilities?.starts_at
    return a.status === 'completed' || (start && new Date(start) < now)
  })
  const nextAppt = upcoming[0] ?? null
   const snapshotCards = [
      {
         title: 'Next session',
         value: nextAppt?.availabilities?.starts_at ? formatApptDate(nextAppt.availabilities.starts_at) : 'No booking yet',
         detail: nextAppt ? providerDisplayName(nextAppt) : 'Find your next match with AI',
         icon: Calendar,
         href: '/patient/appointments',
      },
      {
         title: 'Recovery pace',
         value: '72%',
         detail: 'On track with your mobility goal',
         icon: Activity,
         href: '/patient/motio',
      },
      {
         title: 'Care team',
         value: `${past.length}`,
         detail: 'Previous specialists in record',
         icon: Users,
         href: '/search',
      },
      {
         title: 'AI guidance',
         value: 'BookPhysio AI',
         detail: 'Triage symptoms in focused chat',
         icon: MessageSquare,
         href: '/patient/motio',
      },
   ]

  if (loading) return <DashboardSkeleton />

  return (
    <div className="max-w-[1240px] mx-auto px-6 md:px-10 py-10 md:py-12 animate-in fade-in duration-700">
      
      {/* ── Top Section: Greeting & Quick Action ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-4">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-bp-border rounded-full text-[10px] font-bold uppercase text-bp-accent tracking-widest shadow-sm">
              <ShieldCheck size={12} strokeWidth={3} />
              Verified Patient
           </div>
           <h1 className="text-[36px] md:text-[48px] font-bold text-bp-primary leading-none tracking-tight">
             {greeting}, <span className="text-bp-accent">{displayName}</span> 👋
           </h1>
           <p className="text-[16px] md:text-[18px] font-medium text-bp-body/60 max-w-[500px]">
             Welcome back to your recovery hub. You have <span className="text-bp-primary font-bold">{upcoming.length} upcoming sessions</span> this week.
           </p>
        </div>
            <div className="flex flex-wrap gap-3">
               <Link
                  href="/search"
                  className="flex items-center gap-4 px-10 py-5 bg-bp-primary text-white text-[16px] font-bold rounded-[24px] hover:bg-bp-primary/95 transition-all hover:scale-[1.03] active:scale-[0.97] shadow-xl shadow-bp-primary/10"
               >
                  Book New Therapy
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                      <CalendarPlus size={18} strokeWidth={3} />
                  </div>
               </Link>
               <Link
                  href="/patient/motio"
                  className="flex items-center gap-4 px-8 py-5 bg-white border-2 border-bp-accent/30 text-bp-accent text-[16px] font-bold rounded-[24px] hover:bg-bp-accent/5 hover:border-bp-accent transition-all hover:scale-[1.02] active:scale-[0.97] shadow-lg shadow-bp-accent/5"
               >
                  Ask BookPhysio AI
                  <div className="w-8 h-8 rounded-xl bg-bp-accent/10 flex items-center justify-center text-bp-accent group-hover:scale-110 transition-transform">
                      <MessageSquare size={18} strokeWidth={3} />
                  </div>
               </Link>
            </div>
      </div>

         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
            {snapshotCards.map((card) => {
               const SnapshotIcon = card.icon

               return (
                  <Link
                     key={card.title}
                     href={card.href}
                     className="group rounded-[28px] border border-bp-border bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-bp-accent/20 hover:shadow-xl shadow-bp-primary/5 active:scale-95"
                  >
                     <div className="flex items-center justify-between gap-4 mb-5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-bp-accent/5 text-bp-accent transition-all group-hover:bg-bp-accent/10 group-hover:scale-110">
                           <SnapshotIcon size={22} strokeWidth={2.5} />
                        </div>
                        <div className="h-8 w-8 rounded-full bg-bp-surface flex items-center justify-center text-bp-body/20 transition-all group-hover:text-bp-accent group-hover:bg-bp-accent/5">
                           <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </div>
                     </div>
                     <p className="text-[11px] font-black uppercase tracking-[0.2em] text-bp-body/40 leading-none">{card.title}</p>
                     <p className="mt-2 text-[22px] font-black tracking-tighter text-bp-primary leading-tight">{card.value}</p>
                     <div className="mt-3 flex items-center gap-1.5 overflow-hidden">
                         <p className="text-[12px] font-bold text-bp-body/60 truncate group-hover:text-bp-primary transition-colors">{card.detail}</p>
                     </div>
                  </Link>
               )
            })}
         </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10 items-start">
        
        {/* ── Left Column: Activity & Care Team ── */}
        <div className="space-y-10">
          
      {/* Recovery Progress Widget */}
          <section className="bg-white rounded-[40px] border border-bp-border p-8 md:p-10 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-bp-accent/5 rounded-full blur-[80px] -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-700"></div>
            
            <div className="relative z-10">
               <div className="flex items-center justify-between mb-10">
                  <div className="flex flex-col gap-1">
                     <h2 className="text-[20px] font-bold text-bp-primary tracking-tight flex items-center gap-3">
                        <Activity className="text-bp-accent" size={20} strokeWidth={3} />
                        Recovery Journey
                     </h2>
                     <p className="text-[12px] font-bold text-bp-body/40 uppercase tracking-widest">Active Treatment Phase</p>
                  </div>
                  <div className="p-3 bg-bp-accent/10 rounded-2xl text-bp-accent shadow-sm">
                     <TrendingUp size={22} strokeWidth={3} />
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-6">
                     <div className="flex items-end gap-3">
                        <span className="text-[52px] font-bold text-bp-primary leading-none tracking-tighter">72<span className="text-[20px] text-bp-body/20 ml-1">%</span></span>
                        <div className="flex flex-col pb-1.5">
                           <span className="text-[13px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                              <Zap size={11} strokeWidth={4} fill="currentColor" />
                              On Track
                           </span>
                           <span className="text-[11px] font-bold text-bp-body/40 tracking-tight">Mobility Goal Progress</span>
                        </div>
                     </div>
                     <div className="h-5 w-full bg-bp-surface rounded-full overflow-hidden border border-bp-border p-1.5">
                        <div className="h-full bg-gradient-to-r from-bp-accent to-emerald-400 rounded-full w-[72%] shadow-[0_0_12px_rgba(18,179,160,0.3)] transition-all duration-1000"></div>
                     </div>
                  </div>
                  <div className="bg-bp-surface/50 rounded-[28px] p-6 border border-bp-border flex flex-col justify-center gap-3">
                     <div className="bg-white p-4 rounded-2xl border border-bp-border shadow-sm flex items-center gap-4 hover:border-bp-accent/20 transition-colors">
                        <div className="text-[24px]">🎯</div>
                        <div>
                           <p className="text-[15px] font-bold text-bp-primary leading-none mb-1.5">Weekly Goal</p>
                           <p className="text-[13px] font-medium text-bp-body/60 italic">3 Sessions · <span className="text-bp-accent font-bold">2 Complete</span></p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </section>

          {/* Past Care Team */}
          <section className="bg-white rounded-[40px] border border-bp-border p-8 md:p-10 shadow-sm relative group overflow-hidden">
             <div className="absolute top-0 left-0 w-32 h-32 bg-bp-accent/5 rounded-full blur-[40px] -ml-16 -mt-16 transition-transform group-hover:scale-110"></div>
             
             <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                   <div className="flex flex-col gap-1">
                      <h2 className="text-[20px] font-bold text-bp-primary tracking-tight flex items-center gap-3">
                         <Users className="text-bp-accent" size={20} strokeWidth={3} />
                         My Health Team
                      </h2>
                      <p className="text-[11px] font-bold text-bp-body/40 uppercase tracking-widest">{past.length} Previous Specialists</p>
                   </div>
                   <button aria-label="Open care team actions" title="Open care team actions" className="p-3 bg-bp-surface rounded-2xl text-bp-body/40 hover:text-bp-accent transition-all hover:scale-105 active:scale-95 shadow-sm">
                      <MoreHorizontal size={20} strokeWidth={3} />
                   </button>
                </div>

                {past.length === 0 ? (
                   <div className="py-12 text-center bg-bp-surface/50 rounded-[32px] border border-dashed border-bp-border/60">
                      <div className="w-12 h-12 rounded-2xl bg-white mx-auto mb-4 flex items-center justify-center text-bp-body/10 border border-bp-border shadow-sm">
                         <Users size={24} />
                      </div>
                      <p className="text-[14px] font-bold text-bp-body/40">Build your recovery team.</p>
                      <Link href="/search" className="text-[12px] font-black text-bp-accent hover:underline mt-2 inline-block">Browse Specialists</Link>
                   </div>
                ) : (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {past.slice(0, 4).map((a) => (
                         <div key={a.id} className="group/item p-5 bg-white border border-bp-border rounded-[30px] hover:shadow-lg hover:border-bp-accent/20 transition-all duration-300 flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-bp-surface border border-bp-border flex items-center justify-center text-bp-accent text-[20px] font-black group-hover/item:bg-bp-accent/10 transition-colors">
                               {providerDisplayName(a).charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                               <p className="text-[16px] font-bold text-bp-primary truncate leading-tight mb-1">{providerDisplayName(a)}</p>
                               <div className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                  <p className="text-[11px] font-bold text-bp-body/40 uppercase tracking-wider truncate">{a.providers?.specialties?.[0]?.name ?? 'Physiotherapist'}</p>
                               </div>
                            </div>
                            <Link 
                               href={`/patient/appointments/${a.id}`} 
                               className="w-11 h-11 rounded-2xl bg-bp-surface flex items-center justify-center text-bp-body/20 group-hover/item:bg-bp-primary group-hover/item:text-white transition-all shadow-sm group-hover/item:scale-105"
                               aria-label={`View appointment with ${providerDisplayName(a)}`}
                            >
                               <ChevronRight size={20} strokeWidth={3} />
                            </Link>
                         </div>
                      ))}
                   </div>
                )}
             </div>
          </section>
          
          {/* Growth & Referral Loop: Physio Journal */}
          <section className="bg-gradient-to-br from-bp-primary to-[#005A52] rounded-[40px] p-8 md:p-10 shadow-2xl shadow-bp-primary/20 text-white relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-700"></div>
             
             <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 space-y-6">
                   <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/10 rounded-full text-[10px] font-bold uppercase text-bp-accent tracking-widest shadow-sm">
                      <Heart size={12} strokeWidth={3} fill="currentColor" />
                      Community Referral
                   </div>
                   <h2 className="text-[28px] md:text-[32px] font-black leading-none tracking-tighter">
                      Share the progress, <br />get ₹500 off.
                   </h2>
                   <p className="text-[15px] font-bold text-teal-100/60 leading-relaxed max-w-[400px]">
                      Know someone struggling with recovery? Give them ₹500 off their first session and receive ₹500 credit once they complete it.
                   </p>
                   
                   <button onClick={handleCopyReferralLink} className="flex items-center gap-3 px-8 py-4 bg-[#FF6B35] text-white text-[14px] font-bold rounded-2xl hover:bg-[#FF6B35]/90 transition-all hover:scale-[1.03] active:scale-[0.97] shadow-xl shadow-[#FF6B35]/20 group/btn">
                      {referralCopied ? 'Referral Link Copied' : 'Copy My Referral Link'}
                      <ArrowRight size={18} strokeWidth={3} className="group-hover/btn:translate-x-1 transition-transform" />
                   </button>
                </div>
                
                <div className="hidden md:flex w-[240px] h-[180px] bg-white/5 backdrop-blur-md rounded-[32px] border border-white/10 items-center justify-center relative shadow-inner">
                   <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                   <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-bp-accent shadow-2xl relative overflow-hidden group/star">
                         <div className="absolute inset-0 bg-white/20 scale-0 group-hover/star:scale-150 transition-transform duration-700 rounded-full"></div>
                         <Zap size={32} strokeWidth={3} fill="currentColor" className="relative z-10" />
                      </div>
                      <div className="text-center md:text-left">
                         <p className="text-[20px] font-black leading-none">₹500 Credit</p>
                         <p className="text-[12px] font-bold tracking-widest uppercase text-white/40 mt-1">Verified Gift</p>
                      </div>
                   </div>
                </div>
             </div>
          </section>
        </div>


        {/* ── Right Column: Upcoming & Support ── */}
        <aside className="space-y-6 sticky top-28">
           
           {/* Primary Highlight: Next Appointment */}
           <div className="bg-bp-primary rounded-[40px] p-8 md:p-10 shadow-2xl shadow-bp-primary/10 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-[60px] -mr-24 -mt-24 transition-transform group-hover:scale-110"></div>
              
              <div className="relative z-10">
                 <div className="flex justify-between items-start mb-10">
                    <div className="flex flex-col gap-1">
                       <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em]">Next Booking</p>
                       <h2 className="text-[22px] font-black tracking-tighter">Active Upcoming</h2>
                    </div>
                    {nextAppt && (
                       <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center animate-pulse border border-white/10">
                          <Clock size={24} strokeWidth={3} className="text-bp-accent" />
                       </div>
                    )}
                 </div>

                 {nextAppt ? (
                    <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
                       <div className="flex items-center gap-5 px-6 py-5 bg-white/5 rounded-[32px] border border-white/10 backdrop-blur-sm group-hover:bg-white/10 transition-all">
                          <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-bp-primary text-[28px] font-black shadow-2xl group-hover:scale-110 transition-transform ring-4 ring-white/5">
                             {providerDisplayName(nextAppt).charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                             <h3 className="text-[19px] font-black leading-tight mb-1 animate-in fade-in slide-in-from-left-2 duration-700">{providerDisplayName(nextAppt)}</h3>
                             <div className="flex items-center gap-2 opacity-60">
                                <Activity size={14} strokeWidth={3} className="text-bp-accent" />
                                <p className="text-[11px] font-bold uppercase tracking-widest truncate">
                                   {nextAppt.providers?.specialties?.[0]?.name ?? 'Physiotherapist'}
                                </p>
                             </div>
                          </div>
                       </div>

                       <div className="grid grid-cols-2 gap-3">
                          <div className="p-6 bg-white/5 rounded-[32px] border border-white/10 flex flex-col gap-3 group-hover:bg-white/10 transition-all group/item">
                             <div className="w-8 h-8 rounded-xl bg-bp-accent/20 flex items-center justify-center text-bp-accent group-hover/item:scale-110 transition-transform">
                                <Calendar size={16} strokeWidth={3} />
                             </div>
                             <div>
                                <p className="text-[16px] font-black leading-none">{formatApptDate(nextAppt.availabilities?.starts_at ?? '').split(',')[0]}</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mt-1">{formatApptDate(nextAppt.availabilities?.starts_at ?? '').split(',')[1]}</p>
                             </div>
                          </div>
                          <div className="p-6 bg-white/5 rounded-[32px] border border-white/10 flex flex-col gap-3 group-hover:bg-white/10 transition-all group/item">
                             <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover/item:scale-110 transition-transform">
                                <Clock size={16} strokeWidth={3} />
                             </div>
                             <div>
                                <p className="text-[16px] font-black leading-none">{new Date(nextAppt.availabilities?.starts_at ?? '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mt-1">{VISIT_TYPE_LABELS[nextAppt.visit_type]}</p>
                             </div>
                          </div>
                       </div>

                       <div className="space-y-4 pt-4">
                          <Link
                             href={`/patient/appointments/${nextAppt.id}`}
                             className="flex items-center justify-center gap-4 w-full py-6 bg-white text-bp-primary text-[15px] font-black rounded-[28px] hover:bg-bp-surface transition-all hover:scale-[1.03] active:scale-[0.97] shadow-2xl group/btn"
                          >
                             Manage Booking
                             <ArrowRight size={20} strokeWidth={3} className="group-hover/btn:translate-x-1 transition-transform" />
                          </Link>
                          <div className="flex items-center justify-center gap-2 py-2 px-4 bg-white/5 rounded-full border border-white/5">
                             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                             <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Appointment Confirmed</p>
                          </div>
                       </div>
                    </div>
                 ) : (
                    <div className="py-20 text-center space-y-6">
                       <div className="w-20 h-20 rounded-[30px] bg-white/10 flex items-center justify-center mx-auto grayscale opacity-50">
                          <Calendar size={32} />
                       </div>
                       <p className="text-[16px] font-medium text-white/60">No pending sessions found</p>
                       <Link href="/search" className="inline-block px-8 py-3 bg-white text-bp-primary rounded-full text-[14px] font-bold uppercase tracking-widest shadow-lg hover:bg-bp-surface transition-colors">Start Recovery</Link>
                    </div>
                 )}
              </div>
           </div>

           {/* Support Mini Widget */}
           <Link href="/patient/motio" className="bg-bp-surface rounded-[40px] p-8 border border-bp-border group cursor-pointer hover:bg-white hover:shadow-xl transition-all duration-300 block">
              <div className="flex items-center gap-5">
                 <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-bp-accent shadow-sm transition-transform group-hover:rotate-12">
                    <MessageSquare size={20} />
                 </div>
                 <div className="flex-1">
                    <p className="text-[15px] font-bold text-bp-primary leading-none mb-1">Need help?</p>
                    <p className="text-[12px] font-medium text-bp-body/40">Ask BookPhysio AI</p>
                 </div>
                 <div className="w-8 h-8 rounded-full border border-bp-border flex items-center justify-center text-bp-body/20 group-hover:text-bp-accent group-hover:border-bp-accent/20 transition-colors">
                    <ChevronRight size={16} strokeWidth={3} />
                 </div>
              </div>
           </Link>
        </aside>
      </div>
    </div>
  )
}
