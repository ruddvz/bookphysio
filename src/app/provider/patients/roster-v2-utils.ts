/**
 * Pure helpers for provider patient roster v2 (slice 16.27).
 */

import type { PatientRosterRow } from '@/lib/clinical/types'

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000

export type PatientRosterV2Row = PatientRosterRow & {
  /** Optional visit dates for sparkline — from chart visits when available */
  visit_dates?: string[]
}

/**
 * Six monthly visit counts (oldest → newest), IST month buckets.
 */
export function buildPatientVisitSparkline(
  patient: PatientRosterV2Row,
  nowMs: number = Date.now(),
): number[] {
  const dates = patient.visit_dates ?? []
  const istNow = new Date(nowMs + IST_OFFSET_MS)
  const endYear = istNow.getUTCFullYear()
  const endMonth = istNow.getUTCMonth()

  const keys: string[] = []
  for (let i = 5; i >= 0; i--) {
    const dt = new Date(Date.UTC(endYear, endMonth - i, 1))
    keys.push(`${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}`)
  }

  const countByKey = new Map<string, number>()
  for (const raw of dates) {
    const d = new Date(raw.includes('T') ? raw : `${raw}T00:00:00`)
    if (Number.isNaN(d.getTime())) continue
    const ist = new Date(d.getTime() + IST_OFFSET_MS)
    const key = `${ist.getUTCFullYear()}-${String(ist.getUTCMonth() + 1).padStart(2, '0')}`
    countByKey.set(key, (countByKey.get(key) ?? 0) + 1)
  }

  return keys.map((k) => countByKey.get(k) ?? 0)
}

export function formatPhonePv(phone: string | null): string {
  if (!phone) return '—'
  const digits = phone.replace(/\D/g, '')
  if (digits.length >= 12 && digits.startsWith('91')) {
    const national = digits.slice(2, 12)
    if (national.length === 10) {
      return `+91 ${national.slice(0, 5)} ${national.slice(5)}`
    }
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`
  }
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return `+91 ${digits.slice(1, 6)} ${digits.slice(6)}`
  }
  return phone
}

export function patientInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 1).toUpperCase()
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase()
}
