'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ChevronDown, Sparkles } from 'lucide-react'
import { StaticPageV2Chrome, type StaticTocItem } from '@/components/static/StaticPageV2Chrome'
import { useUiV2 } from '@/hooks/useUiV2'
import { HI_FAQS, hiFaqSectionId } from './hi-faq-data'

const HI_FAQ_TOC: StaticTocItem[] = HI_FAQS.map((cat, i) => ({
  id: hiFaqSectionId(i),
  label: cat.category,
}))

export function HiFAQPageClient() {
  const [openIndex, setOpenIndex] = useState<string | null>(null)
  const v2 = useUiV2()

  const toggle = (id: string) => {
    setOpenIndex(openIndex === id ? null : id)
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: HI_FAQS.flatMap((category) =>
      category.items.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    ),
  }

  const accordion = (
    <div className={v2 ? 'space-y-10 lg:space-y-12' : 'lg:col-span-8 space-y-10 lg:space-y-12'}>
      {HI_FAQS.map((category, categoryIndex) => (
        <div key={category.category} id={hiFaqSectionId(categoryIndex)} className="scroll-mt-28">
          <h2 className="text-[22px] lg:text-[24px] font-bold text-[#1A1C29] tracking-tight mb-5">
            {category.category}
          </h2>
          <div className="space-y-3">
            {category.items.map((item, idx) => {
              const id = `${categoryIndex}-${idx}`
              const isOpen = openIndex === id
              return (
                <div
                  key={id}
                  className={`rounded-[var(--sq-lg)] border bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-colors ${
                    isOpen ? 'border-[#00766C]/40' : 'border-slate-200'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggle(id)}
                    className="w-full text-left px-5 lg:px-6 py-4 lg:py-5 flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00766C] focus-visible:ring-offset-2 rounded-[var(--sq-lg)]"
                  >
                    <span className="text-[15px] font-semibold text-[#1A1C29]">{item.question}</span>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        isOpen ? 'bg-[#00766C] text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-5 lg:px-6 pb-5 lg:pb-6 text-[14px] text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                        {item.answer}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )

  const supportCard = (
    <div className="rounded-[var(--sq-lg)] border border-slate-200 bg-white p-5 lg:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <div className="w-11 h-11 rounded-full bg-[#E6F4F3] text-[#00766C] flex items-center justify-center">
        <Sparkles className="w-5 h-5" />
      </div>
      <h3 className="mt-4 text-[15px] font-semibold text-[#1A1C29]">बुकिंग में मदद चाहिए?</h3>
      <p className="mt-1.5 text-[13px] text-slate-600 leading-relaxed">
        हमारी टीम बुकिंग फ्लो, प्रदाता सत्यापन और प्लेटफॉर्म उपयोग से जुड़े सवालों में सहायता कर सकती है।
      </p>
      <a
        href="mailto:support@bookphysio.in"
        className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[#00766C] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-[#005A52] transition-colors"
      >
        सपोर्ट से संपर्क करें
      </a>
    </div>
  )

  const hero = (
    <section className="bg-white border-b border-slate-200/70">
      <div className="max-w-[1142px] mx-auto px-6 py-12 lg:py-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E6F4F3] text-[#00766C] rounded-full text-[11px] font-semibold uppercase tracking-[0.18em] mb-5">
          सपोर्ट डेस्क
        </div>
        <h1 className="text-[30px] lg:text-[40px] font-bold tracking-tight text-[#1A1C29] leading-tight">
          हम कैसे <span className="text-[#00766C]">मदद करें?</span>
        </h1>
        <p className="mt-4 text-[15px] lg:text-[17px] leading-relaxed max-w-[680px] mx-auto text-slate-600">
          बुकिंग नीतियों, प्रदाता सत्यापन मानकों और प्लेटफॉर्म से जुड़े सबसे सामान्य सवालों के जवाब यहां दिए गए हैं।
        </p>
      </div>
    </section>
  )

  if (!v2) {
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        <Navbar locale="hi" localeSwitchPath="/faq" />
        <main lang="hi" className="bg-[#FAFAFA] min-h-screen">
          {hero}
          <section className="py-12 lg:py-16">
            <div className="max-w-[1142px] mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
                <aside className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
                  <div>
                    <h2 className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.2em] mb-4">
                      श्रेणियाँ
                    </h2>
                    <ul className="space-y-2">
                      {HI_FAQS.map((category, index) => (
                        <li key={category.category}>
                          <a
                            href={`#${hiFaqSectionId(index)}`}
                            className="block rounded-[var(--sq-sm)] px-4 py-3 text-[14px] font-semibold text-[#1A1C29] border border-slate-200 bg-white hover:border-[#00766C]/40 hover:bg-[#E6F4F3]/40 transition-colors"
                          >
                            {category.category}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {supportCard}
                </aside>
                {accordion}
              </div>
            </div>
          </section>
        </main>
        <Footer locale="hi" localeSwitchPath="/faq" />
      </>
    )
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Navbar locale="hi" localeSwitchPath="/faq" />
      <main lang="hi" className="bg-[#FAFAFA] min-h-screen">
        <StaticPageV2Chrome
          lastUpdated="मार्च 2026"
          tocItems={HI_FAQ_TOC}
          hero={hero}
          body={
            <div className="space-y-8">
              {supportCard}
              {accordion}
            </div>
          }
        />
      </main>
      <Footer locale="hi" localeSwitchPath="/faq" />
    </>
  )
}
