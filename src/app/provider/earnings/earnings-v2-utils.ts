/**
 * Pure helpers for provider earnings v2 (slice 16.26).
 */

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000

export interface EarningsTransaction {
  id: string
  date: string
  patient: string
  amount: number
  gst: number
  net: number
  status: 'paid' | 'pending'
}

export interface EarningsMonthGroup {
  key: string
  label: string
  items: EarningsTransaction[]
  totalGross: number
  totalGst: number
  totalNet: number
}

function parseTxnDate(dateStr: string): Date {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return new Date(0)
  return d
}

function istMonthKey(d: Date): string {
  const ist = new Date(d.getTime() + IST_OFFSET_MS)
  const y = ist.getUTCFullYear()
  const m = String(ist.getUTCMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

/**
 * Groups transactions by IST month (newest first).
 */
export function groupEarningsByMonth(transactions: EarningsTransaction[]): EarningsMonthGroup[] {
  const paid = transactions.filter((t) => t.status === 'paid')
  const map = new Map<string, EarningsTransaction[]>()

  for (const t of paid) {
    const key = istMonthKey(parseTxnDate(t.date))
    const bucket = map.get(key) ?? []
    bucket.push(t)
    map.set(key, bucket)
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, items]) => {
      const [year, month] = key.split('-').map(Number)
      const label = new Date(year, month - 1, 1).toLocaleString('en-IN', {
        month: 'long',
        year: 'numeric',
      })
      const totalGross = items.reduce((s, i) => s + i.amount, 0)
      const totalGst = items.reduce((s, i) => s + i.gst, 0)
      const totalNet = items.reduce((s, i) => s + i.net, 0)
      return { key, label, items, totalGross, totalGst, totalNet }
    })
}

/**
 * Last 6 calendar months of net totals (oldest → newest), IST buckets.
 */
export function buildEarningsSparkline(
  transactions: EarningsTransaction[],
  nowMs: number = Date.now(),
): number[] {
  const paid = transactions.filter((t) => t.status === 'paid')
  const istNow = new Date(nowMs + IST_OFFSET_MS)
  const endYear = istNow.getUTCFullYear()
  const endMonth = istNow.getUTCMonth()

  const keys: string[] = []
  for (let i = 5; i >= 0; i--) {
    const dt = new Date(Date.UTC(endYear, endMonth - i, 1))
    keys.push(`${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}`)
  }

  const netByKey = new Map<string, number>()
  for (const t of paid) {
    const k = istMonthKey(parseTxnDate(t.date))
    netByKey.set(k, (netByKey.get(k) ?? 0) + t.net)
  }

  return keys.map((k) => netByKey.get(k) ?? 0)
}

export function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return null
  return ((current - previous) / previous) * 100
}

export function formatInrPv(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`
}
