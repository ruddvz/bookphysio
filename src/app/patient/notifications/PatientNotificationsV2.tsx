'use client'

/**
 * v2 overlay for the patient notifications page.
 * Self-gates via useUiV2() — returns null when v2 is off so the existing
 * v1 page renders byte-identically.
 *
 * v2 additions:
 *   - Day-grouped sections (Today / Yesterday / <date>)
 *   - Per-notification type Badge chip (Confirmed / Cancelled / Payment / etc.)
 *   - Unread count Badge in header with "Mark all read" action
 *   - Richer empty-state with illustration
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Bell,
  CheckCheck,
  Clock,
  ShieldCheck,
  Calendar,
  CreditCard,
  MessageSquare,
  AlertCircle,
  BellOff,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUiV2 } from '@/hooks/useUiV2'
import { Badge } from '@/components/dashboard/primitives/Badge'
import {
  notificationBadgeVariant,
  notificationTypeLabel,
  groupNotificationsByDay,
  formatRelativeTime,
  type NotificationItem,
} from './notifications-v2-utils'

const TYPE_ICON: Record<string, LucideIcon> = {
  appointment_confirmed: Calendar,
  appointment_cancelled: AlertCircle,
  payment_success: CreditCard,
  new_message: MessageSquare,
  account_verified: ShieldCheck,
}

async function fetchNotifications(): Promise<{ notifications: NotificationItem[] }> {
  const res = await fetch('/api/notifications')
  if (!res.ok) throw new Error('Failed to load notifications')
  return res.json()
}

async function markAllRead() {
  const res = await fetch('/api/notifications', { method: 'PATCH' })
  if (!res.ok) throw new Error('Failed to mark all as read')
  return res.json()
}

async function markOneRead(id: string) {
  const res = await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' })
  if (!res.ok) throw new Error('Failed to mark as read')
  return res.json()
}

function EmptyNotifications() {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
      data-testid="v2-empty-notifications"
    >
      <div
        className="w-16 h-16 rounded-[var(--sq-lg)] bg-[var(--color-pt-tile-1-bg)] flex items-center justify-center mb-4"
        aria-hidden="true"
      >
        <BellOff className="w-8 h-8 text-[var(--color-pt-primary)]" />
      </div>
      <p className="text-[15px] font-semibold text-slate-800 mb-1">All caught up!</p>
      <p className="text-[13px] text-slate-500 max-w-[220px]">
        Your notifications will appear here when there are updates to your care.
      </p>
    </div>
  )
}

export function PatientNotificationsV2() {
  const isV2 = useUiV2()
  const queryClient = useQueryClient()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  })

  const markAllMutation = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const markOneMutation = useMutation({
    mutationFn: markOneRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  if (!isV2) return null

  const notifications = data?.notifications ?? []
  const unreadCount = notifications.filter(n => !n.read).length
  const dayGroups = groupNotificationsByDay(notifications)

  return (
    <div
      className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6"
      data-ui-version="v2"
      data-testid="v2-notifications-root"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-pt-primary)] mb-1">
            UPDATES
          </p>
          <h1 className="text-[22px] font-bold text-slate-900 leading-none">Notifications</h1>
          <p className="text-[13px] text-slate-500 mt-1">
            {unreadCount > 0
              ? `You have ${unreadCount} unread update${unreadCount > 1 ? 's' : ''}`
              : "You're all caught up"}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 mt-1">
          {unreadCount > 0 && (
            <Badge
              role="patient"
              variant="success"
              aria-label={`${unreadCount} unread notifications`}
              data-testid="v2-unread-count-badge"
            >
              {unreadCount} unread
            </Badge>
          )}
          {unreadCount > 0 && (
            <button
              onClick={() => markAllMutation.mutate()}
              disabled={markAllMutation.isPending}
              aria-label="Mark all notifications as read"
              data-testid="v2-mark-all-read-btn"
              className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--color-pt-primary)] hover:opacity-80 disabled:opacity-50 transition-opacity"
            >
              <CheckCheck size={14} aria-hidden="true" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      {isLoading ? (
        <div className="space-y-3 py-4" aria-busy="true" aria-label="Loading notifications">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 w-full animate-pulse bg-slate-100 rounded-[var(--sq-sm)]"
              aria-hidden="true"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="py-8 text-center">
          <button
            className="text-[13px] text-rose-600 hover:underline"
            onClick={() => void refetch()}
          >
            <AlertCircle className="inline w-4 h-4 mr-1" aria-hidden="true" />
            Couldn&apos;t load notifications — retry
          </button>
        </div>
      ) : notifications.length === 0 ? (
        <EmptyNotifications />
      ) : (
        <div className="space-y-6" data-testid="v2-notification-groups">
          {dayGroups.map(({ dayKey, label, items }) => (
            <div key={dayKey} data-testid={`v2-day-group-${dayKey}`}>
              {/* Day label */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  {label}
                </span>
                <span className="flex-1 border-t border-slate-200" aria-hidden="true" />
              </div>

              {/* Notification rows */}
              <div
                className="bg-white border border-[var(--color-pt-border)] rounded-[var(--sq-lg)] divide-y divide-[var(--color-pt-border-soft)] overflow-hidden"
                role="list"
                aria-label={`${label} notifications`}
              >
                {items.map((n) => {
                  const Icon = TYPE_ICON[n.type] ?? Bell
                  const badgeVariant = notificationBadgeVariant(n.type, n.read)
                  const typeLabel = notificationTypeLabel(n.type)

                  return (
                    <button
                      key={n.id}
                      role="listitem"
                      onClick={() => !n.read && markOneMutation.mutate(n.id)}
                      aria-label={`${n.title}${!n.read ? ' — unread' : ''}`}
                      className={cn(
                        'w-full text-left flex items-start gap-4 px-5 py-4 transition-colors',
                        !n.read
                          ? 'bg-[var(--color-pt-tile-1-bg)]/30 hover:bg-[var(--color-pt-tile-1-bg)]/60 cursor-pointer'
                          : 'hover:bg-slate-50 cursor-default'
                      )}
                      data-testid={`v2-notification-row-${n.id}`}
                    >
                      {/* Icon */}
                      <div
                        className={cn(
                          'w-9 h-9 rounded-[var(--sq-sm)] flex items-center justify-center shrink-0 mt-0.5',
                          !n.read
                            ? 'bg-[var(--color-pt-tile-1-bg)] text-[var(--color-pt-primary)]'
                            : 'bg-slate-100 text-slate-400'
                        )}
                        aria-hidden="true"
                      >
                        <Icon size={17} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span
                            className={cn(
                              'text-[13px] font-semibold truncate',
                              !n.read ? 'text-slate-900' : 'text-slate-700'
                            )}
                          >
                            {n.title}
                          </span>
                          <Badge
                            role="patient"
                            variant={badgeVariant}
                            data-testid={`v2-notification-badge-${n.id}`}
                          >
                            {typeLabel}
                          </Badge>
                        </div>
                        <p className="text-[12px] text-slate-500 line-clamp-2">{n.body}</p>
                      </div>

                      {/* Time + unread dot */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock size={10} aria-hidden="true" />
                          {formatRelativeTime(n.created_at)}
                        </span>
                        {!n.read && (
                          <span
                            className="w-2 h-2 rounded-full bg-[var(--color-pt-primary)]"
                            aria-label="Unread"
                            data-testid={`v2-unread-dot-${n.id}`}
                          />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
