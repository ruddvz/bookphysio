'use client'

import type { ReactNode } from 'react'
import { Activity } from 'lucide-react'
import { Badge } from '@/components/dashboard/primitives/Badge'
import type { BadgeVariant } from '@/components/dashboard/primitives/Badge'
import { Sparkline } from '@/components/dashboard/primitives/Sparkline'
import { TrendDelta } from '@/components/dashboard/primitives/TrendDelta'
import { useUiV2 } from '@/hooks/useUiV2'

export type PatientAIAssistantMode = 'motio' | 'pai'

type PulseConfig = {
  /** Synthetic weekly-style series for the sparkline (demo signal). */
  series: readonly number[]
  badgeLabel: string
  badgeVariant: BadgeVariant
  badgeTone?: 1 | 2 | 3 | 4 | 5 | 6
  kicker: string
  headline: string
  subline: string
}

const PULSE_BY_MODE: Record<PatientAIAssistantMode, PulseConfig> = {
  motio: {
    // First vs second half ~+14% — reads as “uptick” on the sparkline without wild swings.
    series: [7, 7, 7, 8, 8, 8],
    badgeLabel: 'Triage-ready',
    badgeVariant: 'success',
    kicker: 'Patient · Motio',
    headline: 'Recovery triage pulse',
    subline: 'Symptom-to-next-step signal vs prior window',
  },
  pai: {
    series: [9, 9, 9, 10, 10, 10],
    badgeLabel: 'Evidence depth',
    badgeVariant: 'soft',
    badgeTone: 1,
    kicker: 'Patient · PAI',
    headline: 'Clinical knowledge pulse',
    subline: 'Structured, citation-aware answer depth',
  },
}

function halfWindowDeltaPct(values: readonly number[]): number {
  if (values.length < 2) return 0
  const mid = Math.floor(values.length / 2)
  const head = values.slice(0, mid)
  const tail = values.slice(mid)
  const avg = (xs: readonly number[]) => xs.reduce((s, v) => s + v, 0) / xs.length
  const a = avg(head)
  const b = avg(tail)
  if (a === 0) return Math.round(b * 100) / 100
  return Math.round(((b - a) / a) * 100)
}

export interface PatientAIShellV2Props {
  mode: PatientAIAssistantMode
  children: ReactNode
}

/**
 * Flag-gated v2 shell for patient AI surfaces (`/patient/motio`, `/patient/pai`).
 * Renders a patient-role pulse strip (Sparkline + TrendDelta + Badge) above the
 * existing chat canvas; when ui-v2 is off, returns children unchanged.
 */
export function PatientAIShellV2({ mode, children }: PatientAIShellV2Props) {
  const uiV2 = useUiV2()
  if (!uiV2) {
    return <>{children}</>
  }

  const cfg = PULSE_BY_MODE[mode]
  const delta = halfWindowDeltaPct(cfg.series)

  return (
    <div className="space-y-4">
      <section
        data-testid="patient-ai-pulse-v2"
        aria-label="AI assistant pulse"
        className="rounded-[var(--sq-lg)] border border-[var(--color-pt-border)] bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_1px_2px_rgba(15,23,42,0.03)] md:p-5"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              <Activity size={14} className="shrink-0 text-[var(--color-pt-primary)]" aria-hidden />
              {cfg.kicker}
            </div>
            <h2 className="text-[15px] font-bold leading-tight text-[var(--color-pt-ink)]">{cfg.headline}</h2>
            <p className="text-[12px] font-medium leading-snug text-slate-500">{cfg.subline}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <Sparkline
              role="patient"
              values={cfg.series}
              width={112}
              height={32}
              ariaLabel={`${mode} pulse trend`}
            />
            <TrendDelta value={delta} />
            <Badge role="patient" variant={cfg.badgeVariant} tone={cfg.badgeTone ?? 1}>
              {cfg.badgeLabel}
            </Badge>
          </div>
        </div>
      </section>
      {children}
    </div>
  )
}
