import { UserCircle, Phone, MapPin, ClipboardList, CheckCircle2, ArrowLeft, MoreHorizontal, Activity, Zap, ShieldCheck, Mail, Calendar, Clock, DollarSign, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

export async function generateStaticParams() {
  return [{ id: 'placeholder' }]
}

export default async function ProviderAppointmentDetail({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const resolvedParams = await params
  const id = resolvedParams?.id || 'placeholder'

  return (
    <div className="max-w-[1000px] mx-auto px-6 md:px-10 py-10 md:py-16 animate-in fade-in duration-700">
      <div className="mb-10">
         <Link href="/provider/appointments" className="inline-flex items-center gap-3 text-gray-400 hover:text-[#00766C] font-black text-[11px] uppercase tracking-[0.2em] transition-colors group no-underline">
            <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center group-hover:border-teal-100 group-hover:bg-teal-50 transition-all">
               <ArrowLeft size={14} strokeWidth={3} />
            </div>
            Back to Registry
         </Link>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
        <div className="space-y-4 text-left">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#EEF2FF] border border-blue-100 rounded-full text-[10px] font-black uppercase text-blue-600 tracking-widest shadow-sm">
              <ShieldCheck size={12} strokeWidth={3} />
              Verified Clinical Record
           </div>
           <h1 className="text-[36px] md:text-[42px] font-black text-[#333333] leading-none tracking-tighter">
             Consultation <span className="text-[#00766C]">Analysis</span>
           </h1>
           <p className="text-[15px] font-bold text-gray-400">BP-RECA-2026-{id.toUpperCase()}</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="px-6 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-[13px] font-black uppercase tracking-widest flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              Confirmed Session
           </div>
           <button className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#333333] transition-colors shadow-sm">
              <MoreHorizontal size={20} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">
         <div className="space-y-8">
            <div className="bg-white rounded-[44px] border border-gray-100 p-8 md:p-10 shadow-[0_32px_64px_-24px_rgba(0,0,0,0.06)] relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50/30 rounded-full blur-[80px] -mr-32 -mt-32"></div>
               <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-10 pb-10 border-b border-gray-50">
                     <div className="w-20 h-20 rounded-[32px] bg-teal-50 flex items-center justify-center text-[#00766C] text-[32px] font-black shadow-inner font-sans">
                        RV
                     </div>
                     <div className="flex-1">
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Patient Registry</p>
                        <h2 className="text-[28px] font-black text-[#333333] tracking-tighter leading-none mb-2">Rahul Verma</h2>
                        <div className="flex items-center gap-4 text-[13px] font-bold text-gray-400">
                           <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-500" /> Patient ID: 9942</span>
                           <span className="text-gray-200">·</span>
                           <span>Last Session: 12d ago</span>
                        </div>
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                     <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 group hover:bg-white hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-teal-600 shadow-sm transition-transform group-hover:bg-teal-50">
                              <Phone size={18} />
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Contact</p>
                              <p className="text-[15px] font-black text-[#333333]">+91 98765 00000</p>
                           </div>
                        </div>
                     </div>
                     <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 group hover:bg-white hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm transition-transform group-hover:bg-blue-50">
                              <Mail size={18} />
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Email Registry</p>
                              <p className="text-[15px] font-black text-[#333333]">rahul.v@clinical.in</p>
                           </div>
                        </div>
                     </div>
                  </div>
                  <div className="space-y-6">
                     <div className="flex items-center justify-between">
                        <h3 className="text-[18px] font-black text-[#333333] flex items-center gap-3 tracking-tight">
                           <ClipboardList className="text-[#00766C]" size={20} strokeWidth={3} />
                           Clinical Lab Notes
                        </h3>
                        <span className="text-[11px] font-black text-gray-300 uppercase tracking-widest">Auto-Saving Enabled</span>
                     </div>
                     <div className="relative">
                        <textarea 
                          rows={8} 
                          placeholder="Document clinical diagnosis, treatment provided, differential observations, and rehabilitation roadmap..."
                          className="w-full p-8 bg-gray-50/50 border border-gray-100 rounded-[32px] text-[16px] font-bold text-[#333333] leading-relaxed placeholder:text-gray-300 focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-[#00766C]/20 outline-none transition-all resize-none shadow-inner"
                        />
                        <div className="absolute bottom-4 right-4 group">
                           <button className="flex items-center gap-3 px-8 py-4 bg-[#333333] text-white rounded-[20px] text-[14px] font-black hover:bg-[#00766C] transition-all shadow-xl active:scale-[0.97]">
                              Commit Record
                              <CheckCircle2 size={18} strokeWidth={3} />
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
         <aside className="space-y-8">
            <div className="bg-[#333333] rounded-[40px] p-8 md:p-10 shadow-2xl shadow-gray-900/10 text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[40px] -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
               <div className="relative z-10 space-y-8">
                  <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em] leading-none mb-1">Session Context</p>
                  <div className="space-y-6">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-teal-400 border border-white/5 shadow-sm">
                           <Calendar size={22} strokeWidth={3} />
                        </div>
                        <div>
                           <p className="text-[15px] font-black">Mon, 31 Mar 2026</p>
                           <p className="text-[12px] font-bold text-white/40 uppercase tracking-widest">Appointment Date</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-teal-400 border border-white/5 shadow-sm">
                           <Clock size={22} strokeWidth={3} />
                        </div>
                        <div>
                           <p className="text-[15px] font-black">10:00 AM — 11:30 AM</p>
                           <p className="text-[12px] font-bold text-white/40 uppercase tracking-widest">Duration: 90m</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-teal-400 border border-white/5 shadow-sm">
                           <MapPin size={22} strokeWidth={3} />
                        </div>
                        <div>
                           <p className="text-[15px] font-black">Indira Nagar Clinic</p>
                           <p className="text-[12px] font-bold text-white/40 uppercase tracking-widest">Facility Location</p>
                        </div>
                     </div>
                  </div>
                  <div className="pt-6 border-t border-white/5">
                     <div className="flex items-center justify-between gap-4 mb-8">
                        <div className="flex flex-col">
                           <p className="text-[15px] font-black">₹4,250</p>
                           <p className="text-[11px] font-black text-white/30 uppercase tracking-widest">Session Fee</p>
                        </div>
                        <div className="px-3 py-1.5 bg-emerald-500 rounded-xl text-[10px] font-black uppercase text-white shadow-lg shadow-emerald-500/20">Paid</div>
                     </div>
                     <Link href="#" className="flex items-center justify-between w-full p-5 bg-white/5 border border-white/5 rounded-3xl group/btn hover:bg-white/10 transition-all font-black text-white/80 no-underline">
                        <span className="text-[13px] font-black uppercase tracking-widest leading-none">View Invoice</span>
                        <ArrowUpRight size={18} className="text-white/20 group-hover/btn:text-white group-hover/btn:rotate-12 transition-all" />
                     </Link>
                  </div>
               </div>
            </div>
            <div className="bg-white rounded-[40px] p-8 border border-gray-100 flex flex-col gap-4">
               <button className="flex items-center gap-4 px-6 py-4 rounded-2xl text-[14px] font-bold text-gray-500 hover:bg-gray-50 hover:text-[#333333] transition-all border-none bg-transparent cursor-pointer">
                  <div className="w-10 h-10 rounded-xl border border-gray-100 flex items-center justify-center bg-white"><Zap size={18} /></div>
                  Reschedule Session
               </button>
               <button className="flex items-center gap-4 px-6 py-4 rounded-2xl text-[14px] font-bold text-orange-400 hover:bg-orange-50 transition-all border-none bg-transparent cursor-pointer">
                  <div className="w-10 h-10 rounded-xl border border-orange-100 flex items-center justify-center bg-white"><AlertCircle size={18} /></div>
                  Flag Issue
               </button>
            </div>
         </aside>
      </div>
    </div>
  )
}
