'use client'

import { StaticLegalHero } from '@/components/static/StaticLegalHero'

export function TermsHero() {
  return (
    <section className="bg-white border-b border-slate-200/70">
      <div className="max-w-[1142px] mx-auto px-6 py-12 lg:py-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E6F4F3] text-[#00766C] rounded-full text-[11px] font-semibold uppercase tracking-[0.18em] mb-5">
          Legal Framework
        </div>
        <StaticLegalHero lastUpdatedLabel="April 2026">
          <h1 className="text-[30px] lg:text-[40px] font-bold tracking-tight text-[#1A1C29] leading-tight">
            Terms of <span className="text-[#00766C]">Service</span>
          </h1>
        </StaticLegalHero>
      </div>
    </section>
  )
}
