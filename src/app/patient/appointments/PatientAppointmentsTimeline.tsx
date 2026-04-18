import Link from 'next/link'
import { ArrowRight, Calendar, RefreshCw, Video } from 'lucide-react'
import { Badge } from '@/components/dashboard/primitives/Badge'
import { canPatientCancelAppointment } from '@/lib/appointments/cancellation'
import {
  formatApptTimeOnly,
  groupApptsByDay,
  providerDisplayName,
  statusBadgeVariant,
  STATUS_LABEL,
  type AppointmentItem,
  type AppointmentTab,
} from './appointments-utils'

export interface PatientAppointmentsTimelineProps {
  appointments: AppointmentItem[]
  tab: AppointmentTab
  /** Wall-clock ms for grouping (parent supplies via useState(() => Date.now()) or tests inject a fixed value). */
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

/**
 * Day-grouped appointment timeline for the v2 patient surface.
 *
 * Renders as a vertical rail with a sticky-ish day header and one chip-row per
 * appointment. Status pills use the shared `Badge` primitive so colour tokens
 * stay consistent with the rest of the patient dashboard.
 */
export function PatientAppointmentsTimeline({
  appointments,
  tab,
  nowMs,
}: PatientAppointmentsTimelineProps) {
  const days = groupApptsByDay(appointments, tab, nowMs)
  const nowDate = new Date(nowMs)

  if (days.length === 0) return null

  return (
    <ol
      data-testid="patient-appointments-timeline"
      aria-label={tab === 'upcoming' ? 'Upcoming visit timeline' : 'Past visit timeline'}
      className="flex flex-col gap-5"
    >
      {days.map((day) => (
        <li key={day.key} className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-pt-primary)]"
            />
            <div className="flex items-baseline gap-2">
              <span className="text-[13px] font-bold tracking-tight text-[var(--color-pt-ink)]">
                {day.label}
              </span>
              {day.isToday ? (
                <Badge role="patient" variant="solid" className="!py-0 !px-2 !text-[10px]">
                  Today
                </Badge>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col divide-y divide-[var(--color-pt-border-soft)] overflow-hidden rounded-[var(--sq-lg)] border border-[var(--color-pt-border-soft)] bg-white">
            {day.items.map((appt) => {
              const slotIso = appt.availabilities?.starts_at
              const timeLabel = slotIso ? formatApptTimeOnly(slotIso) : 'TBD'
              const status = appt.status as string
              const statusLabel = STATUS_LABEL[status] ?? status
              const variant = statusBadgeVariant(status)
              const canReschedule =
                tab === 'upcoming' &&
                appt.payment_status !== 'paid' &&
                canPatientCancelAppointment(appt.status, appt.availabilities?.starts_at, nowDate)

              return (
                <article
                  key={appt.id}
                  className="flex items-center gap-4 px-4 py-3"
                  data-testid="timeline-row"
                  data-appt-id={appt.id}
                >
                  <div className="flex w-16 shrink-0 flex-col items-start">
                    <span className="text-[15px] font-bold tabular-nums text-[var(--color-pt-ink)]">
                      {timeLabel}
                    </span>
                    <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-pt-muted)]">
                      <VisitIcon visitType={appt.visit_type as string} />
                      {visitTypeLabel(appt.visit_type as string)}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] font-bold tracking-tight text-[var(--color-pt-ink)]">
                      {providerDisplayName(appt)}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <Badge role="patient" variant={variant}>
                        {statusLabel}
                      </Badge>
                      {appt.locations?.city ? (
                        <span className="truncate text-[12px] font-medium text-[var(--color-pt-muted)]">
                          {appt.locations.city}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {canReschedule ? (
                      <Link
                        href={`/patient/appointments/${appt.id}?reschedule=true`}
                        className="hidden items-center gap-1.5 rounded-full border border-[var(--color-pt-border)] px-3 py-1.5 text-[12px] font-bold text-[var(--color-pt-primary)] transition-colors hover:bg-[var(--color-pt-tile-1-bg)] sm:inline-flex"
                        aria-label={`Reschedule visit with ${providerDisplayName(appt)}`}
                      >
                        <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                        Reschedule
                      </Link>
                    ) : null}
                    <Link
                      href={`/patient/appointments/${appt.id}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-pt-primary)] transition-colors hover:bg-[var(--color-pt-tile-1-bg)]"
                      aria-label={`Open visit with ${providerDisplayName(appt)}`}
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
