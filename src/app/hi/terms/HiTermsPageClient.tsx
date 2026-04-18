'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { StaticPageV2Chrome } from '@/components/static/StaticPageV2Chrome'
import { useUiV2 } from '@/hooks/useUiV2'
import { HiTermsAsideV1, HiTermsBodySections, HiTermsSummaryCard } from './HiTermsContent'
import { HiTermsHero } from './HiTermsHero'
import { HI_TERMS_SECTIONS } from './hi-terms-constants'

export function HiTermsPageClient() {
  const v2 = useUiV2()

  if (!v2) {
    return (
      <>
        <Navbar locale="hi" localeSwitchPath="/terms" />
        <main lang="hi" className="bg-[#FAFAFA] min-h-screen">
          <HiTermsHero />
          <section className="py-12 lg:py-16">
            <div className="max-w-[1142px] mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
                <HiTermsAsideV1 />
                <div className="lg:col-span-8">
                  <HiTermsBodySections />
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer locale="hi" localeSwitchPath="/terms" />
      </>
    )
  }

  return (
    <>
      <Navbar locale="hi" localeSwitchPath="/terms" />
      <main lang="hi" className="bg-[#FAFAFA] min-h-screen">
        <StaticPageV2Chrome
          lastUpdated="मार्च 2026"
          tocItems={[...HI_TERMS_SECTIONS, { id: 'contact', label: '6. संपर्क' }]}
          hero={<HiTermsHero />}
          body={
            <div className="space-y-8">
              <HiTermsSummaryCard />
              <HiTermsBodySections />
            </div>
          }
        />
      </main>
      <Footer locale="hi" localeSwitchPath="/terms" />
    </>
  )
}
