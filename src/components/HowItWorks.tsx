import Link from 'next/link'
import { Search, SlidersHorizontal, CalendarCheck, HeartPulse, ArrowRight, ShieldCheck } from 'lucide-react'

const steps = [
  {
    num: '01',
    icon: Search,
    title: 'Search',
    desc: 'Start with your city or what is bothering you, like back pain or a knee injury.',
    color: 'bg-[#E6F4F3] text-[#00766C]',
  },
  {
    num: '02',
    icon: SlidersHorizontal,
    title: 'Compare',
    desc: 'Check each physiotherapist\u2019s credentials, fees and whether they offer home visits.',
    color: 'bg-[#EAF7F5] text-[#0F766E]',
  },
  {
    num: '03',
    icon: CalendarCheck,
    title: 'Book',
    desc: 'Pick a time that works, confirm with a mobile OTP, and get a confirmation message.',
    color: 'bg-[#FEE9DD] text-[#C4532A]',
  },
  {
    num: '04',
    icon: HeartPulse,
    title: 'Start your session',
    desc: 'Meet your physiotherapist at the clinic or at home, and focus on getting better.',
    color: 'bg-[#FFF1EC] text-[#FF6B35]',
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
                <div className="relative z-10 mb-3 rounded-full border-2 border-slate-100 bg-white px-3 py-1 text-[11px] font-bold text-slate-400 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-colors group-hover:border-[#B2D8D5] group-hover:text-[#00766C]">
                  Step {num}
                </div>

                {/* Icon Circle */}
                <div className={`w-[88px] h-[88px] rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-50 relative z-10 bg-white group-hover:-translate-y-1 transition-transform`}>
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center ${color}`}>
                    <Icon size={24} />
                  </div>
                </div>

                {/* Content */}
                <h3 className="mb-3 text-[18px] font-bold text-slate-900 transition-colors group-hover:text-[#00766C]">
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
                { icon: ShieldCheck, text: 'IAP Verified', color: 'text-[#00766C]' },
                { icon: CalendarCheck, text: 'Instant Confirmation', color: 'text-[#0F766E]' },
                { icon: Search, text: 'No Hidden Fees', color: 'text-[#FF6B35]' },
              ].map(({ icon: Icon, text, color }) => (
              <div key={text} className={`flex items-center gap-2 text-[14px] font-semibold ${color}`}>
                <Icon size={16} />
                {text}
              </div>
            ))}
          </div>
          <Link
            href="/search"
            className="group flex w-full shrink-0 items-center justify-center gap-2 rounded-full bg-[#FF6B35] px-6 py-3.5 text-[14px] font-bold text-white shadow-lg shadow-[#FF6B35]/25 transition-all hover:-translate-y-0.5 hover:bg-[#E0552A] md:w-auto"
          >
            Start searching
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}
