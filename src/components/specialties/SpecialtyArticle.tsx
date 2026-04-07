import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ArrowRight, Calendar, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react'

export interface SpecialtyArticleData {
  title: string
  subtitle: string
  description: string
  highlights: string[]
  benefits: string[]
}

interface SpecialtyArticleProps {
  data: SpecialtyArticleData
}

const highlightTints = [
  'bg-[#E6F4F3] text-[#00766C]',
  'bg-[#E7EEFB] text-[#2F5EC4]',
  'bg-[#FEE9DD] text-[#C4532A]',
  'bg-[#EDEAF8] text-[#5B4BC4]',
]

const benefitTints = [
  'bg-[#FEE9DD] text-[#C4532A]',
  'bg-[#E6F4F3] text-[#00766C]',
  'bg-[#FCE7F3] text-[#BE185D]',
  'bg-[#EEF2FF] text-[#4338CA]',
]

export default function SpecialtyArticle({ data }: SpecialtyArticleProps) {
  const bookingHref = `/search?condition=${encodeURIComponent(data.title)}`

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#FAFAFA]">
        <section className="border-b border-slate-200/70 bg-white">
          <div className="mx-auto max-w-[1142px] px-6 py-12 lg:py-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#E6F4F3] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#00766C]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Clinical specialty
            </div>
            <h1 className="mt-5 text-[30px] lg:text-[40px] font-bold tracking-tight leading-tight text-[#1A1C29]">
              {data.title}
            </h1>
            <p className="mt-4 max-w-[720px] text-[15px] leading-relaxed text-slate-600 lg:text-[17px]">
              {data.subtitle}
            </p>
          </div>
        </section>

        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-[1142px] space-y-8 px-6 lg:space-y-10">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
              <article className="rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_1px_3px_rgba(15,23,42,0.04)] lg:p-10">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#00766C]">
                  What this care covers
                </p>
                <p className="mt-4 text-[15px] leading-relaxed text-slate-600 lg:text-[16px]">
                  {data.description}
                </p>
              </article>

              <div className="grid gap-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E6F4F3] text-[#00766C]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-[18px] font-semibold tracking-tight text-[#1A1C29]">
                    Clearer shortlisting
                  </h2>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">
                    Compare verified clinicians, visit styles, and pricing before choosing the right rehabilitation path.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FEE9DD] text-[#C4532A]">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-[18px] font-semibold tracking-tight text-[#1A1C29]">
                    Faster booking
                  </h2>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">
                    Move from specialty research to a real shortlist in one step, with clinic and home-visit options where available.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] lg:p-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E6F4F3] text-[#00766C]">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Core approaches
                    </p>
                    <h2 className="mt-1 text-[22px] lg:text-[24px] font-bold tracking-tight text-[#1A1C29]">
                      How treatment is delivered
                    </h2>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {data.highlights.map((highlight, index) => (
                    <div
                      key={highlight}
                      className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                    >
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${highlightTints[index % highlightTints.length]}`}>
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <p className="text-[14px] leading-relaxed text-slate-700">{highlight}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] lg:p-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FEE9DD] text-[#C4532A]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Patient benefits
                    </p>
                    <h2 className="mt-1 text-[22px] lg:text-[24px] font-bold tracking-tight text-[#1A1C29]">
                      What better recovery looks like
                    </h2>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {data.benefits.map((benefit, index) => (
                    <div
                      key={benefit}
                      className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                    >
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${benefitTints[index % benefitTints.length]}`}>
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <p className="text-[14px] leading-relaxed text-slate-700">{benefit}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-[0_1px_3px_rgba(15,23,42,0.04)] lg:p-10">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E6F4F3] text-[#00766C]">
                <Calendar className="h-6 w-6" />
              </div>
              <h2 className="mt-5 text-[22px] font-bold tracking-tight text-[#1A1C29] lg:text-[24px]">
                Ready to start your recovery?
              </h2>
              <p className="mx-auto mt-3 max-w-[620px] text-[14px] leading-relaxed text-slate-600 lg:text-[15px]">
                Browse verified physiotherapists, compare visit formats, and book the kind of specialty support that matches your condition and pace of recovery.
              </p>
              <Link
                href={bookingHref}
                className="group mt-6 inline-flex items-center gap-2 rounded-full bg-[#00766C] px-7 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#005A52]"
              >
                <Calendar className="h-4 w-4" />
                Book a session in 60 seconds
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </section>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
