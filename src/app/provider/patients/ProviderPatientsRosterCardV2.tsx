'use client'

import Link from 'next/link'
import { ArrowRight, CalendarDays, ClipboardList, Phone } from 'lucide-react'
import type { PatientRosterRow } from '@/lib/clinical/types'
import { Badge } from '@/components/dashboard/primitives/Badge'
import { Sparkline } from '@/components/dashboard/primitives/Sparkline'
import { TrendDelta } from '@/components/dashboard/primitives/TrendDelta'
import { halfWindowDeltaPct } from '@/lib/clinical/provider-patients-utils'

export interface ProviderPatientsRosterCardV2Props {
  patient: PatientRosterRow
  formatDate: (iso: string | null) => string
  formatPhone: (phone: string | null) => string
}

export function ProviderPatientsRosterCardV2({
  patient: p,
  formatDate,
  formatPhone,
}: ProviderPatientsRosterCardV2Props) {
  const series = p.visit_series_6m ?? []
  const delta = halfWindowDeltaPct(series)

  return (
    <div className="flex flex-col gap-4 rounded-[var(--sq-lg)] border border-slate-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-1 gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--sq-sm)] border border-[var(--color-pv-tile-1-bg)]/20 bg-[var(--color-pv-tile-1-bg)] text-sm font-black text-[var(--color-pv-primary)]">
          {p.patient_name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-[15px] font-black text-slate-900">{p.patient_name}</span>
            {p.patient_age != null ? (
              <Badge role="provider" tone={2} variant="soft" className="text-[10px]">
                {p.patient_age} yrs
              </Badge>
            ) : null}
            <Badge role="provider" tone={1} variant="outline" className="text-[10px]">
              {p.visit_count} {p.visit_count === 1 ? 'visit' : 'visits'}
            </Badge>
          </div>
          <div className="flex flex-col gap-1.5 text-[13px] font-bold text-slate-600 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <span className="flex min-w-0 items-center gap-1.5">
              <Phone size={12} className="shrink-0 text-slate-400" />
              <span className="truncate">{formatPhone(p.patient_phone)}</span>
            </span>
            {p.chief_complaint ? (
              <span className="flex min-w-0 items-center gap-1.5 text-slate-500">
                <ClipboardList size={12} className="shrink-0 text-slate-400" />
                <span className="truncate">{p.chief_complaint}</span>
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4 sm:border-t-0 sm:pt-0">
        <div className="flex items-center gap-3">
          <Sparkline
            role="provider"
            values={series.length > 0 ? series : [0]}
            width={88}
            height={28}
            ariaLabel={`Visit cadence, last 6 months`}
          />
          <TrendDelta value={delta} suffix="%" />
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden flex-col items-end gap-0.5 sm:flex">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Last visit</span>
            <span className="flex items-center gap-1.5 text-[13px] font-bold text-slate-900">
              <CalendarDays size={14} className="text-slate-300" />
              {formatDate(p.last_visit_date)}
            </span>
          </div>
          <Link
            href={`/provider/patients/${p.profile_id}`}
            className="group/btn inline-flex items-center gap-2 rounded-full bg-slate-100 px-5 py-2 text-[12px] font-bold text-slate-600 transition-all hover:bg-[var(--color-pv-ink)] hover:text-white"
          >
            Chart
            <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-1" strokeWidth={3} />
          </Link>
        </div>
      </div>
    </div>
  )
}
