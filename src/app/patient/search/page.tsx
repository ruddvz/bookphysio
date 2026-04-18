'use client'

import { Suspense } from 'react'
import SearchContent from '@/app/search/SearchContent'
import { Skeleton } from '@/components/ui/Skeleton'

function PatientSearchFallback() {
  return (
    <div className="space-y-4 px-4 py-6 sm:px-6">
      <Skeleton className="h-9 w-48 rounded-[var(--sq-sm)] bg-slate-100" />
      <Skeleton className="h-32 w-full rounded-[var(--sq-lg)] bg-slate-100" />
      <Skeleton className="h-24 w-full rounded-[var(--sq-lg)] bg-slate-100" />
    </div>
  )
}

export default function PatientSearchPage() {
  return (
    <Suspense fallback={<PatientSearchFallback />}>
      <SearchContent variant="patient" />
    </Suspense>
  )
}
