// 8 AM through 8 PM inclusive (13 rows)
export const HOURS: number[] = Array.from({ length: 13 }, (_, i) => 8 + i)

export function formatHour(h: number): string {
  if (h === 0) return '12 AM'
  if (h === 12) return '12 PM'
  return h < 12 ? `${h} AM` : `${h - 12} PM`
}

export function getWeekDates(anchor: Date): Date[] {
  const day = anchor.getDay() // 0 = Sunday, 1 = Monday
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

/** "HH:MM" → hour as integer (rounded down). */
export function timeToHour(visitTime: string): number {
  const [hh] = visitTime.split(':')
  return parseInt(hh, 10)
}
