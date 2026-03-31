'use client'

import { useState } from 'react'
import { User, Phone, Mail, FileText, ChevronRight, Info, ShieldCheck, Sparkles, Activity, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PatientDetails {
  fullName: string
  phone: string
  email: string
  reason: string
}

interface StepConfirmProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  doctor: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  booking: any
  onNext: (patient: PatientDetails) => void
}

export function StepConfirm({ onNext }: StepConfirmProps) {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [reason, setReason] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    if (!fullName.trim() || fullName.length < 3) e.fullName = 'Expert identification requires full name'
    if (!phone.match(/^[6-9]\d{9}$/)) e.phone = 'Verified mobile number required'
    if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Secure email format required'
    return e
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onNext({ fullName, phone: `+91${phone}`, email, reason })
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
      {/* Header Layout */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 border border-teal-100 rounded-lg text-[10px] font-black uppercase text-[#00766C] tracking-widest">
             Patient Verification
          </div>
          <h2 className="text-[36px] md:text-[48px] font-black text-[#333333] tracking-tighter leading-tight">Patient Details</h2>
          <p className="text-[17px] text-gray-400 font-bold max-w-lg leading-relaxed">Please provide the details of the individual attending the clinic or online session.</p>
        </div>
        
        <div className="hidden lg:flex flex-col items-end">
           <div className="flex -space-x-4 mb-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-10 h-10 rounded-2xl border-4 border-white bg-gray-100 flex items-center justify-center text-[12px] font-black text-gray-300">
                   {String.fromCharCode(64 + i)}
                </div>
              ))}
              <div className="w-10 h-10 rounded-2xl border-4 border-white bg-[#00766C] flex items-center justify-center text-[12px] font-black text-white">
                 +
              </div>
           </div>
           <p className="text-[11px] font-black text-gray-300 uppercase tracking-widest leading-none">Security Shield Active</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        
        {/* Input Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Full Name */}
           <div className="space-y-3 group">
             <div className="flex items-center justify-between px-1">
                <label className="text-[12px] font-black text-[#333333] uppercase tracking-widest block">
                  Identity Name <span className="text-[#00766C]">*</span>
                </label>
                <div className="opacity-0 group-focus-within:opacity-100 transition-opacity flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                   <Activity size={10} /> Validating
                </div>
             </div>
             <div className="relative">
               <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                 <User size={20} className={cn("transition-all duration-500", errors.fullName ? "text-red-400" : "text-gray-300 group-focus-within:text-[#00766C]")} />
               </div>
               <input
                 type="text"
                 value={fullName}
                 onChange={(e) => setFullName(e.target.value)}
                 placeholder="Enter patient's full name"
                 className={cn(
                   "w-full bg-white rounded-[24px] border-2 pl-14 pr-6 py-6 text-[18px] font-black outline-none transition-all duration-500 placeholder:text-gray-200",
                   errors.fullName 
                     ? "border-red-100 focus:border-red-500 bg-red-50/10 shadow-[0_20px_40px_-10px_rgba(239,68,68,0.05)]" 
                     : "border-gray-100 focus:border-[#00766C] focus:bg-[#E6F4F3]/5 focus:shadow-[0_20px_40px_-10px_rgba(0,118,108,0.1)]"
                 )}
               />
               <div className="absolute right-6 top-1/2 -translate-y-1/2">
                   {fullName.length > 3 && !errors.fullName && <CheckCircle2 className="text-emerald-500 animate-in zoom-in" size={20} />}
               </div>
             </div>
             {errors.fullName && <p className="text-[12px] font-black text-red-500 ml-6 tracking-tight animate-in slide-in-from-top-2">{errors.fullName}</p>}
           </div>

           {/* Mobile Number */}
           <div className="space-y-3 group">
             <div className="flex items-center justify-between px-1">
                <label className="text-[12px] font-black text-[#333333] uppercase tracking-widest block">
                  Secure Contact <span className="text-[#00766C]">*</span>
                </label>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-300 uppercase tracking-widest">
                   OTP VERIFIED
                </div>
             </div>
             <div className="relative">
               <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none font-black text-[18px] text-gray-200 group-focus-within:text-[#00766C] transition-colors leading-[1.2] pb-0.5">
                 +91
               </div>
               <input
                 type="tel"
                 value={phone}
                 maxLength={10}
                 onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                 placeholder="9876543210"
                 className={cn(
                   "w-full bg-white rounded-[24px] border-2 pl-20 pr-6 py-6 text-[20px] font-black outline-none transition-all duration-500 placeholder:text-gray-200 tracking-wider",
                   errors.phone 
                     ? "border-red-100 focus:border-red-500 bg-red-50/10 shadow-[0_20px_40px_-10px_rgba(239,68,68,0.05)]" 
                     : "border-gray-100 focus:border-[#00766C] focus:bg-[#E6F4F3]/5 focus:shadow-[0_20px_40px_-10px_rgba(0,118,108,0.1)]"
                 )}
               />
             </div>
             {errors.phone && <p className="text-[12px] font-black text-red-500 ml-6 tracking-tight animate-in slide-in-from-top-2">{errors.phone}</p>}
           </div>
        </div>

        {/* Email Row */}
        <div className="space-y-3 group">
          <div className="flex items-center gap-3 px-1">
             <label className="text-[12px] font-black text-[#333333] uppercase tracking-widest block">
               Communications Channel
             </label>
             <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest bg-gray-50 px-2.5 py-1 rounded-lg">High Sensitivity</span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <Mail size={20} className="text-gray-300 group-focus-within:text-[#00766C] transition-all duration-500" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="patient@medical.secure"
              className={cn(
                "w-full bg-white rounded-[24px] border-2 pl-14 pr-6 py-6 text-[18px] font-black outline-none transition-all duration-500 placeholder:text-gray-200",
                errors.email 
                   ? "border-red-100 focus:border-red-500 bg-red-50/10 shadow-[0_20px_40px_-10px_rgba(239,68,68,0.05)]" 
                   : "border-gray-100 focus:border-[#00766C] focus:bg-[#E6F4F3]/5 focus:shadow-[0_20px_40px_-10px_rgba(0,118,108,0.1)]"
              )}
            />
          </div>
          {errors.email && <p className="text-[12px] font-black text-red-500 ml-6 tracking-tight animate-in slide-in-from-top-2">{errors.email}</p>}
        </div>

        {/* Reason for visit (Luxury Area) */}
        <div className="space-y-4 group">
          <div className="flex items-center justify-between px-1">
             <label className="text-[12px] font-black text-[#333333] uppercase tracking-widest block">Clinical Concerns & Focus</label>
             <div className="w-10 h-6 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-black text-gray-300">OPT</div>
          </div>
          <div className="relative">
            <div className="absolute top-6 left-6 pointer-events-none">
              <FileText size={20} className="text-gray-300 group-focus-within:text-[#00766C] transition-all duration-500" />
            </div>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Detail your primary symptoms or goals for this session..."
              rows={4}
              className="w-full bg-white rounded-[32px] border-2 pl-16 pr-6 py-6 text-[18px] font-bold outline-none transition-all duration-500 resize-none border-gray-100 focus:border-[#00766C] focus:bg-[#E6F4F3]/5 focus:shadow-[0_32px_64px_-16px_rgba(0,118,108,0.1)] placeholder:text-gray-200 leading-[1.8]"
            />
          </div>
        </div>

        {/* Strategy Guidance */}
        <div className="bg-[#FBFCFD] p-10 rounded-[40px] border border-gray-100 relative overflow-hidden group/hint">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-[#00766C] group-hover:scale-110 transition-transform duration-1000"><ShieldCheck size={120} /></div>
          <div className="flex gap-6 items-start relative z-10">
            <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-[#00766C] shrink-0 border border-teal-100/50">
               <Sparkles size={24} />
            </div>
            <div>
               <h4 className="text-[16px] font-black text-[#333333] mb-2">Automated Confirmations</h4>
               <p className="text-[15px] font-bold text-gray-400 leading-[1.8] max-w-[500px]">
                  Your session link and professional clinician bio will be issued to these credentials upon high-fidelity verification.
               </p>
            </div>
          </div>
        </div>

        {/* Action Interface */}
        <div className="pt-8">
           <button
             type="submit"
             className="w-full h-24 group relative bg-[#00766C] text-white rounded-[32px] shadow-2xl shadow-teal-900/10 hover:shadow-teal-900/20 hover:scale-[1.01] active:scale-[0.98] transition-all duration-500 overflow-hidden"
           >
             <div className="relative z-10 flex items-center justify-center gap-4 text-[22px] font-black tracking-tighter">
                Authorize Session Details
                <ChevronRight size={24} strokeWidth={3} className="group-hover:translate-x-2 transition-transform duration-500" />
             </div>
             {/* Luxury Shine */}
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shine transition-transform duration-1000"></div>
           </button>

           <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-6 text-[12px] font-black text-gray-300 uppercase tracking-widest">
              <div className="flex items-center gap-2"><ShieldCheck size={14} className="text-emerald-500" /> Encrypted Connection</div>
              <div className="hidden md:block w-1.5 h-1.5 bg-gray-100 rounded-full"></div>
              <p>Continuing acknowledges our <span className="text-[#00766C] cursor-pointer hover:border-b border-[#00766C]">Global Terms</span></p>
           </div>
        </div>
      </form>
    </div>
  )
}
