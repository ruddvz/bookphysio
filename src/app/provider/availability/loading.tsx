import { Skeleton } from "@/components/ui/Skeleton"

export default function AvailabilityLoading() {
  return (
    <div className="max-w-[1142px] mx-auto px-6 py-12">
      <Skeleton className="h-9 w-52 mb-2" />
      <Skeleton className="h-5 w-80 mb-8" />

      {/* Weekly schedule grid */}
      <div className="bg-white rounded-[12px] border border-bp-border p-6 space-y-4">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div key={day} className="flex items-center gap-4 py-3 border-b border-bp-border last:border-0">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-8 w-14 rounded-full" />
            <Skeleton className="h-5 w-32" />
          </div>
        ))}
      </div>
    </div>
  )
}
