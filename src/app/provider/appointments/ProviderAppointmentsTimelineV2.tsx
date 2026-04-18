'use client'

import Link from 'next/link'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, Calendar, RefreshCw, Video, CheckCircle2, UserX, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/dashboard/primitives/Badge'
import {
  formatApptTimeOnly,
  providerDisplayName,
  statusBadgeVariant,
  STATUS_LABEL,
  type AppointmentItem,
} from '@/app/patient/appointments/appointments-utils'
import { groupProviderAppointmentsByDay, type ProviderApptTab } from './provider-appointments-utils'

export interface ProviderAppointmentsTimelineV2Props {
  appointments: AppointmentItem[]
  tab: ProviderApptTab
  nowMs: number
}

function visitTypeLabel(visitType: string): string {
  if (visitType === 'home_visit') return 'Home session'
  if (visitType === 'video') return 'Video visit'
  return 'Clinic visit'
}

function VisitIcon({ visitType }: { visitType: string }) {
  if (visitType === 'video') {
    return <Video size={16} strokeWidth={2.2} aria-hidden />
  }
  return <Calendar size={16} strokeWidth={2.2} aria-hidden />
}

export function ProviderAppointmentsTimelineV2({
  appointments,
  tab,
  nowMs,
}: ProviderAppointmentsTimelineV2Props) {
  const queryClient = useQueryClient()
  const days = groupProviderAppointmentsByDay(appointments, tab, nowMs)

  const statusMut = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'confirmed' | 'completed' | 'no_show' }) => {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'provider_set_status', status }),
      })
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(err.error ?? 'Update failed')
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['provider-appointments'] })
    },
  })

  if (days.length === 0) return null

  return (
    <ol
      data-testid="provider-appointments-timeline-v2"
      aria-label={
        tab === 'upcoming'
          ? 'Upcoming session timeline'
          : tab === 'completed'
            ? 'Completed session timeline'
            : 'Cancelled session timeline'
      }
      className="flex flex-col gap-5"
    >
      {days.map((day) => (
        <li key={day.key} className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-pv-primary)]"
            />
            <div className="flex items-baseline gap-2">
              <span className="text-[13px] font-bold tracking-tight text-[var(--color-pv-ink)]">
                {day.label}
              </span>
              {day.isToday ? (
                <Badge role="provider" variant="solid" className="!py-0 !px-2 !text-[10px]">
                  Today
                </Badge>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col divide-y divide-slate-100/80 overflow-hidden rounded-[var(--sq-lg)] border border-slate-200/80 bg-white shadow-sm">
            {day.items.map((appt) => {
              const slotIso = appt.availabilities?.starts_at
              const timeLabel = slotIso ? formatApptTimeOnly(slotIso) : 'TBD'
              const status = appt.status as string
              const statusLabel = STATUS_LABEL[status] ?? status
              const variant = statusBadgeVariant(status)
              const slotMs = slotIso ? Date.parse(slotIso) : NaN
              const slotPassed = Number.isFinite(slotMs) && slotMs <= nowMs
              const patientName = providerDisplayName(appt)
              const busy = statusMut.isPending

              const showOutcome =
                tab === 'upcoming' &&
                slotPassed &&
                ['confirmed', 'pending'].includes(status)
              const showConfirm = tab === 'upcoming' && status === 'pending' && !slotPassed

              return (
                <article
                  key={appt.id}
                  className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-4"
                  data-testid="provider-timeline-row"
                  data-appt-id={appt.id}
                >
                  <div className="flex w-full min-w-0 flex-1 gap-4 sm:items-center">
                    <div className="flex w-16 shrink-0 flex-col items-start">
                      <span className="text-[15px] font-bold tabular-nums text-[var(--color-pv-ink)]">
                        {timeLabel}
                      </span>
                      <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                        <VisitIcon visitType={appt.visit_type as string} />
                        {visitTypeLabel(appt.visit_type as string)}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[14px] font-bold tracking-tight text-[var(--color-pv-ink)]">
                        {patientName}
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2">
                        <Badge role="provider" variant={variant}>
                          {statusLabel}
                        </Badge>
                        {appt.locations?.city ? (
                          <span className="truncate text-[12px] font-medium text-slate-500">
                            {appt.locations.city}
                          </span>
                        ) : null}
                        <span className="text-[12px] font-bold text-slate-700">
                          ₹{appt.fee_inr.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:max-w-[min(100%,380px)]">
                    {showConfirm ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => statusMut.mutate({ id: appt.id, status: 'confirmed' })}
                        className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[12px] font-bold text-emerald-800 transition-colors hover:bg-emerald-100 disabled:opacity-50"
                      >
                        <ShieldCheck size={14} aria-hidden />
                        Confirm
                      </button>
                    ) : null}
                    {showOutcome ? (
                      <>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => statusMut.mutate({ id: appt.id, status: 'completed' })}
                          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-[12px] font-bold text-emerald-700 transition-colors hover:bg-emerald-50 disabled:opacity-50"
                        >
                          <CheckCircle2 size={14} aria-hidden />
                          Complete
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => statusMut.mutate({ id: appt.id, status: 'no_show' })}
                          className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50/80 px-3 py-1.5 text-[12px] font-bold text-rose-800 transition-colors hover:bg-rose-100 disabled:opacity-50"
                        >
                          <UserX size={14} aria-hidden />
                          No-show
                        </button>
                      </>
                    ) : null}
                    {tab === 'upcoming' && ['confirmed', 'pending'].includes(status) ? (
                      <Link
                        href={`/provider/appointments/${appt.id}?reschedule=true`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-[12px] font-bold text-[var(--color-pv-primary)] transition-colors hover:bg-slate-50"
                      >
                        <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                        Reschedule
                      </Link>
                    ) : null}
                    <Link
                      href={`/provider/appointments/${appt.id}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-pv-primary)] transition-colors hover:bg-[var(--color-pv-tile-1-bg)]"
                      aria-label={`Open session ${patientName}`}
                    >
                      <ArrowRight size={16} strokeWidth={2.4} aria-hidden />
                    </Link>
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
