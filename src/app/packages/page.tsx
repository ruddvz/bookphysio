import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Check,
  Crown,
  Sparkles,
  Star,
  Users,
  CalendarCheck,
  Gift,
  IndianRupee,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { PACKAGES } from '@/lib/services'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Session Packs — Save up to 25% — BookPhysio',
  description:
    'Buy physiotherapy session packs on BookPhysio and save up to 25%. Choose from 5, 10, or 20 session bundles with flexible scheduling and verified providers across India.',
  openGraph: {
    title: 'Session Packs — Save up to 25% — BookPhysio',
    description: 'Multi-session physiotherapy packs with progressive discounts. Book verified physiotherapists across India.',
    url: 'https://bookphysio.in/packages',
  },
}

const ACCENT_STYLES: Record<string, { bg: string; border: string; text: string; badgeBg: string; gradientFrom: string; gradientTo: string }> = {
  slate:  { bg: 'bg-slate-50',  border: 'border-slate-200',  text: 'text-slate-700',  badgeBg: 'bg-slate-100',  gradientFrom: 'from-slate-600',  gradientTo: 'to-slate-500'  },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', badgeBg: 'bg-indigo-100', gradientFrom: 'from-indigo-600', gradientTo: 'to-indigo-500' },
  violet: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', badgeBg: 'bg-violet-100', gradientFrom: 'from-violet-600', gradientTo: 'to-violet-500' },
  teal:   { bg: 'bg-teal-50',   border: 'border-teal-200',   text: 'text-teal-700',   badgeBg: 'bg-teal-100',   gradientFrom: 'from-teal-600',   gradientTo: 'to-teal-500'   },
}

const packagesSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'BookPhysio Session Packs',
  description: 'Physiotherapy session packs with progressive discounts',
  itemListElement: PACKAGES.map((pkg, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    item: {
      '@type': 'Offer',
      name: pkg.name,
      description: pkg.description,
      price: pkg.totalPrice,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
    },
  })),
}

export default function PackagesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(packagesSchema) }}
      />
      <Navbar />
      <main>
        {/* Hero */}
        <section
          className="relative pt-28 pb-20 md:pt-36 md:pb-28"
          style={{ background: 'linear-gradient(155deg, #F0EEFF 0%, #E8F8F7 40%, #FFF5F8 75%, #FFF8F0 100%)' }}
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-30"
              style={{ background: 'radial-gradient(circle, #7DCFC9 0%, transparent 70%)' }}
            />
            <div
              className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full opacity-25"
              style={{ background: 'radial-gradient(circle, #C4B5E8 0%, transparent 70%)' }}
            />
          </div>

          <div className="bp-container relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-violet-100 text-violet-700 text-[12px] font-bold uppercase tracking-widest mb-6 backdrop-blur-sm">
                <Sparkles size={14} />
                Save up to 25%
              </div>
              <h1 className="text-[36px] md:text-[52px] font-extrabold tracking-tight leading-[1.08] mb-5" style={{ color: '#2D2B55' }}>
                Session packs for
                <br />
                <span className="text-gradient-lavender">real recovery.</span>
              </h1>
              <p className="text-[17px] md:text-[19px] leading-relaxed max-w-2xl mx-auto mb-8" style={{ color: '#5A5880' }}>
                Most physiotherapy plans need 5–20 sessions. Lock in a pack now and save — with the flexibility to book any IAP-verified provider, at any time.
              </p>
            </div>
          </div>
        </section>

        {/* Packages Grid */}
        <section className="py-20 md:py-28" aria-label="Session packages">
          <div className="bp-container">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {PACKAGES.map((pkg) => {
                const styles = ACCENT_STYLES[pkg.accent] ?? ACCENT_STYLES.slate
                return (
                  <article
                    key={pkg.slug}
                    className={cn(
                      'relative group flex flex-col rounded-2xl border bg-white overflow-hidden',
                      'transition-all duration-200 hover:-translate-y-1 hover:shadow-xl',
                      pkg.recommended ? 'border-violet-300 shadow-lg shadow-violet-200/40' : styles.border,
                    )}
                  >
                    {/* Recommended badge */}
                    {pkg.recommended && (
                      <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-center py-2 text-[12px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">
                        <Crown size={13} />
                        Most popular
                      </div>
                    )}

                    <div className={cn('p-7 flex flex-col flex-1', pkg.recommended && 'pt-14')}>
                      {/* Sessions count */}
                      <div className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold self-start mb-4', styles.badgeBg, styles.text)}>
                        <CalendarCheck size={13} />
                        {pkg.sessions} {pkg.sessions === 1 ? 'session' : 'sessions'}
                      </div>

                      {/* Name & description */}
                      <h3 className="text-slate-900 text-[20px] font-bold mb-2">{pkg.name}</h3>
                      <p className="text-slate-500 text-[14px] leading-relaxed mb-6 flex-1">{pkg.description}</p>

                      {/* Pricing */}
                      <div className="mb-6">
                        <div className="flex items-end gap-2">
                          <span className="text-[36px] font-extrabold text-slate-900 leading-none">₹{pkg.totalPrice.toLocaleString('en-IN')}</span>
                          {pkg.discount > 0 && (
                            <span className="text-[14px] font-bold text-emerald-600 mb-1">
                              {pkg.discount}% off
                            </span>
                          )}
                        </div>
                        <div className="text-[13px] text-slate-400 mt-1">
                          ₹{pkg.perSession}/session · Valid {pkg.validityDays} days
                        </div>
                      </div>

                      {/* Benefits */}
                      <ul className="space-y-2 mb-6">
                        {pkg.benefits.map((benefit) => (
                          <li key={benefit} className="flex items-start gap-2 text-[13px] text-slate-600">
                            <Check size={15} className={cn('shrink-0 mt-0.5', styles.text)} />
                            {benefit}
                          </li>
                        ))}
                      </ul>

                      {/* CTA */}
                      <Link
                        href="/search"
                        className={cn(
                          'flex items-center justify-center gap-2 py-3.5 rounded-xl text-[14px] font-bold transition-all group/btn',
                          pkg.recommended
                            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-violet-500/25 hover:-translate-y-0.5'
                            : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700',
                        )}
                      >
                        {pkg.sessions === 1 ? 'Book a session' : 'Get this pack'}
                        <ArrowRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-16 md:py-24 bg-slate-50 border-y border-slate-100" aria-label="Package comparison">
          <div className="bp-container">
            <div className="text-center mb-12">
              <div className="bp-kicker mb-4 mx-auto">Compare packs</div>
              <h2 className="text-slate-900 tracking-tight">Side by side.</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse">
                <thead>
                  <tr>
                    <th className="text-left text-[13px] font-bold text-slate-400 uppercase tracking-widest pb-4 pl-4">Feature</th>
                    {PACKAGES.map((pkg) => (
                      <th key={pkg.slug} className={cn('text-center text-[14px] font-bold pb-4', pkg.recommended ? 'text-violet-700' : 'text-slate-700')}>
                        {pkg.name}
                        {pkg.recommended && <Star size={12} className="inline-block ml-1 text-violet-500" />}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {[
                    { label: 'Sessions', values: PACKAGES.map(p => String(p.sessions)) },
                    { label: 'Per session', values: PACKAGES.map(p => `₹${p.perSession}`) },
                    { label: 'Total price', values: PACKAGES.map(p => `₹${p.totalPrice.toLocaleString('en-IN')}`) },
                    { label: 'Savings', values: PACKAGES.map(p => p.discount > 0 ? `${p.discount}%` : '—') },
                    { label: 'Validity', values: PACKAGES.map(p => `${p.validityDays} days`) },
                    { label: 'Progress tracking', values: PACKAGES.map(p => p.benefits.some(b => b.toLowerCase().includes('progress')) ? '✓' : '—') },
                    { label: 'Priority rebooking', values: PACKAGES.map(p => p.benefits.some(b => b.toLowerCase().includes('priority')) ? '✓' : '—') },
                    { label: 'Review sessions', values: PACKAGES.map(p => {
                      const review = p.benefits.find(b => b.toLowerCase().includes('review'))
                      if (!review) return '—'
                      if (review.toLowerCase().includes('monthly')) return 'Monthly'
                      if (review.toLowerCase().includes('mid-course')) return 'Mid-course'
                      return '✓'
                    }) },
                    { label: 'Family transferable', values: PACKAGES.map(p => p.benefits.some(b => b.toLowerCase().includes('transferable')) ? '✓' : '—') },
                  ].map(({ label, values }) => (
                    <tr key={label} className="hover:bg-white transition-colors">
                      <td className="py-3.5 pl-4 text-[14px] font-medium text-slate-600">{label}</td>
                      {values.map((val, i) => (
                        <td
                          key={`${label}-${i}`}
                          className={cn(
                            'py-3.5 text-center text-[14px]',
                            val === '✓' ? 'text-emerald-600 font-bold' : val === '—' ? 'text-slate-300' : 'text-slate-700 font-semibold',
                          )}
                        >
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Trust / How it works strip */}
        <section className="py-20 md:py-28" aria-label="How session packs work">
          <div className="bp-container">
            <div className="text-center mb-14">
              <div className="bp-kicker mb-4 mx-auto">How session packs work</div>
              <h2 className="text-slate-900 tracking-tight">Simple and flexible.</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
              {[
                {
                  icon: IndianRupee,
                  title: 'Buy a pack',
                  desc: 'Choose the number of sessions you need. Pay once upfront via UPI, card, or netbanking through Razorpay.',
                  color: 'text-indigo-600',
                  bg: 'bg-indigo-50',
                },
                {
                  icon: Users,
                  title: 'Book any provider',
                  desc: 'Your pack works with any IAP-verified physiotherapist on BookPhysio. Clinic or home visit — your choice, each time.',
                  color: 'text-violet-600',
                  bg: 'bg-violet-50',
                },
                {
                  icon: Gift,
                  title: 'Track your progress',
                  desc: 'Your physiotherapist logs progress after each session. Review it in your patient dashboard alongside remaining sessions.',
                  color: 'text-teal-600',
                  bg: 'bg-teal-50',
                },
              ].map(({ icon: Icon, title, desc, color, bg }) => (
                <div
                  key={title}
                  className="flex flex-col items-center text-center p-7 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center mb-5', bg)}>
                    <Icon size={24} className={color} />
                  </div>
                  <h3 className="text-slate-900 text-[17px] font-bold mb-2">{title}</h3>
                  <p className="text-slate-500 text-[14px] leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services cross-link CTA */}
        <section className="bg-slate-950 py-16 md:py-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[100px]" />
          <div className="bp-container relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h2 className="text-white text-[28px] md:text-[36px] font-extrabold tracking-tight mb-3">
                  Not sure what you need?
                </h2>
                <p className="text-slate-400 text-[16px] max-w-lg">
                  Browse our full range of physiotherapy services — from initial assessments to sports rehab and neuro rehabilitation.
                </p>
              </div>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 px-7 py-4 bg-white text-slate-900 rounded-xl font-bold text-[15px] hover:bg-slate-100 transition-all hover:-translate-y-0.5 group shrink-0"
              >
                View all services
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 md:py-28 bg-slate-50 border-t border-slate-100" aria-label="Package FAQs">
          <div className="bp-container">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <div className="bp-kicker mb-4 mx-auto">Common questions</div>
                <h2 className="text-slate-900 tracking-tight">About session packs</h2>
              </div>

              <div className="space-y-4">
                {[
                  {
                    q: 'Can I use my session pack with different physiotherapists?',
                    a: 'Yes. Your pack is linked to your BookPhysio account, not to a specific provider. You can book any IAP-verified physiotherapist on the platform for each session.',
                  },
                  {
                    q: 'What if I don\'t use all sessions before the pack expires?',
                    a: 'Unused sessions can be extended by contacting support. We also offer full refunds on unused sessions if requested within the validity period.',
                  },
                  {
                    q: 'Can I use session packs for home visits?',
                    a: 'Yes. You can use pack sessions for either clinic or home visits. If a home visit has a higher fee than the pack\'s per-session rate, you pay only the difference.',
                  },
                  {
                    q: 'Is the 20-session pack really transferable to family members?',
                    a: 'Yes. The 20-session pack can be shared among immediate family members registered on the same BookPhysio account. Each family member books under their own profile for proper treatment tracking.',
                  },
                  {
                    q: 'How is payment handled?',
                    a: 'You pay the full pack price upfront through Razorpay (UPI, cards, netbanking). A detailed invoice with GST breakdown is sent to your email. Individual sessions within the pack don\'t require additional payment.',
                  },
                ].map(({ q, a }) => (
                  <details
                    key={q}
                    className="group p-6 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-colors"
                  >
                    <summary className="flex items-center justify-between cursor-pointer text-[15px] font-semibold text-slate-900 list-none">
                      {q}
                      <ArrowRight size={16} className="text-slate-400 group-open:rotate-90 transition-transform shrink-0 ml-4" />
                    </summary>
                    <p className="mt-3 text-slate-500 text-[14px] leading-relaxed">{a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
