'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { StaticPageV2Chrome } from '@/components/static/StaticPageV2Chrome'
import { useUiV2 } from '@/hooks/useUiV2'
import { PrivacyAsideV1, PrivacyBodySections, PrivacyCommitmentCard } from './PrivacyContent'
import { PrivacyHero } from './PrivacyHero'
import { PRIVACY_SECTIONS } from './privacy-constants'

export function PrivacyPageClient() {
  const v2 = useUiV2()

  if (!v2) {
    return (
      <>
        <Navbar locale="en" localeSwitchPath="/privacy" />
        <main className="bg-[#FAFAFA] min-h-screen">
          <PrivacyHero />
          <section className="py-12 lg:py-16">
            <div className="max-w-[1142px] mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
                <PrivacyAsideV1 />
                <div className="lg:col-span-8">
                  <PrivacyBodySections />
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer locale="en" localeSwitchPath="/privacy" />
      </>
    )
  }

  return (
    <>
      <Navbar locale="en" localeSwitchPath="/privacy" />
      <main className="bg-[#FAFAFA] min-h-screen">
        <StaticPageV2Chrome
          lastUpdated="April 2026"
          tocItems={PRIVACY_SECTIONS}
          hero={<PrivacyHero />}
          body={
            <div className="space-y-8">
              <PrivacyCommitmentCard />
              <PrivacyBodySections />
            </div>
          }
        />
      </main>
      <Footer locale="en" localeSwitchPath="/privacy" />
    </>
  )
}
