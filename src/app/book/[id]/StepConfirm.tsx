'use client'

import { useState } from 'react'
import { User, Phone, Mail, FileText, ChevronRight, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PatientDetails {
  fullName: string
  phone: string
  email: string
  reason: string
}

interface StepConfirmProps {
  doctor: any
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
    if (!fullName.trim() || fullName.length < 3) e.fullName = 'Please enter your full name'
    if (!phone.match(/^[6-9]\d{9}$/)) e.phone = 'Enter a valid 10-digit mobile number'
    if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Enter a valid email address'
    return e
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onNext({ fullName, phone: `+91${phone}`, email, reason })
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-[28px] font-black text-[#333333] tracking-tight">Patient Details</h2>
        <p className="text-gray-500 font-medium pt-1">Please provide the details of the person visiting the doctor.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name */}
        <div className="space-y-2">
          <label className="text-[12px] font-black text-gray-400 uppercase tracking-widest block ml-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User size={18} className={cn("transition-colors", errors.fullName ? "text-red-400" : "text-gray-300 group-focus-within:text-[#00766C]")} />
            </div>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className={cn(
                "w-full bg-white rounded-2xl border-2 pl-11 pr-4 py-4 text-[16px] font-bold outline-none transition-all",
                errors.fullName 
                  ? "border-red-100 focus:border-red-500 ring-4 ring-red-50" 
                  : "border-gray-100 focus:border-[#00766C] focus:ring-4 focus:ring-teal-50"
              )}
            />
          </div>
          {errors.fullName && <p className="text-[12px] font-bold text-red-500 ml-1">{errors.fullName}</p>}
        </div>

        {/* Mobile Number */}
        <div className="space-y-2">
          <label className="text-[12px] font-black text-gray-400 uppercase tracking-widest block ml-1">
            Mobile Number <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none font-black text-gray-300 group-focus-within:text-[#333]">
              +91
            </div>
            <input
              type="tel"
              value={phone}
              maxLength={10}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="9876543210"
              className={cn(
                "w-full bg-white rounded-2xl border-2 pl-14 pr-4 py-4 text-[16px] font-bold outline-none transition-all",
                errors.phone 
                  ? "border-red-100 focus:border-red-500 ring-4 ring-red-50" 
                  : "border-gray-100 focus:border-[#00766C] focus:ring-4 focus:ring-teal-50"
              )}
            />
            <div className="absolute inset-y-0 right-4 flex items-center">
               <Phone size={18} className="text-gray-200" />
            </div>
          </div>
          {errors.phone && <p className="text-[12px] font-bold text-red-500 ml-1">{errors.phone}</p>}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="text-[12px] font-black text-gray-400 uppercase tracking-widest block ml-1">
            Email Address <span className="text-gray-300 font-bold lowercase italic">(optional)</span>
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail size={18} className="text-gray-300 group-focus-within:text-[#00766C] transition-colors" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rahul@example.com"
              className={cn(
                "w-full bg-white rounded-2xl border-2 pl-11 pr-4 py-4 text-[16px] font-bold outline-none transition-all",
                errors.email 
                   ? "border-red-100 focus:border-red-500 ring-4 ring-red-50" 
                   : "border-gray-100 focus:border-[#00766C] focus:ring-4 focus:ring-teal-50"
              )}
            />
          </div>
          {errors.email && <p className="text-[12px] font-bold text-red-500 ml-1">{errors.email}</p>}
        </div>

        {/* Reason for visit */}
        <div className="space-y-2">
          <label className="text-[12px] font-black text-gray-400 uppercase tracking-widest block ml-1">
            Reason for Visit <span className="text-gray-300 font-bold lowercase italic">(optional)</span>
          </label>
          <div className="relative group">
            <div className="absolute top-4 left-4 pointer-events-none">
              <FileText size={18} className="text-gray-300 group-focus-within:text-[#00766C] transition-colors" />
            </div>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="E.g. Persistent lower back pain, knee injury rehab..."
              rows={3}
              className="w-full bg-white rounded-2xl border-2 pl-11 pr-4 py-4 text-[16px] font-bold outline-none transition-all resize-none border-gray-100 focus:border-[#00766C] focus:ring-4 focus:ring-teal-50"
            />
          </div>
        </div>

        {/* Verification Info */}
        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex gap-3">
          <Info size={20} className="text-blue-500 shrink-0 mt-0.5" />
          <p className="text-[13px] font-bold text-blue-600 leading-relaxed">
            We will send a booking confirmation and appointment reminders to your mobile number and email.
          </p>
        </div>

        <button
          type="submit"
          className="w-full group flex items-center justify-center gap-3 py-5 bg-[#00766C] text-white text-[18px] font-black rounded-2xl shadow-xl shadow-teal-100 hover:bg-[#005A52] hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Confirm Details
          <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="text-center text-[12px] font-bold text-gray-400 uppercase tracking-tighter">
          By continuing, you agree to our <span className="text-[#00766C] cursor-pointer hover:underline">Terms of Service</span> & <span className="text-[#00766C] cursor-pointer hover:underline">Privacy Policy</span>
        </p>
      </form>
    </div>
  )
}
