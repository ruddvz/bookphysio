import { Star } from 'lucide-react'

const testimonials = [
  {
    quote: 'The interface felt calm and direct. I found a sports physio with same-day availability without digging through clutter.',
    name: 'Arjun Mehta',
    role: 'Runner',
    city: 'Mumbai',
    rating: 5,
    initials: 'AM',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    quote: 'Home-visit options were obvious, the fee was transparent, and I could compare providers before committing to anything.',
    name: 'Sarah Kapoor',
    role: 'Product Manager',
    city: 'Delhi NCR',
    rating: 5,
    initials: 'SK',
    color: 'bg-indigo-100 text-indigo-700',
  },
  {
    quote: "It feels more trustworthy than a generic marketplace. The verification cues and clean booking flow made all the difference.",
    name: 'Vikram Singh',
    role: 'Founder',
    city: 'Bengaluru',
    rating: 5,
    initials: 'VS',
    color: 'bg-violet-100 text-violet-700',
  },
]

export default function Testimonials() {
  return (
    <section className="bg-slate-50 py-24 md:py-32 border-y border-slate-100" aria-label="Patient testimonials">
      <div className="bp-container">
        {/* Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-12">
          <div className="max-w-xl">
            <div className="bp-kicker mb-4">Patient Stories</div>
            <h2 className="text-slate-900 mb-3">Proof without the hard sell.</h2>
            <p className="text-slate-500 text-[16px] leading-relaxed">
              Real patients, real results. Every review is tied to a verified booking.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[13px] font-semibold shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Verified reviews only
          </div>
        </div>

        {/* Cards */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {testimonials.map(t => (
            <article
              key={t.name}
              className="flex flex-col p-7 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/60 hover:-translate-y-1 transition-all duration-200"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-slate-700 text-[15px] leading-relaxed flex-1 mb-6">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3 pt-5 border-t border-slate-100">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0 ${t.color}`}>
                  {t.initials}
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-slate-900">{t.name}</div>
                  <div className="text-[12px] text-slate-400">{t.role} · {t.city}</div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Aggregate rating */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-center">
          <div className="flex gap-1">
            {[1,2,3,4,5].map(i => (
              <Star key={i} size={18} className="fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-slate-900 font-bold text-[16px]">4.9 / 5</span>
          <span className="text-slate-400 text-[14px]">— from 1,200+ verified patient reviews</span>
        </div>
      </div>
    </section>
  )
}