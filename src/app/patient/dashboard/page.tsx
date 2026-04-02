'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
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
  in_clinic: 'bg-teal-50 text-teal-700 border-teal-100',
  home_visit: 'bg-orange-50 text-orange-700 border-orange-100',
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

  function fetchAppointments() {
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
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

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
         detail: nextAppt ? providerDisplayName(nextAppt) : 'Use BookPhysio AI to find your next match',
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
         detail: 'Previous specialists in your record',
         icon: Users,
         href: '/search',
      },
      {
         title: 'AI guidance',
         value: 'BookPhysio AI',
         detail: 'Triage symptoms in one focused chat',
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
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-gray-100 rounded-full text-[10px] font-black uppercase text-[#00766C] tracking-widest shadow-sm">
              <ShieldCheck size={12} strokeWidth={3} />
              Verified Patient Dashboard
           </div>
           <h1 className="text-[36px] md:text-[48px] font-black text-[#333333] leading-none tracking-tighter">
             {greeting}, <span className="text-[#00766C]">{displayName}</span> 👋
           </h1>
           <p className="text-[16px] md:text-[18px] font-bold text-gray-400 max-w-[500px]">
             Welcome back to your recovery hub. You have <span className="text-[#333333] font-black">{upcoming.length} upcoming sessions</span> this week.
           </p>
        </div>
            <div className="flex flex-wrap gap-3">
               <Link
                  href="/search"
                  className="flex items-center gap-4 px-10 py-5 bg-[#333333] text-white text-[16px] font-black rounded-[24px] hover:bg-[#00766C] transition-all hover:scale-[1.03] active:scale-[0.97] shadow-xl shadow-gray-200"
               >
                  Book New Therapy
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                      <CalendarPlus size={18} strokeWidth={3} />
                  </div>
               </Link>
               <Link
                  href="/patient/motio"
                  className="flex items-center gap-4 px-8 py-5 bg-white border border-gray-100 text-[#333333] text-[16px] font-black rounded-[24px] hover:border-teal-100 hover:text-[#00766C] transition-all hover:scale-[1.02] active:scale-[0.97] shadow-sm"
               >
                  Ask BookPhysio AI
                  <div className="w-8 h-8 rounded-xl bg-[#E6F4F3] flex items-center justify-center text-[#00766C]">
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
                     className="group rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-teal-100 hover:shadow-xl"
                  >
                     <div className="flex items-center justify-between gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E6F4F3] text-[#00766C] transition-transform group-hover:scale-105">
                           <SnapshotIcon size={20} strokeWidth={2.5} />
                        </div>
                        <ArrowUpRight size={18} className="text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                     </div>
                     <p className="mt-4 text-[11px] font-black uppercase tracking-[0.22em] text-gray-400">{card.title}</p>
                     <p className="mt-1 text-[18px] font-black tracking-tight text-[#333333]">{card.value}</p>
                     <p className="mt-2 text-[12px] font-medium leading-relaxed text-[#888888]">{card.detail}</p>
                  </Link>
               )
            })}
         </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10 items-start">
        
        {/* ── Left Column: Activity & Care Team ── */}
        <div className="space-y-10">
          
          {/* Recovery Progress Widget */}
          <section className="bg-white rounded-[40px] border border-gray-100 p-8 md:p-10 shadow-[0_32px_64px_-24px_rgba(0,0,0,0.04)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50/30 rounded-full blur-[80px] -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-700"></div>
            
            <div className="relative z-10">
               <div className="flex items-center justify-between mb-10">
                  <div className="flex flex-col gap-1">
                     <h2 className="text-[20px] font-black text-[#333333] tracking-tight flex items-center gap-3">
                        <Activity className="text-[#00766C]" size={20} strokeWidth={3} />
                        Recovery Journey
                     </h2>
                     <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Active Treatment Phase</p>
                  </div>
                  <div className="p-3 bg-teal-50 rounded-2xl text-[#00766C]">
                     <TrendingUp size={22} strokeWidth={3} />
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-6">
                     <div className="flex items-end gap-3">
                        <span className="text-[52px] font-black text-[#333333] leading-none tracking-tighter">72<span className="text-[20px] text-gray-300 ml-1">%</span></span>
                        <div className="flex flex-col pb-1.5">
                           <span className="text-[12px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                              <Zap size={10} strokeWidth={4} fill="currentColor" />
                              On Track
                           </span>
                           <span className="text-[10px] font-bold text-gray-400 tracking-tight">Mobility Goal Progress</span>
                        </div>
                     </div>
                     <div className="h-4 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100 p-1">
                        <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full w-[72%] shadow-[0_0_12px_rgba(16,185,129,0.3)]"></div>
                     </div>
                  </div>
                  <div className="bg-gray-50 rounded-[28px] p-6 border border-gray-100 flex flex-col justify-center gap-3">
                     <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="text-[24px]">🎯</div>
                        <div>
                           <p className="text-[14px] font-black text-[#333333] leading-none mb-1">Weekly Goal</p>
                           <p className="text-[12px] font-bold text-gray-400">3 PT Sessions · 2 Complete</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </section>

          {/* Past Care Team */}
          <section className="bg-white rounded-[40px] border border-gray-100 p-8 md:p-10 shadow-[0_32px_64px_-24px_rgba(0,0,0,0.04)]">
             <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col gap-1">
                   <h2 className="text-[20px] font-black text-[#333333] tracking-tight flex items-center gap-3">
                      <Users className="text-[#00766C]" size={20} strokeWidth={3} />
                      My Health Team
                   </h2>
                   <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest tracking-widest">{past.length} Previous Specialists</p>
                </div>
                <button aria-label="Open care team actions" title="Open care team actions" className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-[#00766C] transition-colors">
                   <MoreHorizontal size={20} strokeWidth={3} />
                </button>
             </div>

             {past.length === 0 ? (
                <div className="py-10 text-center bg-gray-50/50 rounded-[30px] border border-dashed border-gray-200">
                   <p className="text-[15px] font-bold text-gray-400">No past providers yet. Start your first session!</p>
                </div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {past.slice(0, 4).map((a) => (
                      <div key={a.id} className="group p-5 bg-white border border-gray-100 rounded-[30px] hover:shadow-xl hover:border-[#00766C]/10 transition-all duration-300 flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-[#00766C] text-[18px] font-black group-hover:scale-110 transition-transform">
                            {providerDisplayName(a).charAt(0)}
                         </div>
                         <div className="flex-1 min-w-0">
                            <p className="text-[15px] font-black text-[#333333] truncate">{providerDisplayName(a)}</p>
                            <p className="text-[12px] font-bold text-gray-400 truncate">{a.providers?.specialties?.[0]?.name ?? 'Physiotherapist'}</p>
                         </div>
                                     <Link 
                                        href={`/patient/appointments/${a.id}`} 
                                        className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#00766C] group-hover:text-white transition-all shadow-sm"
                                     >
                            <ArrowUpRight size={18} strokeWidth={3} />
                         </Link>
                      </div>
                   ))}
                </div>
             )}
          </section>
          
          {/* Growth & Referral Loop: Physio Journal */}
          <section className="bg-gradient-to-br from-[#00766C] to-[#005A52] rounded-[40px] p-8 md:p-10 shadow-2xl shadow-teal-900/20 text-white relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-700"></div>
             
             <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 space-y-6">
                   <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/10 rounded-full text-[10px] font-black uppercase text-teal-100 tracking-widest shadow-sm">
                      <Heart size={12} strokeWidth={3} fill="currentColor" />
                      Community Referral
                   </div>
                   <h2 className="text-[28px] md:text-[32px] font-black leading-none tracking-tighter">
                      Share the progress, <br />get ₹500 off.
                   </h2>
                   <p className="text-[15px] font-bold text-teal-100/60 leading-relaxed max-w-[400px]">
                      Know someone struggling with recovery? Give them ₹500 off their first session and receive ₹500 credit once they complete it.
                   </p>
                   
                   <button onClick={handleCopyReferralLink} className="flex items-center gap-3 px-8 py-4 bg-white text-[#00766C] text-[14px] font-black rounded-2xl hover:bg-teal-50 transition-all hover:scale-[1.03] active:scale-[0.97] shadow-xl group/btn">
                      {referralCopied ? 'Referral Link Copied' : 'Copy My Referral Link'}
                      <ArrowRight size={18} strokeWidth={3} className="group-hover/btn:translate-x-1 transition-transform" />
                   </button>
                </div>
                
                <div className="hidden md:flex w-[240px] h-[180px] bg-white/5 backdrop-blur-md rounded-[32px] border border-white/10 items-center justify-center relative shadow-inner">
                   <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                   <div className="flex flex-col items-center gap-3 animate-bounce duration-[2000ms]">
                      <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-[#00766C] shadow-2xl">
                         <Zap size={32} strokeWidth={3} fill="currentColor" />
                      </div>
                      <span className="text-[12px] font-black tracking-widest uppercase">Verified Gift</span>
                   </div>
                </div>
             </div>
          </section>
        </div>


        {/* ── Right Column: Upcoming & Support ── */}
        <aside className="space-y-6 sticky top-28">
           
           {/* Primary Highlight: Next Appointment */}
           <div className="bg-[#00766C] rounded-[40px] p-8 md:p-10 shadow-2xl shadow-teal-900/10 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-[60px] -mr-24 -mt-24 transition-transform group-hover:scale-110"></div>
              
              <div className="relative z-10">
                 <div className="flex justify-between items-start mb-10">
                    <div className="flex flex-col gap-1">
                       <p className="text-[11px] font-black text-white/50 uppercase tracking-widest">Next Booking</p>
                       <h2 className="text-[20px] font-black tracking-tight">Active Upcoming</h2>
                    </div>
                    {nextAppt && (
                       <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center animate-pulse">
                          <Clock size={22} strokeWidth={3} />
                       </div>
                    )}
                 </div>

                 {nextAppt ? (
                    <div className="space-y-8">
                       <div className="flex items-center gap-4 px-5 py-4 bg-white/10 rounded-3xl border border-white/10">
                          <div className="w-12 h-12 rounded-2xl bg-white text-[#00766C] flex items-center justify-center text-[20px] font-black shadow-lg">
                             {providerDisplayName(nextAppt).charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                             <p className="text-[17px] font-black truncate">{providerDisplayName(nextAppt)}</p>
                             <p className="text-[13px] font-bold text-white/60 truncate">{nextAppt.providers?.specialties?.[0]?.name ?? 'Physiotherapist'}</p>
                          </div>
                          <div className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", 
                             nextAppt.visit_type === 'in_clinic' ? "bg-emerald-500" : "bg-orange-500"
                          )}>
                             {VISIT_TYPE_LABELS[nextAppt.visit_type].replace('In Clinic', 'Clinic')}
                          </div>
                       </div>

                       <div className="space-y-4">
                          <div className="flex items-center gap-4 text-[22px] font-black tracking-tighter">
                             <Calendar size={22} className="text-white/40" />
                             {nextAppt.availabilities?.starts_at ? formatApptDate(nextAppt.availabilities.starts_at) : 'Date Pending'}
                          </div>
                          <p className="text-[13px] font-bold text-white/40 leading-relaxed">
                            Professional consultation confirmed. Please arrive 10 minutes prior to your scheduled time.
                          </p>
                       </div>

                       <Link
                          href={`/patient/appointments/${nextAppt.id}`}
                          className="flex items-center justify-center gap-3 w-full py-5 rounded-[24px] bg-white text-[#00766C] text-[16px] font-black hover:bg-teal-50 transition-all hover:scale-[1.02] shadow-xl group/btn active:scale-[0.98]"
                       >
                          Manage Session
                          <ArrowRight size={20} strokeWidth={3} className="group-hover/btn:translate-x-1 transition-transform" />
                       </Link>
                    </div>
                 ) : (
                    <div className="py-20 text-center space-y-6">
                       <div className="w-20 h-20 rounded-[30px] bg-white/10 flex items-center justify-center mx-auto grayscale opacity-50">
                          <Calendar size={32} />
                       </div>
                       <p className="text-[16px] font-bold text-white/60">No pending sessions found</p>
                       <Link href="/search" className="inline-block px-8 py-3 bg-white text-[#00766C] rounded-full text-[14px] font-black uppercase tracking-widest shadow-lg">Start Recovery</Link>
                    </div>
                 )}
              </div>
           </div>

           {/* Support Mini Widget */}
           <Link href="/patient/motio" className="bg-gray-50 rounded-[40px] p-8 border border-gray-100 group cursor-pointer hover:bg-white hover:shadow-xl transition-all duration-300 block">
              <div className="flex items-center gap-5">
                 <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-teal-600 shadow-sm transition-transform group-hover:rotate-12">
                    <MessageSquare size={20} />
                 </div>
                 <div className="flex-1">
                    <p className="text-[15px] font-black text-[#333333] leading-none mb-1">Need help?</p>
                    <p className="text-[12px] font-bold text-gray-400">Ask BookPhysio AI</p>
                 </div>
                 <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-300 group-hover:text-teal-600 group-hover:border-teal-100 transition-colors">
                    <ChevronRight size={16} strokeWidth={3} />
                 </div>
              </div>
           </Link>
        </aside>
      </div>
    </div>
  )
}
