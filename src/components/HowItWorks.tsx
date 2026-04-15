import Image from 'next/image'
import Link from 'next/link'
import { Search, SlidersHorizontal, CalendarCheck, HeartPulse, ArrowRight, ShieldCheck } from 'lucide-react'

const steps = [
  {
    num: '01',
    icon: Search,
    title: 'Search',
    desc: 'Start with your city or what is bothering you, like back pain or a knee injury.',
    color: 'bg-indigo-50 text-indigo-600',
    accent: 'group-hover:border-indigo-200',
  },
  {
    num: '02',
    icon: SlidersHorizontal,
    title: 'Compare',
    desc: 'Check each physiotherapist\u2019s credentials, fees and whether they offer home visits.',
    color: 'bg-violet-50 text-violet-600',
    accent: 'group-hover:border-violet-200',
  },
  {
    num: '03',
    icon: CalendarCheck,
    title: 'Book',
    desc: 'Pick a time that works, confirm with a mobile OTP, and get a confirmation message.',
    color: 'bg-teal-50 text-[#00766C]',
    accent: 'group-hover:border-[#00766C]/30',
  },
  {
    num: '04',
    icon: HeartPulse,
    title: 'Start your session',
    desc: 'Meet your physiotherapist at the clinic or at home, and focus on getting better.',
    color: 'bg-rose-50 text-rose-600',
    accent: 'group-hover:border-rose-200',
  },
]

export default function HowItWorks() {
  return (
    <section className="bg-[#F7F8F9] py-24 md:py-32 relative" aria-label="How booking works">
      <div className="bp-container z-10 relative">
        {/* Header */}
        <div className="max-w-2xl mb-16 mx-auto text-center relative">
          <div className="bp-kicker mb-4 mx-auto">How it works</div>
          <h2 className="text-slate-900 mb-4 tracking-tight">Four steps from search to session.</h2>
          <p className="text-slate-500 text-[17px] leading-relaxed">
            Finding a physiotherapist should not feel like a research project. On BookPhysio, most people go from their first search to a confirmed booking in under a minute.
          </p>

          {/* Male physio — desktop only, anchors the header visually */}
          <div className="hidden lg:block absolute -right-36 top-1/2 -translate-y-1/2 pointer-events-none select-none">
            <Image
              src="/images/physio-male.png"
              alt=""
              width={160}
              height={240}
              className="object-contain drop-shadow-xl"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Steps sequence */}
        <div className="relative mt-8">
          {/* Desktop connecting line — teal gradient */}
          <div className="hidden lg:block absolute top-[36px] left-[12%] right-[12%] h-[2px] bg-gradient-to-r from-[#E6F4F3] via-[#00766C]/30 to-[#E6F4F3] -z-10" />

          <div className="grid gap-8 lg:gap-4 lg:grid-cols-4">
            {steps.map(({ num, icon: Icon, title, desc, color }) => (
              <div
                key={num}
                className="relative group flex flex-col bg-white rounded-[var(--sq-lg)] border border-slate-200 p-6 hover:border-[#00766C]/30 hover:shadow-lg hover:shadow-[#00766C]/5 transition-all duration-200 overflow-hidden"
              >
                {/* Teal left accent */}
                <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-full bg-[#00766C] opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Step number */}
                <div className="text-[11px] font-bold uppercase tracking-widest text-slate-300 mb-4 group-hover:text-[#00766C]/60 transition-colors">
                  Step {num}
                </div>

                {/* Icon */}
                <div className={`w-12 h-12 rounded-[var(--sq-sm)] flex items-center justify-center mb-5 ${color}`}>
                  <Icon size={22} />
                </div>

                {/* Content */}
                <h3 className="text-slate-900 text-[17px] font-bold mb-2 group-hover:text-[#00766C] transition-colors">{title}</h3>
                <p className="text-slate-500 text-[14px] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom trust bar */}
        <div className="mt-20 flex flex-col md:flex-row items-center justify-between gap-6 px-8 py-5 rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/20 max-w-5xl mx-auto">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
            {[
              { icon: ShieldCheck,   text: 'IAP Verified',          color: 'text-[#00766C]' },
              { icon: CalendarCheck, text: 'Instant Confirmation',   color: 'text-teal-600'  },
              { icon: Search,        text: 'No Hidden Fees',         color: 'text-slate-500' },
            ].map(({ icon: Icon, text, color }) => (
              <div key={text} className={`flex items-center gap-2 text-[14px] font-semibold ${color}`}>
                <Icon size={16} />
                {text}
              </div>
            ))}
          </div>
          <Link
            href="/search"
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#00766C] text-white rounded-full text-[14px] font-bold hover:bg-[#005A52] hover:-translate-y-0.5 shadow-lg shadow-[#00766C]/30 transition-all group shrink-0 w-full md:w-auto"
          >
            Start searching
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}
