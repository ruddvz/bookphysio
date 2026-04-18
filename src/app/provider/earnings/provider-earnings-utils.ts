import { formatIndiaDateInput } from '@/lib/india-date'

export interface EarningsTxnForSeries {
  status: 'paid' | 'pending'
  /** Integer rupees — settled / expected net */
  net: number
  visitIso: string
}

/**
 * Build oldest→newest monthly settled net totals (India calendar months) for the
 * last `monthCount` months ending at `referenceNowMs`.
 */
export function monthlySettledNetSeries(
  transactions: readonly EarningsTxnForSeries[],
  referenceNowMs: number,
  monthCount = 6,
): { keys: string[]; values: number[] } {
  const end = new Date(referenceNowMs)
  const monthKeys: string[] = []
  for (let i = monthCount - 1; i >= 0; i--) {
    const d = new Date(end.getFullYear(), end.getMonth() - i, 1)
    monthKeys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  const paid = transactions.filter((t) => t.status === 'paid')
  const byMonth = new Map<string, number>()
  for (const t of paid) {
    const visit = new Date(t.visitIso)
    if (Number.isNaN(visit.getTime())) continue
    const mk = formatIndiaDateInput(visit).slice(0, 7)
    byMonth.set(mk, (byMonth.get(mk) ?? 0) + t.net)
  }

  const values = monthKeys.map((k) => byMonth.get(k) ?? 0)
  return { keys: monthKeys, values }
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
