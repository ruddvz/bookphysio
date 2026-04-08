"use client"

import { useState } from 'react'
import { ArrowUpRight, CheckCircle, Clock, Eye, ShieldCheck, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  PageHeader,
  SectionCard,
  ListRow,
  StatTile,
} from '@/components/dashboard/primitives'

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
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-8">
      <PageHeader
        role="admin"
        kicker="OPERATIONS"
        title="Listing verification"
        subtitle="Review provider onboarding, compliance, and launch readiness"
        action={{
          label: 'Review next',
          icon: ShieldCheck,
          onClick: focusReviewRow
        }}
      />

      {/* Summary Roster */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatTile
          role="admin"
          icon={Clock}
          label="Pending review"
          value="342"
          tone={4}
          delta={{ value: '12%', positive: false }}
        />
        <StatTile
          role="admin"
          icon={CheckCircle}
          label="Approved today"
          value="28"
          tone={2}
          delta={{ value: '8%', positive: true }}
        />
        <StatTile
          role="admin"
          icon={ShieldCheck}
          label="SLA integrity"
          value="2.4h"
          tone={1}
        />
      </div>

      <SectionCard
        role="admin"
        title="Provider approval queue"
        action={{ label: 'Export JSON', href: '#' }}
      >
        {actionMessage && (
          <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3 text-[13px] font-bold text-slate-600 animate-in fade-in slide-in-from-top-2">
            <ShieldCheck size={16} className="text-slate-400" />
            {actionMessage}
          </div>
        )}

        <div className="divide-y divide-slate-100/50">
          <ListRow
            key="ak-row"
            role="admin"
            className="group"
            icon={
              <div
                id="provider-review-row"
                className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-sm font-black border border-slate-800"
              >
                AK
              </div>
            }
            primary={
              <div className="flex items-center gap-2">
                Dr. Arun K
                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] uppercase font-black tracking-widest">Physio</span>
              </div>
            }
            secondary={
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="flex items-center gap-1.5"><ShieldCheck size={12} /> IAP-MH-12345</span>
                <span className="flex items-center gap-1.5"><Clock size={12} /> 2 hours ago</span>
              </div>
            }
            right={
              <div className="flex items-center gap-4">
                <div className={cn(
                  "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                  reviewState === 'approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                  reviewState === 'rejected' ? "bg-rose-50 text-rose-600 border-rose-100" :
                  "bg-slate-50 text-slate-500 border-slate-200"
                )}>
                  {reviewState}
                </div>
                <div className="flex items-center gap-1">
                   <button
                     onClick={() => setActionMessage('Opened Dr. Arun K. credential checklist.')}
                     className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
                   >
                     <Eye size={18} strokeWidth={2.5} />
                   </button>
                   <button
                     onClick={() => { setReviewState('approved'); setActionMessage('Provider approved.'); }}
                     className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                   >
                     <CheckCircle size={18} strokeWidth={2.5} />
                   </button>
                   <button
                     onClick={() => { setReviewState('rejected'); setActionMessage('Provider rejected.'); }}
                     className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                   >
                     <XCircle size={18} strokeWidth={2.5} />
                   </button>
                </div>
              </div>
            }
          />
        </div>
      </SectionCard>

      <div className="flex justify-center pt-8">
         <button
           onClick={exportQueue}
           className="px-8 py-3 bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 rounded-full text-[13px] font-bold transition-all flex items-center gap-2"
         >
           Export review registry
           <ArrowUpRight size={14} />
         </button>
      </div>
    </div>
  )
}

