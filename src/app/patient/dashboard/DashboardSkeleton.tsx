import { Skeleton } from '@/components/ui/Skeleton'

/**
 * Loading skeleton for the patient dashboard.
 * Rendered while appointments are being fetched.
 */
export function DashboardSkeleton() {
  return (
    <div className="max-w-[1142px] mx-auto px-6 py-12">
      {/* Greeting skeleton */}
      <Skeleton className="h-9 w-64 mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          {/* Care home card */}
          <div className="bg-white rounded-[12px] border border-bp-border p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <Skeleton className="h-20 w-full rounded-[10px]" />
          </div>

          {/* Quick actions card */}
          <div className="bg-white rounded-[12px] border border-bp-border p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="flex gap-3">
              <Skeleton className="h-10 w-48 rounded-full" />
              <Skeleton className="h-10 w-44 rounded-full" />
            </div>
          </div>

          {/* Care team card */}
          <div className="bg-white rounded-[12px] border border-bp-border p-6">
            <Skeleton className="h-6 w-36 mb-4" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-bp-border last:border-0">
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-14" />
              </div>
            ))}
          </div>
        </div>

        {/* Right column — upcoming */}
        <div className="bg-white rounded-[12px] border border-bp-border p-6">
          <Skeleton className="h-6 w-28 mb-5" />
          <div className="rounded-[8px] border border-bp-border p-4 flex flex-col gap-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-9 w-full rounded-full mt-2" />
          </div>
        </div>
      </div>
    </div>
  )
}
