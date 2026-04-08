'use client'

import { useState } from 'react'
import { X, Loader2, UserPlus, Info, Phone, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatIndianPhone, stripPhoneFormat } from '@/lib/format-phone'

interface AddPatientModalProps {
  onClose: () => void
  onCreated: (profileId: string) => void
}

export function AddPatientModal({ onClose, onCreated }: AddPatientModalProps) {
  const [patientName, setPatientName] = useState('')
  const [patientPhone, setPatientPhone] = useState('')
  const [patientAge, setPatientAge] = useState('')
  const [patientGender, setPatientGender] = useState<'male' | 'female' | 'other' | ''>('')
  const [chiefComplaint, setChiefComplaint] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = patientName.trim().length >= 2 && !submitting

  async function handleSubmit() {
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/provider/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_name: patientName.trim(),
          patient_phone: patientPhone.trim() ? `+91${patientPhone.trim()}` : null,
          patient_age: patientAge ? parseInt(patientAge, 10) : null,
          patient_gender: patientGender || null,
          chief_complaint: chiefComplaint.trim() || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'Failed to add patient')
      }
      const data = await res.json()
      onCreated(data.profile_id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add patient')
    } finally {
      setSubmitting(false)
    }
  }

  const labelClass = 'text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] ml-2'
  const inputClass = 'w-full px-8 py-5 bg-[#F8F9FC] border border-[#EEF0F5] rounded-full text-[15px] font-bold text-[#1A1C29] focus:bg-white focus:border-[#6B7BF5] focus:ring-8 focus:ring-indigo-500/5 outline-none transition-all placeholder:text-slate-300'
  const textareaClass = 'w-full px-8 py-6 bg-[#F8F9FC] border border-[#EEF0F5] rounded-[32px] text-[15px] font-bold text-[#1A1C29] focus:bg-white focus:border-[#6B7BF5] focus:ring-8 focus:ring-indigo-500/5 outline-none transition-all resize-none leading-relaxed placeholder:text-slate-300'

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-8 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div className="fixed inset-0 bg-[#1A1C3C]/60 backdrop-blur-3xl" />
      
      <div
        className="bg-white rounded-[56px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] w-full max-w-[600px] relative z-10 overflow-hidden transform animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 border-[12px] border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#FAF9FF] px-10 py-10 border-b border-[#EEF0F5] relative overflow-hidden">
           <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-[#6B7BF5]/5 rounded-full blur-3xl animate-pulse" />
           
           <div className="relative z-10 flex items-center justify-between">
             <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-[22px] bg-white border border-[#EEF0F5] text-[#6B7BF5] flex items-center justify-center shadow-sm">
                   <UserPlus className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <div>
                   <h2 className="text-[32px] font-black text-[#1A1C29] tracking-tight leading-none mb-1">New Registry</h2>
                   <p className="text-[14px] font-bold text-slate-400">Initialize a new patient profile in the clinical database.</p>
                </div>
             </div>
             <button
               type="button"
               onClick={onClose}
               aria-label="Close add patient modal"
               className="w-12 h-12 rounded-[20px] bg-white border border-[#EEF0F5] flex items-center justify-center text-slate-400 hover:text-rose-500 hover:shadow-lg transition-all active:scale-90"
             >
               <X className="w-5 h-5" strokeWidth={3} />
             </button>
           </div>
        </div>

        <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-3">
            <label htmlFor="ap-name" className={labelClass}>Patient Clinical Name *</label>
            <div className="relative">
               <input
                 id="ap-name"
                 type="text"
                 value={patientName}
                 onChange={(e) => setPatientName(e.target.value)}
                 className={inputClass}
                 placeholder="Full legal name"
               />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label htmlFor="ap-phone" className={labelClass}>Contact (Verified)</label>
              <div className="flex bg-white border-2 border-slate-100 rounded-2xl overflow-hidden focus-within:border-[var(--color-pv-primary)] transition-all">
                 <span className="px-5 py-5 text-[15px] font-bold text-slate-300 bg-slate-50/50 border-r-2 border-slate-100 flex items-center gap-2 shrink-0">
                   <Phone className="w-4 h-4" />
                   +91
                 </span>
                 <input
                   id="ap-phone"
                   type="tel"
                   maxLength={11}
                   value={formatIndianPhone(patientPhone)}
                   onChange={(e) => setPatientPhone(stripPhoneFormat(e.target.value))}
                   className="flex-1 px-5 py-5 bg-transparent text-[15px] font-bold text-slate-900 outline-none placeholder:text-slate-200"
                   placeholder="98765 43210"
                 />
              </div>
            </div>
            <div className="space-y-3">
              <label htmlFor="ap-age" className={labelClass}>Age Cluster</label>
              <div className="relative">
                 <Calendar className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-200" />
                 <input
                   id="ap-age"
                   type="number"
                   min={0}
                   max={130}
                   value={patientAge}
                   onChange={(e) => setPatientAge(e.target.value)}
                   className={cn(inputClass, "pl-14")}
                   placeholder="e.g. 42"
                 />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label htmlFor="ap-gender" className={labelClass}>Gender Identity</label>
            <select
              id="ap-gender"
              value={patientGender}
              onChange={(e) => setPatientGender(e.target.value as 'male' | 'female' | 'other' | '')}
              className={cn(inputClass, "appearance-none cursor-pointer")}
            >
              <option value="">Choose gender…</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other Identity</option>
            </select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between px-2">
               <label htmlFor="ap-complaint" className={labelClass}>Chief Complaint Hub</label>
               <span className="text-[10px] font-bold text-[#6B7BF5] uppercase tracking-widest">Initial Logic</span>
            </div>
            <textarea
              id="ap-complaint"
              rows={4}
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              className={textareaClass}
              placeholder="What triggered this clinical cycle? e.g. acute lumbar stiffness following high-intensity load..."
            />
          </div>

          {error && (
            <div className="px-8 py-5 bg-rose-50 border border-rose-100 rounded-[32px] flex items-center gap-4 animate-shake">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <p className="text-[13px] font-bold text-rose-600">{error}</p>
            </div>
          )}

          <div className="bg-[#FAF9FF] p-6 rounded-[32px] border border-indigo-50 flex items-start gap-4">
             <div className="w-10 h-10 rounded-xl bg-white border border-[#EEF0F5] text-[#6B7BF5] flex items-center justify-center shrink-0 shadow-sm">
                <Info size={18} strokeWidth={3} />
             </div>
             <p className="text-[12px] font-bold text-slate-400 leading-relaxed italic">
               Registry protocols require at least a name to authorize the creation of a new encrypted clinical chart.
             </p>
          </div>
        </div>

        <div className="p-10 border-t border-[#EEF0F5] flex gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-8 py-5 bg-white border border-[#EEF0F5] rounded-[28px] text-[15px] font-black text-slate-500 hover:bg-slate-50 transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex-[2] px-8 py-5 bg-[#1A1C29] text-white rounded-[28px] text-[15px] font-black hover:bg-[#6B7BF5] transition-all hover:shadow-2xl hover:shadow-indigo-500/20 active:scale-95 disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-3"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" strokeWidth={3} /> : <UserPlus className="w-5 h-5" strokeWidth={3} />}
            {submitting ? 'Synchronizing...' : 'Initialize Chart'}
          </button>
        </div>
      </div>
    </div>
  )
}
