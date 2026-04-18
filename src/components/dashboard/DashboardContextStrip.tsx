'use client'

import { Activity, CalendarCheck2, ShieldCheck, type LucideIcon } from 'lucide-react'
import { Badge } from '@/components/dashboard/primitives/Badge'
import type { NavRole } from '@/components/dashboard/TopPillNav'

export interface DashboardContextStripProps {
  role: NavRole
  now?: Date
  className?: string
}

interface RoleCopy {
  icon: LucideIcon
  eyebrow: string
  headline: (weekday: string) => string
  tip: string
  status: string
}

const COPY: Record<NavRole, RoleCopy> = {
  patient: {
    icon: CalendarCheck2,
    eyebrow: 'Your care',
    headline: (weekday) => `${weekday} snapshot`,
    tip: 'Complete your pre-visit form 24 hours before your session.',
    status: 'On track',
  },
  provider: {
    icon: Activity,
    eyebrow: 'Practice pulse',
    headline: (weekday) => `${weekday} rundown`,
    tip: 'Tap AI to auto-draft visit notes from the last session.',
    status: 'All set',
  },
  admin: {
    icon: ShieldCheck,
    eyebrow: 'Ops console',
    headline: (weekday) => `${weekday} review`,
    tip: 'Approvals auto-refresh every 60 seconds.',
    status: 'Live',
  },
}

function formatIndiaDate(date: Date): { weekday: string; full: string } {
  const weekday = date.toLocaleDateString('en-IN', {
    weekday: 'long',
    timeZone: 'Asia/Kolkata',
  })
  const full = date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  })
  return { weekday, full }
}

export function DashboardContextStrip({
  role,
  now,
  className,
}: DashboardContextStripProps) {
  const copy = COPY[role]
  const Icon = copy.icon
  const { weekday, full } = formatIndiaDate(now ?? new Date())

  return (
    <section
      data-testid="dashboard-context-strip"
      aria-label={`${copy.eyebrow} strip`}
      className={`flex flex-wrap items-center gap-3 rounded-full border border-slate-200/80 bg-white/90 px-3 py-2 shadow-sm backdrop-blur sm:px-4 ${className ?? ''}`}
    >
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-600">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="sr-only text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
          {copy.eyebrow} · {full}
        </span>
        <span className="truncate text-[13px] font-semibold text-slate-800">
          {copy.headline(weekday)}
        </span>
      </div>

      <span className="sr-only max-w-sm truncate text-[12px] text-slate-500 md:inline">
        {copy.tip}
      </span>

      <Badge role={role} variant="success" className="shrink-0">
        {copy.status}
      </Badge>
    </section>
  )
}
