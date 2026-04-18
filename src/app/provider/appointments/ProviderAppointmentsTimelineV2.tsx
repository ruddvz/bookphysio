'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Calendar } from 'lucide-react'
import { useUiV2 } from '@/hooks/useUiV2'
import { Badge } from '@/components/dashboard/primitives/Badge'
import {
  groupApptsByDay,
  patientDisplayName,
  providerStatusBadgeVariant,
  formatProviderApptDate,
  type AppointmentRowLike,
  type ProviderApptTab,
} from './provider-appointments-v2-utils'
import { formatIndiaTime } from '@/lib/india-date'

export interface ProviderAppointmentsTimelineV2Props {
  appointments: AppointmentRowLike[]
  tab: ProviderApptTab
  nowMs?: number
}

function visitLabel(visitType: string): string {
  if (visitType === 'home_visit') return 'Home visit'
  if (visitType === 'video') return 'Video'
  return 'Clinic'
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase()
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    confirmed: 'Confirmed',
    pending: 'Pending',
    completed: 'Completed',
    cancelled: 'Cancelled',
    no_show: 'No-show',
  }
  return map[status] ?? status
}

/**
 * Day-grouped provider schedule — self-gates via `useUiV2()`.
 */
export function ProviderAppointmentsTimelineV2({
  appointments,
  tab,
  nowMs,
}: ProviderAppointmentsTimelineV2Props) {
  const v2 = useUiV2()
  const [fallbackNow] = useState(() => Date.now())
  const resolvedNow = nowMs ?? fallbackNow
  if (!v2) return null

  const days = groupApptsByDay(appointments, tab, resolvedNow)
  if (days.length === 0) return null

  return (
    <ol
      data-ui-version="v2"
      data-testid="provider-appointments-timeline-v2"
      aria-label="Provider appointment timeline"
      className="mb-8 flex flex-col gap-6"
    >
      {days.map((day) => (
        <li key={day.key} className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-pv-primary)]"
            />
            <span className="text-[13px] font-bold text-[var(--color-pv-ink)]">{day.label}</span>
          </div>

          <div className="flex flex-col divide-y divide-[var(--color-pv-border-soft)] overflow-hidden rounded-[var(--sq-lg)] border border-[var(--color-pv-border-soft)] bg-white">
            {day.items.map((appt) => {
              const name = patientDisplayName(appt)
              const slot = appt.availabilities?.starts_at
              const variant = providerStatusBadgeVariant(appt.status)
              const badgeTone = variant === 'soft' ? 1 : undefined

              return (
                <article
                  key={appt.id}
                  className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-pv-tile-2-bg)] text-[12px] font-bold text-[var(--color-pv-primary)]"
                      aria-hidden
                    >
                      {initials(name)}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <p className="truncate text-[15px] font-bold text-[var(--color-pv-ink)]">{name}</p>
                      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[var(--color-pv-muted)]">
                        <span className="inline-flex items-center gap-1 capitalize">
                          <Calendar className="h-3.5 w-3.5" aria-hidden />
                          {visitLabel(appt.visit_type)}
                        </span>
                        {slot ? (
                          <>
                            <span>{formatProviderApptDate(slot)}</span>
                            <span className="tabular-nums">{formatIndiaTime(slot)}</span>
                          </>
                        ) : null}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                    <span className="text-[14px] font-bold tabular-nums text-[var(--color-pv-ink)]">
                      ₹{appt.fee_inr.toLocaleString('en-IN')}
                    </span>
                    <Badge
                      role="provider"
                      variant={variant}
                      {...(badgeTone ? { tone: badgeTone } : {})}
                      aria-label={`Status ${statusLabel(appt.status)}`}
                    >
                      {statusLabel(appt.status)}
                    </Badge>
                    <Link
                      href={`/provider/appointments/${appt.id}`}
                      className="inline-flex items-center gap-1 text-[13px] font-bold text-[var(--color-pv-primary)] no-underline hover:underline"
                    >
                      View →
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                    {tab === 'upcoming' ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          data-testid="action-complete"
                          className="rounded-full border border-[var(--color-pv-border-soft)] bg-[var(--color-pv-tile-1-bg)] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--color-pv-ink)]"
                          onClick={() => {}}
                        >
                          Complete
                        </button>
                        <button
                          type="button"
                          data-testid="action-no-show"
                          className="rounded-full border border-[var(--color-pv-border-soft)] bg-[var(--color-pv-tile-1-bg)] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--color-pv-ink)]"
                          onClick={() => {}}
                        >
                          No-show
                        </button>
                      </div>
                    ) : null}
                  </div>
                </article>
              )
            })}
          </div>
        </li>
      ))}
    </ol>
  )
}
