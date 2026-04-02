'use client'

import Link from 'next/link'
import { useState } from 'react'
import { HelpCircle, Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

const faqs = [
  {
    id: 1,
    question: 'How do you verify physiotherapists?',
    answer:
      'Each provider goes through registration, qualification, and profile checks before appearing in search. That keeps the directory trust-first instead of open-ended.',
  },
  {
    id: 2,
    question: 'Can I book a home visit?',
    answer:
      'Yes. Home-visit availability is shown alongside in-clinic options so you can pick the format that fits the recovery plan and the day.',
  },
  {
    id: 3,
    question: 'How are prices shown?',
    answer:
      'Fees are displayed as integer INR before booking. GST and payment details stay visible later in the flow, so there are no surprises.',
  },
  {
    id: 4,
    question: 'What happens after I book?',
    answer:
      'You move into a simple booking flow with confirmation details, payment handling, and session information surfaced in one place.',
  },
  {
    id: 5,
    question: 'Can I cancel a session?',
    answer:
      'Yes. Once a booking is confirmed you can review the appointment details and cancel within the timeline shown in your dashboard.',
  },
]

export default function FAQ() {
  const [openId, setOpenId] = useState<number | null>(1)

  return (
    <section className="bp-section bg-[#fff9f1]" aria-label="Booking questions">
      <div className="bp-shell">
        <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="bp-kicker mb-5">
              <HelpCircle size={13} />
              Help center
            </div>
            <h2 className="bp-title">Questions patients ask before they book.</h2>
            <p className="bp-copy mt-4 max-w-xl">
              Everything you need to know before booking your first session.
            </p>
          </div>

          <Link
            href="/search"
            className="bp-button-primary"
          >
            Browse providers
          </Link>
        </div>

        <div className="mt-10 space-y-4">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id

            return (
              <div
                key={faq.id}
                className={cn(
                  'bp-card overflow-hidden transition-all duration-300',
                  isOpen ? 'border-[#0f7668]/20 shadow-[0_22px_50px_-30px_rgba(24,49,45,0.22)]' : 'hover:border-[#0f7668]/15'
                )}
              >
                <button
                  id={`faq-trigger-${faq.id}`}
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${faq.id}`}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className={cn('text-[17px] font-semibold tracking-[-0.03em]', isOpen ? 'text-[#0f7668]' : 'text-[#18312d]')}>
                    {faq.question}
                  </span>
                  <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all', isOpen ? 'border-[#0f7668] bg-[#dcefe9] text-[#0f7668]' : 'border-[#ddd3c6] bg-white text-[#7d8a85]')}>
                    {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                  </span>
                </button>

                <div
                  id={`faq-answer-${faq.id}`}
                  role="region"
                  aria-labelledby={`faq-trigger-${faq.id}`}
                  aria-hidden={!isOpen}
                  className={cn('grid overflow-hidden transition-all duration-300', isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}
                >
                  <div
                    className={cn(
                      'min-h-0 overflow-hidden px-6 text-[15px] leading-7 text-[#58645f] transition-all duration-300',
                      isOpen ? 'pb-6 opacity-100' : 'invisible pb-0 opacity-0'
                    )}
                  >
                    {faq.answer}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}