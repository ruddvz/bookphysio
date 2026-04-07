'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Save, Loader2, CheckCircle2 } from 'lucide-react'
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

const labelClass = 'text-[12px] font-semibold text-slate-500 uppercase tracking-wider'
const inputClass =
  'w-full px-4 py-3 border border-slate-200 rounded-lg text-[14px] text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 outline-none transition-all'
const textareaClass = `${inputClass} resize-y min-h-[80px]`

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

  return (
    <div className="bg-white rounded-[12px] border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-emerald-50/50 to-white">
        <div>
          <h3 className="text-[16px] font-bold text-slate-900">Visit {visitNumber} — SOAP Note</h3>
          <p className="text-[12px] text-slate-500 mt-0.5">Clinical record. Patients see only the simplified summary.</p>
        </div>
        <button
          type="button"
          disabled
          title="AI dictation coming soon"
          className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full opacity-70 cursor-not-allowed"
        >
          <Sparkles className="w-3.5 h-3.5" />
          AI Dictate (soon)
        </button>
      </div>

      <div className="p-6 space-y-6">
        <section className="space-y-2">
          <label htmlFor={`s-${visitId}`} className={labelClass}>S — Subjective</label>
          <p className="text-[12px] text-slate-500 -mt-1">What the patient reports in their own words.</p>
          <textarea
            id={`s-${visitId}`}
            value={draft.subjective}
            onChange={(e) => update('subjective', e.target.value)}
            className={textareaClass}
            placeholder="Patient reports lower back pain when bending forward, worse in mornings…"
          />
        </section>

        <section className="space-y-3">
          <div>
            <label className={labelClass}>O — Objective</label>
            <p className="text-[12px] text-slate-500">Measurements, observations, test results.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor={`pain-${visitId}`} className="text-[11px] font-semibold text-slate-500">Pain scale (0–10)</label>
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
                className={inputClass}
                placeholder="e.g. 4"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor={`rom-${visitId}`} className="text-[11px] font-semibold text-slate-500">Range of motion</label>
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
          <div className="space-y-1.5">
            <label htmlFor={`func-${visitId}`} className="text-[11px] font-semibold text-slate-500">Functional tests</label>
            <input
              id={`func-${visitId}`}
              type="text"
              value={draft.functional_tests}
              onChange={(e) => update('functional_tests', e.target.value)}
              className={inputClass}
              placeholder="SLR positive at 60°, FABER negative"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor={`obj-${visitId}`} className="text-[11px] font-semibold text-slate-500">Other observations</label>
            <textarea
              id={`obj-${visitId}`}
              value={draft.objective_notes}
              onChange={(e) => update('objective_notes', e.target.value)}
              className={textareaClass}
              placeholder="Posture, gait, palpation findings…"
            />
          </div>
        </section>

        <section className="space-y-2">
          <label htmlFor={`a-${visitId}`} className={labelClass}>A — Assessment</label>
          <p className="text-[12px] text-slate-500 -mt-1">Clinical impression and diagnosis.</p>
          <textarea
            id={`a-${visitId}`}
            value={draft.assessment}
            onChange={(e) => update('assessment', e.target.value)}
            className={textareaClass}
            placeholder="Mechanical lower back pain, lumbar facet involvement…"
          />
        </section>

        <section className="space-y-2">
          <label htmlFor={`p-${visitId}`} className={labelClass}>P — Plan</label>
          <p className="text-[12px] text-slate-500 -mt-1">Treatment given today + homework + next steps.</p>
          <textarea
            id={`p-${visitId}`}
            value={draft.plan}
            onChange={(e) => update('plan', e.target.value)}
            className={textareaClass}
            placeholder="Manual therapy 20 min, McKenzie extensions x10 reps daily, follow-up in 5 days."
          />
        </section>

        <section className="space-y-2 pt-4 border-t border-slate-200">
          <label htmlFor={`sum-${visitId}`} className={labelClass}>Patient-friendly summary</label>
          <p className="text-[12px] text-slate-500 -mt-1">
            This is what the patient sees. Plain language, no jargon.
          </p>
          <textarea
            id={`sum-${visitId}`}
            value={draft.patient_summary}
            onChange={(e) => update('patient_summary', e.target.value.slice(0, 1000))}
            className={textareaClass}
            placeholder="Your lower back is stiff because of tight muscles. Today we worked on loosening them. Please do the stretches I showed you twice a day."
            maxLength={1000}
          />
          <p className="text-[11px] text-slate-400 text-right">{draft.patient_summary.length}/1000</p>
        </section>

        {error && (
          <p className="text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          {savedAt && (
            <span className="flex items-center gap-1.5 text-[12px] text-emerald-600 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Saved
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-[14px] font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : 'Save SOAP note'}
          </button>
        </div>
      </div>
    </div>
  )
}
