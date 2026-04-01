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
  // Clear time for consistency
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

export function buildMockGrid(days: Date[]): WeekGrid {
  const grid: WeekGrid = {}
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  days.forEach((d) => {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    grid[key] = {}
    const isToday = isSameDay(d, today)
    const isPast = d < today && !isToday
    const dayOfWeek = d.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    HOURS.forEach((h) => {
      if (isWeekend) {
        grid[key][h] = { status: 'blocked' }
        return
      }
      if (isPast) {
        if (h === 10 || h === 14) grid[key][h] = { status: 'booked', patientName: 'Patient', visitType: 'in_clinic' }
        else grid[key][h] = { status: 'empty' }
        return
      }
      if (isToday) {
        if (h === 9) grid[key][h] = { status: 'booked', patientName: 'Anil Kumar', visitType: 'in_clinic' }
        else if (h === 11) grid[key][h] = { status: 'booked', patientName: 'Priya Nair', visitType: 'home_visit' }
        else if (h === 14) grid[key][h] = { status: 'booked', patientName: 'Suresh Pillai', visitType: 'home_visit' }
        else if (h === 13) grid[key][h] = { status: 'blocked' }
        else grid[key][h] = { status: 'available' }
        return
      }
      // Future days
      if (h === 10 || h === 15) grid[key][h] = { status: 'booked', patientName: 'Patient', visitType: 'in_clinic' }
      else if (h === 12) grid[key][h] = { status: 'blocked' }
      else grid[key][h] = { status: 'available' }
    })
  })

  return grid
}
