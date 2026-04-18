import { formatIndiaDateInput } from '@/lib/india-date'

/**
 * Count visits per India calendar month for the last `monthCount` months ending at `referenceNowMs`.
 * Returns oldest→newest counts (same ordering as `Sparkline` expects).
 */
export function monthlyVisitCountSeries(
  visitDates: readonly string[],
  referenceNowMs: number,
  monthCount = 6,
): number[] {
  const end = new Date(referenceNowMs)
  const monthKeys: string[] = []
  for (let i = monthCount - 1; i >= 0; i--) {
    const d = new Date(end.getFullYear(), end.getMonth() - i, 1)
    monthKeys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  const byMonth = new Map<string, number>()
  for (const raw of visitDates) {
    const visit = new Date(raw.includes('T') ? raw : `${raw}T12:00:00+05:30`)
    if (Number.isNaN(visit.getTime())) continue
    const mk = formatIndiaDateInput(visit).slice(0, 7)
    byMonth.set(mk, (byMonth.get(mk) ?? 0) + 1)
  }

  return monthKeys.map((k) => byMonth.get(k) ?? 0)
}

export function halfWindowDeltaPct(values: readonly number[]): number {
  if (values.length < 2) return 0
  const mid = Math.floor(values.length / 2)
  const head = values.slice(0, mid)
  const tail = values.slice(mid)
  const avg = (xs: readonly number[]) => xs.reduce((s, v) => s + v, 0) / xs.length
  const a = avg(head)
  const b = avg(tail)
  if (a === 0) return Math.round(b * 100) / 100
  return Math.round(((b - a) / a) * 100)
}
