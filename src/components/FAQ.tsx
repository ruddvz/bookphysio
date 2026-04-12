'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Plus, Minus, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const faqs = [
  {
    id: 1,
    q: 'How do you verify physiotherapists?',
    a: 'Every provider shares their IAP or State Council registration number and a qualification proof when they sign up. Our team checks these against the public registers before the profile goes live, and the credentials are shown on their public page so you can see them for yourself.',
  },
  {
    id: 2,
    q: 'Can I book a home visit?',
    a: 'Yes. On each provider page you can see whether they offer home visits, the areas they cover, and their home-visit fee, and you can book either option in the same flow.',
  },
  {
    id: 3,
    q: 'How are prices shown?',
    a: 'Session fees are shown in Indian Rupees on every provider card, and GST and the payment method are shown again on the checkout screen, so the total you pay at the end is the same amount you saw at the start.',
  },
  {
    id: 4,
    q: 'What happens after I book?',
    a: 'You get an SMS confirmation with the session details as soon as the provider accepts the booking. The appointment also shows up in your Patient Dashboard, where you can view it, reschedule it, or cancel it.',
  },
  {
    id: 5,
    q: 'Can I cancel or reschedule a session?',
    a: 'Yes. You can cancel or reschedule free of charge up to four hours before the session from your Patient Dashboard. Cancellations inside the four-hour window may be charged in full at the provider’s discretion.',
  },
]

export default function FAQ() {
  const [openId, setOpenId] = useState<number | null>(1)

  return (
    <section className="bg-white py-24 md:py-32" aria-label="Frequently asked questions">
      <div className="bp-container">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.4fr] items-start">
          <div className="lg:sticky lg:top-28">
            <div className="bp-kicker mb-4">Common questions</div>
            <h2 className="text-slate-900 mb-4">Before you book, here is what people usually want to know.</h2>
            <p className="text-slate-500 text-[16px] leading-relaxed mb-8">
              Short answers to the questions we hear most often. If yours is not here, our support team is happy to help.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 px-5 py-3.5 bg-[#FF6B35] text-white rounded-full font-semibold text-[14px] hover:bg-[#E0552A] transition-colors group w-fit"
              >
                Browse providers
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/faq"
                className="inline-flex items-center gap-2 px-5 py-3.5 border border-slate-200 text-slate-700 rounded-full font-semibold text-[14px] hover:border-[#00766C]/30 hover:text-[#00766C] transition-colors w-fit"
              >
                View all FAQs
              </Link>
            </div>
          </div>

          <div className="space-y-2">
            {faqs.map((faq) => {
              const isOpen = openId === faq.id
              return (
                <div
                  key={faq.id}
                  className={cn(
                    'rounded-xl border transition-all duration-200',
                    isOpen
                      ? 'border-[#00766C]/20 bg-[#E6F4F3]/50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  )}
                >
                  <button
                    type="button"
                    id={`faq-q-${faq.id}`}
                    onClick={() => setOpenId(isOpen ? null : faq.id)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${faq.id}`}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className={cn(
                      'text-[15px] font-semibold transition-colors',
                      isOpen ? 'text-[#00766C]' : 'text-slate-900'
                    )}>
                      {faq.q}
                    </span>
                    <span className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-lg border transition-all shrink-0',
                      isOpen
                        ? 'border-[#00766C]/20 bg-[#E6F4F3] text-[#00766C]'
                        : 'border-slate-200 bg-white text-slate-400'
                    )}>
                      {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                    </span>
                  </button>

                  <div
                    id={`faq-a-${faq.id}`}
                    role="region"
                    aria-hidden={!isOpen}
                    aria-labelledby={`faq-q-${faq.id}`}
                    className={cn(
                      'grid transition-all duration-300',
                      isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    )}
                  >
                    <div className={cn(
                      'min-h-0 overflow-hidden px-5 text-[14px] leading-relaxed text-slate-600 transition-all duration-300',
                      isOpen ? 'pb-5 opacity-100' : 'pb-0 opacity-0'
                    )}>
                      {faq.a}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
