/**
 * Pure utility functions for the patient notifications v2 overlay.
 * Extracted for unit-testability without mounting the full page.
 */

import type { BadgeVariant } from '@/components/dashboard/primitives/Badge'
import { formatIndiaDateInput } from '@/lib/india-date'

export type NotificationType =
  | 'appointment_confirmed'
  | 'appointment_cancelled'
  | 'payment_success'
  | 'new_message'
  | 'account_verified'
  | string

export interface NotificationItem {
  id: string
  type: NotificationType
  title: string
  body: string
  read: boolean
  created_at: string
}

/** Badge variant for a notification type / read state. */
export function notificationBadgeVariant(type: NotificationType, read: boolean): BadgeVariant {
  if (read) return 'soft'
  switch (type) {
    case 'appointment_cancelled':
      return 'danger'
    case 'payment_success':
      return 'success'
    case 'appointment_confirmed':
      return 'success'
    case 'new_message':
      return 'warning'
    case 'account_verified':
      return 'success'
    default:
      return 'soft'
  }
}

/** Human-readable label for a notification type. */
export function notificationTypeLabel(type: NotificationType): string {
  switch (type) {
    case 'appointment_confirmed': return 'Confirmed'
    case 'appointment_cancelled': return 'Cancelled'
    case 'payment_success': return 'Payment'
    case 'new_message': return 'Message'
    case 'account_verified': return 'Verified'
    default: return 'Update'
  }
}

/**
 * Groups notifications by IST calendar day (YYYY-MM-DD), newest day first.
 */
export function groupNotificationsByDay(
  notifications: NotificationItem[],
  nowIso?: string,
): Array<{ dayKey: string; label: string; items: NotificationItem[] }> {
  if (notifications.length === 0) return []

  const now = nowIso ? new Date(nowIso) : new Date()
  const todayKey = formatIndiaDateInput(now)
  const yesterdayKey = formatIndiaDateInput(new Date(now.getTime() - 86_400_000))

  const buckets = new Map<string, NotificationItem[]>()
  for (const n of notifications) {
    const dayKey = formatIndiaDateInput(n.created_at)
    const bucket = buckets.get(dayKey)
    if (bucket) {
      bucket.push(n)
    } else {
      buckets.set(dayKey, [n])
    }
  }

  const result: Array<{ dayKey: string; label: string; items: NotificationItem[] }> = []
  for (const [dayKey, items] of buckets) {
    let label: string
    if (dayKey === todayKey) label = 'Today'
    else if (dayKey === yesterdayKey) label = 'Yesterday'
    else {
      const date = new Date(dayKey + 'T00:00:00+05:30')
      label = new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Kolkata',
      }).format(date)
    }
    result.push({ dayKey, label, items })
  }

  // Newest first
  result.sort((a, b) => b.dayKey.localeCompare(a.dayKey))
  return result
}

const RELATIVE_TIME_FORMATTER = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

/** Human-readable relative time (e.g. "2 hours ago"). */
export function formatRelativeTime(dateString: string): string {
  const diffMs = new Date(dateString).getTime() - Date.now()
  const absSeconds = Math.abs(diffMs) / 1000

  if (absSeconds < 60) return RELATIVE_TIME_FORMATTER.format(Math.round(diffMs / 1000), 'second')
  if (absSeconds < 3600) return RELATIVE_TIME_FORMATTER.format(Math.round(diffMs / 60_000), 'minute')
  if (absSeconds < 86_400) return RELATIVE_TIME_FORMATTER.format(Math.round(diffMs / 3_600_000), 'hour')
  if (absSeconds < 2_592_000) return RELATIVE_TIME_FORMATTER.format(Math.round(diffMs / 86_400_000), 'day')
  if (absSeconds < 31_536_000) return RELATIVE_TIME_FORMATTER.format(Math.round(diffMs / 2_592_000_000), 'month')
  return RELATIVE_TIME_FORMATTER.format(Math.round(diffMs / 31_536_000_000), 'year')
}
