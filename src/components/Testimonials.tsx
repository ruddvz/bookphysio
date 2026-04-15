import Image from 'next/image'
import { ShieldCheck, Clock, Home } from 'lucide-react'

const promises = [
  {
    title: 'Verified credentials',
    description: 'We check every physiotherapist against their IAP or State Council registration before their profile goes live on the site.',
    icon: ShieldCheck,
    color: 'text-[#00766C]',
    bg: 'bg-[#E6F4F3]',
  },
  {
    title: 'Clear pricing',
    description: 'You see the session fee and any taxes before you book. The amount you pay at the end is the amount you saw at the start.',
    icon: Clock,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
  {
    title: 'Clinic or home visit',
    description: 'Filter by home visit or in-clinic, compare providers side by side, and book whichever option fits your day better.',
    icon: Home,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
]

export default function Testimonials() {
  return (
    <section className="bg-[#E6F4F3] py-24 md:py-32" aria-label="Platform promises">
      <div className="bp-container">
        <div className="grid gap-16 lg:grid-cols-2 items-center">

          {/* Left: kicker + heading + quote + female physio */}
          <div className="relative">
            <div
              className="bp-kicker mb-4"
              style={{ background: 'rgba(0,118,108,0.1)', borderColor: 'rgba(0,118,108,0.25)', color: '#00766C' }}
            >
              What to expect
            </div>
            <h2 className="text-slate-900 mb-4">Straightforward, start to finish.</h2>
            <p className="text-slate-600 text-[16px] leading-relaxed mb-8">
              We are a new platform, so here is what we are promising from day one: verified providers, honest prices and no unnecessary steps.
            </p>

            {/* Pull quote */}
            <div className="bg-white rounded-[var(--sq-lg)] p-7 border border-[#00766C]/15 shadow-sm relative overflow-hidden">
              <div className="text-[64px] font-serif text-[#00766C]/15 leading-none -mt-3 -ml-1 mb-1 select-none">&ldquo;</div>
              <p className="text-slate-700 text-[17px] leading-relaxed font-medium italic">
                We only list physiotherapists we&rsquo;ve verified ourselves. That&rsquo;s the whole product.
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#E6F4F3] border-2 border-[#00766C]/20 flex items-center justify-center">
                  <ShieldCheck size={15} className="text-[#00766C]" />
                </div>
                <span className="text-[13px] font-semibold text-slate-500">The BookPhysio team</span>
              </div>
            </div>

            {/* Female physio character */}
            <div className="hidden lg:flex justify-end mt-6 pointer-events-none select-none">
              <Image
                src="/images/physio-female.png"
                alt=""
                width={150}
                height={230}
                className="object-contain object-bottom"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Right: 3 promise cards */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[13px] font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                All providers verified
              </span>
            </div>

            {promises.map(p => (
              <article
                key={p.title}
                className="flex gap-4 p-6 bg-white rounded-[var(--sq-lg)] border border-[#00766C]/10 hover:border-[#00766C]/25 hover:shadow-md hover:shadow-[#00766C]/5 transition-all duration-200"
              >
                <div className={`w-11 h-11 rounded-[var(--sq-sm)] ${p.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                  <p.icon size={20} className={p.color} />
                </div>
                <div>
                  <h3 className="text-slate-900 text-[16px] font-semibold mb-1.5">{p.title}</h3>
                  <p className="text-slate-500 text-[14px] leading-relaxed">{p.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
