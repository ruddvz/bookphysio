import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ArrowRight, Calendar, CheckCircle2, ShieldCheck, Sparkles, Stethoscope, FileText } from 'lucide-react'

export interface SpecialtyArticleData {
  title: string
  ncahpName?: string
  subtitle: string
  description: string
  highlights: string[]
  benefits: string[]
  conditions?: string[]
}

interface SpecialtyArticleProps {
  data: SpecialtyArticleData
  slug?: string
}

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'conditions', label: 'Common conditions' },
  { id: 'treatment', label: 'How treatment works' },
  { id: 'benefits', label: 'Patient benefits' },
  { id: 'booking', label: 'Book a session' },
]

export default function SpecialtyArticle({ data, slug }: SpecialtyArticleProps) {
  const bookingHref = slug
    ? `/search?specialty=${encodeURIComponent(slug)}`
    : `/search?condition=${encodeURIComponent(data.title)}`

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#FAFAFA]">
        {/* Hero */}
        <section className="border-b border-slate-200/70 bg-white">
          <div className="mx-auto max-w-[1142px] px-6 py-12 lg:py-16 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#E6F4F3] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#00766C]">
              <ShieldCheck className="h-3.5 w-3.5" />
              {data.ncahpName ? `NCAHP: ${data.ncahpName}` : 'Clinical specialty'}
            </div>
            <h1 className="mt-5 text-[30px] lg:text-[40px] font-bold tracking-tight leading-tight text-[#1A1C29]">
              {data.title} <span className="text-[#00766C]">in India</span>
            </h1>
            <p className="mt-4 mx-auto max-w-[720px] text-[15px] leading-relaxed text-slate-600 lg:text-[17px]">
              {data.subtitle}
            </p>
          </div>
        </section>

        {/* Content with TOC sidebar */}
        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-[1142px] px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">

              {/* Sidebar TOC */}
              <aside className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
                <div>
                  <h2 className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.2em] mb-4">
                    On this page
                  </h2>
                  <ul className="space-y-2">
                    {SECTIONS.filter((s) => s.id !== 'conditions' || data.conditions?.length).map((s) => (
                      <li key={s.id}>
                        <a
                          href={`#${s.id}`}
                          className="block rounded-xl px-4 py-3 text-[14px] font-semibold text-[#1A1C29] border border-slate-200 bg-white hover:border-[#00766C]/40 hover:bg-[#E6F4F3]/40 transition-colors"
                        >
                          {s.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                  <div className="w-11 h-11 rounded-full bg-[#E6F4F3] text-[#00766C] flex items-center justify-center">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <h3 className="mt-4 text-[15px] font-semibold text-[#1A1C29]">
                    Not medical advice
                  </h3>
                  <p className="mt-1.5 text-[13px] text-slate-600 leading-relaxed">
                    This page is for general information only. It does not replace a consultation with a qualified physiotherapist. Always seek professional advice for your specific condition.
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-[11px] font-semibold text-[#00766C] uppercase tracking-[0.16em]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> IAP-verified providers
                  </div>
                </div>
              </aside>

              {/* Main content */}
              <div className="lg:col-span-8 space-y-10 lg:space-y-12">

                {/* Overview */}
                <section id="overview" className="scroll-mt-28">
                  <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_1px_3px_rgba(15,23,42,0.04)] lg:p-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E6F4F3] text-[#00766C]">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Overview
                        </p>
                        <h2 className="text-[22px] lg:text-[24px] font-bold tracking-tight text-[#1A1C29]">
                          What this care covers
                        </h2>
                      </div>
                    </div>
                    <p className="text-[15px] leading-relaxed text-slate-600 lg:text-[16px]">
                      {data.description}
                    </p>
                  </div>
                </section>

                {/* Conditions */}
                {data.conditions && data.conditions.length > 0 && (
                  <section id="conditions" className="scroll-mt-28">
                    <h2 className="text-[22px] lg:text-[24px] font-bold text-[#1A1C29] tracking-tight mb-5">
                      Common conditions treated
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {data.conditions.map((condition) => (
                        <div
                          key={condition}
                          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]"
                        >
                          <div className="w-5 h-5 rounded-full bg-[#E6F4F3] flex items-center justify-center shrink-0">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#00766C]" />
                          </div>
                          <span className="text-[14px] font-medium text-slate-700">{condition}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Treatment approaches */}
                <section id="treatment" className="scroll-mt-28">
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] lg:p-7">
                    <div className="flex items-center gap-3 mb-6">
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
                    <div className="space-y-3">
                      {data.highlights.map((highlight, index) => {
                        const tints = [
                          'bg-[#E6F4F3] text-[#00766C]',
                          'bg-[#E7EEFB] text-[#2F5EC4]',
                          'bg-[#FEE9DD] text-[#C4532A]',
                          'bg-[#EDEAF8] text-[#5B4BC4]',
                        ]
                        return (
                          <div
                            key={highlight}
                            className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                          >
                            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${tints[index % tints.length]}`}>
                              <CheckCircle2 className="h-5 w-5" />
                            </div>
                            <p className="text-[14px] leading-relaxed text-slate-700">{highlight}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </section>

                {/* Benefits */}
                <section id="benefits" className="scroll-mt-28">
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] lg:p-7">
                    <div className="flex items-center gap-3 mb-6">
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
                    <div className="space-y-3">
                      {data.benefits.map((benefit, index) => {
                        const tints = [
                          'bg-[#FEE9DD] text-[#C4532A]',
                          'bg-[#E6F4F3] text-[#00766C]',
                          'bg-[#FCE7F3] text-[#BE185D]',
                          'bg-[#EEF2FF] text-[#4338CA]',
                        ]
                        return (
                          <div
                            key={benefit}
                            className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                          >
                            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${tints[index % tints.length]}`}>
                              <Sparkles className="h-5 w-5" />
                            </div>
                            <p className="text-[14px] leading-relaxed text-slate-700">{benefit}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </section>

                {/* CTA */}
                <section id="booking" className="scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-[0_1px_3px_rgba(15,23,42,0.04)] lg:p-10">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E6F4F3] text-[#00766C]">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <h2 className="mt-5 text-[22px] font-bold tracking-tight text-[#1A1C29] lg:text-[24px]">
                    Ready to start your recovery?
                  </h2>
                  <p className="mx-auto mt-3 max-w-[620px] text-[14px] leading-relaxed text-slate-600 lg:text-[15px]">
                    Browse verified physiotherapists, compare visit formats, and book the kind of specialist support that matches your condition and pace of recovery.
                  </p>
                  <Link
                    href={bookingHref}
                    className="group mt-6 inline-flex items-center gap-2 rounded-full bg-[#00766C] px-7 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#005A52]"
                  >
                    <Calendar className="h-4 w-4" />
                    Find a specialist
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </section>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
