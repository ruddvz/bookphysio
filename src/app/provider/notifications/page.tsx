'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, CheckCheck, Clock, ShieldCheck, Calendar, CreditCard, MessageSquare, AlertCircle, Loader2, UserPlus } from 'lucide-react'

interface Notification {
  id: string
  type: string
  title: string
  body: string
  read: boolean
  created_at: string
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  appointment_confirmed: <Calendar className="w-5 h-5 text-bp-accent" />,
  appointment_cancelled: <AlertCircle className="w-5 h-5 text-[#EF4444]" />,
  new_appointment: <UserPlus className="w-5 h-5 text-bp-accent" />,
  payment_received: <CreditCard className="w-5 h-5 text-[#2563EB]" />,
  payment_success: <CreditCard className="w-5 h-5 text-[#2563EB]" />,
  new_message: <MessageSquare className="w-5 h-5 text-[#7C3AED]" />,
  new_review: <ShieldCheck className="w-5 h-5 text-[#22C55E]" />,
  account_verified: <ShieldCheck className="w-5 h-5 text-[#22C55E]" />,
}

const TYPE_BG: Record<string, string> = {
  appointment_confirmed: 'bg-bp-accent/10',
  appointment_cancelled: 'bg-[#FEF2F2]',
  new_appointment: 'bg-bp-accent/10',
  payment_received: 'bg-[#EFF6FF]',
  payment_success: 'bg-[#EFF6FF]',
  new_message: 'bg-[#F5F3FF]',
  new_review: 'bg-[#DCFCE7]',
  account_verified: 'bg-[#DCFCE7]',
}

function getIcon(type: string) {
  return TYPE_ICON[type] ?? <Bell className="w-5 h-5 text-[#9CA3AF]" />
}

function getIconBg(type: string) {
  return TYPE_BG[type] ?? 'bg-[#F3F4F6]'
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
    <div className="max-w-[800px] mx-auto px-6 py-12 animate-in fade-in duration-500 delay-100 fill-mode-both">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[32px] font-bold text-bp-primary tracking-tight">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-[14px] text-bp-body mt-1">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
            className="flex items-center gap-2 text-[14px] font-semibold text-bp-accent hover:text-bp-primary cursor-pointer bg-transparent border-none outline-none transition-colors disabled:opacity-50"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-bp-accent" />
        </div>
      )}

      {isError && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Bell className="w-7 h-7 text-slate-400" />
          </div>
          <p className="text-[15px] font-medium text-slate-900 mb-1">No notifications yet</p>
          <p className="text-[13px] text-slate-400">When you get notifications, they will appear here.</p>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="flex flex-col gap-3">
          {notifications.length === 0 ? (
            <div className="bg-white rounded-[12px] border border-bp-border shadow-sm p-10 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#F3F4F6] flex items-center justify-center mb-4">
                <Bell className="w-7 h-7 text-[#9CA3AF]" />
              </div>
              <p className="text-[15px] font-medium text-bp-primary mb-1">You&apos;re all caught up</p>
              <p className="text-[13px] text-[#9CA3AF]">No notifications yet.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.read && markOneMutation.mutate(n.id)}
                className={`rounded-[12px] border shadow-sm p-5 flex gap-4 items-start transition-colors ${
                  n.read
                    ? 'bg-white border-bp-border'
                    : 'bg-[#FAFFFE] border-[#B2DFDB] cursor-pointer hover:border-bp-accent'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getIconBg(n.type)}`}>
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`text-[15px] font-semibold ${n.read ? 'text-bp-body' : 'text-bp-primary'}`}>
                      {n.title}
                    </h3>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-bp-accent shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-[13px] text-bp-body mt-0.5">{n.body}</p>
                  <span className="flex items-center gap-1 text-[12px] text-[#9CA3AF] mt-2">
                    <Clock className="w-3 h-3" />
                    {formatRelativeTime(n.created_at)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
