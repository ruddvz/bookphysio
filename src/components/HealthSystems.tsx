import Image from 'next/image'
import Link from 'next/link'
import { BadgeCheck, Clock3, Home, ShieldCheck, ArrowRight } from 'lucide-react'

const features = [
  {
    icon: BadgeCheck,
    title: 'Verified clinicians',
    desc: "Each profile shows the provider's registration number, qualifications and specialties, so you know who you are booking.",
    color: 'text-[#7DCFC9]',
    bg: 'bg-[#7DCFC9]/10',
  },
  {
    icon: Home,
    title: 'Clinic or at home',
    desc: 'Providers list both options where they offer them, with separate fees and travel areas for home visits.',
    color: 'text-violet-400',
    bg: 'bg-violet-400/10',
  },
  {
    icon: Clock3,
    title: 'Real availability',
    desc: "You see the slots that are actually open on each provider's calendar, not a generic booking form.",
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
  },
  {
    icon: ShieldCheck,
    title: 'Clear pricing',
    desc: 'Fees, GST and the payment method are shown before you confirm, so the total never changes on you.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
  },
]

const checkItems = [
  'IAP or State Council verified',
  'In-clinic + home visit modes',
  'Transparent INR pricing',
  'Mobile-first booking flow',
]

export default function HealthSystems() {
  return (
    <section className="bg-[#1A1C29] py-24 md:py-32 relative overflow-hidden" aria-label="Platform trust signals">
      {/* Background glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00766C]/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="bp-container relative z-10">
        <div className="grid gap-12 lg:grid-cols-[1fr_260px_1fr] items-center">

          {/* Left: text + checklist + CTAs */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E6F4F3]/10 border border-[#00766C]/30 text-[#7DCFC9] text-[11px] font-bold uppercase tracking-widest mb-6">
              Built for trust
            </div>
            <h2 className="text-white text-[32px] md:text-[40px] font-extrabold tracking-tight leading-[1.1] mb-4">
              Everything you need<br />before you book.
            </h2>
            <p className="text-slate-400 text-[16px] leading-relaxed mb-8">
              Credentials, visit format, fees and availability are all on the same page, so you can make a decision without opening five tabs.
            </p>

            <div className="space-y-3 mb-8">
              {checkItems.map(item => (
                <div key={item} className="flex items-center gap-3 text-[14px] font-medium text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-[#00766C]/20 border border-[#00766C]/40 flex items-center justify-center shrink-0">
                    <ShieldCheck size={11} className="text-[#7DCFC9]" />
                  </div>
                  {item}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/search" className="inline-flex items-center gap-2 px-6 py-3 bg-[#00766C] text-white rounded-[var(--sq-sm)] font-semibold text-[14px] hover:bg-[#005A52] transition-colors group">
                Browse providers
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link href="/how-it-works" className="inline-flex items-center gap-2 px-6 py-3 border border-white/15 text-slate-300 rounded-[var(--sq-sm)] font-semibold text-[14px] hover:border-white/30 hover:text-white transition-colors">
                See how it works
              </Link>
            </div>
          </div>

          {/* Centre: male physio */}
          <div className="hidden lg:flex items-end justify-center">
            <Image
              src="/images/characters/physio-male-arms-crossed.png"
              alt=""
              width={240}
              height={360}
              className="object-contain drop-shadow-2xl pointer-events-none select-none"
              aria-hidden="true"
            />
          </div>

          {/* Right: feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
            {features.map(({ icon: Icon, title, desc, color, bg }) => (
              <div
                key={title}
                className="p-5 rounded-[var(--sq-lg)] border border-white/8 bg-white/5 hover:bg-white/8 hover:border-white/15 transition-all duration-200"
              >
                <div className={`w-10 h-10 rounded-[var(--sq-sm)] ${bg} flex items-center justify-center mb-4`}>
                  <Icon size={18} className={color} />
                </div>
                <h3 className="text-white font-semibold text-[14px] mb-1.5">{title}</h3>
                <p className="text-slate-400 text-[12px] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
