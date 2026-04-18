/**
 * Pure helpers for provider appointments v2 timeline (slice 16.24).
 */

import { formatIndiaDateInput } from '@/lib/india-date'
import type { BadgeVariant } from '@/components/dashboard/primitives/Badge'

export type ProviderApptTab = 'upcoming' | 'completed' | 'cancelled'

export interface AppointmentRowLike {
  id: string
  status: string
  visit_type: string
  fee_inr: number
  availabilities: { starts_at: string } | null
  patient: { full_name: string } | null
}

export interface ProviderDayGroup {
  key: string
  label: string
  items: AppointmentRowLike[]
  isToday: boolean
}

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000

function istKeyFromIso(iso: string): string {
  const ist = new Date(new Date(iso).getTime() + IST_OFFSET_MS)
  const y = ist.getUTCFullYear()
  const m = String(ist.getUTCMonth() + 1).padStart(2, '0')
  const d = String(ist.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function dayHeaderLabel(iso: string, nowMs: number): string {
  const slotKey = istKeyFromIso(iso)
  const todayKey = formatIndiaDateInput(new Date(nowMs))
  const tomorrowKey = formatIndiaDateInput(new Date(nowMs + 86_400_000))
  const yesterdayKey = formatIndiaDateInput(new Date(nowMs - 86_400_000))

  const weekday = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
  }).format(new Date(iso))

  const dayNum = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
  }).format(new Date(iso))

  const month = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    month: 'short',
  }).format(new Date(iso))

  if (slotKey === todayKey) return 'Today'
  if (slotKey === tomorrowKey) return 'Tomorrow'
  if (slotKey === yesterdayKey) return 'Yesterday'
  return `${weekday} ${dayNum} ${month}`
}

/**
 * Groups provider appointments by IST calendar day (same spirit as patient timeline).
 */
export function groupApptsByDay(
  appointments: AppointmentRowLike[],
  tab: ProviderApptTab,
  nowMs: number = Date.now(),
): ProviderDayGroup[] {
  if (appointments.length === 0) return []

  const todayKey = formatIndiaDateInput(new Date(nowMs))
  const buckets = new Map<string, AppointmentRowLike[]>()

  for (const a of appointments) {
    const iso = a.availabilities?.starts_at
    if (!iso) continue
    const key = istKeyFromIso(iso)
    const list = buckets.get(key) ?? []
    list.push(a)
    buckets.set(key, list)
  }

  const ordered = [...buckets.entries()].sort(([ka], [kb]) =>
    tab === 'upcoming' ? ka.localeCompare(kb) : kb.localeCompare(ka),
  )

  return ordered.map(([key, items]) => {
    const firstIso = items[0]?.availabilities?.starts_at
    const label =
      firstIso != null ? dayHeaderLabel(firstIso, nowMs) : key
    const sorted = [...items].sort((a, b) => {
      const as = a.availabilities?.starts_at ?? ''
      const bs = b.availabilities?.starts_at ?? ''
      return tab === 'upcoming' ? as.localeCompare(bs) : bs.localeCompare(as)
    })
    return {
      key,
      label,
      items: sorted,
      isToday: key === todayKey,
    }
  })
}

export function providerStatusBadgeVariant(status: string): BadgeVariant {
  switch (status) {
    case 'confirmed':
      return 'success'
    case 'pending':
      return 'warning'
    case 'completed':
      return 'soft'
    case 'cancelled':
    case 'no_show':
      return 'danger'
    default:
      return 'soft'
  }
}

export function formatProviderApptDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function patientDisplayName(appt: { patient: { full_name: string } | null }): string {
  return appt.patient?.full_name?.trim() || 'Patient'
}
