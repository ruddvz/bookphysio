'use client'

import { Loader2, FileHeart, Calendar, AlertCircle, Stethoscope } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import type { PatientFacingRecord } from '@/lib/clinical/types'

async function fetchRecords(): Promise<{ records: PatientFacingRecord[] }> {
  const res = await fetch('/api/patient/records')
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export default function PatientRecordsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['patient-records'],
    queryFn: fetchRecords,
  })

  const records = data?.records ?? []

  return (
    <div className="max-w-[820px] mx-auto px-6 py-12 animate-in fade-in duration-500 delay-100 fill-mode-both">
      <div className="mb-8">
        <h1 className="text-[32px] font-bold text-slate-900 tracking-tight mb-2 flex items-center gap-3">
          <FileHeart className="w-8 h-8 text-emerald-600" />
          Your Care Summary
        </h1>
        <p className="text-[15px] text-slate-600 max-w-[600px]">
          A simple summary of what your physiotherapist worked on with you and what to do next.
          For full clinical details, please ask your physio directly.
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      )}

      {isError && (
        <div className="bg-red-50 rounded-[12px] border border-red-100 p-6 text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <p className="text-[15px] font-medium text-slate-900">We couldn&apos;t load your care summary</p>
          <p className="text-[13px] text-slate-500 mt-1">Please try refreshing the page.</p>
        </div>
      )}

      {!isLoading && !isError && records.length === 0 && (
        <div className="bg-white rounded-[12px] border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-50 mx-auto flex items-center justify-center mb-4">
            <Stethoscope className="w-8 h-8 text-emerald-600" />
          </div>
          <p className="text-[16px] font-medium text-slate-900 mb-1">No visit summaries yet</p>
          <p className="text-[14px] text-slate-500">
            After your next physio session, your provider can share a simple summary here.
          </p>
        </div>
      )}

      {!isLoading && records.length > 0 && (
        <div className="space-y-4">
          {records.map((r) => (
            <article
              key={r.visit_id}
              className="bg-white rounded-[12px] border border-slate-200 shadow-sm overflow-hidden"
            >
              <header className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50/50 to-white">
                <div>
                  <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                    Visit {r.visit_number}
                  </p>
                  <p className="text-[15px] font-bold text-slate-900 mt-0.5">{r.provider_name}</p>
                </div>
                <div className="flex items-center gap-1.5 text-[13px] text-slate-500 font-medium">
                  <Calendar className="w-4 h-4" />
                  {formatDate(r.visit_date)}
                </div>
              </header>

              <div className="p-6 space-y-5">
                {r.patient_summary ? (
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      What your physio wants you to know
                    </p>
                    <p className="text-[14px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {r.patient_summary}
                    </p>
                  </div>
                ) : (
                  <p className="text-[13px] text-slate-400 italic">
                    Your physio hasn&apos;t shared a summary for this visit yet.
                  </p>
                )}

                {r.plan && (
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      What&apos;s next
                    </p>
                    <p className="text-[14px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {r.plan}
                    </p>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
