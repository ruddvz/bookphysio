import { Skeleton } from "@/components/ui/Skeleton";

export default function AppointmentsLoading() {
  return (
    <div className="max-w-[1142px] mx-auto px-6 py-12">
      {/* Title skeleton */}
      <Skeleton className="h-9 w-48 mb-8" />

      {/* Tabs skeleton */}
      <div className="flex gap-8 mb-8 border-b border-[#E5E5E5] pt-1">
        <Skeleton className="h-6 w-24 mb-4" />
        <Skeleton className="h-6 w-24 mb-4" />
      </div>

      {/* List skeleton */}
      <div className="flex flex-col gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-[12px] border border-[#E5E5E5] p-5 flex items-center justify-between gap-4">
            <div className="flex-1 space-y-3">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-10 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
