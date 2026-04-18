'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { StaticPageV2Chrome } from '@/components/static/StaticPageV2Chrome'
import { useUiV2 } from '@/hooks/useUiV2'
import { HiPrivacyAsideV1, HiPrivacyBodySections, HiPrivacyCommitmentCard } from './HiPrivacyContent'
import { HiPrivacyHero } from './HiPrivacyHero'
import { HI_PRIVACY_SECTIONS } from './hi-privacy-constants'

export function HiPrivacyPageClient() {
  const v2 = useUiV2()

  if (!v2) {
    return (
      <>
        <Navbar locale="hi" localeSwitchPath="/privacy" />
        <main lang="hi" className="bg-[#FAFAFA] min-h-screen">
          <HiPrivacyHero />
          <section className="py-12 lg:py-16">
            <div className="max-w-[1142px] mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
                <HiPrivacyAsideV1 />
                <div className="lg:col-span-8">
                  <HiPrivacyBodySections />
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer locale="hi" localeSwitchPath="/privacy" />
      </>
    )
  }

  return (
    <>
      <Navbar locale="hi" localeSwitchPath="/privacy" />
      <main lang="hi" className="bg-[#FAFAFA] min-h-screen">
        <StaticPageV2Chrome
          lastUpdated="मार्च 2026"
          tocItems={[...HI_PRIVACY_SECTIONS, { id: 'contact', label: '6. संपर्क' }]}
          hero={<HiPrivacyHero />}
          body={
            <div className="space-y-8">
              <HiPrivacyCommitmentCard />
              <HiPrivacyBodySections />
            </div>
          }
        />
      </main>
      <Footer locale="hi" localeSwitchPath="/privacy" />
    </>
  )
}
