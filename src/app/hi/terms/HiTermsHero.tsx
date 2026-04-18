'use client'

import { StaticLegalHero } from '@/components/static/StaticLegalHero'

export function HiTermsHero() {
  return (
    <section className="bg-white border-b border-slate-200/70">
      <div className="max-w-[1142px] mx-auto px-6 py-12 lg:py-16 text-center">
        <div className="sr-only">
          लीगल फ्रेमवर्क
        </div>
        <StaticLegalHero lastUpdatedLabel="मार्च 2026 · Agreement v2.1">
          <h1 className="text-[30px] lg:text-[40px] font-bold tracking-tight text-[#1A1C29] leading-tight">
            सेवा की <span className="text-[#00766C]">शर्तें</span>
          </h1>
        </StaticLegalHero>
      </div>
    </section>
  )
}
