import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Skeleton } from '@/components/ui/Skeleton'

export default function SearchLoading() {
  return (
    <div className="bg-[#F7F8F9] min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-[1142px] mx-auto px-4 sm:px-6 md:px-10 py-8">
          {/* Search bar skeleton */}
          <Skeleton className="h-12 w-full max-w-2xl mx-auto rounded-full mb-8" />

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
            {/* Filter sidebar skeleton */}
            <aside className="hidden lg:block space-y-6">
              <Skeleton className="h-6 w-24" />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full rounded-[var(--sq-xs)]" />
                </div>
              ))}
            </aside>

            {/* Results skeleton */}
            <div className="space-y-5">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-9 w-32 rounded-[var(--sq-xs)]" />
              </div>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-[var(--sq-sm)] border border-slate-200 p-5 flex gap-5"
                >
                  <Skeleton className="w-20 h-20 rounded-[var(--sq-sm)] shrink-0" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-5 w-3/5" />
                    <Skeleton className="h-4 w-2/5" />
                    <div className="flex gap-2">
                      <Skeleton className="h-7 w-16 rounded-full" />
                      <Skeleton className="h-7 w-20 rounded-full" />
                    </div>
                    <div className="flex gap-2 pt-1">
                      {[1, 2, 3].map((j) => (
                        <Skeleton key={j} className="h-8 w-16 rounded-md" />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
