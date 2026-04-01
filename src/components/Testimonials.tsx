'use client'

import { Star, Quote, CheckCircle2 } from 'lucide-react'

const testimonials = [
  {
    id: 1,
    content: 'The interface felt calm and direct. I found a sports physio with same-day availability without digging through clutter.',
    author: 'Arjun Mehta',
    role: 'Runner',
    city: 'Mumbai',
  },
  {
    id: 2,
    content: 'Home-visit options were obvious, the fee was transparent, and I could compare providers before booking anything.',
    author: 'Sarah Kapoor',
    role: 'Product Manager',
    city: 'Delhi NCR',
  },
  {
    id: 3,
    content: 'It feels more trustworthy than a generic marketplace. The verification cues and booking flow are easy to read.',
    author: 'Vikram Singh',
    role: 'Founder',
    city: 'Bengaluru',
  },
]

export default function Testimonials() {
  return (
    <section className="bp-section bg-white">
      <div className="bp-shell">
        <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="bp-kicker mb-5">
              <Star size={13} className="fill-current" />
              Patient stories
            </div>
            <h2 className="bp-title">What patients are saying.</h2>
            <p className="bp-copy mt-4 max-w-xl">
              Keep the proof lightweight and readable. The goal is trust, not a wall of marketing copy.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-[#E6E8EC] bg-[#FCFDFD] px-4 py-2 text-[13px] text-slate-500">
            <CheckCircle2 size={14} className="text-[#00766C]" />
            Verified reviews only
          </div>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article key={testimonial.id} className="bp-card relative h-full p-6">
              <Quote className="absolute right-5 top-5 h-10 w-10 text-[#E6F4F3]" />

              <div className="flex gap-1 text-[#F59E0B]">
                {[...Array(5)].map((_, index) => (
                  <Star key={index} size={15} className="fill-current" />
                ))}
              </div>

              <p className="mt-5 text-[15px] leading-7 text-slate-600">“{testimonial.content}”</p>

              <div className="mt-6 flex items-center gap-3 border-t border-[#E6E8EC] pt-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E6F4F3] text-[15px] font-semibold text-[#005A52]">
                  {testimonial.author.charAt(0)}
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-slate-900">{testimonial.author}</p>
                  <p className="text-[12px] text-slate-500">
                    {testimonial.role} · {testimonial.city}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}