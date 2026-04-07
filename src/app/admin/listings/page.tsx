"use client"

import { useState } from 'react'
import { ArrowUpRight, CheckCircle, Clock, Eye, FileCheck, ShieldCheck, XCircle } from 'lucide-react'
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
    const csv = ['Provider,ICP,City,Status', `Dr. Arun K,IAP-MH-12345,Mumbai,${reviewState}`].join('\n')
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
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-700">
              <FileCheck size={12} />
              Provider review queue
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-600">
              <ShieldCheck size={12} />
              ICP checks
            </span>
          </div>
          <h1 className="text-[24px] md:text-[28px] font-bold tracking-tight text-slate-900">Provider Approvals</h1>
          <p className="mt-0.5 text-[14px] text-slate-500">
            Review provider onboarding, compliance, and launch readiness.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={focusReviewRow} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-slate-800">
            Review next provider
            <ArrowUpRight size={14} />
          </button>
          <button type="button" onClick={exportQueue} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-[14px] font-semibold text-slate-700 transition-colors hover:border-slate-300">
            Export queue
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {summaryCards.map((card) => {
          const CardIcon = card.icon
          return (
            <div key={card.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <CardIcon size={18} />
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Live
                </span>
              </div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{card.title}</p>
              <p className="mt-1 text-[22px] font-bold tracking-tight text-slate-900">{card.value}</p>
              <p className="mt-1 text-[12px] text-slate-500">{card.detail}</p>
            </div>
          )
        })}
      </div>

      {/* Approval Queue Table */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-lg">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 md:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-[17px] font-bold tracking-tight text-slate-900">Provider approval queue</h2>
            <p className="mt-0.5 text-[12px] font-medium uppercase tracking-wider text-slate-400">Review applications and verify ICP details</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-4 py-2 text-[13px] font-bold text-amber-700">
            <Clock className="h-4 w-4" />
            342 Pending
          </div>
        </div>

        {actionMessage && (
          <div className="mx-5 mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] font-medium text-amber-800 md:mx-6">
            {actionMessage}
          </div>
        )}

        <div className="overflow-x-auto p-2 md:p-6">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-[12px] font-semibold uppercase tracking-wider text-slate-500">Provider</th>
                <th className="px-6 py-4 text-[12px] font-semibold uppercase tracking-wider text-slate-500">ICP #</th>
                <th className="px-6 py-4 text-[12px] font-semibold uppercase tracking-wider text-slate-500">City</th>
                <th className="px-6 py-4 text-[12px] font-semibold uppercase tracking-wider text-slate-500">Submitted</th>
                <th className="px-6 py-4 text-[12px] font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-4 text-[12px] font-semibold uppercase tracking-wider text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr id="provider-review-row" className="transition-colors hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 font-bold text-amber-700 text-[13px]">
                      AK
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-slate-900">Dr. Arun K</p>
                      <p className="text-[12px] text-slate-400">Sports Physiotherapy</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-[14px] font-mono text-slate-600">IAP-MH-12345</td>
                <td className="px-6 py-4 text-[14px] text-slate-600">Mumbai</td>
                <td className="px-6 py-4 text-[14px] text-slate-600">2 hours ago</td>
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
                    <button onClick={() => setActionMessage('Opened Dr. Arun K. credential checklist for document review.')} aria-label="View provider documents" className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900" title="View Documents">
                      <Eye className="h-5 w-5" />
                    </button>
                    <button onClick={() => { setReviewState('approved'); setActionMessage('Dr. Arun K. has been approved and moved live.'); }} aria-label="Approve provider" className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-emerald-50 hover:text-emerald-600" title="Approve">
                      <CheckCircle className="h-5 w-5" />
                    </button>
                    <button onClick={() => { setReviewState('rejected'); setActionMessage('Dr. Arun K. has been returned for document corrections.'); }} aria-label="Reject provider" className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600" title="Reject">
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
