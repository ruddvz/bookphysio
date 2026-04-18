'use client'

import { FileText, Calendar, Activity, Users, AlertCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import type { PatientFacingRecord } from '@/lib/clinical/types'
import {
  PageHeader,
  StatTile,
  SectionCard,
  ListRow,
  EmptyState,
} from '@/components/dashboard/primitives'
import { useUiV2 } from '@/hooks/useUiV2'
import { PatientRecordsSummaryV2 } from './PatientRecordsSummaryV2'

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

function RecordsSkeleton() {
  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
      <Skeleton className="h-10 w-64 rounded-[var(--sq-sm)] bg-slate-100" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 rounded-[var(--sq-lg)] bg-slate-100" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-[var(--sq-lg)] bg-slate-100" />
    </div>
  )
}

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse ${className}`} />
}

export default function PatientRecordsPage() {
  const uiV2 = useUiV2()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['patient-records'],
    queryFn: fetchRecords,
  })

  if (isLoading) return <RecordsSkeleton />

  if (isError) {
    return (
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <EmptyState
          role="patient"
          icon={AlertCircle}
          title="We couldn't load your care summary"
          description="There was an error fetching your care summary history."
          cta={{ label: 'Retry', onClick: refetch }}
        />
      </div>
    )
  }

  const records = data?.records ?? []
  const uniqueProviders = new Set(records.map((r) => r.provider_name)).size
  const lastVisit = records[0] ?? null

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8">
      <PageHeader
        role="patient"
        kicker="MEDICAL RECORDS"
        title="Your care summary"
        subtitle="A simple summary of your physiotherapy sessions and next steps"
      />

      {/* Stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          role="patient"
          icon={FileText}
          label="Total visits"
          value={records.length}
          tone={1}
        />
        <StatTile
          role="patient"
          icon={Users}
          label="Care team"
          value={uniqueProviders}
          tone={2}
        />
        <StatTile
          role="patient"
          icon={Activity}
          label="Last visit"
          value={lastVisit ? formatDate(lastVisit.visit_date.slice(0, 10)) : '—'}
          tone={3}
        />
        <StatTile
          role="patient"
          icon={Calendar}
          label="Active plans"
          value={records.filter(r => r.plan).length}
          tone={5}
        />
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 space-y-6">
          {uiV2 ? (
            records.length === 0 ? (
              <EmptyState
                role="patient"
                icon={FileText}
                title="No visit summaries yet"
                description="After your next physio session, your provider can share a simple summary here."
                cta={{ label: 'Book a visit', href: '/search' }}
              />
            ) : (
              <PatientRecordsSummaryV2 records={records} />
            )
          ) : (
            <SectionCard role="patient" title="Visit history">
              {records.length === 0 ? (
                <EmptyState
                  role="patient"
                  icon={FileText}
                  title="No visit summaries yet"
                  description="After your next physio session, your provider can share a simple summary here."
                  cta={{ label: 'Book a visit', href: '/search' }}
                />
              ) : (
                <div className="divide-y divide-[var(--color-pt-border-soft)]">
                  {records.map((r) => (
                    <div key={r.visit_id} className="py-6 first:pt-0 last:pb-0">
                      <ListRow
                        role="patient"
                        icon={FileText}
                        tone={1}
                        primary={r.provider_name}
                        secondary={
                          <>
                            <span>Visit {r.visit_number}</span>
                            <span aria-hidden="true" className="mx-1">•</span>
                            <span>{formatDate(r.visit_date)}</span>
                          </>
                        }
                      />
                      <div className="mt-4 pl-13 space-y-4">
                        {r.patient_summary ? (
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                              Physio Notes
                            </p>
                            <p className="text-[13px] text-slate-600 leading-relaxed whitespace-pre-wrap">
                              {r.patient_summary}
                            </p>
                          </div>
                        ) : (
                          <p className="text-[12px] text-slate-400 italic">
                            Your provider hasn&apos;t shared a summary for this visit yet.
                          </p>
                        )}

                        {r.plan && (
                          <div className="pt-3 border-t border-slate-50">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                              What&apos;s next
                            </p>
                            <p className="text-[13px] text-slate-600 leading-relaxed whitespace-pre-wrap">
                              {r.plan}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          )}
        </div>

        <div className="xl:w-[340px] xl:shrink-0">
          <SectionCard role="patient" title="Care tips">
            <div className="space-y-4">
              <div className="p-4 rounded-[var(--sq-sm)] bg-emerald-50/50 border border-emerald-100 flex gap-3">
                <Activity className="h-5 w-5 text-emerald-600 shrink-0" />
                <div className="text-[13px] text-slate-600 leading-relaxed">
                  Consistency is key for recovery. Follow your prescribed exercises daily for best results.
                </div>
              </div>
              <p className="text-[12px] text-slate-500 italic px-1">
                Note: These summaries are for your reference. For clinical details, please consult your provider.
              </p>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}

