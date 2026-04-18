'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { Quote, ArrowUpRight, CheckCircle } from 'lucide-react'
import { revealOnScroll, useGSAP } from '@/lib/gsap-client'

// Pull-quote is illustrative until we publish a real provider testimonial.
// Phrasing mirrors the kind of thing physios have told us in onboarding calls.
const testimonial = {
  quote:
    'I used to run my clinic on WhatsApp and a paper diary. The first month on BookPhysio I got nine new bookings from patients I would never have met otherwise — and the OTP step means almost nobody no-shows.',
  attribution: 'A BookPhysio physio · Pune',
  tenure: 'Using BookPhysio since month one',
}

// Headline stats — grounded in what the platform offers (no made-up numbers).
const stats = [
  {
    value: 'New patients',
    label: 'from outside your usual referral network',
    support: 'Patients search by specialty and location — you show up wherever you practise.',
  },
  {
    value: 'OTP-confirmed',
    label: 'bookings with automated reminders',
    support: 'Every confirmed booking is held by an OTP. Reminders go out automatically.',
  },
  {
    value: 'One workspace',
    label: 'for calendar, notes, invoices & payouts',
    support: 'See today\u2019s schedule, send an invoice, and track payouts in the same place.',
  },
]

const trustSignals = [
  'Free to list your practice',
  'Approval typically in 48 hours',
  'No subscription fees',
]

export default function ProviderCTA() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      // Testimonial slides in from the left.
      revealOnScroll('[data-cta-testimonial]', {
        y: 0,
        x: -40,
        duration: 0.8,
        trigger: '[data-cta-testimonial]',
      })

      // Stat cards rise in sequence on the right.
      revealOnScroll('[data-cta-stat]', {
        y: 24,
        duration: 0.6,
        stagger: 0.12,
        trigger: '[data-cta-stats]',
      })
    },
    { scope },
  )

  return (
    <section
      ref={scope}
      className="relative z-0 isolate py-24 md:py-32 bg-slate-950 overflow-hidden"
      aria-label="For physiotherapists"
    >
      {/* Subtle background accents */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #C7CEEF 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="absolute -top-40 -right-40 w-[520px] h-[520px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-[460px] h-[460px] bg-[#00766C]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="bp-container relative">
        <div className="grid gap-16 lg:grid-cols-[1.1fr_1fr] lg:items-start">

          {/* Left: testimonial */}
          <div data-cta-testimonial className="lg:sticky lg:top-24 order-2 lg:order-1">
            <div
              className="bp-kicker mb-6"
              style={{
                background: 'rgba(199,206,239,0.08)',
                borderColor: 'rgba(199,206,239,0.15)',
                color: '#C7CEEF',
              }}
            >
              For physiotherapists
            </div>

            <h2 className="text-white text-[34px] md:text-[44px] font-extrabold tracking-tight leading-[1.08] mb-10">
              Keep your calendar full,
              <br />
              <span className="text-gradient-lavender">without chasing leads.</span>
            </h2>

            <figure className="rounded-[var(--sq-lg)] border border-white/8 bg-white/[0.03] backdrop-blur-sm p-7 md:p-9">
              <Quote
                size={28}
                className="text-[#C7CEEF] mb-5 opacity-70"
                aria-hidden="true"
              />
              <blockquote className="text-slate-100 text-[18px] md:text-[19px] leading-[1.55] font-medium">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between gap-4">
                <div>
                  <div className="text-white text-[14px] font-semibold">
                    {testimonial.attribution}
                  </div>
                  <div className="text-slate-500 text-[12px] mt-0.5">
                    {testimonial.tenure}
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 border border-white/10 rounded-full px-2 py-1">
                  Illustrative
                </span>
              </figcaption>
            </figure>
          </div>

          {/* Right: stats + CTA */}
          <div data-cta-stats className="order-1 lg:order-2 flex flex-col gap-4">
            {stats.map((s, i) => (
              <div
                key={s.value}
                data-cta-stat
                className="rounded-[var(--sq-lg)] border border-white/8 bg-gradient-to-br from-white/[0.04] to-white/[0.015] p-6 md:p-7 hover:border-white/15 transition-colors"
              >
                <div className="flex items-baseline gap-4">
                  <span
                    className="text-[13px] font-bold uppercase tracking-widest text-slate-500 w-6 tabular-nums shrink-0"
                    aria-hidden="true"
                  >
                    0{i + 1}
                  </span>
                  <div>
                    <div className="text-white text-[20px] md:text-[22px] font-bold leading-tight">
                      {s.value}
                    </div>
                    <div className="text-slate-300 text-[15px] mt-1">{s.label}</div>
                  </div>
                </div>
                <p className="text-slate-500 text-[13px] leading-relaxed mt-4 pl-10">
                  {s.support}
                </p>
              </div>
            ))}

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <Link
                href="/doctor-signup"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-[#FF6B35] text-white rounded-full font-bold text-[15px] hover:bg-[#e85f2e] transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/20 group"
              >
                List your practice
                <ArrowUpRight
                  size={16}
                  className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                />
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center gap-2 px-5 py-4 text-slate-300 hover:text-white text-[14px] font-semibold transition-colors"
              >
                See how onboarding works
              </Link>
            </div>

            <ul className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 pt-4 border-t border-white/5">
              {trustSignals.map((t) => (
                <li key={t} className="flex items-center gap-1.5 text-slate-400 text-[12px]">
                  <CheckCircle size={13} className="text-[#00766C] shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
