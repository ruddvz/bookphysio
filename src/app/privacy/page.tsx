import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ShieldCheck, Lock, Sparkles } from 'lucide-react'

const SECTIONS = [
  { id: 'introduction', label: '1. Introduction' },
  { id: 'data-collection', label: '2. Collection' },
  { id: 'data-usage', label: '3. Usage' },
  { id: 'data-security', label: '4. Security' },
  { id: 'sharing', label: '5. Sharing' },
]

export default function PrivacyPage() {
  return (
    <>
      <Navbar locale="en" localeSwitchPath="/privacy" />

      <main className="bg-[#FAFAFA] min-h-screen">
        {/* Hero */}
        <section className="bg-white border-b border-slate-200/70">
          <div className="max-w-[1142px] mx-auto px-6 py-12 lg:py-16 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E6F4F3] text-[#00766C] rounded-full text-[11px] font-semibold uppercase tracking-[0.18em] mb-5">
              Data Protection
            </div>
            <h1 className="text-[30px] lg:text-[40px] font-bold tracking-tight text-[#1A1C29] leading-tight">
              Privacy <span className="text-[#00766C]">Policy</span>
            </h1>
            <p className="mt-4 text-[14px] text-slate-500">
              Last updated: March 2026 · Clinical Governance v4.2
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 lg:py-16">
          <div className="max-w-[1142px] mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
              {/* TOC */}
              <aside className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
                <div>
                  <h2 className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.2em] mb-4">
                    Legal Index
                  </h2>
                  <ul className="space-y-2">
                    {SECTIONS.map((s) => (
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
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="mt-4 text-[15px] font-semibold text-[#1A1C29]">
                    Clinical Governance
                  </h3>
                  <p className="mt-1.5 text-[13px] text-slate-600 leading-relaxed">
                    We use layered technical and organisational safeguards designed to protect
                    account, booking, and payment data on the platform.
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-[11px] font-semibold text-[#00766C] uppercase tracking-[0.16em]">
                    <Lock className="w-3.5 h-3.5" /> Secured protocol
                  </div>
                </div>
              </aside>

              {/* Body */}
              <div className="lg:col-span-8 space-y-10 lg:space-y-12 text-[15px] text-slate-600 leading-relaxed">
                <section id="introduction" className="scroll-mt-28">
                  <h2 className="text-[22px] lg:text-[24px] font-bold text-[#1A1C29] tracking-tight mb-4">
                    1. Introduction
                  </h2>
                  <p className="text-[15px] text-[#1A1C29] font-semibold mb-3">
                    At BookPhysio.in, your privacy is our top clinical priority.
                  </p>
                  <p>
                    This Privacy Policy describes how we collect, use, and share your personal
                    information when you use our website, mobile application, and related clinical
                    services (collectively, the &quot;Platform&quot;). Our approach is built around
                    minimum necessary data use, access control, and operational safeguards.
                  </p>
                </section>

                <section id="data-collection" className="scroll-mt-28">
                  <h2 className="text-[22px] lg:text-[24px] font-bold text-[#1A1C29] tracking-tight mb-4">
                    2. Information Collection
                  </h2>
                  <p className="mb-5">
                    To provide you with the best experience and clinical care, we may collect
                    several types of information:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                      <h4 className="text-[14px] font-semibold text-[#1A1C29]">Personal Data</h4>
                      <p className="mt-1.5 text-[13px] text-slate-600 leading-relaxed">
                        Name, age, gender, phone number, and verified email address.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                      <h4 className="text-[14px] font-semibold text-[#1A1C29]">Clinical Data</h4>
                      <p className="mt-1.5 text-[13px] text-slate-600 leading-relaxed">
                        Reason for visit, preferred visit types, and historical booking logs.
                      </p>
                    </div>
                  </div>
                </section>

                <section id="data-usage" className="scroll-mt-28">
                  <h2 className="text-[22px] lg:text-[24px] font-bold text-[#1A1C29] tracking-tight mb-4">
                    3. How We Use Your Information
                  </h2>
                  <ul className="space-y-3">
                    {[
                      'To facilitate and confirm clinical bookings with verified physiotherapists.',
                      'To verify the IAP/State Council registration and credentials of providers.',
                      'To calculate booking charges, prepare GST-compliant summaries, and support the online checkout or pay-at-visit option shown in a booking flow.',
                      'To send real-time appointment reminders and clinical updates via MSG91.',
                    ].map((item) => (
                      <li key={item} className="flex gap-3 items-start">
                        <div className="w-5 h-5 rounded-full bg-[#E6F4F3] flex items-center justify-center shrink-0 mt-0.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#00766C]" />
                        </div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section id="data-security" className="scroll-mt-28">
                  <h2 className="text-[22px] lg:text-[24px] font-bold text-[#1A1C29] tracking-tight mb-4">
                    4. Security Measures
                  </h2>
                  <div className="rounded-2xl bg-[#00766C] text-white p-6 lg:p-8 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                    <Lock className="w-6 h-6 text-[#FF6B35] mb-3" />
                    <p className="text-[14px] lg:text-[15px] leading-relaxed text-white/85">
                      We implement industry-standard technical and organizational measures to
                      safeguard your information against unauthorized access, modification, or
                      destruction.{' '}
                      <span className="text-white font-semibold">
                        We never sell your personal or clinical data to third-party advertisers.
                      </span>
                    </p>
                  </div>
                </section>

                <section id="sharing" className="scroll-mt-28">
                  <h2 className="text-[22px] lg:text-[24px] font-bold text-[#1A1C29] tracking-tight mb-4">
                    5. Information Sharing
                  </h2>
                  <p>
                    We only share information that is necessary to deliver the booking and care
                    experience. That can include appointment details shared with your selected
                    physiotherapist, payment details shared with our payment processor for online
                    checkout flows or with the provider when a pay-at-visit option is explicitly
                    shown, prompts you choose to submit through BookPhysio AI features that are
                    processed by our AI service providers to generate a response, and legally
                    required disclosures to regulators or law-enforcement authorities when
                    applicable.
                  </p>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:p-8 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                  <div className="flex flex-col md:flex-row gap-5 items-center md:items-start text-center md:text-left">
                    <div className="w-12 h-12 rounded-full bg-[#E6F4F3] text-[#00766C] flex items-center justify-center shrink-0">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-[16px] font-semibold text-[#1A1C29]">
                        Data Protection Officer
                      </h3>
                      <p className="mt-1 text-[13px] text-slate-600 leading-relaxed">
                        Questions regarding clinical data privacy or protection protocols?
                      </p>
                      <a
                        href="mailto:privacy@bookphysio.in"
                        className="mt-2 inline-block text-[14px] font-semibold text-[#00766C] hover:text-[#005A52] underline underline-offset-4"
                      >
                        privacy@bookphysio.in
                      </a>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer locale="en" localeSwitchPath="/privacy" />
    </>
  )
}
