'use client'

import Link from 'next/link'
import { ArrowRight, CalendarCheck, Search, ShieldCheck, SlidersHorizontal, Sparkles } from 'lucide-react'

const steps = [
  {
    step: '01',
    icon: Search,
    title: 'Search with context',
    description: 'Start with the condition, then narrow by city, visit type, or fee range without leaving the page.',
  },
  {
    step: '02',
    icon: SlidersHorizontal,
    title: 'Compare verified options',
    description: 'Read credentials, reviews, and availability together so the shortlist stays easy to compare.',
  },
  {
    step: '03',
    icon: CalendarCheck,
    title: 'Book in a few taps',
    description: 'Pick a slot, confirm the session, and keep the handoff focused on care instead of friction.',
  },
]

function StepCard({ step, icon: Icon, title, description }: (typeof steps)[number]) {
  return (
    <div className="bp-card group flex h-full flex-col p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#0f7668]/20 md:p-7">
      <div className="flex items-start justify-between gap-4">
        <div className="inline-flex h-11 items-center rounded-xl border border-bp-border bg-white px-4 text-[12px] font-bold uppercase tracking-[0.18em] text-bp-body/40">
          {step}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-bp-surface text-bp-accent transition-all duration-300 group-hover:scale-105 group-hover:bg-bp-accent/10">
          <Icon size={20} />
        </div>
      </div>

      <h3 className="mt-6 text-[24px] font-semibold tracking-[-0.04em] text-[#18312d] group-hover:text-[#0f7668]">
        {title}
      </h3>
      <p className="mt-3 text-[15px] leading-7 text-[#66706b]">{description}</p>
    </div>
  )
}

export default function HowItWorks() {
  return (
    <section className="bp-section border-y border-bp-border/10 bg-bp-surface" aria-label="How booking works">
      <div className="bp-shell">
        <div className="flex flex-col items-start gap-6 text-left lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="bp-kicker mb-5">
              <Sparkles size={13} />
              Simple workflow
            </div>
            <h2 className="bp-title">The booking flow should read in one pass.</h2>
            <p className="bp-copy mt-4 max-w-xl">
              Find a verified physiotherapist, check their availability, and book your session in under 60 seconds.
            </p>
          </div>

          <Link
            href="/search"
            className="bp-button-primary"
          >
            Start searching
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {steps.map((step) => (
            <StepCard key={step.step} {...step} />
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-4 rounded-3xl border border-bp-border bg-white px-6 py-6 md:flex-row md:items-center md:justify-between shadow-xl shadow-bp-primary/5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f7668]">Trust signal</p>
            <p className="mt-2 text-[18px] font-semibold tracking-[-0.03em] text-[#18312d]">
              Verified care, transparent fees, and booking that works on mobile.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['ICP verified', 'Home visit ready', 'UPI accepted'].map((item) => (
              <span key={item} className="bp-chip bp-chip-active">
                <ShieldCheck size={14} />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}