import { Skeleton } from "@/components/ui/Skeleton"

export default function MessagesLoading() {
  return (
    <div className="max-w-[1142px] mx-auto px-6 py-12">
      <Skeleton className="h-9 w-36 mb-8" />

      <div className="flex flex-col gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-[12px] border border-bp-border p-4 flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}
