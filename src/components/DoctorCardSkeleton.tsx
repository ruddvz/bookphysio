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
          <Skeleton className="h-24 w-24 shrink-0 rounded-[24px] bg-bp-border/50" />

          <div className="min-w-0 flex-1 space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-7 w-3/4 rounded-full bg-bp-border/50" />
              <Skeleton className="h-4 w-1/2 rounded-full bg-bp-border/30" />
            </div>

            <div className="space-y-3">
              <Skeleton className="h-4 w-2/3 rounded-full bg-bp-border/30" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-7 w-24 rounded-full bg-bp-border/40" />
                <Skeleton className="h-7 w-20 rounded-full bg-bp-border/40" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full bg-bp-border/30" />
                <Skeleton className="h-4 w-36 rounded-full bg-bp-border/30" />
              </div>
            </div>

            <Skeleton className="h-10 w-28 rounded-full bg-bp-primary/20" />
          </div>
        </div>

        <div className="bg-bp-surface/40 rounded-[var(--sq-xl)] border border-bp-border space-y-4 p-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-28 rounded-full bg-bp-border/40" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-full bg-bp-border/40" />
              <Skeleton className="h-8 w-8 rounded-full bg-bp-border/40" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="space-y-2 rounded-[var(--sq-lg)] border border-bp-border bg-white p-3">
                <Skeleton className="h-4 w-10 rounded-full bg-bp-border/40" />
                <Skeleton className="h-8 w-full rounded-[var(--sq-sm)] bg-bp-border/30" />
                <Skeleton className="h-8 w-full rounded-[var(--sq-sm)] bg-bp-border/20" />
              </div>
            ))}
          </div>

          <Skeleton className="h-12 w-full rounded-[var(--sq-lg)] bg-bp-accent/20" />
        </div>
      </div>
    </div>
  )
}