'use client'

import { useState } from 'react'
import { X, Loader2, UserPlus } from 'lucide-react'

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
          patient_phone: patientPhone.trim() || null,
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

  const inputClass =
    'w-full px-4 py-3 border border-slate-200 rounded-lg text-[14px] text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 outline-none transition-all'
  const labelClass = 'text-[12px] font-semibold text-slate-500 uppercase tracking-wider'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[16px] shadow-2xl w-full max-w-[560px] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-[18px] font-bold text-slate-900 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-600" />
            Add Patient
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-lg hover:bg-slate-50 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="ap-name" className={labelClass}>Patient Name *</label>
            <input
              id="ap-name"
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className={inputClass}
              placeholder="Full name"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="ap-phone" className={labelClass}>Phone</label>
              <input
                id="ap-phone"
                type="tel"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                className={inputClass}
                placeholder="+91 XXXXX XXXXX"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="ap-age" className={labelClass}>Age</label>
              <input
                id="ap-age"
                type="number"
                min={0}
                max={130}
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                className={inputClass}
                placeholder="e.g. 42"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="ap-gender" className={labelClass}>Gender</label>
            <select
              id="ap-gender"
              value={patientGender}
              onChange={(e) => setPatientGender(e.target.value as 'male' | 'female' | 'other' | '')}
              className={inputClass}
            >
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="ap-complaint" className={labelClass}>Chief complaint</label>
            <textarea
              id="ap-complaint"
              rows={3}
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              className={`${inputClass} resize-none`}
              placeholder="What brought them in. e.g. Lower back pain after lifting"
            />
          </div>

          {error && (
            <p className="text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-200 rounded-lg text-[14px] font-medium text-slate-900 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg text-[14px] font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {submitting ? 'Adding…' : 'Add Patient'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
