'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  MessageSquare,
  PieChart,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type AdminStat = {
  title: string
  value: string
  icon: LucideIcon
  tone: 'teal' | 'emerald' | 'amber' | 'slate'
  caption: string
}

const REVENUE_BARS = [
  { heightClass: 'h-[38%]' },
  { heightClass: 'h-[54%]' },
  { heightClass: 'h-[44%]' },
  { heightClass: 'h-[72%]' },
  { heightClass: 'h-[64%]' },
  { heightClass: 'h-[88%]' },
  { heightClass: 'h-[76%]' },
]

const queuePreview = [
  {
    label: 'Provider approval',
    title: 'Dr. Arun K.',
    detail: 'ICP documents uploaded · Mumbai · Sports Physiotherapy',
    status: 'Pending review',
    icon: UserPlus,
  },
  {
    label: 'Support queue',
    title: 'Patient billing query',
    detail: 'Refund clarification requested through the app',
    status: 'Waiting 12m',
    icon: MessageSquare,
  },
  {
    label: 'Quality review',
    title: 'Search ranking signal',
    detail: 'Bangalore sports specialists trending above baseline',
    status: 'Healthy',
    icon: Activity,
  },
]

const flowPreview = [
  {
    title: 'Live bookings',
    value: '324',
    detail: 'Confirmed sessions this week',
    tone: 'teal' as const,
    icon: CalendarCheck,
  },
  {
    title: 'Platform trust',
    value: '98.4%',
    detail: 'Verified providers with active availability',
    tone: 'emerald' as const,
    icon: ShieldCheck,
  },
  {
    title: 'Pending approvals',
    value: '18',
    detail: 'Profiles waiting on review',
    tone: 'amber' as const,
    icon: Clock,
  },
]

export default function AdminDashboardHome() {
  const [stats, setStats] = useState({
    activeProviders: 0,
    pendingApprovals: 0,
    totalPatients: 0,
    gmvMtd: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setStats(data)
      })
      .finally(() => setLoading(false))
  }, [])

  const gmvLakhs = (stats.gmvMtd / 100000).toFixed(1)

  const kpis: AdminStat[] = [
    {
      title: 'Active Providers',
      value: stats.activeProviders.toLocaleString('en-IN'),
      icon: Users,
      tone: 'teal',
      caption: 'Verified physiotherapists currently live',
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals.toLocaleString('en-IN'),
      icon: UserPlus,
      tone: 'amber',
      caption: 'Profiles waiting on compliance review',
    },
    {
      title: 'Total Patients',
      value: stats.totalPatients.toLocaleString('en-IN'),
      icon: CalendarCheck,
      tone: 'slate',
      caption: 'Patients active across the platform',
    },
    {
      title: 'GMV (MTD)',
      value: `₹${gmvLakhs}L`,
      icon: TrendingUp,
      tone: 'emerald',
      caption: 'Month-to-date platform gross volume',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[460px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#00766C]" />
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-6 py-10 md:px-10 md:py-12 animate-in fade-in duration-500">
      <section className="overflow-hidden rounded-[40px] border border-gray-100 bg-white shadow-[0_28px_80px_-40px_rgba(0,0,0,0.22)]">
        <div className="grid gap-6 p-6 md:p-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-gray-400">
              <span className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-[#E6F4F3] px-3 py-1 text-[#00766C]">
                <Sparkles size={12} />
                Platform command center
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-gray-100 bg-gray-50 px-3 py-1 text-[#333333]">
                <BarChart3 size={12} />
                Live ops
              </span>
            </div>

            <div className="space-y-3">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#00766C]">BookPhysio administration</p>
              <h1 className="max-w-3xl text-[34px] font-black leading-[0.95] tracking-tight text-[#333333] md:text-[54px]">
                Control the platform without the clutter.
              </h1>
              <p className="max-w-2xl text-[15px] font-medium leading-relaxed text-[#666666] md:text-[17px]">
                A premium operator dashboard for approvals, growth, and trust signals. It is designed to feel like a live product, not a placeholder admin screen.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/admin/listings" className="inline-flex items-center gap-3 rounded-[24px] bg-[#333333] px-6 py-3.5 text-[14px] font-black text-white shadow-xl shadow-gray-200 transition-all hover:-translate-y-0.5 hover:bg-[#00766C]">
                Open approvals
                <ArrowUpRight size={16} strokeWidth={3} />
              </Link>
              <Link href="/admin/analytics" className="inline-flex items-center gap-3 rounded-[24px] border border-gray-100 bg-white px-6 py-3.5 text-[14px] font-black text-[#333333] shadow-sm transition-all hover:border-teal-100 hover:text-[#00766C]">
                Review analytics
                <ArrowUpRight size={16} strokeWidth={3} />
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {flowPreview.map((card) => {
              const CardIcon = card.icon

              return (
                <div key={card.title} className="rounded-[28px] border border-gray-100 bg-[#fafbfc] p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E6F4F3] text-[#00766C]">
                      <CardIcon size={20} strokeWidth={2.5} />
                    </div>
                    <div className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-emerald-700">
                      Live
                    </div>
                  </div>
                  <p className="mt-4 text-[11px] font-black uppercase tracking-widest text-gray-400">{card.title}</p>
                  <p className="mt-1 text-[18px] font-black tracking-tight text-[#333333]">{card.value}</p>
                  <p className="mt-2 text-[12px] font-medium leading-relaxed text-[#888888]">{card.detail}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const toneStyles = {
            teal: 'bg-teal-50 text-[#00766C]',
            emerald: 'bg-emerald-50 text-emerald-600',
            amber: 'bg-amber-50 text-amber-600',
            slate: 'bg-slate-50 text-slate-700',
          }[kpi.tone]
          const KpiIcon = kpi.icon

          return (
            <div
              key={kpi.title}
              className="group rounded-[30px] border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-100 hover:shadow-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl', toneStyles)}>
                  <KpiIcon size={22} strokeWidth={2.5} />
                </div>
                <div className="rounded-full border border-gray-100 bg-gray-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-gray-400">
                  Live
                </div>
              </div>
              <p className="mt-4 text-[11px] font-black uppercase tracking-widest text-gray-400">{kpi.title}</p>
              <p className="mt-1 text-[32px] font-black tracking-tight text-[#333333]">{kpi.value}</p>
              <p className="mt-2 text-[12px] font-medium leading-relaxed text-[#888888]">{kpi.caption}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[36px] border border-gray-100 bg-white p-6 shadow-[0_28px_80px_-44px_rgba(0,0,0,0.2)] md:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-[20px] font-black tracking-tight text-[#333333]">Revenue pulse</h2>
              <p className="mt-1 text-[12px] font-black uppercase tracking-[0.22em] text-gray-400">Platform volume by week</p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-gray-100 bg-gray-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
              <Clock size={12} />
              Updated now
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-7">
            {REVENUE_BARS.map((bar, index) => (
              <div key={index} className="flex flex-col gap-3">
                <div className="flex h-[240px] items-end rounded-[26px] border border-gray-100 bg-[linear-gradient(180deg,_#fafbfc,_white)] p-3 shadow-inner">
                  <div
                    className={cn('w-full rounded-[18px] bg-[linear-gradient(180deg,_#00766C,_#56c2b8)] shadow-[0_20px_40px_-18px_rgba(0,118,108,0.55)]', bar.heightClass)}
                  />
                </div>
                <p className="text-center text-[11px] font-black uppercase tracking-widest text-gray-400">W{index + 1}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {[
              { label: 'Bookings', value: '12.4k', detail: 'Across all cities' },
              { label: 'Conversion', value: '18.2%', detail: 'Search to booking' },
              { label: 'Retention', value: '74%', detail: 'Returning patients' },
            ].map((item) => (
              <div key={item.label} className="rounded-[24px] border border-gray-100 bg-[#fafbfc] p-4">
                <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">{item.label}</p>
                <p className="mt-1 text-[24px] font-black tracking-tight text-[#333333]">{item.value}</p>
                <p className="mt-1 text-[12px] font-medium text-[#888888]">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[36px] border border-gray-100 bg-[#333333] p-6 text-white shadow-[0_28px_80px_-44px_rgba(0,0,0,0.35)] md:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/40">Approval cockpit</p>
              <h2 className="mt-1 text-[20px] font-black tracking-tight">Queue at a glance</h2>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white/60">
              18 pending
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {queuePreview.map((item) => {
              const QueueIcon = item.icon

              return (
                <div key={item.title} className="rounded-[26px] border border-white/10 bg-white/5 p-4 transition-all hover:bg-white/10">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#00766C]">
                      <QueueIcon size={20} strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/40">{item.label}</p>
                      <h3 className="mt-2 text-[15px] font-black tracking-tight text-white">{item.title}</h3>
                      <p className="mt-1 text-[13px] leading-relaxed text-white/65">{item.detail}</p>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/60">
                      {item.status}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-white/40">
                <MapPin size={12} />
                Regional density
              </div>
              <p className="mt-3 text-[24px] font-black tracking-tight text-white">NCR leading</p>
              <p className="mt-1 text-[12px] font-medium leading-relaxed text-white/65">The demo heat map and specialty demand will live here.</p>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-white/40">
                <PieChart size={12} />
                Funnel health
              </div>
              <p className="mt-3 text-[24px] font-black tracking-tight text-white">98.4%</p>
              <p className="mt-1 text-[12px] font-medium leading-relaxed text-white/65">High-quality verified provider profiles and fast matching.</p>
            </div>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[
          {
            title: 'Patients',
            value: stats.totalPatients.toLocaleString('en-IN'),
            detail: 'Active patients across the product',
            icon: Users,
          },
          {
            title: 'Providers',
            value: stats.activeProviders.toLocaleString('en-IN'),
            detail: 'Live physiotherapists on the platform',
            icon: ShieldCheck,
          },
          {
            title: 'Support health',
            value: 'Warm',
            detail: 'A calm, responsive ops workflow',
            icon: CheckCircle2,
          },
        ].map((card) => {
          const CardIcon = card.icon

          return (
            <div key={card.title} className="rounded-[30px] border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E6F4F3] text-[#00766C]">
                  <CardIcon size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">{card.title}</p>
                  <h3 className="text-[24px] font-black tracking-tight text-[#333333]">{card.value}</h3>
                </div>
              </div>
              <p className="mt-3 text-[13px] font-medium text-[#888888]">{card.detail}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}