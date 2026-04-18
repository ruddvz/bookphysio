'use client'

import { useMemo } from 'react'
import { StickyNote } from 'lucide-react'
import type { ClinicalProfile, PatientVisit } from '@/lib/clinical/types'
import { Badge } from '@/components/dashboard/primitives/Badge'
import { Sparkline } from '@/components/dashboard/primitives/Sparkline'
import { TrendDelta } from '@/components/dashboard/primitives/TrendDelta'
import { monthlyVisitCountSeries, halfWindowDeltaPct } from '@/lib/clinical/provider-patients-utils'

function formatPhoneDisplay(phone: string | null) {
  if (!phone) return '—'
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`
  }
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
  }
  return phone
}

function genderLabel(g: ClinicalProfile['patient_gender']) {
  if (!g) return null
  if (g === 'male') return 'Male'
  if (g === 'female') return 'Female'
  return 'Other'
}

export interface ProviderPatientChartV2ChromeProps {
  profile: ClinicalProfile
  visits: readonly PatientVisit[]
  referenceNowMs: number
  onQuickNote: () => void
}

export function ProviderPatientChartV2Chrome({
  profile,
  visits,
  referenceNowMs,
  onQuickNote,
}: ProviderPatientChartV2ChromeProps) {
  const visitDates = useMemo(() => visits.map((v) => v.visit_date), [visits])
  const series = useMemo(
    () => monthlyVisitCountSeries(visitDates, referenceNowMs, 6),
    [visitDates, referenceNowMs],
  )
  const delta = useMemo(() => halfWindowDeltaPct(series), [series])
  const gender = genderLabel(profile.patient_gender)

  return (
    <div className="space-y-4 rounded-[var(--sq-lg)] border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/80 p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <Sparkline
            role="provider"
            values={series.length > 0 ? series : [0]}
            width={112}
            height={32}
            ariaLabel="Visits per month, last six months"
          />
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Visit cadence</span>
            <TrendDelta value={delta} suffix="%" />
          </div>
          <Badge role="provider" tone={3} variant="soft" className="text-[11px]">
            {visits.length} total {visits.length === 1 ? 'visit' : 'visits'}
          </Badge>
        </div>
        <button
          type="button"
          onClick={onQuickNote}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF6B35] px-5 py-2.5 text-[12px] font-black uppercase tracking-widest text-white shadow-sm transition hover:brightness-105"
        >
          <StickyNote size={16} strokeWidth={2.5} />
          Quick note
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {profile.patient_age != null ? (
          <Badge role="provider" tone={2} variant="soft" className="text-[11px]">
            Age {profile.patient_age}
          </Badge>
        ) : null}
        {gender ? (
          <Badge role="provider" tone={4} variant="soft" className="text-[11px]">
            {gender}
          </Badge>
        ) : null}
        <Badge role="provider" tone={1} variant="outline" className="max-w-full text-[11px]">
          {formatPhoneDisplay(profile.patient_phone)}
        </Badge>
        {profile.chief_complaint ? (
          <Badge role="provider" tone={5} variant="soft" className="max-w-full text-[11px]">
            {profile.chief_complaint}
          </Badge>
        ) : null}
      </div>
    </div>
  )
}
