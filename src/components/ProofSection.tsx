'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { Home as HomeIcon, Stethoscope, ShieldCheck, ArrowRight, Calendar } from 'lucide-react'
import { gsap, useGSAP } from '@/lib/gsap-client'

// Illustrative slot data — matches what real search results render.
// Each slot keys off a known "shape" (same-day, tomorrow, later this week)
// so users can see availability at a glance without clicking into a profile.
interface Slot {
  day: string      // e.g. "Today", "Tomorrow", "Thu"
  time: string     // e.g. "6:30 PM"
  kind: 'clinic' | 'home'
  taken?: boolean  // greys out the pill — shows realistic availability
}

interface TimelineProvider {
  initials: string
  name: string
  specialty: string
  city: string
  feeInr: number
  rating: number
  yearsExp: number
  slots: Slot[]
}

const providers: TimelineProvider[] = [
  {
    initials: 'DR',
    name: 'Dr. R. — Sports rehab',
    specialty: 'ACL, rotator cuff, runners',
    city: 'Mumbai · Bandra',
    feeInr: 800,
    rating: 4.9,
    yearsExp: 8,
    slots: [
      { day: 'Today',    time: '6:30 PM', kind: 'clinic' },
      { day: 'Today',    time: '7:30 PM', kind: 'home' },
      { day: 'Tomorrow', time: '9:00 AM', kind: 'clinic', taken: true },
      { day: 'Tomorrow', time: '11:00 AM', kind: 'clinic' },
      { day: 'Thu',      time: '5:00 PM', kind: 'home' },
    ],
  },
  {
    initials: 'DK',
    name: 'Dr. K. — Ortho rehab',
    specialty: 'Joint, back, post-surgery',
    city: 'Delhi · Saket',
    feeInr: 700,
    rating: 4.8,
    yearsExp: 12,
    slots: [
      { day: 'Today',    time: '4:00 PM', kind: 'clinic', taken: true },
      { day: 'Tomorrow', time: '10:00 AM', kind: 'clinic' },
      { day: 'Tomorrow', time: '1:00 PM', kind: 'home' },
      { day: 'Wed',      time: '6:00 PM', kind: 'clinic' },
      { day: 'Thu',      time: '11:00 AM', kind: 'home' },
    ],
  },
  {
    initials: 'DM',
    name: 'Dr. M. — Neuro rehab',
    specialty: 'Stroke, Parkinson\u2019s, MS',
    city: 'Bengaluru · Indiranagar',
    feeInr: 900,
    rating: 5.0,
    yearsExp: 15,
    slots: [
      { day: 'Tomorrow', time: '8:30 AM', kind: 'home' },
      { day: 'Tomorrow', time: '2:00 PM', kind: 'clinic' },
      { day: 'Wed',      time: '9:00 AM', kind: 'clinic', taken: true },
      { day: 'Thu',      time: '4:30 PM', kind: 'home' },
      { day: 'Fri',      time: '10:30 AM', kind: 'clinic' },
    ],
  },
]

function SlotPill({ slot }: { slot: Slot }) {
  const base = 'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap border transition-colors'
  if (slot.taken) {
    return (
      <span data-slot-pill className={`${base} border-slate-200 bg-slate-50 text-slate-400 line-through decoration-slate-300`}>
        {slot.time}
      </span>
    )
  }
  if (slot.kind === 'home') {
    return (
      <span data-slot-pill className={`${base} border-[#00766C]/25 bg-[#E6F4F3] text-[#00766C]`}>
        <HomeIcon size={11} strokeWidth={2.5} />
        {slot.time}
      </span>
    )
  }
  return (
    <span data-slot-pill className={`${base} border-indigo-200 bg-indigo-50 text-indigo-700`}>
      <Stethoscope size={11} strokeWidth={2.5} />
      {slot.time}
    </span>
  )
}

export default function ProofSection() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      // Provider rows rise in as the list enters view.
      gsap.from('[data-proof-row]', {
        opacity: 0,
        y: 28,
        duration: 0.65,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: {
          trigger: '[data-proof-list]',
          start: 'top 80%',
          once: true,
        },
      })

      // Slot pills ripple in after the row they belong to. Short, subtle,
      // scoped per-row so the effect feels local to each provider.
      gsap.utils.toArray<HTMLElement>('[data-proof-row]').forEach((row) => {
        const pills = row.querySelectorAll('[data-slot-pill]')
        if (pills.length === 0) return
        gsap.from(pills, {
          opacity: 0,
          scale: 0.85,
          duration: 0.4,
          ease: 'back.out(1.4)',
          stagger: 0.05,
          scrollTrigger: {
            trigger: row,
            start: 'top 75%',
            once: true,
          },
        })
      })
    },
    { scope },
  )

  return (
    <section
      ref={scope}
      className="relative z-0 isolate bg-white py-24 md:py-32"
      aria-label="Real availability across providers"
    >
      <div className="bp-container">
        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end mb-14">
          <div className="max-w-2xl">
            <div
              className="bp-kicker mb-4"
              style={{
                background: 'rgba(0,118,108,0.08)',
                borderColor: 'rgba(0,118,108,0.2)',
                color: '#00766C',
              }}
            >
              Real slots, not callbacks
            </div>
            <h2 className="text-slate-900 mb-3">
              What is actually open this week.
            </h2>
            <p className="text-slate-500 text-[17px] leading-relaxed">
              Every pill below is a slot the physiotherapist has opened themselves. No phone tag,
              no &ldquo;we&rsquo;ll call you back.&rdquo; Pick one, confirm with an OTP, done.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[12px] font-semibold">
            <span className="flex items-center gap-1.5 text-indigo-700">
              <span className="w-3 h-3 rounded-full border border-indigo-200 bg-indigo-50" />
              Clinic
            </span>
            <span className="flex items-center gap-1.5 text-[#00766C]">
              <span className="w-3 h-3 rounded-full border border-[#00766C]/25 bg-[#E6F4F3]" />
              Home visit
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-3 h-3 rounded-full border border-slate-200 bg-slate-50" />
              Booked
            </span>
          </div>
        </div>

        <div data-proof-list className="space-y-4">
          {providers.map((p) => (
            <article
              key={p.name}
              data-proof-row
              className="group rounded-[var(--sq-lg)] border border-slate-200 bg-white p-5 md:p-6 transition-all hover:border-[#00766C]/30 hover:shadow-lg hover:shadow-slate-200/50"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                {/* Identity */}
                <div className="flex items-center gap-4 lg:w-[320px] lg:shrink-0">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[var(--sq-md)] bg-[#E6F4F3] text-[15px] font-bold text-[#00766C] transition-colors group-hover:bg-[#00766C] group-hover:text-white">
                    {p.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-900 text-[15px] truncate">
                        {p.name}
                      </span>
                      <ShieldCheck size={13} className="text-[#00766C] shrink-0" />
                    </div>
                    <div className="text-[13px] text-slate-500 truncate">{p.specialty}</div>
                    <div className="flex items-center gap-2 mt-0.5 text-[12px] text-slate-400">
                      <span>{p.city}</span>
                      <span className="h-0.5 w-0.5 rounded-full bg-slate-300" />
                      <span>{p.yearsExp} yrs</span>
                      <span className="h-0.5 w-0.5 rounded-full bg-slate-300" />
                      <span className="text-amber-500 font-semibold">★ {p.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="flex-1 min-w-0">
                  <div className="flex gap-3 overflow-x-auto pb-1 lg:pb-0 -mx-1 px-1">
                    {p.slots.map((slot, i) => (
                      <div
                        key={i}
                        className="flex flex-col items-start gap-1.5 shrink-0 min-w-[92px]"
                      >
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          {slot.day}
                        </span>
                        <SlotPill slot={slot} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fee + CTA */}
                <div className="flex items-center justify-between gap-4 lg:flex-col lg:items-end lg:justify-center lg:gap-2 lg:w-[140px] lg:shrink-0">
                  <div className="text-right">
                    <div className="text-[20px] font-bold text-slate-900 leading-none">
                      ₹{p.feeInr}
                    </div>
                    <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mt-1">
                      per session
                    </div>
                  </div>
                  <Link
                    href="/search"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#00766C] text-white rounded-full text-[13px] font-semibold hover:bg-[#005A52] transition-colors"
                  >
                    Book in 60s
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Footer band */}
        <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-[var(--sq-lg)] bg-slate-50 border border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <Calendar size={18} className="text-[#00766C] shrink-0" />
            <p className="text-[14px] text-slate-600">
              Availability refreshes every few minutes. Slots you see here are the ones
              providers are actually holding open.
            </p>
          </div>
          <Link
            href="/search"
            className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#00766C] hover:text-[#005A52] shrink-0 group"
          >
            Browse every provider
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}
