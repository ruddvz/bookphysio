"use client"

import { use, useState, useMemo } from 'react'
import Link from 'next/link'
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  FileText,
  Loader2,
  type LucideIcon,
  Phone,
  Plus,
  User,
  Receipt,
  Save,
  Activity,
  History,
  Target,
  ShieldAlert,
} from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { SoapForm } from '@/components/clinical/SoapForm'
import type { PatientChart, PatientVisit } from '@/lib/clinical/types'
import { cn } from '@/lib/utils'
import {
  PageHeader,
  SectionCard,
  StatTile,
  EmptyState,
} from '@/components/dashboard/primitives'
import { ProviderPatientDetailV2 } from './ProviderPatientDetailV2'

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
  const [visitError, setVisitError] = useState<string | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['provider-patient-chart', id],
    queryFn: () => fetchChart(id),
  })

  const profile = data?.profile
  const visits = useMemo(() => data?.visits ?? [], [data?.visits])
  const rosterForV2 = useMemo(() => {
    if (!profile) return null
    const sortedVisits = [...visits].sort(
      (a, b) => new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime(),
    )
    return {
      profile_id: profile.id,
      patient_name: profile.patient_name,
      patient_phone: profile.patient_phone,
      patient_age: profile.patient_age,
      chief_complaint: profile.chief_complaint,
      visit_count: visits.length,
      last_visit_date: sortedVisits[0]?.visit_date ?? null,
      visit_dates: visits.map((v) => v.visit_date),
    }
  }, [profile, visits])
  const activeVisit = useMemo<PatientVisit | null>(
    () => visits.find((v) => v.id === activeVisitId) ?? visits[0] ?? null,
    [visits, activeVisitId]
  )

  async function handleNewVisit() {
    setCreatingVisit(true)
    setVisitError(null)
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
    } catch {
      setVisitError('We couldn\'t create a new visit. Please try again.')
    } finally {
      setCreatingVisit(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="w-12 h-12 text-[var(--color-pv-primary)] animate-spin" />
        <p className="mt-4 text-[13px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Decrypting Chart...</p>
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div className="max-w-[800px] mx-auto px-6 py-12">
        <div className="bg-rose-50 rounded-[40px] border border-rose-100 p-12 text-center shadow-xl shadow-rose-500/5">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-6" strokeWidth={2.5} />
          <h3 className="text-[20px] font-black text-[var(--color-pv-ink)]">Patient Record Hidden</h3>
          <p className="text-[14px] font-bold text-slate-500 mt-2">The clinical identifier provided does not match any registry entry.</p>
          <Link href="/provider/patients" className="mt-8 inline-flex px-8 py-3 bg-[var(--color-pv-ink)] text-white rounded-full text-[13px] font-black uppercase tracking-widest hover:bg-black transition-all">Return to Roster</Link>
        </div>
      </div>
    )
  }

  const tabs: Array<{ id: Tab; label: string; icon: LucideIcon }> = [
    { id: 'visits', label: 'Clinical Notes', icon: FileText },
    { id: 'profile', label: 'Clinical Profile', icon: User },
    { id: 'bills', label: 'Billing & Ledger', icon: Receipt },
  ]

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8">
      <Link
        href="/provider/patients"
        className="inline-flex items-center gap-2 text-[12px] font-bold text-slate-400 uppercase tracking-widest hover:text-[var(--color-pv-primary)] transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Registry
      </Link>

      {rosterForV2 ? <ProviderPatientDetailV2 patient={rosterForV2} /> : null}

      <PageHeader
        role="provider"
        kicker="CLINICAL CHART"
        title={profile.patient_name}
        subtitle={profile.chief_complaint ? `Managing: ${profile.chief_complaint}` : `Clinical history for ${profile.patient_name}`}
        action={{
          label: creatingVisit ? 'Initializing...' : 'New Visit',
          icon: creatingVisit ? Loader2 : Plus,
          onClick: handleNewVisit,
          disabled: creatingVisit
        }}
      />

      {visitError ? (
        <div className="rounded-[var(--sq-sm)] border border-rose-100 bg-rose-50 px-5 py-3 text-rose-700">
          <p className="text-[13px] font-bold">{visitError}</p>
        </div>
      ) : null}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
           role="provider"
           icon={Calendar}
           label="Total Visits"
           value={visits.length}
           tone={1}
        />
        <StatTile
           role="provider"
           icon={User}
           label="Age"
           value={profile.patient_age ? `${profile.patient_age} yrs` : '—'}
           tone={4}
        />
        <StatTile
           role="provider"
           icon={Phone}
           label="Contact"
           value={profile.patient_phone || '—'}
           tone={3}
        />
        <StatTile
           role="provider"
           icon={Activity}
           label="Last Visit"
           value={visits[0] ? formatDate(visits[0].visit_date) : 'N/A'}
           tone={2}
        />
      </div>

      <div className="space-y-6 lg:space-y-8">
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-[var(--sq-lg)] w-fit">
          {tabs.map((t) => {
            const Icon = t.icon
            const isActive = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-[var(--sq-sm)] text-[13px] font-bold transition-all",
                  isActive
                    ? "bg-white text-[var(--color-pv-primary)] shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                <Icon size={16} />
                {t.label}
              </button>
            )
          })}
        </div>

        <SectionCard role="provider" noPadding={tab === 'visits' && visits.length > 0}>
          {tab === 'profile' && <ProfileTab profileId={id} initialProfile={profile} />}

          {tab === 'visits' && (
            <div className="animate-fade-in">
              {visits.length === 0 ? (
                <div className="py-20">
                  <EmptyState
                    role="provider"
                    icon={Calendar}
                    title="No visit records"
                    description="This patient doesn't have any encrypted medical records yet."
                    cta={{ label: 'Start First Visit', onClick: handleNewVisit }}
                  />
                </div>
              ) : (
                <div className="flex flex-col xl:flex-row min-h-[600px]">
                  <aside className="w-full xl:w-[280px] bg-slate-50/50 border-b xl:border-b-0 xl:border-r border-slate-100 p-6">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 ml-2">Timeline</p>
                    <div className="space-y-2">
                       {visits.map((v) => {
                         const isActive = activeVisit?.id === v.id
                         return (
                           <button
                             key={v.id}
                             onClick={() => setActiveVisitId(v.id)}
                             className={cn(
                               "w-full text-left p-4 rounded-[var(--sq-sm)] transition-all group",
                               isActive
                                 ? "bg-white border border-slate-200 shadow-sm text-[var(--color-pv-primary)]"
                                 : "hover:bg-white/50 text-slate-500"
                             )}
                           >
                              <div className="flex items-center justify-between mb-1">
                                 <span className="text-[14px] font-bold">Visit #{v.visit_number}</span>
                                 {v.note && <Check size={12} className="text-emerald-500" />}
                              </div>
                              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{formatDate(v.visit_date)}</div>
                           </button>
                         )
                       })}
                    </div>
                  </aside>

                  <div className="flex-1 p-6 lg:p-10">
                    {activeVisit && (
                      <SoapForm
                        key={activeVisit.id}
                        visitId={activeVisit.id}
                        visitNumber={activeVisit.visit_number}
                        initialNote={activeVisit.note ?? null}
                        onSaved={() => queryClient.invalidateQueries({ queryKey: ['provider-patient-chart', id] })}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'bills' && (
            <div className="py-20">
               <EmptyState
                  role="provider"
                  icon={Receipt}
                  title="Invoice Hub"
                  description={`Generate a digital clinical receipt for ${profile.patient_name}.`}
                  cta={{
                    label: 'Create Invoice',
                  href: `/provider/bills/new?profileId=${encodeURIComponent(id)}`
                  }}
               />
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  )
}

function ProfileTab({ profileId, initialProfile }: { profileId: string, initialProfile: PatientChart['profile'] }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    chief_complaint: initialProfile.chief_complaint ?? '',
    medical_history: initialProfile.medical_history ?? '',
    contraindications: initialProfile.contraindications ?? '',
    treatment_goals: initialProfile.treatment_goals ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    setError(null)
    try {
      const res = await fetch(`/api/provider/patients/${profileId}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to save')
      setSaved(true)
      queryClient.invalidateQueries({ queryKey: ['provider-patient-chart', profileId] })
    } catch {
      setError('We couldn\'t save the clinical profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const sections = [
    { id: 'chief_complaint', label: 'Chief Complaint', icon: Activity, placeholder: 'Primary reason for consultation...' },
    { id: 'medical_history', label: 'Medical History', icon: History, placeholder: 'Relevant history, meds, surgeries...' },
    { id: 'contraindications', label: 'Contraindications', icon: ShieldAlert, placeholder: 'Risks or treatments to avoid...' },
    { id: 'treatment_goals', label: 'Treatment Goals', icon: Target, placeholder: 'Trajectory and desired outcomes...' },
  ]

  return (
    <div className="space-y-10 animate-fade-in py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sections.map((s) => (
          <div key={s.id} className="space-y-3">
             <div className="flex items-center gap-2 mb-1 ml-1">
                <s.icon size={16} className="text-slate-300" />
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</label>
             </div>
             <textarea
                value={form[s.id as keyof typeof form]}
                onChange={(e) => setForm(f => ({ ...f, [s.id]: e.target.value }))}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[var(--sq-lg)] text-[14px] font-bold text-slate-900 focus:bg-white focus:border-[var(--color-pv-primary)] outline-none transition-all min-h-[120px] resize-none leading-relaxed"
                placeholder={s.placeholder}
             />
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-between pt-6 border-t border-slate-100">
         <div className="text-[12px] font-bold text-slate-400 flex items-center gap-2 italic">
            Clinical data is synchronized instantly.
         </div>
         <div className="flex items-center gap-6">
            {saved && <span className="text-[12px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2"><Check size={14} /> Synchronized</span>}
            <button
               onClick={handleSave}
               disabled={saving}
               className="px-8 py-3 bg-[var(--color-pv-ink)] text-white rounded-full text-[13px] font-black uppercase tracking-widest hover:bg-[var(--color-pv-primary)] transition-all flex items-center gap-2 group disabled:opacity-40"
            >
               {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} className="group-hover:scale-110 transition-transform" />}
               {saving ? 'Saving...' : 'Persist Data'}
            </button>
         </div>
      </div>
      {error ? <p className="text-[12px] font-bold text-rose-600">{error}</p> : null}
    </div>
  )
}
