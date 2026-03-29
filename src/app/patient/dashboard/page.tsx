import Link from 'next/link'
import { Heart, Search, Calendar, Users, ArrowRight } from 'lucide-react'

export default function PatientDashboardHome() {
  return (
    <div className="max-w-[1142px] mx-auto px-6 py-12 animate-in fade-in duration-500 delay-100 fill-mode-both">
      
      {/* Greeting */}
      <h1 className="text-[32px] font-bold text-[#333333] tracking-tight mb-8">
        Good morning, Rahul
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
        {/* Left Column: Well Guide / Updates */}
        <div className="flex flex-col gap-6">
          
          <section className="bg-white rounded-[12px] border border-[#E5E5E5] shadow-sm p-6">
            <h2 className="text-[20px] font-bold text-[#333333] mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-[#00766C]" />
              Your Care Home
            </h2>
            <div className="bg-gradient-to-r from-[#E6F4F3] to-[#D5EFED] p-5 rounded-[10px] flex items-center gap-4">
              <div className="text-[32px] shrink-0">💪</div>
              <div>
                <p className="text-[16px] font-semibold text-[#005A52] mb-1">
                  Keep moving forward
                </p>
                <p className="text-[14px] text-[#005A52]/80">
                  Book your next physiotherapy session to stay on track with your recovery goals.
                </p>
              </div>
            </div>
          </section>

          {/* Past Providers Section */}
          <section className="bg-white rounded-[12px] border border-[#E5E5E5] shadow-sm p-6">
            <h2 className="text-[18px] font-bold text-[#333333] mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#00766C]" />
              Your Care Team
            </h2>
            <p className="text-[14px] text-[#666666] leading-relaxed">
              You don&apos;t have any past providers yet. Once you book a session, they will appear here for easy re-booking.
            </p>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-[#00766C] hover:bg-[#005A52] text-white rounded-full no-underline font-semibold text-[14px] transition-colors"
            >
              <Search className="w-4 h-4" />
              Find a Physiotherapist
            </Link>
          </section>
        </div>

        {/* Right Column: Upcoming Appointments */}
        <aside className="bg-white rounded-[12px] border border-[#E5E5E5] shadow-sm p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-[18px] font-bold text-[#333333] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#00766C]" />
              Upcoming
            </h2>
          </div>

          {/* Empty State */}
          <div className="text-center py-10">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#F3F4F6] flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-[#9CA3AF]" />
            </div>
            <p className="text-[15px] font-semibold text-[#333333] mb-1">
              No upcoming appointments
            </p>
            <p className="text-[14px] text-[#666666]">
              Need to see a physio?
            </p>
            <Link
              href="/search"
              className="inline-flex items-center gap-1.5 mt-4 text-[14px] font-semibold text-[#00766C] hover:text-[#005A52] no-underline transition-colors"
            >
              Book a session
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
