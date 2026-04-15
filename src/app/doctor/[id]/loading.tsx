import { Skeleton } from "@/components/ui/Skeleton";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function DoctorProfileLoading() {
  return (
    <>
      <Navbar />
      <main className="bg-bp-surface min-h-screen pt-10 pb-20">
        <div className="max-w-[1142px] mx-auto px-6 lg:px-[60px]">
          <div className="grid grid-cols-1 md:grid-cols-[65%_35%] gap-8">
            {/* Left Column Skeletons */}
            <div className="space-y-6">
              {/* Profile Card Skeleton */}
              <div className="bg-white rounded-[8px] border border-bp-border p-6">
                <div className="flex gap-5">
                  <Skeleton className="w-[120px] h-[120px] rounded-full shrink-0" />
                  <div className="flex-1 space-y-4 pt-2">
                    <Skeleton className="h-8 w-3/4 rounded-md" />
                    <Skeleton className="h-5 w-1/2 rounded-md" />
                    <div className="flex gap-3">
                      <Skeleton className="h-7 w-24" />
                      <Skeleton className="h-7 w-32 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* About Section Skeleton */}
              <div className="bg-white rounded-[8px] border border-bp-border p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>

              {/* Specialties Skeleton */}
              <div className="bg-white rounded-[8px] border border-bp-border p-6">
                <Skeleton className="h-6 w-40 mb-4" />
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} className="h-8 w-24 rounded-[var(--sq-xs)]" />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column / Booking Card Skeleton */}
            <div className="bg-white rounded-[12px] border border-bp-border p-6 h-fit">
              <Skeleton className="h-7 w-full mb-6" />
              <div className="space-y-4">
                <Skeleton className="h-12 w-full rounded-[var(--sq-xs)]" />
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
                <Skeleton className="h-40 w-full rounded-[var(--sq-xs)] mt-4" />
                <Skeleton className="h-12 w-full rounded-full mt-6" />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
