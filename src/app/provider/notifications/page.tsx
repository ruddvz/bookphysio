"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Bell,
  CheckCheck,
  ShieldCheck,
  Calendar,
  CreditCard,
  MessageSquare,
  AlertCircle,
  Loader2,
  type LucideIcon,
  UserPlus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  PageHeader,
  SectionCard,
  ListRow,
  EmptyState,
  type TileTone,
} from '@/components/dashboard/primitives'

interface Notification {
  id: string
  type: string
  title: string
  body: string
  read: boolean
  created_at: string
}

const TYPE_ICON_MAP: Record<string, LucideIcon> = {
  appointment_confirmed: Calendar,
  appointment_cancelled: AlertCircle,
  new_appointment: UserPlus,
  payment_received: CreditCard,
  payment_success: CreditCard,
  new_message: MessageSquare,
  new_review: ShieldCheck,
  account_verified: ShieldCheck,
}

const TYPE_TONE_MAP: Record<string, TileTone> = {
  appointment_confirmed: 1,
  appointment_cancelled: 2,
  new_appointment: 1,
  payment_received: 3,
  payment_success: 3,
  new_message: 4,
  new_review: 1,
  account_verified: 1,
}

function formatRelativeTime(dateString: string) {
  const diffMs = new Date(dateString).getTime() - Date.now()
  const absSeconds = Math.abs(diffMs) / 1000
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

  if (absSeconds < 60) return rtf.format(Math.round(diffMs / 1000), 'second')
  if (absSeconds < 3600) return rtf.format(Math.round(diffMs / 60000), 'minute')
  if (absSeconds < 86400) return rtf.format(Math.round(diffMs / 3_600_000), 'hour')
  if (absSeconds < 2_592_000) return rtf.format(Math.round(diffMs / 86_400_000), 'day')
  return rtf.format(Math.round(diffMs / 2_592_000_000), 'month')
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

export default function ProviderNotifications() {
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
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
        role="provider"
        kicker="PRACTICE STREAM"
        title="Notifications"
        subtitle={unreadCount > 0 ? `Currently monitoring ${unreadCount} pending practice events.` : "Practice telemetry healthy."}
        action={unreadCount > 0 ? {
          label: markAllMutation.isPending ? 'Resolving...' : 'Resolve All',
          icon: markAllMutation.isPending ? Loader2 : CheckCheck,
          onClick: () => markAllMutation.mutate(),
          disabled: markAllMutation.isPending
        } : undefined}
      />

      <SectionCard role="provider" title="Active Events">
        {isLoading ? (
          <div className="space-y-4 py-8">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-16 w-full bg-slate-50 animate-pulse rounded-xl" />)}
          </div>
        ) : isError ? (
          <EmptyState
            role="provider"
            icon={AlertCircle}
            title="Telemetry sync error"
            description="We couldn't synchronize with the practice stream."
          />
        ) : notifications.length === 0 ? (
          <EmptyState
            role="provider"
            icon={Bell}
            title="Stream is quiet"
            description="No active events detected in your practice stream."
          />
        ) : (
          <div className="divide-y divide-slate-100/50">
            {notifications.map((n) => (
              <ListRow
                key={n.id}
                role="provider"
                icon={TYPE_ICON_MAP[n.type] || Bell}
                tone={TYPE_TONE_MAP[n.type] || 1}
                primary={n.title}
                secondary={n.body}
                right={
                  <div className="flex items-center gap-4">
                     <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{formatRelativeTime(n.created_at)}</span>
                     {!n.read && <div className="w-2 h-2 rounded-full bg-[var(--color-pv-primary)]" />}
                  </div>
                }
                onClick={() => !n.read && markOneMutation.mutate(n.id)}
                className={cn(!n.read && "bg-slate-50/50")}
              />
            ))}
          </div>
        )}
      </SectionCard>

      <div className="text-center pt-10">
         <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] italic">
            Verified Practice Stream &bull; Clinical Encryption Active
         </p>
      </div>
    </div>
  )
}
