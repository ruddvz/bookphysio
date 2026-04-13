'use client'

import useSWR from 'swr'
import { Quote, Star, ShieldCheck, Clock, UserCheck } from 'lucide-react'

type ReviewResponse = {
  reviews: Array<{
    id: string
    rating: number
    comment: string | null
    created_at: string
    provider: {
      full_name: string
      title: 'Dr.' | 'PT' | 'BPT' | 'MPT' | null
      specialty: string | null
    }
  }>
}

const TESTIMONIALS_URL = '/api/reviews?limit=3'

async function fetcher(url: string): Promise<ReviewResponse> {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch reviews')
  return res.json() as Promise<ReviewResponse>
}

export default function Testimonials() {
  const { data, error } = useSWR<ReviewResponse>(
    TESTIMONIALS_URL,
    fetcher,
    { revalidateOnFocus: false },
  )

  const reviews = (data?.reviews ?? []).filter((review) => Boolean(review.comment?.trim()))

  if (error || reviews.length === 0) {
    return (
      <section className="bg-slate-50 py-24 md:py-32 border-y border-slate-100" aria-label="Why patients trust BookPhysio">
        <div className="bp-container">
          <div className="max-w-xl mb-12">
            <div className="bp-kicker mb-4">Why BookPhysio</div>
            <h2 className="text-slate-900 mb-3">Trusted physiotherapy, simplified.</h2>
            <p className="text-slate-500 text-[16px] leading-relaxed">
              Every provider on our platform is verified, and every review comes from a completed appointment.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="flex flex-col p-7 bg-white rounded-2xl border border-slate-200">
              <ShieldCheck size={28} className="text-[#00766C] mb-4" />
              <h3 className="text-slate-900 text-[17px] font-semibold mb-2">Verified providers</h3>
              <p className="text-slate-500 text-[15px] leading-relaxed">
                All physiotherapists are credentialed and reviewed before joining the platform.
              </p>
            </div>
            <div className="flex flex-col p-7 bg-white rounded-2xl border border-slate-200">
              <Clock size={28} className="text-[#00766C] mb-4" />
              <h3 className="text-slate-900 text-[17px] font-semibold mb-2">Book in minutes</h3>
              <p className="text-slate-500 text-[15px] leading-relaxed">
                Find available slots, compare providers, and confirm your appointment online.
              </p>
            </div>
            <div className="flex flex-col p-7 bg-white rounded-2xl border border-slate-200">
              <UserCheck size={28} className="text-[#00766C] mb-4" />
              <h3 className="text-slate-900 text-[17px] font-semibold mb-2">Real patient feedback</h3>
              <p className="text-slate-500 text-[15px] leading-relaxed">
                Reviews are published only after completed visits — no fake testimonials.
              </p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-slate-50 py-24 md:py-32 border-y border-slate-100" aria-label="Patient reviews">
      <div className="bp-container">
        {/* Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-12">
          <div className="max-w-xl">
            <div className="bp-kicker mb-4">Patient reviews</div>
            <h2 className="text-slate-900 mb-3">What patients are saying after treatment.</h2>
            <p className="text-slate-500 text-[16px] leading-relaxed">
              Published reviews only appear after a completed appointment, so every quote here comes from a real BookPhysio visit.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[13px] font-semibold shrink-0">
            <Quote size={14} />
            Verified post-visit feedback
          </div>
        </div>

        {/* Cards */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="flex flex-col p-7 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/60 hover:-translate-y-1 transition-all duration-200"
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} size={16} className={index < review.rating ? 'fill-current' : 'text-slate-200'} />
                  ))}
                </div>
                <span className="text-[12px] font-semibold text-slate-400">{review.created_at}</span>
              </div>

              <p className="text-slate-700 text-[15px] leading-relaxed flex-1">&ldquo;{review.comment}&rdquo;</p>

              <div className="mt-6 border-t border-slate-100 pt-4">
                <h3 className="text-slate-900 text-[17px] font-semibold">
                  {(review.provider.title ? `${review.provider.title} ` : '') + review.provider.full_name}
                </h3>
                <p className="mt-1 text-[13px] font-medium text-slate-500">{review.provider.specialty ?? 'Physiotherapist'}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
