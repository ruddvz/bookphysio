import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ArrowRight, Calendar, CheckCircle2, ShieldCheck, Stethoscope } from 'lucide-react'
import type { SpecialtyCondition } from '@/lib/specialties'

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
  /** Path to 3D illustration image, e.g. /specialties/orthopaedic.png */
  image?: string
  /** Patient-friendly sub-label, e.g. "Bones & Joints" */
  subLabel?: string
  /** Rich conditions with slugs for clickable search links */
  richConditions?: readonly SpecialtyCondition[]
  /** Common presenting symptoms */
  symptoms?: readonly string[]
  /** Treatment approaches */
  treatments?: readonly string[]
  /** Equipment and modality tags */
  modalities?: readonly string[]
  /** Professional certifications to look for */
  certifications?: readonly string[]
}

/** Mustard yellow — matches the 3D illustration background exactly */
const MUSTARD = '#F5A623'

export default function SpecialtyArticle({
  data,
  slug,
  image,
  subLabel,
  richConditions,
  symptoms,
  treatments,
  modalities,
  certifications,
}: SpecialtyArticleProps) {
  const bookingHref = slug
    ? `/search?specialty=${encodeURIComponent(slug)}`
    : `/search?condition=${encodeURIComponent(data.title)}`

  return (
    <>
      <Navbar scrolledBg={MUSTARD} />

      <main className="min-h-screen" style={{ backgroundColor: MUSTARD }}>

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden pt-[68px]"
          style={{ backgroundColor: MUSTARD }}
          aria-label="Specialty hero"
        >
          <div className="mx-auto max-w-[1142px] px-6">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-0">

              {/* Left — text */}
              <div className="flex-1 py-14 lg:py-20 lg:pr-12 z-10">
                {/* NCAHP badge */}
                {data.ncahpName && (
                  <div className="inline-flex items-center gap-2 rounded-full border border-black/20 bg-black/10 px-3 py-1 mb-6">
                    <ShieldCheck className="h-3.5 w-3.5 text-black/70" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/70">
                      NCAHP: {data.ncahpName}
                    </span>
                  </div>
                )}

                {/* Sub-label */}
                {subLabel && (
                  <p className="text-[14px] font-bold uppercase tracking-[0.22em] text-black/60 mb-2">
                    {subLabel}
                  </p>
                )}

                {/* Title */}
                <h1 className="text-[36px] lg:text-[52px] font-black tracking-tight leading-[1.05] text-black mb-5">
                  {data.title}
                </h1>

                {/* Subtitle */}
                <p className="text-[17px] lg:text-[19px] leading-relaxed text-black/75 max-w-[520px] mb-8">
                  {data.subtitle}
                </p>

                {/* CTA */}
                <Link
                  href={bookingHref}
                  className="inline-flex items-center gap-2.5 rounded-full bg-black px-7 py-4 text-[15px] font-bold text-white transition-opacity hover:opacity-80 group"
                >
                  <Calendar className="h-4 w-4" />
                  Find a specialist
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>

                {/* Disclaimer chip */}
                <p className="mt-6 text-[11px] text-black/50 leading-relaxed max-w-[420px]">
                  This page is for general information only — not medical advice. Always consult a qualified physiotherapist.
                </p>
              </div>

              {/* Right — illustration image (seamless on mustard bg) */}
              {image && (
                <div className="relative lg:w-[480px] xl:w-[540px] shrink-0 self-end">
                  <Image
                    src={image}
                    alt={`${data.title} illustration`}
                    width={540}
                    height={480}
                    className="w-full h-auto object-contain object-bottom"
                    priority
                  />
                </div>
              )}

              {/* Fallback icon when no image */}
              {!image && (
                <div className="hidden lg:flex lg:w-[300px] shrink-0 items-center justify-center self-center">
                  <div className="w-32 h-32 rounded-full bg-black/10 flex items-center justify-center">
                    <Stethoscope className="w-16 h-16 text-black/40" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Subtle wave divider into content area */}
          <div
            className="absolute bottom-0 inset-x-0 h-8 pointer-events-none"
            style={{
              background: `linear-gradient(to bottom, transparent, ${MUSTARD})`,
            }}
          />
        </section>

        {/* ── Content cards on mustard background ─────────────────────── */}
        <section className="pb-24" style={{ backgroundColor: MUSTARD }}>
          <div className="mx-auto max-w-[1142px] px-6">

            {/* Overview */}
            <div className="mb-6">
              <div className="rounded-[var(--sq-lg)] bg-white p-8 shadow-[0_2px_16px_rgba(0,0,0,0.08)]">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-black/40 mb-2">Overview</h2>
                <h3 className="text-[22px] lg:text-[24px] font-bold text-black mb-4">What this care covers</h3>
                <p className="text-[15px] lg:text-[16px] leading-relaxed text-[#333333]">
                  {data.description}
                </p>
              </div>
            </div>

            {/* ── Conditions — rich cards with links (Phase 2) or plain list fallback ── */}
            {richConditions && richConditions.length > 0 ? (
              <div className="mb-6">
                <div className="rounded-[var(--sq-lg)] bg-white p-8 shadow-[0_2px_16px_rgba(0,0,0,0.08)]">
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-black/40 mb-2">Common conditions</h2>
                  <h3 className="text-[20px] font-bold text-black mb-5">Conditions treated</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {richConditions.map((condition) => (
                      <Link
                        key={condition.slug}
                        href={`/search?condition=${encodeURIComponent(condition.slug)}`}
                        className="group flex flex-col gap-1.5 rounded-xl p-4 transition-colors hover:bg-black/5"
                        style={{ backgroundColor: `${MUSTARD}22` }}
                      >
                        <span className="text-[14px] font-semibold text-black group-hover:underline">
                          {condition.name}
                        </span>
                        <span className="text-[13px] leading-relaxed text-[#555555]">
                          {condition.description}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : data.conditions && data.conditions.length > 0 ? (
              <div className="mb-6">
                <div className="rounded-[var(--sq-lg)] bg-white p-8 shadow-[0_2px_16px_rgba(0,0,0,0.08)]">
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-black/40 mb-2">Common conditions</h2>
                  <h3 className="text-[20px] font-bold text-black mb-5">Conditions treated</h3>
                  <ul className="space-y-3">
                    {data.conditions.map((condition) => (
                      <li key={condition} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: MUSTARD }}>
                          <div className="w-1.5 h-1.5 rounded-full bg-black" />
                        </div>
                        <span className="text-[14px] font-medium text-[#333333]">{condition}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}

            {/* ── Symptoms ─────────────────────────────────────────────── */}
            {symptoms && symptoms.length > 0 && (
              <div className="mb-6">
                <div className="rounded-2xl bg-white p-8 shadow-[0_2px_16px_rgba(0,0,0,0.08)]">
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-black/40 mb-2">Signs & symptoms</h2>
                  <h3 className="text-[20px] font-bold text-black mb-5">When to seek help</h3>
                  <ul className="grid sm:grid-cols-2 gap-3">
                    {symptoms.map((symptom) => (
                      <li key={symptom} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: MUSTARD }}>
                          <div className="w-1.5 h-1.5 rounded-full bg-black" />
                        </div>
                        <span className="text-[14px] leading-relaxed text-[#333333]">{symptom}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="grid lg:grid-cols-2 gap-6 mb-6">

              {/* Treatment approaches */}
              <div className="rounded-[var(--sq-lg)] bg-white p-8 shadow-[0_2px_16px_rgba(0,0,0,0.08)]">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-black/40 mb-2">Approach</h2>
                <h3 className="text-[20px] font-bold text-black mb-5">How treatment is delivered</h3>
                <ul className="space-y-3">
                  {(treatments ?? data.highlights).map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2
                        className="w-5 h-5 shrink-0 mt-0.5"
                        style={{ color: MUSTARD }}
                        strokeWidth={2.5}
                      />
                      <span className="text-[14px] leading-relaxed text-[#333333]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Modalities & certifications combined */}
              {(modalities?.length ?? 0) > 0 || (certifications?.length ?? 0) > 0 ? (
                <div className="rounded-2xl bg-white p-8 shadow-[0_2px_16px_rgba(0,0,0,0.08)]">
                  {modalities && modalities.length > 0 && (
                    <>
                      <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-black/40 mb-2">Equipment used</h2>
                      <h3 className="text-[20px] font-bold text-black mb-4">Modalities & equipment</h3>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {modalities.map((m) => (
                          <span
                            key={m}
                            className="rounded-full px-3 py-1 text-[13px] font-medium text-black/80"
                            style={{ backgroundColor: `${MUSTARD}44` }}
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                  {certifications && certifications.length > 0 && (
                    <>
                      <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-black/40 mb-2">Qualifications to look for</h2>
                      <h3 className="text-[18px] font-bold text-black mb-4">Relevant certifications</h3>
                      <div className="flex flex-wrap gap-2">
                        {certifications.map((c) => (
                          <span
                            key={c}
                            className="rounded-full border border-black/15 bg-white px-3 py-1 text-[13px] font-medium text-black/80"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : null}
            </div>

            {/* Benefits */}
            <div className="mb-6">
              <div className="rounded-[var(--sq-lg)] bg-white p-8 shadow-[0_2px_16px_rgba(0,0,0,0.08)]">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-black/40 mb-2">Patient benefits</h2>
                <h3 className="text-[20px] font-bold text-black mb-5">What better recovery looks like</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {data.benefits.map((benefit) => (
                    <div
                      key={benefit}
                      className="flex items-start gap-3 rounded-[var(--sq-sm)] p-4"
                      style={{ backgroundColor: `${MUSTARD}22` }}
                    >
                      <div
                        className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                        style={{ backgroundColor: MUSTARD }}
                      />
                      <p className="text-[14px] leading-relaxed font-medium text-black">{benefit}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA card — solid black for contrast */}
            <div
              className="rounded-[var(--sq-lg)] p-10 text-center"
              style={{ backgroundColor: '#000000' }}
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/10 mb-5">
                <Calendar className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-[24px] lg:text-[28px] font-black tracking-tight text-white mb-3">
                Ready to start your recovery?
              </h2>
              <p className="mx-auto max-w-[580px] text-[15px] leading-relaxed text-white/70 mb-7">
                Browse verified physiotherapists, compare visit formats, and book the specialist support that matches your condition and recovery pace.
              </p>
              <Link
                href={bookingHref}
                className="inline-flex items-center gap-2.5 rounded-full bg-white px-8 py-4 text-[15px] font-bold text-black transition-opacity hover:opacity-90 group"
              >
                <Calendar className="h-4 w-4" />
                Find a specialist
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
