/**
 * Loading skeleton for the patient dashboard.
 * Rendered while appointments are being fetched.
 */
export function DashboardSkeleton() {
  return (
    <div className="max-w-[1142px] mx-auto px-6 py-12">
      {/* Greeting skeleton */}
      <div className="h-9 w-64 bg-gray-200 rounded-lg animate-pulse mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          {/* Care home card */}
          <div className="bg-white rounded-[12px] border border-[#E5E5E5] p-6">
            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="h-20 bg-gray-100 rounded-[10px] animate-pulse" />
          </div>

          {/* Quick actions card */}
          <div className="bg-white rounded-[12px] border border-[#E5E5E5] p-6">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="flex gap-3">
              <div className="h-10 w-48 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-10 w-44 bg-gray-200 rounded-full animate-pulse" />
            </div>
          </div>

          {/* Care team card */}
          <div className="bg-white rounded-[12px] border border-[#E5E5E5] p-6">
            <div className="h-6 w-36 bg-gray-200 rounded animate-pulse mb-4" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-[#F5F5F5] last:border-0">
                <div className="flex flex-col gap-1">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                </div>
                <div className="h-4 w-14 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Right column — upcoming */}
        <div className="bg-white rounded-[12px] border border-[#E5E5E5] p-6">
          <div className="h-6 w-28 bg-gray-200 rounded animate-pulse mb-5" />
          <div className="rounded-[8px] border border-[#E5E5E5] p-4 flex flex-col gap-2">
            <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-28 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-36 bg-gray-100 rounded animate-pulse" />
            <div className="h-9 bg-gray-200 rounded-full animate-pulse mt-2" />
          </div>
        </div>
      </div>
    </div>
  )
}
