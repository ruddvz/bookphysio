'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ChevronDown, Sparkles } from 'lucide-react'

const FAQS = [
  {
    category: 'Patients',
    items: [
      {
        question: 'How do I book an appointment?',
        answer:
          'Simply search for your condition or a physiotherapist, choose a provider, select your preferred date and time, and click "Book Session". You\'ll receive an OTP on your mobile to confirm.',
      },
      {
        question: 'What is IAP Verified?',
        answer:
          'IAP (Indian Association of Physiotherapists) or State Council verification means we have manually checked the credentials, professional registration, and experience of the physiotherapist to ensure patient safety.',
      },
      {
        question: 'Are home visits available?',
        answer:
          'Yes, many of our therapists offer home visit services. You can filter your search results to see providers who offer "Home Visit" and see their specific fees for home sessions.',
      },
      {
        question: 'How do I pay for my session?',
        answer:
          'Most bookings support online checkout through BookPhysio. If a session uses pay-at-visit instead, that option is shown clearly before you confirm the booking.',
      },
      {
        question: 'Can I cancel or reschedule my booking?',
        answer:
          'Yes, you can cancel or reschedule up to 4 hours before the appointment time through your Patient Dashboard without any penalty.',
      },
    ],
  },
  {
    category: 'Physiotherapists',
    items: [
      {
        question: 'How can I join BookPhysio as a provider?',
        answer:
          'Click on the "For Providers" button in the navigation or visit the Doctor Signup page. You will need to provide your IAP/State Council registration number and practice details.',
      },
      {
        question: 'What are the charges for listing?',
        answer:
          'Listing on BookPhysio is free. We charge a nominal platform fee only on successful bookings made through our platform.',
      },
      {
        question: 'Do I get my own dashboard?',
        answer:
          'Yes, every registered provider gets a comprehensive dashboard to manage their calendar, appointments, patient records, and earnings.',
      },
    ],
  },
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null)

  const toggle = (id: string) => {
    setOpenIndex(openIndex === id ? null : id)
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.flatMap((cat) =>
      cat.items.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      }))
    ),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Navbar locale="en" localeSwitchPath="/faq" />

      <main className="bg-[#FAFAFA] min-h-screen">
        {/* Hero */}
        <section className="bg-white border-b border-slate-200/70">
          <div className="max-w-[1142px] mx-auto px-6 py-12 lg:py-16 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E6F4F3] text-[#00766C] rounded-full text-[11px] font-semibold uppercase tracking-[0.18em] mb-5">
              Support Desk
            </div>
            <h1 className="text-[30px] lg:text-[40px] font-bold tracking-tight text-[#1A1C29] leading-tight">
              How can we <span className="text-[#00766C]">help?</span>
            </h1>
            <p className="mt-4 text-[15px] lg:text-[17px] leading-relaxed max-w-[680px] mx-auto text-slate-600">
              Booking policies, provider verification standards, and answers to the questions we
              hear most.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 lg:py-16">
          <div className="max-w-[1142px] mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
              {/* Sidebar */}
              <aside className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
                <div>
                  <h2 className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.2em] mb-4">
                    Categories
                  </h2>
                  <ul className="space-y-2">
                    {FAQS.map((category) => (
                      <li key={category.category}>
                        <a
                          href={`#${category.category.toLowerCase().replace(/\s+/g, '-')}`}
                          className="block rounded-xl px-4 py-3 text-[14px] font-semibold text-[#1A1C29] border border-slate-200 bg-white hover:border-[#00766C]/40 hover:bg-[#E6F4F3]/40 transition-colors"
                        >
                          {category.category}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                  <div className="w-11 h-11 rounded-full bg-[#E6F4F3] text-[#00766C] flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="mt-4 text-[15px] font-semibold text-[#1A1C29]">
                    Need booking help?
                  </h3>
                  <p className="mt-1.5 text-[13px] text-slate-600 leading-relaxed">
                    Our support team can help with booking guidance, provider verification
                    questions, and platform issues.
                  </p>
                  <a
                    href="mailto:support@bookphysio.in"
                    className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[#00766C] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-[#005A52] transition-colors"
                  >
                    Contact support
                  </a>
                </div>
              </aside>

              {/* Accordion */}
              <div className="lg:col-span-8 space-y-10 lg:space-y-12">
                {FAQS.map((category) => (
                  <div
                    key={category.category}
                    id={category.category.toLowerCase().replace(/\s+/g, '-')}
                    className="scroll-mt-28"
                  >
                    <h2 className="text-[22px] lg:text-[24px] font-bold text-[#1A1C29] tracking-tight mb-5">
                      {category.category}
                    </h2>
                    <div className="space-y-3">
                      {category.items.map((item, idx) => {
                        const id = `${category.category}-${idx}`
                        const isOpen = openIndex === id
                        return (
                          <div
                            key={id}
                            className={`rounded-2xl border bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-colors ${
                              isOpen ? 'border-[#00766C]/40' : 'border-slate-200'
                            }`}
                          >
                            <button
                              onClick={() => toggle(id)}
                              className="w-full text-left px-5 lg:px-6 py-4 lg:py-5 flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00766C] focus-visible:ring-offset-2 rounded-2xl"
                            >
                              <span className="text-[15px] font-semibold text-[#1A1C29]">
                                {item.question}
                              </span>
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                                  isOpen ? 'bg-[#00766C] text-white' : 'bg-slate-100 text-slate-500'
                                }`}
                              >
                                <ChevronDown
                                  className={`w-4 h-4 transition-transform ${
                                    isOpen ? 'rotate-180' : ''
                                  }`}
                                />
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
            </div>
          </div>
        </section>
      </main>

      <Footer locale="en" localeSwitchPath="/faq" />
    </>
  )
}
