'use client'

import { CalendarDays, Search, Filter, Clock, MapPin, Activity, UserCircle as User, MoreHorizontal, ChevronRight, CheckCircle2, CircleAlert, ArrowUpRight } from 'lucide-react'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const STATUS_STLYES: Record<string, string> = {
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  pending: 'bg-amber-50 text-amber-700 border-amber-100',
  completed: 'bg-bp-accent/10 text-bp-accent border-bp-accent/20',
  cancelled: 'bg-bp-surface text-bp-body/40 border-bp-border',
}

const VISIT_TYPE_ICONS: Record<string, any> = {
  in_clinic: Activity,
  home_visit: MapPin,
}

function ProviderAppointmentsContent() {
  const [activeTab, setActiveTab] = useState('upcoming')
  const appointments = [
    { id: '1', patient: 'Rahul Sharma', date: 'Mar 31, 2026', time: '10:00 AM', type: 'in_clinic', status: 'confirmed', age: 34, disease: 'Back Pain' },
      { id: '2', patient: 'Ananya Iyer', date: 'Apr 01, 2026', time: '11:30 AM', type: 'home_visit', status: 'pending', age: 28, disease: 'Post-Op Rehab' },
    { id: '3', patient: 'Vikram Singh', date: 'Apr 02, 2026', time: '02:00 PM', type: 'home_visit', status: 'confirmed', age: 45, disease: 'Shoulder Injury' },
  ]

  return (
    <div className="max-w-[1240px] mx-auto px-6 md:px-10 py-10 md:py-16 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
        <div className="space-y-4">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-bp-border rounded-full text-[10px] font-black uppercase text-bp-accent tracking-widest shadow-sm">
              <Activity size={12} strokeWidth={3} />
              Session Management Hub
           </div>
           <h1 className="text-[36px] md:text-[42px] font-black text-bp-primary leading-none tracking-tighter">
             Patient <span className="text-bp-accent">Consultations</span>
           </h1>
           <p className="text-[15px] font-bold text-bp-body/40 max-w-[500px]">
             Detailed clinical roadmap of your practice sessions and recovery follow-ups.
           </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative group w-full sm:w-auto">
             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-bp-body/40 group-focus-within:text-bp-accent transition-colors">
                <Search size={18} />
             </div>
             <input 
               type="text" 
               placeholder="Search registry..." 
               className="w-full sm:w-[280px] pl-12 pr-6 py-4 rounded-[22px] border border-bp-border bg-white font-bold text-[14px] text-bp-primary placeholder:text-bp-body/40 focus:border-bp-accent/20 focus:ring-4 focus:ring-bp-accent/5 outline-none transition-all shadow-sm"
             />
          </div>
          <button className="h-[58px] px-8 bg-white border border-bp-border rounded-[22px] flex items-center gap-3 text-[14px] font-black text-bp-primary hover:bg-bp-surface transition-all shadow-sm">
             <Filter size={18} />
             Insights
          </button>
        </div>
      </div>
      <div className="mb-10 p-1.5 bg-bp-surface rounded-[28px] inline-flex items-center gap-1 border border-bp-border shadow-sm">
        {(['upcoming', 'completed', 'cancelled'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={cn(
              "px-10 py-3.5 rounded-[24px] text-[14px] font-black tracking-tight transition-all duration-300 capitalize",
              activeTab === t
                ? "bg-bp-primary text-white shadow-xl shadow-gray-900/10 ring-1 ring-black/5"
                : "text-bp-body/40 hover:text-bp-body font-bold"
            )}
          >
            {t} Flow
          </button>
        ))}
      </div>
      <div className="bg-white rounded-[44px] border border-bp-border overflow-hidden shadow-[0_32px_80px_-24px_rgba(0,0,0,0.06)] relative px-0 md:px-6 py-6 transition-all duration-500">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full text-left border-separate border-spacing-y-4">
            <thead>
              <tr className="text-bp-body/30 uppercase text-[10px] font-black tracking-[0.2em]">
                <th className="px-6 pb-2">Patient Details</th>
                <th className="px-6 pb-2">Clinical Goal</th>
                <th className="px-6 pb-2">Schedule</th>
                <th className="px-6 pb-2">Treatment Type</th>
                <th className="px-6 pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                 <tr>
                    <td colSpan={5} className="py-24 text-center">
                       <div className="flex flex-col items-center gap-6 opacity-20">
                          <Activity size={64} strokeWidth={1} />
                          <p className="text-[20px] font-bold tracking-tight">No active patient flow found</p>
                       </div>
                    </td>
                 </tr>
              ) : (
                appointments.map((appt) => (
                  <tr key={appt.id} className="group hover:scale-[1.005] transition-all duration-300">
                    <td className="px-6 py-5 bg-[#FCFCFC] border-y border-l border-bp-border rounded-l-[32px] first:rounded-tl-[32px] first:rounded-bl-[32px]">
                       <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-bp-accent/10 flex items-center justify-center text-bp-accent text-[18px] font-black shadow-sm group-hover:scale-105 transition-transform">
                             {appt.patient.charAt(0)}
                          </div>
                          <div>
                             <p className="text-[17px] font-black text-bp-primary tracking-tight leading-none mb-1.5">{appt.patient}</p>
                             <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold text-bp-body/40 uppercase tracking-widest">{appt.age}yrs Member</span>
                                <div className="w-1 h-1 bg-bp-border rounded-full"></div>
                                <div className={cn("px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border shadow-sm", STATUS_STLYES[appt.status])}>
                                   {appt.status}
                                </div>
                             </div>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-5 bg-[#FCFCFC] border-y border-bp-border">
                       <div className="flex flex-col gap-1">
                          <p className="text-[14px] font-black text-bp-primary leading-none mb-1">{appt.disease}</p>
                          <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
                             <CheckCircle2 size={12} strokeWidth={3} />
                             Treatment Verified
                          </p>
                       </div>
                    </td>
                    <td className="px-6 py-5 bg-[#FCFCFC] border-y border-bp-border">
                       <div className="space-y-1">
                          <div className="flex items-center gap-2 text-[15px] font-black text-bp-primary">
                             <CalendarDays size={16} className="text-bp-body/30" />
                             {appt.date}
                          </div>
                          <div className="flex items-center gap-2 text-[13px] font-bold text-bp-body/40">
                             <Clock size={14} className="text-bp-body/30" />
                             {appt.time}
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-5 bg-[#FCFCFC] border-y border-bp-border">
                       <div className="flex items-center gap-3 py-2 px-4 bg-white border border-bp-border rounded-2xl w-fit shadow-sm">
                          {(() => {
                             const Icon = VISIT_TYPE_ICONS[appt.type] || Activity
                             return <Icon size={16} className="text-bp-body/40" />
                          })()}
                          <span className="text-[12px] font-black text-bp-primary uppercase tracking-widest">{appt.type.replace('_', ' ')}</span>
                       </div>
                    </td>
                    <td className="px-6 py-5 bg-[#FCFCFC] border-y border-r border-bp-border rounded-r-[32px] text-right">
                       <div className="flex items-center justify-end gap-2">
                          <button className="w-12 h-12 bg-white border border-bp-border rounded-2xl flex items-center justify-center text-bp-body/40 hover:text-bp-accent hover:border-bp-accent/20 transition-all shadow-sm">
                             <MoreHorizontal size={20} />
                          </button>
                          <Link href={`/provider/appointments/${appt.id}`} className="h-12 px-6 bg-bp-primary text-white rounded-2xl text-[13px] font-black flex items-center gap-3 hover:bg-bp-accent transition-all shadow-lg active:scale-95 group/view">
                             View Lab
                             <ArrowUpRight size={18} strokeWidth={3} className="text-bp-accent/70 group-hover:rotate-12 transition-transform" />
                          </Link>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="p-8 bg-bp-surface rounded-[40px] border border-bp-border flex items-center gap-8 group cursor-pointer hover:bg-white hover:shadow-xl transition-all duration-500">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-bp-accent shadow-sm transition-transform group-hover:rotate-12">
               <Activity size={32} strokeWidth={3} />
            </div>
            <div>
               <p className="text-[14px] font-black text-bp-body/40 uppercase tracking-widest mb-1">Clinic Efficiency</p>
               <h4 className="text-[24px] font-black text-bp-primary tracking-tighter mb-2">94% Retention Rate</h4>
               <p className="text-[12px] font-bold text-bp-body/40 italic">Excellent benchmark for independent practice</p>
            </div>
         </div>
         <div className="p-8 bg-bp-surface rounded-[40px] border border-bp-border flex items-center gap-8 group cursor-pointer hover:bg-white hover:shadow-xl transition-all duration-500">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-bp-secondary shadow-sm transition-transform group-hover:scale-110">
               <CircleAlert size={32} strokeWidth={3} />
            </div>
            <div>
               <p className="text-[14px] font-black text-bp-body/40 uppercase tracking-widest mb-1">Practice Alert</p>
               <h4 className="text-[24px] font-black text-bp-primary tracking-tighter mb-2">2 Pending Approvals</h4>
               <p className="text-[12px] font-bold text-bp-body/40 underline underline-offset-4 decoration-orange-300">Resolve patient requests now →</p>
            </div>
         </div>
      </div>
    </div>
  )
}

export default function ProviderAppointments() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-bp-body/40">Loading Clinical Flow...</div>}>
      <ProviderAppointmentsContent />
    </Suspense>
  )
}
