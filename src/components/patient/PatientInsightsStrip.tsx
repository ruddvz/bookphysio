'use client'

import Link from 'next/link'
import { ArrowRight, CalendarCheck2, HeartPulse, Users } from 'lucide-react'
import { Sparkline } from '@/components/dashboard/primitives/Sparkline'
import { Badge } from '@/components/dashboard/primitives/Badge'
export interface PatientInsightsStripProps {
  upcomingVisits: number
  careTeam: number
  publishedSummaries: number
  lastVisitIso?: string | null
  visitCadence?: readonly number[]
  bookHref?: string
  className?: string
}

const DEFAULT_CADENCE: readonly number[] = [1, 0, 2, 1, 2, 3, 2]

const DAY_MS = 86_400_000

interface GapBadge {
  label: string
  variant: 'success' | 'warning' | 'danger'
}

function daysSince(iso: string): number | undefined {
  const parsed = Date.parse(iso)
  if (!Number.isFinite(parsed)) return undefined
  const diff = Date.now() - parsed
  // Future timestamps are treated as missing rather than healthy so a
  // bad server clock never masquerades as an on-track cadence.
  if (diff < 0) return undefined
  return Math.floor(diff / DAY_MS)
}

function gapBadge(lastVisitIso?: string | null): GapBadge {
  if (!lastVisitIso) return { label: 'No visits yet', variant: 'warning' }
  const days = daysSince(lastVisitIso)
  if (typeof days !== 'number') return { label: 'No visits yet', variant: 'warning' }
  if (days <= 14) return { label: `${days}d ago · on track`, variant: 'success' }
  if (days <= 45) return { label: `${days}d ago · check in`, variant: 'warning' }
  return { label: `${days}d ago · book soon`, variant: 'danger' }
}

interface TileProps {
  icon: typeof CalendarCheck2
  label: string
  value: string | number
}

function InsightTile({ icon: Icon, label, value }: TileProps) {
  return (
    <div className="flex items-center gap-3 rounded-[var(--sq-md)] bg-white/70 px-3 py-2.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--sq-sm)] bg-[var(--color-pt-tile-1-bg)] text-[var(--color-pt-tile-1-fg)]">
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </div>
        <div className="text-[16px] font-bold tabular-nums text-[var(--color-pt-ink)]">
          {value}
        </div>
      </div>
    </div>
  )
}

export function PatientInsightsStrip({
  upcomingVisits,
  careTeam,
  publishedSummaries,
  lastVisitIso,
  visitCadence = DEFAULT_CADENCE,
  bookHref = '/search',
  className,
}: PatientInsightsStripProps) {
  const gap = gapBadge(lastVisitIso)

  return (
    <section
      data-testid="patient-insights-strip"
      aria-label="Your care cadence"
      className={`rounded-[var(--sq-lg)] border border-[var(--color-pt-border-soft)] bg-[var(--color-pt-surface)] p-4 sm:p-5 ${className ?? ''}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-pt-muted)]">
            Care cadence · Last 7 days
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-[15px] font-semibold text-[var(--color-pt-ink)]">
              Visits per week
            </span>
            <Badge role="patient" variant={gap.variant}>
              {gap.label}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Sparkline
            role="patient"
            values={visitCadence}
            width={96}
            height={28}
            ariaLabel="Visits per week trend"
          />
          <Link
            href={bookHref}
            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-pt-primary)] px-3.5 py-1.5 text-[12px] font-bold text-white transition-opacity hover:opacity-85"
            aria-label="Book next session"
          >
            Book
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <InsightTile icon={CalendarCheck2} label="Upcoming visits" value={upcomingVisits} />
        <InsightTile icon={Users} label="Care team" value={careTeam} />
        <InsightTile icon={HeartPulse} label="Visit summaries" value={publishedSummaries} />
      </div>
    </section>
  )
}
