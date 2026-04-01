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
    question: 'Is BookPhysio meant for mobile?',
    answer:
      'Yes. The refreshed layout is built to stay readable on smaller screens, with the search bar and cards sized for tap-first use.',
  },
]

export default function FAQ() {
  const [openId, setOpenId] = useState<number | null>(1)

  return (
    <section className="bp-section bg-[#F7F8F9]">
      <div className="bp-shell">
        <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="bp-kicker mb-5">
              <HelpCircle size={13} />
              Help center
            </div>
            <h2 className="bp-title">Common questions.</h2>
            <p className="bp-copy mt-4 max-w-xl">
              Keep this section concise and direct. It should answer the questions people actually need before they book.
            </p>
          </div>

          <Link
            href="/search"
            className="rounded-full bg-[#00766C] px-5 py-3 text-[14px] font-semibold text-white transition-all hover:bg-[#005A52]"
          >
            Browse providers
          </Link>
        </div>

        <div className="mt-10 space-y-4">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id

            return (
              <article
                key={faq.id}
                className={cn(
                  'bp-card overflow-hidden transition-all duration-300',
                  isOpen ? 'border-[#00766C]/20 shadow-[0_22px_50px_-30px_rgba(15,23,42,0.22)]' : 'hover:border-[#00766C]/15'
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className={cn('text-[17px] font-semibold tracking-[-0.03em]', isOpen ? 'text-[#005A52]' : 'text-slate-900')}>
                    {faq.question}
                  </span>
                  <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all', isOpen ? 'border-[#00766C] bg-[#E6F4F3] text-[#00766C]' : 'border-[#E6E8EC] bg-white text-slate-400')}>
                    {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                  </span>
                </button>

                <div className={cn('grid overflow-hidden transition-all duration-300', isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
                  <div className="min-h-0 px-6 pb-6 text-[15px] leading-7 text-slate-600">{faq.answer}</div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}