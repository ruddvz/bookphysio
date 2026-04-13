import { Skeleton } from "@/components/ui/Skeleton"

export default function EarningsLoading() {
  return (
    <div className="max-w-[1142px] mx-auto px-6 py-12">
      <Skeleton className="h-9 w-36 mb-8" />

      {/* Earnings summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-[12px] border border-bp-border p-5 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-28" />
          </div>
        ))}
      </div>

      {/* Transactions table skeleton */}
      <Skeleton className="h-7 w-40 mb-4" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-[12px] border border-bp-border p-4 flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}
