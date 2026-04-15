import { Skeleton } from "@/components/ui/Skeleton"

export default function ProfileLoading() {
  return (
    <div className="max-w-[1142px] mx-auto px-6 py-12">
      <Skeleton className="h-9 w-36 mb-8" />

      <div className="bg-white rounded-[12px] border border-bp-border p-6 space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>

        {/* Form fields */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full rounded-[var(--sq-xs)]" />
          </div>
        ))}

        <Skeleton className="h-10 w-32 rounded-full" />
      </div>
    </div>
  )
}
