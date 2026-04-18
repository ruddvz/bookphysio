'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { StaticPageV2Chrome } from '@/components/static/StaticPageV2Chrome'
import { useUiV2 } from '@/hooks/useUiV2'
import { TermsAsideV1, TermsBodySections, TermsSummaryCard } from './TermsContent'
import { TermsHero } from './TermsHero'
import { TERMS_SECTIONS } from './terms-constants'

export function TermsPageClient() {
  const v2 = useUiV2()

  if (!v2) {
    return (
      <>
        <Navbar locale="en" localeSwitchPath="/terms" />
        <main className="bg-[#FAFAFA] min-h-screen">
          <TermsHero />
          <section className="py-12 lg:py-16">
            <div className="max-w-[1142px] mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
                <TermsAsideV1 />
                <div className="lg:col-span-8">
                  <TermsBodySections />
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer locale="en" localeSwitchPath="/terms" />
      </>
    )
  }

  return (
    <>
      <Navbar locale="en" localeSwitchPath="/terms" />
      <main className="bg-[#FAFAFA] min-h-screen">
        <StaticPageV2Chrome
          lastUpdated="April 2026"
          tocItems={TERMS_SECTIONS}
          hero={<TermsHero />}
          body={
            <div className="space-y-8">
              <TermsSummaryCard />
              <TermsBodySections />
            </div>
          }
        />
      </main>
      <Footer locale="en" localeSwitchPath="/terms" />
    </>
  )
}
