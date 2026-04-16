'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { gsap, useGSAP } from '@/lib/gsap-client'

type CategoryId = 'booking' | 'payments' | 'providers' | 'privacy'

interface Category {
  id: CategoryId
  label: string
  description: string
}

interface FaqItem {
  id: string
  category: CategoryId
  q: string
  a: React.ReactNode
}

const CATEGORIES: Category[] = [
  { id: 'booking',   label: 'Booking',   description: 'Slots, confirmations, reschedules.' },
  { id: 'payments',  label: 'Payments',  description: 'Prices, GST, refunds.' },
  { id: 'providers', label: 'Providers', description: 'Verification, credentials, IAP.' },
  { id: 'privacy',   label: 'Privacy',   description: 'Your data, your phone number, your records.' },
]

const FAQS: FaqItem[] = [
  {
    id: 'faq-book-home',
    category: 'booking',
    q: 'Can I book a home visit?',
    a: (
      <>
        Yes. On each provider page you can see whether they offer home visits, the areas
        they cover, and their home-visit fee. You can book either option in the same flow —
        toggle <strong>In clinic</strong> or <strong>Home visit</strong> before picking a slot.
      </>
    ),
  },
  {
    id: 'faq-book-after',
    category: 'booking',
    q: 'What happens after I book?',
    a: (
      <>
        You get an SMS with the session details as soon as the provider accepts the booking
        (usually under a minute). It also shows up in your{' '}
        <Link href="/patient/dashboard" className="text-[#00766C] font-semibold hover:underline">
          Patient Dashboard
        </Link>
        , where you can view, reschedule, or cancel it.
      </>
    ),
  },
  {
    id: 'faq-book-cancel',
    category: 'booking',
    q: 'Can I cancel or reschedule a session?',
    a: (
      <>
        Yes. You can cancel or reschedule free of charge up to <strong>four hours before</strong>
        {' '}the session from your Patient Dashboard. Inside the four-hour window, providers may
        charge the full fee at their discretion — this is shown on the cancel screen before you
        confirm.
      </>
    ),
  },
  {
    id: 'faq-pay-prices',
    category: 'payments',
    q: 'How are prices shown?',
    a: (
      <>
        Session fees are shown in Indian Rupees (₹) on every provider card. GST (18%) and the
        payment method are shown again on the checkout screen, so the total you pay at the end
        is the same amount you saw at the start.
      </>
    ),
  },
  {
    id: 'faq-pay-methods',
    category: 'payments',
    q: 'What payment methods do you support?',
    a: (
      <>
        UPI, cards, and net-banking through Razorpay. We do not support international cards or
        PayPal. Refunds, when due, go back to the same method within 5&ndash;7 working days.
      </>
    ),
  },
  {
    id: 'faq-prov-verify',
    category: 'providers',
    q: 'How do you verify physiotherapists?',
    a: (
      <>
        Every provider shares their <strong>IAP or State Council registration number</strong> and
        a qualification proof when they sign up. Our team checks these against the public
        registers before the profile goes live, and the credentials are shown on their public
        page so you can see them for yourself.
      </>
    ),
  },
  {
    id: 'faq-prov-reviews',
    category: 'providers',
    q: 'Can I trust the reviews?',
    a: (
      <>
        Only patients who completed a booking can leave a review. Reviews are not edited and
        providers cannot remove them. Each review shows the visit type (in-clinic or home) and
        the date range of the treatment.
      </>
    ),
  },
  {
    id: 'faq-priv-phone',
    category: 'privacy',
    q: 'Will my phone number be shared with the provider?',
    a: (
      <>
        Yes — providers need to contact you for the session. We do not share your number with
        anyone else, and we do not use it for marketing. You can see every place your number is
        used from your account settings.
      </>
    ),
  },
  {
    id: 'faq-priv-records',
    category: 'privacy',
    q: 'Who can see my medical notes?',
    a: (
      <>
        Only you and the physiotherapist you booked with. Notes are stored encrypted and are not
        shared with other providers or third parties. You can export or delete your records from
        the{' '}
        <Link href="/patient/settings" className="text-[#00766C] font-semibold hover:underline">
          settings page
        </Link>{' '}
        at any time.
      </>
    ),
  },
]

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('booking')
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      // Each category group fades and rises as it enters view. Headings drive
      // the trigger so the reveal feels tied to the section title.
      gsap.utils.toArray<HTMLElement>('[data-faq-group]').forEach((group) => {
        gsap.from(group.querySelectorAll('[data-faq-item]'), {
          opacity: 0,
          y: 20,
          duration: 0.5,
          ease: 'power2.out',
          stagger: 0.08,
          scrollTrigger: {
            trigger: group,
            start: 'top 80%',
            once: true,
          },
        })
      })
    },
    { scope },
  )

  // Scroll-spy: update activeCategory as the user scrolls through the answers.
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (!visible) return
        const cat = visible.target.getAttribute('data-category') as CategoryId | null
        if (cat) setActiveCategory(cat)
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: 0 },
    )

    for (const heading of document.querySelectorAll('[data-faq-heading]')) {
      observer.observe(heading)
    }
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={scope}
      className="relative z-0 isolate bg-white py-24 md:py-32"
      aria-label="Frequently asked questions"
      id="faq"
    >
      <div className="bp-container">
        <div className="mb-14 max-w-2xl">
          <div
            className="bp-kicker mb-4"
            style={{
              background: 'rgba(0,118,108,0.08)',
              borderColor: 'rgba(0,118,108,0.2)',
              color: '#00766C',
            }}
          >
            Common questions
          </div>
          <h2 className="text-slate-900 mb-3">
            Before you book, here is what people usually want to know.
          </h2>
          <p className="text-slate-500 text-[17px] leading-relaxed">
            Jump to a category on the left — or scroll through all of them. If yours is not here,
            we are happy to help over chat.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-[260px_1fr] items-start">

          {/* Left: sticky category nav */}
          <nav
            aria-label="FAQ categories"
            className="lg:sticky lg:top-28 flex overflow-x-auto lg:overflow-visible lg:flex-col gap-2 -mx-4 px-4 lg:mx-0 lg:px-0"
          >
            {CATEGORIES.map((cat) => {
              const isActive = cat.id === activeCategory
              return (
                <a
                  key={cat.id}
                  href={`#faq-${cat.id}`}
                  aria-current={isActive ? 'true' : undefined}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    'shrink-0 lg:shrink rounded-[var(--sq-sm)] border px-4 py-3 transition-colors',
                    isActive
                      ? 'border-[#00766C]/25 bg-[#E6F4F3]/60 text-[#00766C]'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
                  )}
                >
                  <div className="text-[14px] font-semibold">{cat.label}</div>
                  <div className={cn('text-[12px] mt-0.5 hidden lg:block', isActive ? 'text-[#00766C]/75' : 'text-slate-500')}>
                    {cat.description}
                  </div>
                </a>
              )
            })}
          </nav>

          {/* Right: full answers grouped by category */}
          <div className="space-y-16">
            {CATEGORIES.map((cat) => {
              const items = FAQS.filter((f) => f.category === cat.id)
              return (
                <div key={cat.id} data-faq-group id={`faq-${cat.id}`} className="scroll-mt-28">
                  <h3
                    data-faq-heading
                    data-category={cat.id}
                    className="text-[13px] font-bold uppercase tracking-widest text-[#00766C] mb-5"
                  >
                    {cat.label}
                  </h3>
                  <div className="space-y-6">
                    {items.map((item) => (
                      <article key={item.id} data-faq-item id={item.id} className="scroll-mt-28">
                        <h4 className="text-slate-900 text-[18px] font-semibold mb-2">
                          {item.q}
                        </h4>
                        <div className="text-slate-600 text-[15px] leading-[1.65]">
                          {item.a}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )
            })}

            {/* Still stuck CTA */}
            <div className="rounded-[var(--sq-lg)] border border-[#00766C]/15 bg-[#E6F4F3]/50 p-6 md:p-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[var(--sq-sm)] bg-white shrink-0">
                  <MessageCircle size={18} className="text-[#00766C]" />
                </div>
                <div>
                  <div className="text-slate-900 text-[15px] font-semibold">
                    Still stuck?
                  </div>
                  <div className="text-slate-500 text-[13px] mt-0.5">
                    Chat with our support team — most replies under 30 minutes.
                  </div>
                </div>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 px-5 py-3 bg-[#00766C] text-white rounded-full font-semibold text-[14px] hover:bg-[#005A52] transition-colors shrink-0 group"
              >
                Talk to us
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
