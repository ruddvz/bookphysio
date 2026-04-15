import { Star, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatIndiaDate } from '@/lib/india-date'
import type { ProviderProfile, ProviderReview } from '@/app/api/contracts/provider'

const cardClass = 'bg-white rounded-[var(--sq-lg)] border border-slate-200 p-6 lg:p-8 mb-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-all duration-200 hover:shadow-[0_4px_12px_rgba(15,23,42,0.06)] relative'

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={size}
          className={cn(
            i < Math.floor(rating)
              ? 'text-[#F5A623] fill-[#F5A623]'
              : i < rating
                ? 'text-[#F5A623] fill-[#F5A623] opacity-50'
                : 'text-[#E5E7EB] fill-[#E5E7EB]'
          )}
        />
      ))}
    </div>
  )
}

interface ReviewsSectionProps {
  provider: ProviderProfile
  nameWithTitle: string
}

export default function ReviewsSection({ provider, nameWithTitle }: ReviewsSectionProps) {
  const reviews: ProviderReview[] = provider.reviews ?? []

  return (
    <section className={cn(cardClass, 'border-bp-border/10 bg-[#FBFCFD] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.03)]')} aria-labelledby="reviews-heading">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 relative z-10 px-2 lg:px-4">
        <div className="max-w-md">
          <h2 id="reviews-heading" className="text-[28px] font-bold text-bp-primary mb-2 tracking-tight">
            Patient Transformations
          </h2>
          <p className="text-[15px] text-bp-body/50 font-bold leading-relaxed">
            Verified outcomes and recovery stories from patients under professional care.
          </p>
        </div>
        <div className="flex items-center gap-8 p-6 bg-white rounded-[var(--sq-lg)] border border-bp-border/30 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-bp-primary/[0.03] rounded-bl-[60px] -z-0" />
          <div className="text-right relative z-10">
            <div className="text-[44px] font-bold text-bp-primary leading-none tracking-tighter">{(provider.rating_avg ?? 0).toFixed(1)}</div>
            <div className="text-[11px] font-bold text-bp-body/30 uppercase tracking-[0.2em] mt-2 pr-1">Out of 5.0</div>
          </div>
          <div className="w-px h-12 bg-bp-border/60" />
          <div className="flex flex-col gap-1.5 relative z-10">
            <StarRating rating={provider.rating_avg ?? 0} size={18} />
            <span className="text-[11px] font-bold text-bp-primary/70 uppercase tracking-widest">{provider.rating_count ?? 0} Clinical Reviews</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 px-2 lg:px-4">
        {reviews.length > 0 ? (
          reviews.filter((r) => r.comment).slice(0, 5).map((review) => (
            <article key={review.id} className="group p-8 lg:p-10 rounded-[var(--sq-lg)] bg-white border border-bp-border/20 hover:border-bp-primary/30 hover:shadow-[0_12px_48px_-8px_rgba(0,118,108,0.05)] transition-all duration-700 relative overflow-hidden">
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-[var(--sq-lg)] bg-bp-surface border border-bp-border/40 flex items-center justify-center text-bp-primary text-xl font-bold shadow-inner shadow-black/[0.02]">
                    {review.comment?.charAt(0).toUpperCase() || 'P'}
                  </div>
                  <div>
                    <p className="text-[16px] font-bold text-bp-primary tracking-tight mb-1">Verified Patient</p>
                    <div className="flex items-center gap-3">
                      <StarRating rating={review.rating} size={14} />
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-100/50">Clinical Feedback</span>
                    </div>
                  </div>
                </div>
                <span className="text-[12px] text-bp-body/30 font-bold tracking-widest uppercase">
                  {formatIndiaDate(review.created_at, { month: 'short', year: 'numeric' })}
                </span>
              </div>

              <blockquote className="relative z-10">
                <p className="text-[18px] text-bp-primary/80 leading-[1.8] font-medium italic opacity-90 max-w-2xl group-hover:text-bp-primary transition-colors duration-500">
                  &quot;{review.comment}&quot;
                </p>
              </blockquote>
            </article>
          ))
        ) : (
          <div className="py-24 text-center bg-white rounded-[var(--sq-lg)] border-2 border-dashed border-bp-border/40">
            <div className="w-20 h-20 bg-bp-surface rounded-[var(--sq-xl)] flex items-center justify-center mx-auto mb-6 shadow-sm border border-bp-border/20"><Mail className="text-bp-border" size={32} /></div>
            <h3 className="text-[18px] font-bold text-bp-primary/70 mb-2 tracking-tight">Clinical Outcomes Pending</h3>
            <p className="text-bp-body/40 text-[15px] font-bold max-w-sm mx-auto">Be among the first to document your professional recovery journey with {nameWithTitle}.</p>
          </div>
        )}
      </div>
    </section>
  )
}
