import { Skeleton } from "@/components/ui/Skeleton"

export default function ProviderAppointmentsLoading() {
  return (
    <div className="max-w-[1142px] mx-auto px-6 py-12">
      <Skeleton className="h-9 w-48 mb-8" />

      <div className="flex gap-8 mb-8 border-b border-bp-border pt-1">
        <Skeleton className="h-6 w-24 mb-4" />
        <Skeleton className="h-6 w-24 mb-4" />
      </div>

      <div className="flex flex-col gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-[12px] border border-bp-border p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
