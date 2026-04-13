import { Skeleton } from "@/components/ui/Skeleton"

export default function PatientsLoading() {
  return (
    <div className="max-w-[1142px] mx-auto px-6 py-12">
      <Skeleton className="h-9 w-40 mb-8" />

      <div className="flex flex-col gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-[12px] border border-bp-border p-5 flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  )
}
