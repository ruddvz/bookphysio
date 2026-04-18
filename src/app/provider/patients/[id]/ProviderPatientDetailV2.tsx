'use client'

import { useState } from 'react'
import { useUiV2 } from '@/hooks/useUiV2'
import { Badge } from '@/components/dashboard/primitives/Badge'
import { Sparkline } from '@/components/dashboard/primitives/Sparkline'
import { buildPatientVisitSparkline, formatPhonePv, patientInitials } from '../roster-v2-utils'
import type { PatientRosterV2Row } from '../roster-v2-utils'

export interface ProviderPatientDetailV2Props {
  patient: PatientRosterV2Row
}

/**
 * v2 header strip for patient chart — self-gates via `useUiV2()`.
 */
export function ProviderPatientDetailV2({ patient }: ProviderPatientDetailV2Props) {
  const v2 = useUiV2()
  const [note, setNote] = useState('')
  if (!v2) return null

  const spark = buildPatientVisitSparkline(patient)

  return (
    <div
      data-ui-version="v2"
      data-testid="provider-patient-detail-v2"
      className="mb-6 space-y-4 rounded-[var(--sq-lg)] border border-[var(--color-pv-border-soft)] bg-[var(--color-pv-tile-1-bg)] p-5"
      aria-label="Patient summary"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--color-pv-tile-2-bg)] text-[20px] font-bold text-[var(--color-pv-primary)]"
            aria-hidden
          >
            {patientInitials(patient.patient_name)}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[22px] font-bold text-[var(--color-pv-ink)]">{patient.patient_name}</h2>
              <Badge role="provider" variant="outline">
                Patient
              </Badge>
            </div>
            <p className="mt-1 inline-flex rounded-full border border-[var(--color-pv-border-soft)] bg-white px-3 py-1 text-[13px] font-bold text-[var(--color-pv-muted)]">
              {formatPhonePv(patient.patient_phone)}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[var(--sq-lg)] border border-[var(--color-pv-border-soft)] bg-white p-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-pv-muted)]">
          Visit frequency
        </p>
        <div className="mt-2 flex items-end justify-between gap-3">
          <Sparkline
            role="provider"
            values={spark}
            width={120}
            height={40}
            ariaLabel="Monthly visit frequency"
          />
          <span className="text-[13px] font-bold text-[var(--color-pv-muted)]">
            Last 6 months (IST)
          </span>
        </div>
      </div>

      <div>
        <label htmlFor="provider-quick-note" className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-pv-muted)]">
          Add clinical note
        </label>
        <textarea
          id="provider-quick-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Record observations..."
          rows={3}
          className="mt-2 w-full rounded-[var(--sq-lg)] border border-[var(--color-pv-border-soft)] bg-white p-3 text-[14px] font-medium text-[var(--color-pv-ink)] outline-none focus:border-[var(--color-pv-primary)]"
        />
      </div>
    </div>
  )
}
