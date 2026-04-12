import Image from 'next/image'
import Link from 'next/link'
import { TrendingUp, Users, Calendar, ArrowUpRight, CheckCircle } from 'lucide-react'

const bullets = [
  { icon: Users,     text: 'Reach patients in your city who are actively looking for a physiotherapist right now.' },
  { icon: TrendingUp, text: 'OTP-confirmed bookings and automatic reminders cut down on no-shows.' },
  { icon: Calendar,  text: 'One place for your calendar, patient notes, invoices and payouts.' },
]

const mockAppts = [
  { time: '9:00 AM',  patient: 'Rahul V.',  condition: 'Back Pain',  type: 'Clinic' },
  { time: '10:30 AM', patient: 'Priya S.',  condition: 'ACL Rehab',  type: 'Home'   },
  { time: '12:00 PM', patient: 'Ananya N.', condition: 'Neuro Rehab',type: 'Clinic' },
]

export default function ProviderCTA() {
  return (
    <section className="py-24 md:py-32 bg-slate-950 relative overflow-hidden" aria-label="For providers">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-rose-500/5 rounded-full blur-[100px]" />

      <div className="bp-container relative z-10">
        <div className="grid gap-16 lg:grid-cols-2 items-center">

          {/* Dashboard mockup */}
          <div className="order-2 lg:order-1">
            <div className="relative group">
              {/* Glow ring */}
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-indigo-500/20 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-sm" />

              {/* Female physio — floating above dashboard, desktop only */}
              <div className="hidden lg:block absolute -top-20 right-4 z-10 pointer-events-none select-none">
                <Image
                  src="/images/physio-female.png"
                  alt=""
                  width={160}
                  height={240}
                  className="object-contain object-bottom drop-shadow-2xl"
                  aria-hidden="true"
                />
              </div>

              <div className="relative bg-slate-900 rounded-2xl border border-white/8 overflow-hidden shadow-2xl">
                {/* Mock header */}
                <div className="flex items-center gap-2 px-5 py-4 border-b border-white/5">
                  <span className="w-3 h-3 rounded-full bg-red-500/40" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/40" />
                  <span className="w-3 h-3 rounded-full bg-green-500/40" />
                  <span className="ml-3 text-[11px] text-slate-500 font-medium">BookPhysio Provider Dashboard</span>
                </div>

                <div className="p-5 space-y-4">
                  {/* Stat cards */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { val: '—', label: 'Today' },
                      { val: '—', label: 'Rating' },
                      { val: '—', label: 'Month' },
                    ].map(({ val, label }) => (
                      <div key={label} className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <div className="text-white font-bold text-[18px] leading-none">{val}</div>
                        <div className="text-slate-500 text-[10px] font-semibold uppercase tracking-widest mt-1">{label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Today's schedule */}
                  <div className="bg-white/3 rounded-xl border border-white/5 p-4 space-y-3">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Today&apos;s Schedule</div>
                    {mockAppts.map(appt => (
                      <div key={appt.time} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                        <div className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                        <span className="text-indigo-400 text-[12px] font-bold w-16 shrink-0">{appt.time}</span>
                        <span className="text-white text-[13px] font-medium flex-1">{appt.patient}</span>
                        <span className="text-slate-500 text-[11px]">{appt.condition}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${appt.type === 'Home' ? 'bg-violet-500/10 text-violet-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                          {appt.type}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Growth badge */}
                  <div className="flex items-center justify-between px-4 py-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                      <span className="text-indigo-400 text-[12px] font-bold">Patient growth this month</span>
                    </div>
                    <span className="text-white font-bold text-[18px]">Growing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Copy column */}
          <div className="order-1 lg:order-2 space-y-8">
            <div className="bp-kicker border-white/15 bg-white/5 text-[#C7CEEF]">For Physiotherapists</div>

            <div>
              <h2 className="text-white text-[36px] md:text-[48px] font-extrabold tracking-tight leading-[1.05] mb-4">
                Spend less time
                <br />
                <span className="text-gradient-lavender">chasing patients.</span>
              </h2>
              <p className="text-slate-400 text-[17px] leading-relaxed">
                BookPhysio gives IAP-verified physiotherapists a simple way to accept bookings, manage their calendar and handle payments, so you can spend more of your day actually treating people.
              </p>
            </div>

            <div className="space-y-4">
              {bullets.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                    <Icon size={16} />
                  </div>
                  <p className="text-slate-300 text-[15px] leading-relaxed">{text}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Link
                href="/doctor-signup"
                className="flex items-center gap-2 px-7 py-4 bg-indigo-600 text-white rounded-xl font-bold text-[15px] hover:bg-indigo-500 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/20 group"
              >
                List your practice
                <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
              <Link
                href="/how-it-works"
                className="flex items-center gap-2 px-5 py-4 text-slate-400 hover:text-white text-[14px] font-medium transition-colors"
              >
                Learn more
              </Link>
            </div>

            <div className="flex items-center gap-4 pt-2 border-t border-white/5">
              <CheckCircle size={15} className="text-indigo-400 shrink-0" />
              <span className="text-slate-500 text-[13px]">Free to list · Approval in 48 hours · No subscription fees</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
