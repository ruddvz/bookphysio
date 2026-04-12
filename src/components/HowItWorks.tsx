import Link from 'next/link'
import Image from 'next/image'
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
    color: 'bg-violet-50 text-violet-600',
  },
  {
    num: '03',
    icon: CalendarCheck,
    title: 'Book',
    desc: 'Pick a time that works, confirm with a mobile OTP, and get a confirmation message.',
    color: 'bg-amber-50 text-amber-600',
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
    <section className="py-24 md:py-32 bg-white relative overflow-hidden" aria-label="How booking works">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #00766C 0%, transparent 70%)' }}
        />
      </div>

      <div className="bp-container z-10 relative">
        {/* Header + character */}
        <div className="grid lg:grid-cols-[1fr_260px] gap-8 items-end mb-16">
          <div className="max-w-2xl">
            <div className="bp-kicker mb-4">How it works</div>
            <h2 className="text-slate-900 mb-4 tracking-tight">Four steps from search to session.</h2>
            <p className="text-slate-500 text-[17px] leading-relaxed">
              Finding a physiotherapist should not feel like a research project. On BookPhysio, most people go from their first search to a confirmed booking in under a minute.
            </p>
          </div>

          {/* Physio character — desktop decoration */}
          <div className="hidden lg:flex justify-center items-end" aria-hidden="true">
            <div className="relative">
              <div
                className="w-[200px] h-[200px] rounded-full absolute bottom-0 left-1/2 -translate-x-1/2"
                style={{ background: 'linear-gradient(145deg, #E6F4F3 0%, #B2D8D5 100%)' }}
              />
              <Image
                src="/images/physio-male.png"
                alt=""
                aria-hidden="true"
                width={200}
                height={280}
                className="relative z-10 object-contain object-bottom"
                sizes="(min-width: 1024px) 200px, 0px"
              />
            </div>
          </div>
        </div>

        {/* Steps sequence */}
        <div className="relative mt-4">
          {/* Desktop connecting line */}
          <div className="hidden lg:block absolute top-[52px] left-[14%] right-[14%] h-px bg-gradient-to-r from-[#00766C]/20 via-[#00766C]/40 to-rose-400/20 -z-0" />

          <div className="grid gap-6 lg:gap-4 lg:grid-cols-4">
            {steps.map(({ num, icon: Icon, title, desc, color }, i) => (
              <div
                key={num}
                className="relative group flex flex-col items-center text-center px-2"
              >
                {/* Arrow between steps */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-[44px] -right-[10px] z-10">
                    <ArrowRight size={18} style={{ color: '#CBD5E1' }} />
                  </div>
                )}

                {/* Step number pill */}
                <div className="bg-white border border-slate-200 text-slate-400 font-bold text-[11px] px-3 py-1 rounded-full mb-3 shadow-[0_1px_4px_rgba(0,0,0,0.06)] relative z-10 group-hover:border-[#00766C]/30 group-hover:text-[#00766C] transition-colors">
                  Step {num}
                </div>

                {/* Icon Circle */}
                <div className="w-[88px] h-[88px] rounded-full flex items-center justify-center mb-5 shadow-sm border border-slate-100 relative z-10 bg-white group-hover:-translate-y-1 transition-transform duration-200">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center ${color}`}>
                    <Icon size={24} />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-slate-900 text-[17px] font-bold mb-2 group-hover:text-[#00766C] transition-colors">
                  {title}
                </h3>
                <p className="text-slate-500 text-[14px] leading-relaxed max-w-[210px]">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom trust bar */}
        <div className="mt-20 flex flex-col md:flex-row items-center justify-between gap-6 px-8 py-5 rounded-2xl border border-slate-200 bg-[#F7F8F9] shadow-sm max-w-5xl mx-auto">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
            {[
              { icon: ShieldCheck, text: 'IAP Verified', color: 'text-[#00766C]' },
              { icon: CalendarCheck, text: 'Instant Confirmation', color: 'text-[#00766C]' },
              { icon: Search, text: 'No Hidden Fees', color: 'text-slate-500' },
            ].map(({ icon: Icon, text, color }) => (
              <div key={text} className={`flex items-center gap-2 text-[13px] font-semibold ${color}`}>
                <Icon size={15} />
                {text}
              </div>
            ))}
          </div>
          <Link
            href="/search"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#00766C] text-white rounded-full text-[14px] font-bold hover:bg-[#005A52] hover:-translate-y-0.5 shadow-[0_4px_16px_rgba(0,118,108,0.30)] transition-all group shrink-0 w-full md:w-auto"
          >
            Start searching
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}