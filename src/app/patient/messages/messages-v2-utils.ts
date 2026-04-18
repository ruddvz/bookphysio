/**
 * Pure utility functions for the patient messages v2 overlay.
 * Extracted for unit-testability without mounting the full page.
 */

import type { BadgeVariant } from '@/components/dashboard/primitives/Badge'
import { formatIndiaDateInput } from '@/lib/india-date'

export interface ConversationItem {
  id: string
  other_user?: {
    id: string
    full_name?: string | null
    role?: string
    avatar_url?: string | null
  } | null
  last_message?: {
    content?: string | null
    sender_id?: string | null
  } | null
  last_message_at?: string | null
  created_at: string
  updated_at?: string | null
  unread_count: number
}

export interface MessageItem {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
  read_at?: string | null
}

/** Returns initials (up to 2 chars) from a full name. */
export function nameInitials(fullName: string | null | undefined): string {
  if (!fullName) return '?'
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

/** Badge variant for unread count chip (always soft tone 2 for patient). */
export function unreadBadgeVariant(count: number): BadgeVariant {
  if (count === 0) return 'soft'
  if (count >= 5) return 'warning'
  return 'success'
}

/**
 * Groups messages by IST calendar day (YYYY-MM-DD).
 * Returns an ordered array of { dayKey, label, messages }.
 */
export function groupMessagesByDay(
  messages: MessageItem[],
  nowIso?: string,
): Array<{ dayKey: string; label: string; messages: MessageItem[] }> {
  if (messages.length === 0) return []

  const now = nowIso ? new Date(nowIso) : new Date()
  const todayKey = formatIndiaDateInput(now)
  const yesterdayKey = formatIndiaDateInput(new Date(now.getTime() - 86_400_000))

  const buckets = new Map<string, MessageItem[]>()
  for (const msg of messages) {
    const dayKey = formatIndiaDateInput(msg.created_at)
    const bucket = buckets.get(dayKey)
    if (bucket) {
      bucket.push(msg)
    } else {
      buckets.set(dayKey, [msg])
    }
  }

  const result: Array<{ dayKey: string; label: string; messages: MessageItem[] }> = []
  for (const [dayKey, msgs] of buckets) {
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
    result.push({ dayKey, label, messages: msgs })
  }
  return result
}

/**
 * Returns a short time string (e.g. "10:42 AM") for a message timestamp in IST.
 */
export function formatMessageTime(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(iso))
}

/**
 * Returns the display label for the last-message preview, truncated to 60 chars.
 */
export function lastMessagePreview(content: string | null | undefined): string {
  if (!content) return 'No messages yet'
  return content.length > 60 ? content.slice(0, 57) + '…' : content
}

/**
 * Returns the sort key for conversations (newest-last-message first).
 */
export function conversationSortKey(c: ConversationItem): number {
  const ts = c.last_message_at ?? c.created_at
  return -new Date(ts).getTime()
}
