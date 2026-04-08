'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Save, Loader2, CheckCircle2, Activity, ClipboardList, Info, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ClinicalNote } from '@/lib/clinical/types'

export interface SoapDraft {
  subjective: string
  pain_scale: number | null
  range_of_motion: string
  functional_tests: string
  objective_notes: string
  assessment: string
  plan: string
  patient_summary: string
}

interface SoapFormProps {
  visitId: string
  visitNumber: number
  initialNote?: ClinicalNote | null
  onSaved?: (note: ClinicalNote) => void
}

function noteToDraft(note?: ClinicalNote | null): SoapDraft {
  return {
    subjective: note?.subjective ?? '',
    pain_scale: note?.pain_scale ?? null,
    range_of_motion: note?.range_of_motion ?? '',
    functional_tests: note?.functional_tests ?? '',
    objective_notes: note?.objective_notes ?? '',
    assessment: note?.assessment ?? '',
    plan: note?.plan ?? '',
    patient_summary: note?.patient_summary ?? '',
  }
}

export function SoapForm({ visitId, visitNumber, initialNote, onSaved }: SoapFormProps) {
  const [draft, setDraft] = useState<SoapDraft>(noteToDraft(initialNote))
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setDraft(noteToDraft(initialNote))
  }, [initialNote, visitId])

  function update<K extends keyof SoapDraft>(key: K, value: SoapDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }))
    setSavedAt(null)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/provider/visits/${visitId}/soap`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjective: draft.subjective || null,
          pain_scale: draft.pain_scale,
          range_of_motion: draft.range_of_motion || null,
          functional_tests: draft.functional_tests || null,
          objective_notes: draft.objective_notes || null,
          assessment: draft.assessment || null,
          plan: draft.plan || null,
          patient_summary: draft.patient_summary || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'Failed to save')
      }
      const note: ClinicalNote = await res.json()
      setSavedAt(Date.now())
      onSaved?.(note)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const sectionHeaderClass = 'flex items-center gap-3 mb-6'
  const labelClass = 'text-[11px] font-black text-slate-300 uppercase tracking-[0.2em]'
  const inputClass = 'w-full px-8 py-5 bg-[#F8F9FC] border border-[#EEF0F5] rounded-[24px] text-[15px] font-bold text-[#1A1C29] focus:bg-white focus:border-[#6B7BF5] focus:ring-8 focus:ring-indigo-500/5 outline-none transition-all placeholder:text-slate-300'
  const textareaClass = 'w-full px-8 py-6 bg-[#F8F9FC] border border-[#EEF0F5] rounded-[32px] text-[15px] font-bold text-[#1A1C29] focus:bg-white focus:border-[#6B7BF5] focus:ring-8 focus:ring-indigo-500/5 outline-none transition-all resize-none leading-relaxed'

  return (
    <div className="bg-white rounded-[56px] border border-[#EEF0F5] shadow-2xl shadow-indigo-500/5 overflow-hidden relative animate-in fade-in duration-700">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#6B7BF5]/5 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
      
      {/* Header with Multi-tone Accent */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-10 py-10 border-b border-[#EEF0F5] bg-[#F8F9FF]/50 relative z-10">
        <div className="flex items-center gap-5">
           <div className="w-14 h-14 rounded-[22px] bg-white border border-[#EEF0F5] text-[#6B7BF5] flex items-center justify-center shadow-sm relative transition-transform">
              <ClipboardList className="w-6 h-6" strokeWidth={2.5} />
           </div>
           <div>
              <h3 className="text-[20px] font-black text-[#1A1C29] tracking-tight">Visit Cycle #{visitNumber}</h3>
              <p className="text-[13px] font-bold text-slate-400">Clinical Data Registry • Encrypted Record</p>
           </div>
        </div>
        
        <button
          type="button"
          disabled
          className="flex items-center gap-2.5 px-6 py-2.5 bg-white border border-[#EEF0F5] rounded-full text-[11px] font-black text-indigo-300 uppercase tracking-widest opacity-60 shadow-sm transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          AI Dictation Engine
        </button>
      </div>

      <div className="p-10 space-y-12 relative z-10">
        {/* Subjective Section */}
        <section>
          <div className={sectionHeaderClass}>
             <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#6B7BF5] flex items-center justify-center shrink-0">
               <span className="text-[16px] font-black">S</span>
             </div>
             <div>
               <label htmlFor={`s-${visitId}`} className={labelClass}>Subjective Perspective</label>
               <p className="text-[11px] font-bold text-slate-300 mt-0.5">Narrative reported by the clinical case.</p>
             </div>
          </div>
          <textarea
            id={`s-${visitId}`}
            value={draft.subjective}
            onChange={(e) => update('subjective', e.target.value)}
            className={textareaClass}
            rows={4}
            placeholder="Patient reports acute lumbar tension when bending forward, intensity peaked during morning movement cycle..."
          />
        </section>

        {/* Objective Section */}
        <section className="pt-10 border-t border-[#EEF0F5]">
          <div className={sectionHeaderClass}>
             <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
               <span className="text-[16px] font-black">O</span>
             </div>
             <div>
               <label className={labelClass}>Objective Diagnostics</label>
               <p className="text-[11px] font-bold text-slate-300 mt-0.5">Verified measurements and clinical observations.</p>
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-3">
              <label htmlFor={`pain-${visitId}`} className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-2">Pain Intensity (0–10)</label>
              <div className="relative">
                 <Activity className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-200" />
                 <input
                   id={`pain-${visitId}`}
                   type="number"
                   min={0}
                   max={10}
                   value={draft.pain_scale ?? ''}
                   onChange={(e) => {
                     const v = e.target.value
                     update('pain_scale', v === '' ? null : Math.max(0, Math.min(10, parseInt(v, 10) || 0)))
                   }}
                   className={cn(inputClass, "pl-14 text-indigo-500")}
                   placeholder="e.g. 4"
                 />
              </div>
            </div>
            <div className="space-y-3">
              <label htmlFor={`rom-${visitId}`} className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-2">Range of Motion</label>
              <input
                id={`rom-${visitId}`}
                type="text"
                value={draft.range_of_motion}
                onChange={(e) => update('range_of_motion', e.target.value)}
                className={inputClass}
                placeholder="Lumbar flexion 40°, extension 15°"
              />
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="space-y-3">
              <label htmlFor={`func-${visitId}`} className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-2">Functional Stress Tests</label>
              <input
                id={`func-${visitId}`}
                type="text"
                value={draft.functional_tests}
                onChange={(e) => update('functional_tests', e.target.value)}
                className={inputClass}
                placeholder="SLR positive at 60°, FABER negative"
              />
            </div>
            <div className="space-y-3">
              <label htmlFor={`obj-${visitId}`} className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-2">Additional Clinical Observations</label>
              <textarea
                id={`obj-${visitId}`}
                value={draft.objective_notes}
                onChange={(e) => update('objective_notes', e.target.value)}
                className={textareaClass}
                rows={3}
                placeholder="Palpation triggers localized tension in L4-L5 paraspinal cluster..."
              />
            </div>
          </div>
        </section>

        {/* Assessment Section */}
        <section className="pt-10 border-t border-[#EEF0F5]">
          <div className={sectionHeaderClass}>
             <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-400 flex items-center justify-center shrink-0">
               <span className="text-[16px] font-black">A</span>
             </div>
             <div>
               <label htmlFor={`a-${visitId}`} className={labelClass}>Clinical Assessment</label>
               <p className="text-[11px] font-bold text-slate-300 mt-0.5">Professional impression and clinical reasoning.</p>
             </div>
          </div>
          <textarea
            id={`a-${visitId}`}
            value={draft.assessment}
            onChange={(e) => update('assessment', e.target.value)}
            className={textareaClass}
            rows={3}
            placeholder="Structural mechanical back pain with high probability of facet joint involvement..."
          />
        </section>

        {/* Plan Section */}
        <section className="pt-10 border-t border-[#EEF0F5]">
          <div className={sectionHeaderClass}>
             <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center shrink-0">
               <Target size={20} strokeWidth={3} />
             </div>
             <div>
               <label htmlFor={`p-${visitId}`} className={labelClass}>Treatment Trajectory & Plan</label>
               <p className="text-[11px] font-bold text-slate-300 mt-0.5">Intervention applied and clinical targets.</p>
             </div>
          </div>
          <textarea
            id={`p-${visitId}`}
            value={draft.plan}
            onChange={(e) => update('plan', e.target.value)}
            className={textareaClass}
            rows={4}
            placeholder="Applied 20m manual mobilization, McKenzie extensions (10 reps x 3 cycles). Prescribed core stabilization protocol..."
          />
        </section>

        {/* Patient Summary Section - Glassmorphic Accents */}
        <section className="pt-10 border-t border-[#EEF0F5]">
          <div className="bg-[#FAF9FF] rounded-[40px] border border-indigo-50 p-10 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-2 h-full bg-[#6B7BF5]" />
             
             <div className={sectionHeaderClass}>
               <div className="w-10 h-10 rounded-xl bg-white border border-[#EEF0F5] text-[#6B7BF5] flex items-center justify-center shrink-0 shadow-sm">
                 <Info size={18} strokeWidth={3} />
               </div>
               <div>
                 <label htmlFor={`sum-${visitId}`} className={labelClass}>Patient-facing Briefing</label>
                 <p className="text-[11px] font-bold text-slate-400 mt-0.5">Encrypted briefing shared via the patient dashboard.</p>
               </div>
             </div>
             
             <textarea
               id={`sum-${visitId}`}
               value={draft.patient_summary}
               onChange={(e) => update('patient_summary', e.target.value.slice(0, 1000))}
               className={cn(textareaClass, "bg-white h-[140px] shadow-sm")}
               placeholder="Your spine is currently showing mechanical stiffness due to muscle guarding. Today's mobilization was focused on restoring flow. Please maintain the prescribed stretches..."
               maxLength={1000}
             />
             <div className="flex justify-between items-center mt-4 px-4">
                <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">{draft.patient_summary.length}/1000 CAPACITY</p>
                <span className="text-[10px] font-bold text-slate-300 italic">Patients see this in plain language.</span>
             </div>
          </div>
        </section>

        {error && (
          <div className="px-8 py-5 bg-rose-50 border border-rose-100 rounded-[32px] flex items-center gap-4 animate-shake">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <p className="text-[13px] font-bold text-rose-600">{error}</p>
          </div>
        )}

        <div className="flex flex-col md:flex-row items-center justify-end gap-6 pt-10 border-t border-[#EEF0F5]">
          {savedAt && (
            <div className="flex items-center gap-3 px-6 py-2.5 bg-[#F2FFF6] border border-[#D1F7E0] rounded-full text-[12px] font-black text-[#22C55E] uppercase tracking-widest animate-in slide-in-from-right-3">
              <CheckCircle2 className="w-4 h-4" strokeWidth={3} />
              Chart Synchronized
            </div>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full md:w-auto inline-flex items-center justify-center gap-3 px-12 py-5 bg-[#1A1C29] text-white rounded-full text-[15px] font-black hover:bg-[#6B7BF5] transition-all hover:shadow-2xl hover:shadow-indigo-500/10 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed group"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" strokeWidth={3} /> : <Save className="w-5 h-5 group-hover:scale-110 transition-transform" strokeWidth={3} />}
            {saving ? 'Synchronizing registry...' : 'Persist SOAP Entry'}
          </button>
        </div>
      </div>
    </div>
  )
}
