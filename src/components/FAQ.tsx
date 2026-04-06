'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Plus, Minus, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const faqs = [
  {
    id: 1,
    q: 'How do you verify physiotherapists?',
    a: 'Every provider goes through a 3-step check — IAP/State Council registration number, degree upload (BPT/MPT), and identity verification — before appearing in search results. We then surface their credentials on the public profile so you can judge for yourself.',
  },
  {
    id: 2,
    q: 'Can I book a home visit?',
    a: 'Yes. Home-visit availability is shown alongside in-clinic options on every provider card. You pick the format that fits your needs — no separate flows.',
  },
  {
    id: 3,
    q: 'How are prices shown?',
    a: 'Session fees are displayed in INR before booking — no hidden extras. GST and payment method details appear in the checkout, so there are zero surprises at the end.',
  },
  {
    id: 4,
    q: 'What happens after I book?',
    a: 'You get an instant SMS confirmation with session details. The appointment appears in your patient dashboard where you can manage, reschedule, or cancel within the allowed window.',
  },
  {
    id: 5,
    q: 'Can I cancel or reschedule a session?',
    a: 'Yes. From your dashboard you can cancel or request a reschedule within the cancellation window set by the provider (usually 24 hours). Refund terms are shown before you confirm.',
  },
]

export default function FAQ() {
  const [openId, setOpenId] = useState<number | null>(1)

  return (
    <section className="bg-white py-24 md:py-32" aria-label="Frequently asked questions">
      <div className="bp-container">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.4fr] items-start">

          {/* Left: header + CTA */}
          <div className="lg:sticky lg:top-28">
            <div className="bp-kicker mb-4">Help Center</div>
            <h2 className="text-slate-900 mb-4">Questions patients ask before they book.</h2>
            <p className="text-slate-500 text-[16px] leading-relaxed mb-8">
              Everything you need to know before booking your first session. Can&apos;t find an answer?
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 px-5 py-3.5 bg-indigo-600 text-white rounded-xl font-semibold text-[14px] hover:bg-indigo-700 transition-colors group w-fit"
              >
                Browse providers
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/faq"
                className="inline-flex items-center gap-2 px-5 py-3.5 border border-slate-200 text-slate-700 rounded-xl font-semibold text-[14px] hover:border-indigo-200 hover:text-indigo-700 transition-colors w-fit"
              >
                View all FAQs
              </Link>
            </div>
          </div>

          {/* Right: accordion */}
          <div className="space-y-2">
            {faqs.map(faq => {
              const isOpen = openId === faq.id
              return (
                <div
                  key={faq.id}
                  className={cn(
                    'rounded-xl border transition-all duration-200',
                    isOpen
                      ? 'border-indigo-200 bg-indigo-50/50'
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
                      isOpen ? 'text-indigo-700' : 'text-slate-900'
                    )}>
                      {faq.q}
                    </span>
                    <span className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-lg border transition-all shrink-0',
                      isOpen
                        ? 'border-indigo-200 bg-indigo-100 text-indigo-700'
                        : 'border-slate-200 bg-white text-slate-400'
                    )}>
                      {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                    </span>
                  </button>

                  <div
                    id={`faq-a-${faq.id}`}
                    role="region"
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