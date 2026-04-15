'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ChevronDown, Sparkles } from 'lucide-react'

const FAQS = [
  {
    category: 'Booking a session',
    items: [
      {
        question: 'How do I book a physiotherapist?',
        answer:
          'Search by your city, condition or specialty, open a provider you like, pick a date and time that suits you, and tap Book Session. You will get an OTP on your mobile to confirm, and a confirmation message once the provider accepts.',
      },
      {
        question: 'What does IAP Verified mean?',
        answer:
          'It means the physiotherapist has shared a valid registration number with either the Indian Association of Physiotherapists or a recognised State Council, and we have checked that it matches the name on their profile. You can see a verified badge on the provider card when we have confirmed this.',
      },
      {
        question: 'Can I book a home visit?',
        answer:
          'Yes. Many physiotherapists on BookPhysio offer home visits alongside their clinic work. Use the Home Visit filter on the search page to see only providers who visit patients at home, along with their home-visit fee and travel area.',
      },
      {
        question: 'Is BookPhysio available in my city?',
        answer:
          'We are growing city by city. If a provider is listed in your pincode area, you can book them right away. If you cannot find anyone near you, you can still create an account and we will notify you when a verified physiotherapist joins in your area.',
      },
      {
        question: 'Do I need a doctor\u2019s prescription to book?',
        answer:
          'No. You can book a physiotherapy session directly. If you have an existing prescription or report from a doctor, you can share it with the provider at the start of the session to help them plan your care.',
      },
    ],
  },
  {
    category: 'Payments and refunds',
    items: [
      {
        question: 'How do I pay for my session?',
        answer:
          'Most bookings are paid online through Razorpay using UPI, credit or debit cards, or net banking. If a provider has enabled pay-at-visit, that option is shown clearly before you confirm, and you pay the provider directly at the session.',
      },
      {
        question: 'Will I get a GST invoice?',
        answer:
          'Yes. Every online payment through BookPhysio generates a GST-compliant invoice, which you can download from your Patient Dashboard once the booking is confirmed.',
      },
      {
        question: 'What is your cancellation and refund policy?',
        answer:
          'You can cancel or reschedule free of charge up to four hours before the session from your Patient Dashboard. Cancellations inside the four-hour window, or no-shows, may be charged in full. If the provider cancels, or if the session cannot take place for a reason attributable to them or to us, you get a full refund to the original payment method, usually within five to seven working days.',
      },
      {
        question: 'What if I am not satisfied with a session?',
        answer:
          'Write to us at support@bookphysio.in within seven days of the session. Share the booking reference and a short description of what went wrong. We will investigate with the provider and come back to you with an outcome, including a refund where we believe it is fair.',
      },
    ],
  },
  {
    category: 'Safety and privacy',
    items: [
      {
        question: 'Is my personal and health information safe?',
        answer:
          'We collect only what we need to run your booking, and we never sell your personal or health data. Data is encrypted in transit, access to our database is tightly controlled, and payments are handled by Razorpay so card details never touch our servers. Full details are in our Privacy Policy.',
      },
      {
        question: 'How do I report a problem with a provider or the site?',
        answer:
          'For general issues write to support@bookphysio.in. For privacy or content-related grievances under Indian law you can write directly to our Grievance Officer at grievance@bookphysio.in. We aim to acknowledge grievances within forty-eight hours.',
      },
      {
        question: 'Is BookPhysio suitable for emergencies?',
        answer:
          'No. BookPhysio is for planned physiotherapy sessions, not urgent or emergency care. If you are having a medical emergency, please call your local emergency number or go to the nearest hospital.',
      },
    ],
  },
  {
    category: 'For physiotherapists',
    items: [
      {
        question: 'How do I list my practice on BookPhysio?',
        answer:
          'Tap For Providers in the top navigation and start the signup flow. You will be asked for your name, mobile number, IAP or State Council registration number and basic practice details. Our team reviews each application before the profile goes live.',
      },
      {
        question: 'Does it cost anything to list?',
        answer:
          'Creating and maintaining a profile is free. We charge a small platform fee only on bookings that are paid online through BookPhysio, so you only pay when you actually earn through the platform.',
      },
      {
        question: 'What does the provider dashboard give me?',
        answer:
          'Your dashboard lets you manage your calendar and availability, see upcoming and past appointments, keep simple notes for each patient, track earnings and payouts, and generate GST-ready bills for pay-at-visit sessions.',
      },
      {
        question: 'Who controls my patient records?',
        answer:
          'Any clinical notes or records you add belong to you and your patient. BookPhysio stores them securely on your behalf so you can access them from your dashboard, but we do not share them with anyone else without a lawful reason.',
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
              Answers to the questions patients and physiotherapists ask us most often, from bookings and payments to safety and privacy.
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
                          className="block rounded-[var(--sq-sm)] px-4 py-3 text-[14px] font-semibold text-[#1A1C29] border border-slate-200 bg-white hover:border-[#00766C]/40 hover:bg-[#E6F4F3]/40 transition-colors"
                        >
                          {category.category}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-[var(--sq-lg)] border border-slate-200 bg-white p-5 lg:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
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
                            className={`rounded-[var(--sq-lg)] border bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-colors ${
                              isOpen ? 'border-[#00766C]/40' : 'border-slate-200'
                            }`}
                          >
                            <button
                              onClick={() => toggle(id)}
                              className="w-full text-left px-5 lg:px-6 py-4 lg:py-5 flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00766C] focus-visible:ring-offset-2 rounded-[var(--sq-lg)]"
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
