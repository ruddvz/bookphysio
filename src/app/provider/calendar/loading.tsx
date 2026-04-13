import { Skeleton } from "@/components/ui/Skeleton"

export default function CalendarLoading() {
  return (
    <div className="max-w-[1142px] mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <Skeleton className="h-9 w-36" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-[12px] border border-bp-border p-6">
        <div className="grid grid-cols-7 gap-2 mb-4">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <Skeleton key={d} className="h-5 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 14 }, (_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}
