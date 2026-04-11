import Link from 'next/link'
import { ArrowRight, Check, Crown, Sparkles, CalendarCheck } from 'lucide-react'
import { PACKAGES } from '@/lib/services'
import { cn } from '@/lib/utils'

const ACCENT_STYLES: Record<string, { bg: string; text: string; badgeBg: string }> = {
  slate:  { bg: 'bg-slate-50',  text: 'text-slate-700',  badgeBg: 'bg-slate-100'  },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', badgeBg: 'bg-indigo-100' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-700', badgeBg: 'bg-violet-100' },
  teal:   { bg: 'bg-teal-50',   text: 'text-teal-700',   badgeBg: 'bg-teal-100'   },
}

/** Multi-session packs shown between ProviderCTA and Testimonials on the homepage. */
export default function FeaturedPackages() {
  return (
    <section className="py-24 md:py-32 relative" aria-label="Session packs">
      <div className="bp-container">
        {/* Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-14">
          <div className="max-w-xl">
            <div className="bp-kicker mb-4">Session packs</div>
            <h2 className="text-slate-900 mb-3 tracking-tight">
              Recovery takes more than one session.
            </h2>
            <p className="text-slate-500 text-[16px] leading-relaxed">
              Most treatment plans need 5–20 sessions. Commit to a pack upfront and save up to 25% — with the flexibility to book any provider, any time.
            </p>
          </div>

          <Link
            href="/packages"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-[14px] font-semibold hover:border-indigo-200 hover:text-indigo-700 transition-all group shrink-0 self-start lg:self-auto"
          >
            Compare all packs
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Cards */}
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {PACKAGES.map((pkg) => {
            const styles = ACCENT_STYLES[pkg.accent] ?? ACCENT_STYLES.slate
            return (
              <article
                key={pkg.slug}
                className={cn(
                  'relative group flex flex-col p-6 rounded-2xl border bg-white',
                  'transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/60',
                  pkg.recommended
                    ? 'border-violet-300 shadow-md shadow-violet-200/30'
                    : 'border-slate-200',
                )}
              >
                {/* Recommended label */}
                {pkg.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap">
                    <Crown size={10} />
                    Most popular
                  </div>
                )}

                {/* Session count pill */}
                <div className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold self-start mb-4', styles.badgeBg, styles.text)}>
                  <CalendarCheck size={12} />
                  {pkg.sessions} {pkg.sessions === 1 ? 'session' : 'sessions'}
                </div>

                {/* Name */}
                <h3 className="text-slate-900 text-[17px] font-bold mb-1">{pkg.name}</h3>
                <p className="text-slate-500 text-[13px] leading-relaxed mb-5 flex-1 line-clamp-2">{pkg.description}</p>

                {/* Price */}
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-[28px] font-extrabold text-slate-900 leading-none">₹{pkg.totalPrice.toLocaleString('en-IN')}</span>
                  {pkg.discount > 0 && (
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[12px] font-bold mb-0.5">
                      <Sparkles size={10} />
                      {pkg.discount}% off
                    </span>
                  )}
                </div>
                <div className="text-[12px] text-slate-400 mb-5">₹{pkg.perSession}/session · {pkg.validityDays} day validity</div>

                {/* Top benefits (max 3 on homepage) */}
                <ul className="space-y-1.5 mb-5">
                  {pkg.benefits.slice(0, 3).map((b) => (
                    <li key={b} className="flex items-start gap-2 text-[12px] text-slate-600">
                      <Check size={13} className={cn('shrink-0 mt-0.5', styles.text)} />
                      {b}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href="/packages"
                  className={cn(
                    'flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold transition-all group/btn',
                    pkg.recommended
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:shadow-md hover:shadow-violet-500/25'
                      : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700',
                  )}
                >
                  {pkg.sessions === 1 ? 'Book now' : 'Get this pack'}
                  <ArrowRight size={13} className="group-hover/btn:translate-x-0.5 transition-transform" />
                </Link>
              </article>
            )
          })}
        </div>

        {/* Bottom trust strip */}
        <div className="mt-8 flex flex-wrap items-center gap-3 px-5 py-4 rounded-2xl bg-white border border-slate-200">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[12px] font-semibold">
            Razorpay-secured payments
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-[12px] font-semibold">
            Use with any provider
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-[12px] font-semibold">
            Full refund on unused sessions
          </div>
          <p className="ml-auto text-[12px] text-slate-400 font-medium hidden md:block">
            All prices inclusive of GST
          </p>
        </div>
      </div>
    </section>
  )
}
