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

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function Testimonials() {
  return (
    <section className="bp-section bg-[#f4ecdf]" aria-label="Patient testimonials">
      <div className="bp-shell">
        <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="bp-kicker mb-5">
              <Star size={13} className="fill-current" />
              Patient stories
            </div>
            <h2 className="bp-title">Proof without the hard sell.</h2>
            <p className="bp-copy mt-4 max-w-xl">
              Real patients. Real results. Every review is tied to a verified booking.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-[#ddd3c6] bg-[#fffaf4] px-4 py-2 text-[13px] text-[#66706b]">
            <CheckCircle2 size={14} className="text-[#0f7668]" />
            Verified reviews only
          </div>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article key={testimonial.id} className="bp-card relative h-full p-6">
              <Quote className="absolute right-5 top-5 h-10 w-10 text-[#eadfce]" />

              <div className="flex gap-1 text-[#F59E0B]">
                {[...Array(5)].map((_, index) => (
                  <Star key={index} size={15} className="fill-current" />
                ))}
              </div>

              <p className="mt-5 text-[15px] leading-7 text-[#58645f]">“{testimonial.content}”</p>

              <div className="mt-6 flex items-center gap-3 border-t border-[#e1d7c9] pt-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#dcefe9] text-[15px] font-semibold text-[#18312d]">
                  {getInitials(testimonial.author)}
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-[#18312d]">{testimonial.author}</p>
                  <p className="text-[12px] text-[#66706b]">
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