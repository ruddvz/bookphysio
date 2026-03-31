import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";

export function DoctorCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-[#E5E5E5] p-5 md:p-6 flex flex-col lg:flex-row gap-6 animate-pulse",
        className
      )}
    >
      {/* Left Column: Avatar & Info */}
      <div className="flex flex-1 gap-5">
        {/* Avatar */}
        <Skeleton className="w-20 h-20 md:w-24 md:h-24 rounded-full shrink-0" />

        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-3/4 rounded-md" />
            <Skeleton className="h-4 w-1/2 rounded-md" />
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-12 rounded-full" />
              <Skeleton className="h-4 w-24 rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-2/3 rounded-md" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-lg" />
                <Skeleton className="h-5 w-16 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Availability Grid Shell */}
      <div className="w-full lg:w-[320px] shrink-0">
        <div className="bg-[#F9FAFB] rounded-xl p-4 border border-[#F3F4F6] space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-24 rounded-md" />
            <div className="flex gap-1">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-full rounded-md" />
                <div className="space-y-1.5">
                  <Skeleton className="h-9 w-full rounded-lg" />
                  <Skeleton className="h-9 w-full rounded-lg" />
                  <Skeleton className="h-9 w-full rounded-lg" />
                </div>
              </div>
            ))}
          </div>

          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}
