"use client"

import { useState } from 'react'
import { ArrowUpRight, CheckCircle, Clock, Eye, FileCheck, ShieldCheck, Sparkles, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const summaryCards = [
  { title: 'Pending', value: '342', detail: 'New provider submissions', icon: Clock },
  { title: 'Approved today', value: '28', detail: 'Validated and live', icon: CheckCircle },
  { title: 'Review SLA', value: '2.4h', detail: 'Average turnaround time', icon: ShieldCheck },
]

export default function AdminListings() {
  const [reviewState, setReviewState] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  function focusReviewRow() {
    document.getElementById('provider-review-row')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setActionMessage('Focused the next provider submission in the review queue.')
  }

  function exportQueue() {
    const csv = ['Provider,ICP,City,Status', `Dr. Arun K,ICP-MH-12345,Mumbai,${reviewState}`].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const downloadUrl = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = downloadUrl
    anchor.download = 'provider-review-queue.csv'
    anchor.click()
    URL.revokeObjectURL(downloadUrl)
    setActionMessage('Provider queue exported for ops review.')
  }

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-6 py-10 md:px-10 md:py-12 animate-in fade-in duration-500">
      <section className="overflow-hidden rounded-[36px] border border-bp-border bg-white shadow-[0_28px_80px_-40px_rgba(0,0,0,0.2)]">
        <div className="grid gap-6 p-6 md:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-bp-body/40">
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-amber-700">
                <Sparkles size={12} />
                Provider review queue
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-bp-border bg-bp-surface px-3 py-1 text-bp-primary">
                <FileCheck size={12} />
                ICP checks
              </span>
            </div>

            <div className="space-y-3">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-bp-accent">Admin console</p>
              <h1 className="max-w-3xl text-[34px] font-black leading-[0.95] tracking-tight text-bp-primary md:text-[54px]">Approvals should feel fast, calm, and trustworthy.</h1>
              <p className="max-w-2xl text-[15px] font-medium leading-relaxed text-bp-body md:text-[17px]">
                This view gives the operations team a clean queue for provider onboarding, compliance review, and launch readiness.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button onClick={focusReviewRow} className="inline-flex items-center gap-3 rounded-[24px] bg-bp-primary px-6 py-3.5 text-[14px] font-black text-white shadow-xl shadow-gray-200 transition-all hover:-translate-y-0.5 hover:bg-bp-accent">
                Review next provider
                <ArrowUpRight size={16} strokeWidth={3} />
              </button>
              <button onClick={exportQueue} className="inline-flex items-center gap-3 rounded-[24px] border border-bp-border bg-white px-6 py-3.5 text-[14px] font-black text-bp-primary shadow-sm transition-all hover:border-bp-accent/20 hover:text-bp-accent">
                Export queue
                <ArrowUpRight size={16} strokeWidth={3} />
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {summaryCards.map((card) => {
              const CardIcon = card.icon
              return (
                <div key={card.title} className="rounded-[28px] border border-bp-border bg-[#fafbfc] p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-bp-accent/10 text-bp-accent">
                      <CardIcon size={20} strokeWidth={2.5} />
                    </div>
                    <div className="rounded-full border border-bp-border bg-white px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-bp-body/40">
                      Live
                    </div>
                  </div>
                  <p className="mt-4 text-[11px] font-black uppercase tracking-widest text-bp-body/40">{card.title}</p>
                  <p className="mt-1 text-[18px] font-black tracking-tight text-bp-primary">{card.value}</p>
                  <p className="mt-2 text-[12px] font-medium leading-relaxed text-bp-body/60">{card.detail}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="rounded-[36px] border border-bp-border bg-white shadow-[0_28px_80px_-44px_rgba(0,0,0,0.2)]">
        <div className="flex flex-col gap-6 border-b border-bp-border p-6 md:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-[20px] font-black tracking-tight text-bp-primary">Provider approval queue</h2>
            <p className="mt-1 text-[12px] font-black uppercase tracking-[0.22em] text-bp-body/40">Review applications and verify ICP details</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-4 py-2 text-[14px] font-black text-amber-700">
            <Clock className="h-4 w-4" />
            342 Pending
          </div>
        </div>

        {actionMessage && (
          <div className="mx-6 rounded-[24px] border border-bp-accent/20 bg-[#F7FCFB] px-4 py-3 text-[13px] font-bold text-bp-accent md:mx-8">
            {actionMessage}
          </div>
        )}

        <div className="overflow-x-auto p-2 md:p-6">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="border-b border-bp-border bg-[#fafbfc]">
              <tr>
                <th className="px-6 py-4 text-[13px] font-semibold uppercase tracking-wider text-[#6B7280]">Provider</th>
                <th className="px-6 py-4 text-[13px] font-semibold uppercase tracking-wider text-[#6B7280]">ICP #</th>
                <th className="px-6 py-4 text-[13px] font-semibold uppercase tracking-wider text-[#6B7280]">City</th>
                <th className="px-6 py-4 text-[13px] font-semibold uppercase tracking-wider text-[#6B7280]">Submitted</th>
                <th className="px-6 py-4 text-[13px] font-semibold uppercase tracking-wider text-[#6B7280]">Status</th>
                <th className="px-6 py-4 text-[13px] font-semibold uppercase tracking-wider text-[#6B7280] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr id="provider-review-row" className="transition-colors hover:bg-[#fafbfc]">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bp-accent/10 font-bold text-bp-accent text-[13px]">
                      AK
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-bp-primary">Dr. Arun K</p>
                      <p className="text-[13px] text-[#9CA3AF]">Sports Physiotherapy</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-[14px] font-mono text-bp-body">ICP-MH-12345</td>
                <td className="px-6 py-4 text-[14px] text-bp-body">Mumbai</td>
                <td className="px-6 py-4 text-[14px] text-bp-body">2 hours ago</td>
                <td className="px-6 py-4">
                  <span className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold',
                    reviewState === 'approved'
                      ? 'bg-emerald-50 text-emerald-700'
                      : reviewState === 'rejected'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-amber-50 text-amber-700'
                  )}>
                    <Clock className="h-3 w-3" />
                    {reviewState === 'approved' ? 'Approved' : reviewState === 'rejected' ? 'Needs changes' : 'Pending'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => setActionMessage('Opened Dr. Arun K. credential checklist for document review.')} aria-label="View provider documents" className="rounded-lg p-2 text-bp-body transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00766C]/20 cursor-pointer hover:bg-bp-accent/10 hover:text-bp-accent" title="View Documents">
                      <Eye className="h-5 w-5" />
                    </button>
                    <button onClick={() => { setReviewState('approved'); setActionMessage('Dr. Arun K. has been approved and moved live.'); }} aria-label="Approve provider" className="rounded-lg p-2 text-bp-body transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00766C]/20 cursor-pointer hover:bg-[#F0FDF4] hover:text-[#059669]" title="Approve">
                      <CheckCircle className="h-5 w-5" />
                    </button>
                    <button onClick={() => { setReviewState('rejected'); setActionMessage('Dr. Arun K. has been returned for document corrections.'); }} aria-label="Reject provider" className="rounded-lg p-2 text-bp-body transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00766C]/20 cursor-pointer hover:bg-[#FEF2F2] hover:text-[#DC2626]" title="Reject">
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
