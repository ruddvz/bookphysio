/**
 * Pure utility functions for the patient appointments page.
 * Extracted so they can be unit-tested without mounting the full page.
 */

import { formatIndiaDate, formatIndiaDateInput, formatIndiaDateTime, formatIndiaTime } from '@/lib/india-date'

export type AppointmentTab = 'upcoming' | 'past'
export type VisitType = 'in_clinic' | 'home_visit'
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'

export interface AppointmentItem {
  id: string
  status: AppointmentStatus | string
  visit_type: VisitType | string
  fee_inr: number
  payment_status: 'created' | 'paid' | 'failed' | 'refunded' | null
  availabilities: { starts_at: string } | null
  providers: {
    users: { full_name: string } | null
    specialties?: { name: string }[]
  } | null
  locations: { city: string } | null
}

/**
 * Formats an ISO date string to "DD MMM YYYY, HH:MM" in en-IN locale.
 * Reuses the same format as the dashboard for consistency.
 */
export function formatApptDate(iso: string): string {
  return formatIndiaDateTime(iso, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Returns the provider display name, prefixing "Dr." if not already present.
 */
export function providerDisplayName(appt: AppointmentItem): string {
  const name = appt.providers?.users?.full_name
  if (!name) return 'Doctor'
  return name.startsWith('Dr.') ? name : `Dr. ${name}`
}

/**
 * Filters appointments by tab.
 * upcoming: not cancelled, slot in the future
 * past: completed, cancelled, or slot in the past
 */
export function filterByTab(appointments: AppointmentItem[], tab: AppointmentTab): AppointmentItem[] {
  const now = new Date()
  if (tab === 'upcoming') {
    return appointments.filter((a) => {
      const start = a.availabilities?.starts_at
      return a.status !== 'cancelled' && start && new Date(start) >= now
    })
  }
  return appointments.filter((a) => {
    const start = a.availabilities?.starts_at
    return (
      a.status === 'completed' ||
      a.status === 'cancelled' ||
      a.status === 'no_show' ||
      (start && new Date(start) < now)
    )
  })
}

/**
 * Parses the tab query param, defaulting to 'upcoming'.
 */
export function parseTab(raw: string | null): AppointmentTab {
  return raw === 'past' ? 'past' : 'upcoming'
}

// ---------------------------------------------------------------------------
// v2 timeline helpers (slice 16.16)
// ---------------------------------------------------------------------------

export type BadgeVariantSignal = 'success' | 'warning' | 'danger' | 'soft'

/**
 * Maps an appointment status to the `Badge` primitive variant used by the v2
 * timeline. `soft` is the neutral fallback that reuses the patient palette.
 */
export function statusBadgeVariant(status: AppointmentStatus | string): BadgeVariantSignal {
  switch (status) {
    case 'confirmed':
    case 'completed':
      return 'success'
    case 'pending':
      return 'warning'
    case 'cancelled':
      return 'danger'
    default:
      return 'soft'
  }
}

export const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No-show',
}

/**
 * Formats the clock-only portion of an appointment slot (e.g. "09:30 AM") in
 * Asia/Kolkata. Used as the left rail of the v2 timeline row.
 */
export function formatApptTimeOnly(iso: string): string {
  return formatIndiaTime(iso)
}

export interface TimelineDay {
  /** India-local YYYY-MM-DD key — stable sort key and React key. */
  key: string
  /** Human label, e.g. "Today · Mon, 15 Apr" or "Wed, 22 Apr 2026". */
  label: string
  items: AppointmentItem[]
  isToday: boolean
  isPast: boolean
}

function indiaKey(iso: string): string {
  return formatIndiaDateInput(iso)
}

function dayLabel(iso: string, nowMs: number): string {
  const slotKey = indiaKey(iso)
  const todayKey = formatIndiaDateInput(new Date(nowMs))
  const tomorrowKey = formatIndiaDateInput(new Date(nowMs + 86_400_000))
  const yesterdayKey = formatIndiaDateInput(new Date(nowMs - 86_400_000))

  const thisYearKey = formatIndiaDateInput(new Date(nowMs)).slice(0, 4)
  const slotYearKey = slotKey.slice(0, 4)
  const showYear = slotYearKey !== thisYearKey

  const pretty = formatIndiaDate(iso, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    ...(showYear ? { year: 'numeric' } : {}),
  })

  if (slotKey === todayKey) return `Today · ${pretty}`
  if (slotKey === tomorrowKey) return `Tomorrow · ${pretty}`
  if (slotKey === yesterdayKey) return `Yesterday · ${pretty}`
  return pretty
}

/**
 * Groups appointments by India-local day, sorted chronologically.
 *
 * - `upcoming` tab is sorted ascending (soonest first) so patients see the
 *   next visit at the top of the timeline.
 * - `past` tab is sorted descending (most recent first) so recent history
 *   surfaces first.
 * Appointments without a slot are placed at the end under a "To be scheduled"
 * bucket so they never silently disappear from the UI.
 */
export function groupApptsByDay(
  appointments: AppointmentItem[],
  tab: AppointmentTab,
  nowMs: number = Date.now(),
): TimelineDay[] {
  const todayKey = formatIndiaDateInput(new Date(nowMs))
  const buckets = new Map<string, TimelineDay>()
  const pending: AppointmentItem[] = []

  for (const appt of appointments) {
    const iso = appt.availabilities?.starts_at
    if (!iso) {
      pending.push(appt)
      continue
    }
    const key = indiaKey(iso)
    const existing = buckets.get(key)
    if (existing) {
      existing.items.push(appt)
    } else {
      buckets.set(key, {
        key,
        label: dayLabel(iso, nowMs),
        items: [appt],
        isToday: key === todayKey,
        isPast: key < todayKey,
      })
    }
  }

  const ordered = [...buckets.values()].sort((a, b) =>
    tab === 'upcoming' ? a.key.localeCompare(b.key) : b.key.localeCompare(a.key),
  )

  // Sort each day's items by starts_at to keep the rail in chronological order.
  for (const day of ordered) {
    day.items.sort((a, b) => {
      const aStart = a.availabilities?.starts_at ?? ''
      const bStart = b.availabilities?.starts_at ?? ''
      return tab === 'upcoming'
        ? aStart.localeCompare(bStart)
        : bStart.localeCompare(aStart)
    })
  }

  if (pending.length > 0) {
    ordered.push({
      key: 'pending',
      label: 'To be scheduled',
      items: pending,
      isToday: false,
      isPast: false,
    })
  }

  return ordered
}
