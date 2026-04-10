import Link from 'next/link'
import { Search, SlidersHorizontal, CalendarCheck, HeartPulse, ArrowRight, ShieldCheck } from 'lucide-react'

const steps = [
  {
    num: '01',
    icon: Search,
    title: 'Search',
    desc: 'Start with your city or what is bothering you, like back pain or a knee injury.',
    color: 'bg-indigo-50 text-indigo-600',
  },
  {
    num: '02',
    icon: SlidersHorizontal,
    title: 'Compare',
    desc: 'Check each physiotherapist\u2019s credentials, fees and whether they offer home visits.',
    color: 'bg-violet-50 text-violet-600',
  },
  {
    num: '03',
    icon: CalendarCheck,
    title: 'Book',
    desc: 'Pick a time that works, confirm with a mobile OTP, and get a confirmation message.',
    color: 'bg-teal-50 text-teal-600',
  },
  {
    num: '04',
    icon: HeartPulse,
    title: 'Start your session',
    desc: 'Meet your physiotherapist at the clinic or at home, and focus on getting better.',
    color: 'bg-rose-50 text-rose-600',
  },
]

export default function HowItWorks() {
  return (
    <section className="py-24 md:py-32 relative" aria-label="How booking works">
      <div className="bp-container z-10 relative">
        {/* Header */}
        <div className="max-w-2xl mb-16 mx-auto text-center">
          <div className="bp-kicker mb-4 mx-auto">How it works</div>
          <h2 className="text-slate-900 mb-4 tracking-tight">Four steps from search to session.</h2>
          <p className="text-slate-500 text-[17px] leading-relaxed">
            Finding a physiotherapist should not feel like a research project. On BookPhysio, most people go from their first search to a confirmed booking in under a minute.
          </p>
        </div>

        {/* Steps sequence */}
        <div className="relative mt-8">
          {/* Desktop Connecting Line */}
          <div className="hidden lg:block absolute top-[44px] left-[12%] right-[12%] h-[2px] bg-slate-100 -z-10" />

          <div className="grid gap-8 lg:gap-4 lg:grid-cols-4">
            {steps.map(({ num, icon: Icon, title, desc, color }, i) => (
              <div
                key={num}
                className="relative group flex flex-col items-center text-center px-2"
              >
                {/* Desktop Arrow Head overlay on line */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-[36px] -right-[12px] z-0 text-slate-300">
                    <ArrowRight size={20} />
                  </div>
                )}

                {/* Step number pill above icon */}
                <div className="bg-white border-2 border-slate-100 text-slate-400 font-bold text-[11px] px-3 py-1 rounded-full mb-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)] relative z-10 group-hover:border-indigo-200 group-hover:text-indigo-600 transition-colors">
                  Step {num}
                </div>

                {/* Icon Circle */}
                <div className={`w-[88px] h-[88px] rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-50 relative z-10 bg-white group-hover:-translate-y-1 transition-transform`}>
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center ${color}`}>
                    <Icon size={24} />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-slate-900 text-[18px] font-bold mb-3 group-hover:text-indigo-600 transition-colors">
                  {title}
                </h3>
                <p className="text-slate-500 text-[14px] leading-relaxed max-w-[220px]">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom trust bar */}
        <div className="mt-20 flex flex-col md:flex-row items-center justify-between gap-6 px-8 py-5 rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/20 max-w-5xl mx-auto">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
            {[
              { icon: ShieldCheck, text: 'IAP Verified', color: 'text-indigo-600' },
              { icon: CalendarCheck, text: 'Instant Confirmation', color: 'text-teal-600' },
              { icon: Search, text: 'No Hidden Fees', color: 'text-slate-500' },
            ].map(({ icon: Icon, text, color }) => (
              <div key={text} className={`flex items-center gap-2 text-[14px] font-semibold ${color}`}>
                <Icon size={16} />
                {text}
              </div>
            ))}
          </div>
          <Link
            href="/search"
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-full text-[14px] font-bold hover:bg-indigo-700 hover:-translate-y-0.5 shadow-lg shadow-indigo-600/30 transition-all group shrink-0 w-full md:w-auto"
          >
            Start searching
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}