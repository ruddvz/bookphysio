import { Skeleton } from "@/components/ui/Skeleton";

export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-8">
      {/* Header section skeleton */}
      <div>
        <Skeleton className="h-10 w-64 mb-3" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* KPI Cards skeleton */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col p-6 bg-white border border-bp-border rounded-[8px] shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="flex flex-col p-8 bg-white border border-bp-border rounded-[8px] shadow-sm min-h-[400px]">
             <div className="flex items-center justify-between mb-6">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-10 w-28 rounded-full" />
             </div>
             <Skeleton className="flex-1 w-full rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
