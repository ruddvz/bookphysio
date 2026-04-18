/**
 * Pure utility functions for the patient payments page.
 * Extracted so they can be unit-tested without mounting the full page.
 */

export type PaymentStatus = 'created' | 'paid' | 'failed' | 'refunded'
export type BadgeVariant = 'soft' | 'solid' | 'outline' | 'success' | 'warning' | 'danger'

export interface PaymentItem {
  id: string
  appointment_id: string
  amount_inr: number
  gst_amount_inr: number
  status: PaymentStatus | string
  razorpay_payment_id: string | null
  created_at: string
  visit_type: string
  provider_name: string | null
  starts_at: string | null
}

export const PAYMENT_STATUS_LABEL: Record<string, string> = {
  paid: 'Paid',
  created: 'Pending',
  failed: 'Failed',
  refunded: 'Refunded',
}

export function statusBadgeVariant(status: string): BadgeVariant {
  switch (status) {
    case 'paid':     return 'success'
    case 'refunded': return 'soft'
    case 'failed':   return 'danger'
    default:         return 'warning'
  }
}

/** Formats an integer rupee amount with en-IN locale (₹1,23,456). */
export function formatInr(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`
}

/** Returns the provider display name with "Dr." prefix if missing. */
export function providerDisplayName(payment: PaymentItem): string {
  const name = payment.provider_name
  if (!name) return 'Provider'
  return name.startsWith('Dr.') ? name : `Dr. ${name}`
}

export function visitTypeLabel(visitType: string): string {
  if (visitType === 'home_visit') return 'Home session'
  if (visitType === 'video') return 'Video visit'
  return 'Clinic visit'
}

export function formatPaymentDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export interface MonthGroup {
  /** ISO month key — "YYYY-MM" in IST. */
  key: string
  /** Human-readable label — "April 2026". */
  label: string
  items: PaymentItem[]
  /** Sum of amount_inr for paid items only. */
  totalPaid: number
  /** Sum of gst_amount_inr for paid items only. */
  gstTotal: number
}

/**
 * Groups payments by IST calendar month (newest month first).
 * Uses a +5:30 offset so late-night UTC transactions land in the correct IST day/month.
 */
export function groupPaymentsByMonth(payments: PaymentItem[]): MonthGroup[] {
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000
  const map = new Map<string, PaymentItem[]>()

  for (const p of payments) {
    const ist = new Date(new Date(p.created_at).getTime() + IST_OFFSET_MS)
    const key = `${ist.getUTCFullYear()}-${String(ist.getUTCMonth() + 1).padStart(2, '0')}`
    const bucket = map.get(key) ?? []
    bucket.push(p)
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
      const paidItems = items.filter((i) => i.status === 'paid')
      return {
        key,
        label,
        items: [...items].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        ),
        totalPaid: paidItems.reduce((s, i) => s + i.amount_inr, 0),
        gstTotal:  paidItems.reduce((s, i) => s + i.gst_amount_inr, 0),
      }
    })
}
