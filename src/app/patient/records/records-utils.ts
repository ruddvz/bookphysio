/**
 * Pure utility functions for the patient records v2 page.
 * Extracted for unit testing without mounting the full page.
 */

import type { PatientFacingRecord } from '@/lib/clinical/types'

export function formatRecordDate(isoDate: string): string {
  return new Date(isoDate + 'T00:00:00').toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen).trimEnd() + '…'
}

/**
 * Builds a monthly visit count array for the last `months` calendar months
 * (oldest → newest), suitable for feeding into a Sparkline.
 *
 * Uses the UTC date from `visit_date` (format "YYYY-MM-DD").
 */
export function buildVisitSparkline(
  records: PatientFacingRecord[],
  months = 6,
): readonly number[] {
  const now = new Date()
  const buckets: number[] = Array(months).fill(0)

  for (const r of records) {
    const d = new Date(r.visit_date + 'T00:00:00')
    // months difference (negative = past)
    const diff =
      (now.getFullYear() - d.getFullYear()) * 12 +
      (now.getMonth() - d.getMonth())
    const idx = months - 1 - diff
    if (idx >= 0 && idx < months) {
      buckets[idx]++
    }
  }

  return buckets
}

/** Short month labels (oldest → newest) aligned with `buildVisitSparkline` buckets. */
export function buildVisitSparklineMonthLabels(months = 6): string[] {
  const now = new Date()
  const labels: string[] = []
  for (let j = 0; j < months; j++) {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - j), 1)
    labels.push(d.toLocaleDateString('en-IN', { month: 'short' }))
  }
  return labels
}

export interface ProviderGroup {
  providerName: string
  visits: PatientFacingRecord[]
  latestDate: string
}

/**
 * Groups records by provider, sorted by most-recent visit descending.
 */
export function groupRecordsByProvider(
  records: PatientFacingRecord[],
): ProviderGroup[] {
  const map = new Map<string, PatientFacingRecord[]>()

  for (const r of records) {
    const bucket = map.get(r.provider_name) ?? []
    bucket.push(r)
    map.set(r.provider_name, bucket)
  }

  return Array.from(map.entries())
    .map(([providerName, visits]) => ({
      providerName,
      visits: [...visits].sort(
        (a, b) => new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime(),
      ),
      latestDate: visits.reduce(
        (latest, v) => (v.visit_date > latest ? v.visit_date : latest),
        '',
      ),
    }))
    .sort((a, b) => b.latestDate.localeCompare(a.latestDate))
}

/** Count of records that have a patient_summary written. */
export function summaryCompletionCount(records: PatientFacingRecord[]): number {
  return records.filter((r) => Boolean(r.patient_summary)).length
}

/** Count of records that have a care plan written. */
export function planCount(records: PatientFacingRecord[]): number {
  return records.filter((r) => Boolean(r.plan)).length
}
