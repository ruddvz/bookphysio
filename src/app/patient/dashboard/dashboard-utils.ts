import {
  formatApptDate,
  providerDisplayName,
  type AppointmentItem,
} from '../appointments/appointments-utils'

export function getNextAppointment(appointments: AppointmentItem[]): AppointmentItem | null {
  const now = Date.now()

  return (
    appointments
      .filter((appointment) => {
        const startsAt = appointment.availabilities?.starts_at
        if (!startsAt) {
          return false
        }

        if (appointment.status === 'cancelled' || appointment.status === 'completed' || appointment.status === 'no_show') {
          return false
        }

        return Date.parse(startsAt) >= now
      })
      .sort((left, right) => {
        const leftTime = Date.parse(left.availabilities?.starts_at ?? '')
        const rightTime = Date.parse(right.availabilities?.starts_at ?? '')
        return leftTime - rightTime
      })[0] ?? null
  )
}

export function getPatientAppointmentProviderName(appointment: AppointmentItem): string {
  return providerDisplayName(appointment)
}

export function getPatientAppointmentVisitLabel(appointment: AppointmentItem): string {
  return appointment.visit_type === 'home_visit' ? 'Home session' : 'Clinic visit'
}

export function formatAppointmentDateTime(iso: string): string {
  return formatApptDate(iso)
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000
const DAY_MS = 24 * 60 * 60 * 1000

interface WeeklyBucketInput {
  visit_date?: string | null
}

/**
 * True when `visit_date` (parsed as a UTC instant) falls within the last
 * `weeks` calendar weeks ending at the end of today UTC. Shared by the
 * bucketing helper and by downstream aggregations (e.g. windowed care
 * team size) so both views of "recent" agree on the same boundary.
 */
export function isWithinWeeks(
  visit_date: string | null | undefined,
  weeks: number,
  now: number = Date.now(),
): boolean {
  if (!visit_date) return false
  const date = Date.parse(visit_date)
  if (Number.isNaN(date)) return false
  const dayEnd = (Math.floor(now / DAY_MS) + 1) * DAY_MS
  const ageMs = dayEnd - date
  return ageMs > 0 && ageMs <= weeks * WEEK_MS
}

/**
 * Bucket items into the last `weeks` rolling weekly windows ending today,
 * returned oldest → newest. `visit_date` is stored as `YYYY-MM-DD` (UTC
 * midnight) per `PatientFacingRecord`, and `now` is a precise instant;
 * we snap `now` to the start of the next UTC day so all visits dated
 * today land in the latest bucket regardless of the hour the page is
 * loaded, and week boundaries don't flip mid-session. Items without a
 * parseable date or older than the window are dropped silently.
 */
export function bucketVisitsByWeek<T extends WeeklyBucketInput>(
  items: readonly T[],
  weeks: number,
  now: number = Date.now(),
): number[] {
  const dayEnd = (Math.floor(now / DAY_MS) + 1) * DAY_MS
  const buckets = new Array<number>(weeks).fill(0)
  for (const item of items) {
    const date = item.visit_date ? Date.parse(item.visit_date) : NaN
    if (Number.isNaN(date)) continue
    const ageMs = dayEnd - date
    if (ageMs <= 0 || ageMs > weeks * WEEK_MS) continue
    const weekIndex = weeks - 1 - Math.floor((ageMs - 1) / WEEK_MS)
    buckets[weekIndex] += 1
  }
  return buckets
}

/**
 * Whole calendar-day distance from `now` to `iso`, rounded down. Returns
 * `null` for missing or unparseable input or for past dates.
 */
export function daysUntil(iso: string | undefined | null, now: number = Date.now()): number | null {
  if (!iso) return null
  const target = Date.parse(iso)
  if (Number.isNaN(target)) return null
  const diff = target - now
  if (diff < 0) return null
  return Math.floor(diff / DAY_MS)
}
