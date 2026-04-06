export type SlotStatus = 'booked' | 'available' | 'blocked' | 'empty'

export interface Slot {
  status: SlotStatus
  patientName?: string
  visitType?: 'in_clinic' | 'home_visit'
}

export type WeekGrid = Record<string, Record<number, Slot>>

export const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17]

export function formatHour(h: number): string {
  if (h === 12) return '12 PM'
  return h < 12 ? `${h} AM` : `${h - 12} PM`
}

export function getWeekDates(anchor: Date): Date[] {
  const day = anchor.getDay() // 0 = Sunday
  const monday = new Date(anchor)
  monday.setDate(anchor.getDate() - ((day + 6) % 7))
  monday.setHours(0, 0, 0, 0)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

export function formatMonthRange(days: Date[]): string {
  if (days.length === 0) return ''
  const first = days[0]
  const last = days[days.length - 1]
  const monthFmt = new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' })
  if (first.getMonth() === last.getMonth()) {
    return monthFmt.format(first)
  }
  return `${new Intl.DateTimeFormat('en-IN', { month: 'short' }).format(first)} – ${monthFmt.format(last)}`
}

export function formatDay(d: Date): string {
  return new Intl.DateTimeFormat('en-IN', { weekday: 'short' }).format(d)
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export interface AvailabilitySlot {
  starts_at: string
  ends_at: string
  is_booked: boolean
  is_blocked: boolean
}

export interface AppointmentSlot {
  visit_type: string
  patient: { full_name: string } | null
  availabilities: { starts_at: string } | null
}

const SLOT_PRIORITY: Record<SlotStatus, number> = {
  empty: 0,
  available: 1,
  blocked: 2,
  booked: 3,
}

function mergeSlot(existing: Slot | undefined, incoming: Slot): Slot {
  if (!existing) {
    return incoming
  }

  if (SLOT_PRIORITY[incoming.status] > SLOT_PRIORITY[existing.status]) {
    return incoming
  }

  return existing
}

export function buildGridFromData(
  days: Date[],
  availabilities: AvailabilitySlot[],
  appointments: AppointmentSlot[],
): WeekGrid {
  const grid: WeekGrid = {}

  // Initialize empty grid
  for (const d of days) {
    const key = dateKey(d)
    grid[key] = {}
  }

  // Map appointments by start hour+date for quick lookup
  const apptMap = new Map<string, AppointmentSlot>()
  for (const appt of appointments) {
    if (!appt.availabilities?.starts_at) continue
    const dt = new Date(appt.availabilities.starts_at)
    const key = `${dateKey(dt)}-${dt.getHours()}`
    apptMap.set(key, appt)
  }

  // Fill from availabilities
  for (const slot of availabilities) {
    const dt = new Date(slot.starts_at)
    const key = dateKey(dt)
    const hour = dt.getHours()

    if (!grid[key]) continue
    if (!HOURS.includes(hour)) continue

    if (slot.is_blocked) {
      grid[key][hour] = mergeSlot(grid[key][hour], { status: 'blocked' })
    } else if (slot.is_booked) {
      const apptKey = `${key}-${hour}`
      const appt = apptMap.get(apptKey)
      grid[key][hour] = mergeSlot(grid[key][hour], {
        status: 'booked',
        patientName: appt?.patient?.full_name ?? 'Patient',
        visitType: (appt?.visit_type as Slot['visitType']) ?? 'in_clinic',
      })
    } else {
      grid[key][hour] = mergeSlot(grid[key][hour], { status: 'available' })
    }
  }

  return grid
}
