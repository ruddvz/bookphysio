import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/Skeleton'

export function DoctorCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bp-card overflow-hidden p-5 md:p-6',
        className
      )}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex gap-5">
          <Skeleton className="h-24 w-24 shrink-0 rounded-[24px]" />

          <div className="min-w-0 flex-1 space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-7 w-3/4 rounded-full" />
              <Skeleton className="h-4 w-1/2 rounded-full" />
            </div>

            <div className="space-y-3">
              <Skeleton className="h-4 w-2/3 rounded-full" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-7 w-24 rounded-full" />
                <Skeleton className="h-7 w-20 rounded-full" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-36 rounded-full" />
              </div>
            </div>

            <Skeleton className="h-10 w-28 rounded-full" />
          </div>
        </div>

        <div className="bp-card-soft space-y-4 p-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-28 rounded-full" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="space-y-2 rounded-[20px] border border-[#E6E8EC] bg-white p-3">
                <Skeleton className="h-4 w-10 rounded-full" />
                <Skeleton className="h-9 w-full rounded-2xl" />
                <Skeleton className="h-9 w-full rounded-2xl" />
              </div>
            ))}
          </div>

          <Skeleton className="h-12 w-full rounded-[20px]" />
        </div>
      </div>
    </div>
  )
}