import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";

export function DoctorCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-white rounded-[8px] border border-[#E5E5E5] p-[20px] md:p-[24px] flex gap-[20px] items-start animate-in fade-in duration-500",
        className
      )}
    >
      {/* Avatar Skeleton */}
      <Skeleton className="w-[80px] h-[80px] rounded-full shrink-0" />

      {/* Main content */}
      <div className="flex-1 space-y-4 min-w-0">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-2 flex-1">
            {/* Name */}
            <Skeleton className="h-6 w-3/4 rounded-md" />
            {/* Specialty */}
            <Skeleton className="h-4 w-1/2 rounded-md" />
          </div>
          {/* Fee */}
          <div className="space-y-1 items-end flex flex-col pt-1">
            <Skeleton className="h-6 w-16 rounded-md" />
            <Skeleton className="h-3 w-12 rounded-md" />
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-24 rounded-md" />
        </div>

        {/* Location & Time */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-2/3 rounded-md" />
          <Skeleton className="h-4 w-1/2 rounded-md" />
        </div>

        {/* Badges */}
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </div>

      {/* Button CTA */}
      <div className="hidden sm:flex shrink-0 pt-4">
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>
    </div>
  );
}
