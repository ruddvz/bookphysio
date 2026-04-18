'use client'

import Link from 'next/link'
import { CalendarDays } from 'lucide-react'
import { useUiV2 } from '@/hooks/useUiV2'
import { Badge } from '@/components/dashboard/primitives/Badge'
import { Sparkline } from '@/components/dashboard/primitives/Sparkline'
import {
  buildPatientVisitSparkline,
  formatPhonePv,
  patientInitials,
  type PatientRosterV2Row,
} from './roster-v2-utils'

export interface ProviderPatientRosterV2Props {
  patients: PatientRosterV2Row[]
}

function formatLastVisit(iso: string | null): string {
  if (!iso) return 'No visits yet'
  return new Date(iso.includes('T') ? iso : `${iso}T00:00:00`).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * v2 patient roster cards — self-gates via `useUiV2()`.
 */
export function ProviderPatientRosterV2({ patients }: ProviderPatientRosterV2Props) {
  const v2 = useUiV2()
  if (!v2) return null

  return (
    <div
      data-ui-version="v2"
      data-testid="provider-patient-roster-v2"
      className="mb-8 space-y-4"
      aria-label="Patient roster"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-pv-primary)]">
            PATIENT REGISTRY
          </p>
          <h2 className="text-[24px] font-bold tracking-tight text-[var(--color-pv-ink)]">
            Your Patients
          </h2>
        </div>
        <Badge role="provider" variant="soft" tone={1} aria-label="Total patients">
          {patients.length} patients
        </Badge>
      </div>

      <ul className="flex flex-col gap-3" aria-label="Patient cards">
        {patients.map((p) => {
          const spark = buildPatientVisitSparkline(p)
          return (
            <li
              key={p.profile_id}
              data-testid={`patient-card-${p.profile_id}`}
              className="flex flex-col gap-4 rounded-[var(--sq-lg)] border border-[var(--color-pv-border-soft)] bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-pv-tile-2-bg)] text-[13px] font-bold text-[var(--color-pv-primary)]"
                  aria-hidden
                >
                  {patientInitials(p.patient_name)}
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="truncate text-[16px] font-bold text-[var(--color-pv-ink)]">
                    {p.patient_name}
                  </p>
                  <p className="text-[13px] font-medium text-[var(--color-pv-muted)]">
                    {formatPhonePv(p.patient_phone)}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-pv-tile-1-bg)] px-2.5 py-1 text-[12px] font-bold text-[var(--color-pv-ink)]">
                      <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                      {formatLastVisit(p.last_visit_date)}
                    </span>
                    <Badge role="provider" variant="soft" tone={2}>
                      {p.visit_count} visits
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 sm:justify-end">
                <Sparkline
                  role="provider"
                  values={spark}
                  width={64}
                  height={24}
                  ariaLabel={`Visit trend for ${p.patient_name}`}
                />
                <Link
                  href={`/provider/patients/${p.profile_id}`}
                  className="shrink-0 text-[13px] font-bold text-[var(--color-pv-primary)] no-underline hover:underline"
                >
                  View profile →
                </Link>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
