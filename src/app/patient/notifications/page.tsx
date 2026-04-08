'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, CheckCheck, Clock, ShieldCheck, Calendar, CreditCard, MessageSquare, AlertCircle, type LucideIcon } from 'lucide-react'
import {
  PageHeader,
  SectionCard,
  ListRow,
  EmptyState,
} from '@/components/dashboard/primitives'

interface Notification {
  id: string
  type: string
  title: string
  body: string
  read: boolean
  created_at: string
}

const TYPE_ICON: Record<string, LucideIcon> = {
  appointment_confirmed: Calendar,
  appointment_cancelled: AlertCircle,
  payment_success: CreditCard,
  new_message: MessageSquare,
  account_verified: ShieldCheck,
}

const RELATIVE_TIME_FORMATTER = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

function formatRelativeTime(dateString: string) {
  const diffMs = new Date(dateString).getTime() - Date.now()
  const absSeconds = Math.abs(diffMs) / 1000

  if (absSeconds < 60) return RELATIVE_TIME_FORMATTER.format(Math.round(diffMs / 1000), 'second')
  if (absSeconds < 3600) return RELATIVE_TIME_FORMATTER.format(Math.round(diffMs / 60000), 'minute')
  if (absSeconds < 86400) return RELATIVE_TIME_FORMATTER.format(Math.round(diffMs / 3_600_000), 'hour')
  if (absSeconds < 2_592_000) return RELATIVE_TIME_FORMATTER.format(Math.round(diffMs / 86_400_000), 'day')
  if (absSeconds < 31_536_000) return RELATIVE_TIME_FORMATTER.format(Math.round(diffMs / 2_592_000_000), 'month')
  return RELATIVE_TIME_FORMATTER.format(Math.round(diffMs / 31_536_000_000), 'year')
}

async function fetchNotifications(): Promise<{ notifications: Notification[] }> {
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

export default function PatientNotifications() {
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

  const notifications = data?.notifications ?? []
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8">
      <PageHeader
        role="patient"
        kicker="UPDATES"
        title="Notifications"
        subtitle={unreadCount > 0 ? `You have ${unreadCount} unread updates` : "You're all caught up"}
        action={unreadCount > 0 ? {
          label: 'Mark all read',
          onClick: () => markAllMutation.mutate(),
          icon: CheckCheck
        } : undefined}
      />

      <SectionCard role="patient" title="Recent activity">
        {isLoading ? (
          <div className="space-y-4 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 w-full animate-pulse bg-slate-50 rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            role="patient"
            icon={AlertCircle}
            title="Couldn't load updates"
            description="There was an error fetching your notifications."
            cta={{ label: 'Retry', onClick: refetch }}
          />
        ) : notifications.length === 0 ? (
          <EmptyState
            role="patient"
            icon={Bell}
            title="All caught up!"
            description="Your notifications will appear here when there are updates to your care."
          />
        ) : (
          <div className="divide-y divide-[var(--color-pt-border-soft)]">
            {notifications.map((n) => (
              <ListRow
                key={n.id}
                role="patient"
                icon={TYPE_ICON[n.type] || Bell}
                tone={n.read ? 1 : 1}
                primary={n.title}
                secondary={n.body}
                className={!n.read ? "bg-[var(--color-pt-tile-1-bg)]/20 cursor-pointer" : ""}
                right={
                   <div className="flex flex-col items-end gap-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Clock size={10} />
                        {formatRelativeTime(n.created_at)}
                      </span>
                      {!n.read && (
                         <div className="w-2 h-2 rounded-full bg-[var(--color-pt-primary)]" />
                      )}
                   </div>
                }
                onClick={() => !n.read && markOneMutation.mutate(n.id)}
              />
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  )
}

