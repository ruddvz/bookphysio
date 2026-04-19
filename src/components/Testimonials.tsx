'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { ShieldCheck, Star } from 'lucide-react'
import useSWR from 'swr'
import { ScrollTrigger, revealOnScroll, useGSAP } from '@/lib/gsap-client'

type ReviewFeedItem = {
  id: string
  rating: number
  comment: string
  created_at: string
  provider: { full_name: string; title: string; specialty: string }
}

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error('Failed to load reviews')
    return res.json() as Promise<{ reviews: ReviewFeedItem[] }>
  })

export default function Testimonials() {
  const scope = useRef<HTMLElement>(null)
  const { data, error, isLoading } = useSWR<{ reviews: ReviewFeedItem[] }>(
    '/api/reviews?limit=3',
    fetcher,
    { revalidateOnFocus: false },
  )

  const reviews = !error && data?.reviews?.length ? data.reviews : null

  useGSAP(() => {
    revealOnScroll('[data-tl-left]', {
      y: 0,
      x: -32,
      duration: 0.7,
      ease: 'power2.out',
      trigger: scope.current,
      start: 'top 78%',
    })

    revealOnScroll('[data-tl-card]', {
      y: 28,
      duration: 0.55,
      ease: 'power2.out',
      stagger: 0.1,
      trigger: '[data-tl-cards]',
      start: 'top 80%',
    })
  }, { scope, dependencies: [ScrollTrigger, reviews?.length] })

  return (
    <section ref={scope} className="bg-[#E6F4F3] py-24 md:py-32" aria-label={reviews ? 'Patient stories' : 'Platform promises'}>
      <div className="bp-container">
        <div className="grid gap-16 lg:grid-cols-2 items-center">

          {/* Left: kicker + heading + quote + female physio */}
          <div className="relative" data-tl-left>
            <div
              className="bp-kicker mb-4"
              style={{ background: 'rgba(0,118,108,0.1)', borderColor: 'rgba(0,118,108,0.25)', color: '#00766C' }}
            >
              What to expect
            </div>
            <h2 className="text-slate-900 mb-4">Straightforward, start to finish.</h2>
            <p className="text-slate-600 text-[16px] leading-relaxed mb-8">
              We are a new platform, so here is what we are promising from day one: verified providers, honest prices and no unnecessary steps.
            </p>

            {/* Pull quote */}
            <div className="bg-white rounded-[var(--sq-lg)] p-7 border border-[#00766C]/15 shadow-sm relative overflow-hidden">
              <div className="text-[64px] font-serif text-[#00766C]/15 leading-none -mt-3 -ml-1 mb-1 select-none">&ldquo;</div>
              <p className="text-slate-700 text-[17px] leading-relaxed font-medium italic">
                We only list physiotherapists we&rsquo;ve verified ourselves. That&rsquo;s the whole product.
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#E6F4F3] border-2 border-[#00766C]/20 flex items-center justify-center">
                  <ShieldCheck size={15} className="text-[#00766C]" />
                </div>
                <span className="text-[13px] font-semibold text-slate-500">The BookPhysio team</span>
              </div>
            </div>

            {/* Female physio character */}
            <div className="hidden lg:flex justify-end mt-6 pointer-events-none select-none">
              <Image
                src="/images/characters/physio-female-waving.png"
                alt=""
                width={150}
                height={230}
                className="object-contain object-bottom"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Right: live reviews or static promise cards */}
          <div className="space-y-4" data-tl-cards>
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[13px] font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                All providers verified
              </span>
            </div>

            {isLoading && !reviews ? (
              <div className="space-y-4">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    data-tl-card
                    className="h-32 rounded-[var(--sq-lg)] bg-white/60 border border-[#00766C]/10 animate-pulse"
                  />
                ))}
              </div>
            ) : null}

            {reviews
              ? reviews.map((r) => {
                  const displayName =
                    r.provider.title === 'Dr.'
                      ? `Dr. ${r.provider.full_name}`
                      : `${r.provider.title} ${r.provider.full_name}`
                  return (
                    <article
                      key={r.id}
                      data-tl-card
                      className="flex flex-col gap-3 p-6 bg-white rounded-[var(--sq-lg)] border border-[#00766C]/10 hover:border-[#00766C]/25 hover:shadow-md hover:shadow-[#00766C]/5 transition-all duration-200"
                    >
                      <div className="flex items-center gap-1 text-amber-500" aria-hidden>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
                            strokeWidth={1.5}
                          />
                        ))}
                      </div>
                      <p className="text-slate-700 text-[15px] leading-relaxed">{r.comment}</p>
                      <div className="flex flex-wrap items-baseline justify-between gap-2 pt-1 border-t border-slate-100">
                        <p className="text-slate-900 text-[15px] font-semibold">{displayName}</p>
                        <p className="text-slate-500 text-[13px]">
                          {r.provider.specialty} · {r.created_at}
                        </p>
                      </div>
                    </article>
                  )
                })
              : null}

            {!reviews && !isLoading ? (
              <p className="text-slate-600 text-[14px]" data-tl-card>
                Reviews will appear here as patients share their experience.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
