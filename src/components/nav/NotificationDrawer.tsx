'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Bell,
  Calendar,
  CreditCard,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Badge } from '@/components/dashboard/primitives/Badge'
import {
  formatRelativeTime,
  groupNotificationsByDay,
  notificationTypeLabel,
  type NotificationItem,
} from '@/app/patient/notifications/notifications-v2-utils'
import { cn } from '@/lib/utils'

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

export function NotificationDrawer() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: profile } = useQuery({
    queryKey: ['navbar-profile'],
    queryFn: async () => {
      const res = await fetch('/api/profile')
      if (!res.ok) return null
      return res.json() as Promise<{ role?: string }>
    },
    enabled: Boolean(user),
    staleTime: 60_000,
  })

  const role = profile?.role
  const show =
    user &&
    (role === 'patient' || role === 'provider')

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', 'drawer'],
    queryFn: fetchNotifications,
    enabled: Boolean(show),
    staleTime: 30_000,
  })

  const markAllMutation = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'drawer'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const markOneMutation = useMutation({
    mutationFn: markOneRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'drawer'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  useEffect(() => {
    if (!open) return
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [open])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!show) return null

  const notifications = data?.notifications ?? []
  const unread = notifications.filter((n) => !n.read).length
  const groups = groupNotificationsByDay(notifications)
  const allHref = role === 'provider' ? '/provider/notifications' : '/patient/notifications'

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-600 shadow-sm transition-colors hover:border-[#00766C]/30 hover:text-[#00766C]"
        aria-label="Notifications"
        data-testid="notification-drawer-trigger"
      >
        <Bell size={18} aria-hidden />
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[199] bg-black/30"
            aria-label="Close notifications"
            data-testid="notification-drawer-backdrop"
            onClick={() => setOpen(false)}
          />
          <aside
            className={cn(
              'fixed right-0 top-0 z-[200] flex h-full w-full max-w-sm flex-col bg-white shadow-2xl',
              'transition-transform duration-300 ease-out translate-x-0',
            )}
            role="dialog"
            aria-modal="true"
            aria-label="Notifications"
            data-testid="notification-drawer"
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Notifications
                </p>
                <p className="text-[15px] font-semibold text-slate-900">
                  {unread > 0 ? `${unread} unread` : 'All caught up'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => markAllMutation.mutate()}
                disabled={unread === 0 || markAllMutation.isPending}
                className="text-[12px] font-semibold text-[#00766C] hover:text-[#005A52] disabled:opacity-40"
                data-testid="notification-mark-all"
              >
                Mark all read
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
              {isLoading ? (
                <p className="px-2 py-8 text-center text-[13px] text-slate-500">Loading…</p>
              ) : groups.length === 0 ? (
                <p className="px-2 py-8 text-center text-[13px] text-slate-500">
                  No notifications yet.
                </p>
              ) : (
                groups.map((g) => (
                  <div key={g.dayKey} className="mb-6">
                    <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {g.label}
                    </p>
                    <ul className="space-y-2">
                      {g.items.map((n) => {
                        const Icon = TYPE_ICON[n.type] ?? Bell
                        return (
                          <li key={n.id}>
                            <button
                              type="button"
                              onClick={() => {
                                if (!n.read) markOneMutation.mutate(n.id)
                              }}
                              className={cn(
                                'flex w-full gap-3 rounded-xl border px-3 py-3 text-left transition-colors',
                                n.read
                                  ? 'border-slate-100 bg-slate-50/50'
                                  : 'border-[#00766C]/20 bg-[#E6F4F3]/40',
                              )}
                            >
                              <div
                                className={cn(
                                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#00766C] shadow-sm',
                                )}
                              >
                                <Icon size={16} aria-hidden />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-[13px] font-semibold text-slate-900 line-clamp-2">
                                    {n.title}
                                  </p>
                                  {!n.read ? (
                                    <span
                                      className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#00766C]"
                                      aria-hidden
                                    />
                                  ) : null}
                                </div>
                                <p className="mt-0.5 text-[12px] text-slate-500 line-clamp-2">
                                  {n.body}
                                </p>
                                <div className="mt-1 flex items-center gap-2">
                                  <Badge role={role === 'provider' ? 'provider' : 'patient'} variant="soft" tone={2}>
                                    {notificationTypeLabel(n.type)}
                                  </Badge>
                                  <span className="text-[11px] text-slate-400">
                                    {formatRelativeTime(n.created_at)}
                                  </span>
                                </div>
                              </div>
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-slate-100 px-4 py-3">
              <Link
                href={allHref}
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center rounded-full border border-slate-200 py-2.5 text-[13px] font-semibold text-[#00766C] hover:bg-[#E6F4F3]/60"
              >
                View all
              </Link>
            </div>
          </aside>
        </>
      ) : null}
    </>
  )
}
