'use client'

import { use, useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Phone, Loader2, AlertCircle, Plus, FileText, User, Calendar,
  Receipt, Save,
} from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { SoapForm } from '@/components/clinical/SoapForm'
import type { PatientChart, PatientVisit } from '@/lib/clinical/types'

type Tab = 'profile' | 'visits' | 'bills'

async function fetchChart(id: string): Promise<PatientChart> {
  const res = await fetch(`/api/provider/patients/${id}`)
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso + (iso.includes('T') ? '' : 'T00:00:00')).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function ProviderPatientChart({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<Tab>('visits')
  const [creatingVisit, setCreatingVisit] = useState(false)
  const [activeVisitId, setActiveVisitId] = useState<string | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['provider-patient-chart', id],
    queryFn: () => fetchChart(id),
  })

  const profile = data?.profile
  const visits = data?.visits ?? []
  const activeVisit = useMemo<PatientVisit | null>(
    () => visits.find((v) => v.id === activeVisitId) ?? visits[0] ?? null,
    [visits, activeVisitId]
  )

  async function handleNewVisit() {
    setCreatingVisit(true)
    try {
      const res = await fetch(`/api/provider/patients/${id}/visits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      if (!res.ok) throw new Error('Failed to create visit')
      const visit: PatientVisit = await res.json()
      await queryClient.invalidateQueries({ queryKey: ['provider-patient-chart', id] })
      setActiveVisitId(visit.id)
      setTab('visits')
    } finally {
      setCreatingVisit(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div className="max-w-[800px] mx-auto px-6 py-12">
        <div className="bg-[#FEF2F2] rounded-[12px] border border-[#FECACA] p-6 text-center">
          <AlertCircle className="w-8 h-8 text-[#EF4444] mx-auto mb-3" />
          <p className="text-[15px] font-medium text-slate-900">Patient not found</p>
        </div>
      </div>
    )
  }

  const tabs: Array<{ id: Tab; label: string; icon: typeof User }> = [
    { id: 'profile', label: 'Clinical Profile', icon: User },
    { id: 'visits', label: 'Visits & SOAP', icon: FileText },
    { id: 'bills', label: 'Bills', icon: Receipt },
  ]

  return (
    <div className="max-w-[1080px] mx-auto px-6 py-12 animate-in fade-in duration-500 delay-100 fill-mode-both">
      <Link
        href="/provider/patients"
        className="inline-flex items-center gap-1.5 text-[14px] font-medium text-bp-body hover:text-bp-primary mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Patients
      </Link>

      {/* Header */}
      <div className="bg-white rounded-[12px] border border-bp-border shadow-sm p-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-emerald-600/10 text-emerald-600 flex items-center justify-center text-[24px] font-bold shrink-0">
              {profile.patient_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-[28px] font-bold text-slate-900 mb-1">{profile.patient_name}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] text-bp-body">
                {profile.patient_age && <span>Age {profile.patient_age}</span>}
                {profile.patient_gender && <span className="capitalize">{profile.patient_gender}</span>}
                {profile.patient_phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {profile.patient_phone}
                  </span>
                )}
              </div>
              {profile.chief_complaint && (
                <p className="text-[13px] text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1 inline-block mt-3">
                  {profile.chief_complaint}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleNewVisit}
            disabled={creatingVisit}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-full text-[14px] font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {creatingVisit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            New Visit
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-[12px] border border-bp-border shadow-sm overflow-hidden">
        <div className="flex border-b border-bp-border">
          {tabs.map((t) => {
            const Icon = t.icon
            const isActive = tab === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-6 py-4 text-[14px] font-semibold transition-colors border-b-2 -mb-px ${
                  isActive
                    ? 'text-emerald-600 border-emerald-600 bg-emerald-50/30'
                    : 'text-slate-500 border-transparent hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            )
          })}
        </div>

        <div className="p-6">
          {tab === 'profile' && <ProfileTab profileId={id} initialProfile={profile} />}

          {tab === 'visits' && (
            <div className="space-y-6">
              {visits.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-[15px] font-medium text-slate-900 mb-1">No visits yet</p>
                  <p className="text-[13px] text-slate-500">Click "New Visit" above to record this patient&apos;s first session.</p>
                </div>
              )}

              {visits.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6">
                  <aside className="space-y-2">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">
                      Visit history
                    </p>
                    {visits.map((v) => {
                      const isActive = activeVisit?.id === v.id
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setActiveVisitId(v.id)}
                          className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all ${
                            isActive
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <p className="text-[13px] font-bold">Visit {v.visit_number}</p>
                          <p className="text-[11px] opacity-70">{formatDate(v.visit_date)}</p>
                          {v.note && (
                            <p className="text-[10px] mt-1 inline-block px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-semibold">
                              SOAP saved
                            </p>
                          )}
                        </button>
                      )
                    })}
                  </aside>

                  <div>
                    {activeVisit && (
                      <SoapForm
                        key={activeVisit.id}
                        visitId={activeVisit.id}
                        visitNumber={activeVisit.visit_number}
                        initialNote={activeVisit.note ?? null}
                        onSaved={() =>
                          queryClient.invalidateQueries({ queryKey: ['provider-patient-chart', id] })
                        }
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'bills' && (
            <div className="text-center py-12">
              <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-[15px] font-medium text-slate-900 mb-1">Generate a bill for this patient</p>
              <p className="text-[13px] text-slate-500 mb-5">Patient details will be prefilled in the form.</p>
              <Link
                href={`/provider/bills/new?patient=${encodeURIComponent(profile.patient_name)}${profile.patient_phone ? `&phone=${encodeURIComponent(profile.patient_phone)}` : ''}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-full text-[14px] font-semibold hover:bg-emerald-700 transition-colors"
              >
                <Receipt className="w-4 h-4" />
                Generate Bill
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface ProfileTabProps {
  profileId: string
  initialProfile: PatientChart['profile']
}

function ProfileTab({ profileId, initialProfile }: ProfileTabProps) {
  const queryClient = useQueryClient()
  const [chiefComplaint, setChiefComplaint] = useState(initialProfile.chief_complaint ?? '')
  const [medicalHistory, setMedicalHistory] = useState(initialProfile.medical_history ?? '')
  const [contraindications, setContraindications] = useState(initialProfile.contraindications ?? '')
  const [treatmentGoals, setTreatmentGoals] = useState(initialProfile.treatment_goals ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch(`/api/provider/patients/${profileId}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chief_complaint: chiefComplaint || null,
          medical_history: medicalHistory || null,
          contraindications: contraindications || null,
          treatment_goals: treatmentGoals || null,
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      setSaved(true)
      queryClient.invalidateQueries({ queryKey: ['provider-patient-chart', profileId] })
    } finally {
      setSaving(false)
    }
  }

  const labelClass = 'text-[12px] font-semibold text-slate-500 uppercase tracking-wider'
  const taClass =
    'w-full px-4 py-3 border border-slate-200 rounded-lg text-[14px] text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 outline-none transition-all resize-y min-h-[80px]'

  return (
    <div className="space-y-5 max-w-[760px]">
      <div className="space-y-1.5">
        <label htmlFor="cp-cc" className={labelClass}>Chief complaint</label>
        <textarea id="cp-cc" value={chiefComplaint} onChange={(e) => setChiefComplaint(e.target.value)} className={taClass} placeholder="What brought them in" />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="cp-mh" className={labelClass}>Medical history</label>
        <textarea id="cp-mh" value={medicalHistory} onChange={(e) => setMedicalHistory(e.target.value)} className={taClass} placeholder="Diabetes, prior surgeries, current meds, etc." />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="cp-ci" className={labelClass}>Contraindications</label>
        <textarea id="cp-ci" value={contraindications} onChange={(e) => setContraindications(e.target.value)} className={taClass} placeholder="Anything to avoid in treatment" />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="cp-tg" className={labelClass}>Treatment goals</label>
        <textarea id="cp-tg" value={treatmentGoals} onChange={(e) => setTreatmentGoals(e.target.value)} className={taClass} placeholder="Where the patient wants to be in 4–8 weeks" />
      </div>
      <div className="flex items-center justify-end gap-3 pt-2">
        {saved && <span className="text-[12px] font-medium text-emerald-600">Saved</span>}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-[14px] font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </div>
    </div>
  )
}
