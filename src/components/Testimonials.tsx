'use client'

import { Star, ShieldCheck, Clock, Home } from 'lucide-react'
import useSWR from 'swr'

interface RecentReview {
  id: string
  rating: number
  comment: string
  providerName: string
  createdAt: string
}

interface RecentReviewsResponse {
  reviews: RecentReview[]
}

const fetcher = (url: string) => fetch(url).then(r => r.json()) as Promise<RecentReviewsResponse>

const PLATFORM_PROMISES = [
  {
    title: 'Verified credentials',
    description: 'We check every physiotherapist against their IAP or State Council registration before their profile goes live on the site.',
    icon: ShieldCheck,
    color: 'bg-indigo-100 text-indigo-700',
  },
  {
    title: 'Clear pricing',
    description: 'You see the session fee and any taxes before you book. The amount you pay at the end is the amount you saw at the start.',
    icon: Clock,
    color: 'bg-violet-100 text-violet-700',
  },
  {
    title: 'Clinic or home visit',
    description: 'Filter by home visit or in-clinic, compare providers side by side, and book whichever option fits your day better.',
    icon: Home,
    color: 'bg-emerald-100 text-emerald-700',
  },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={14}
          className={i <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}
        />
      ))}
    </div>
  )
}

function formatRelativeDate(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  if (days < 365) return `${Math.floor(days / 30)} months ago`
  return `${Math.floor(days / 365)} years ago`
}

function ReviewCards({ reviews }: { reviews: RecentReview[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {reviews.map(review => (
        <article
          key={review.id}
          className="flex flex-col p-7 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/60 hover:-translate-y-1 transition-all duration-200"
        >
          <StarRating rating={review.rating} />
          <p className="text-slate-600 text-[15px] leading-relaxed mt-4 flex-1 line-clamp-4">
            &ldquo;{review.comment}&rdquo;
          </p>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-[13px] text-slate-500">
              About <span className="font-semibold text-slate-700">{review.providerName}</span>
            </p>
            <p className="text-[12px] text-slate-400 mt-0.5">{formatRelativeDate(review.createdAt)}</p>
          </div>
        </article>
      ))}
    </div>
  )
}

function PromiseCards() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {PLATFORM_PROMISES.map(p => (
        <article
          key={p.title}
          className="flex flex-col p-7 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/60 hover:-translate-y-1 transition-all duration-200"
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${p.color}`}>
            <p.icon size={22} />
          </div>
          <h3 className="text-slate-900 text-[17px] font-semibold mb-2">{p.title}</h3>
          <p className="text-slate-500 text-[15px] leading-relaxed flex-1">{p.description}</p>
        </article>
      ))}
    </div>
  )
}

export default function Testimonials() {
  const { data } = useSWR<RecentReviewsResponse>('/api/reviews/recent', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  })

  const hasReviews = data?.reviews && data.reviews.length > 0

  return (
    <section className="bg-slate-50 py-24 md:py-32 border-y border-slate-100" aria-label={hasReviews ? 'Patient reviews' : 'Platform promises'}>
      <div className="bp-container">
        {/* Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-12">
          <div className="max-w-xl">
            <div className="bp-kicker mb-4">{hasReviews ? 'What patients say' : 'What to expect'}</div>
            <h2 className="text-slate-900 mb-3">
              {hasReviews ? 'Real reviews from real patients.' : 'Straightforward, start to finish.'}
            </h2>
            <p className="text-slate-500 text-[16px] leading-relaxed">
              {hasReviews
                ? 'Hear directly from patients who booked physiotherapy through BookPhysio.in.'
                : 'We are a new platform, so here is what we are promising from day one: verified providers, honest prices and no unnecessary steps.'}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[13px] font-semibold shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            All providers verified
          </div>
        </div>

        {/* Cards */}
        {hasReviews ? <ReviewCards reviews={data.reviews} /> : <PromiseCards />}
      </div>
    </section>
  )
}
