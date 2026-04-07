import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { FileText, AlertCircle, Scale, CheckCircle2 } from 'lucide-react'

const SECTIONS = [
  { id: 'acceptance', label: '1. Acceptance' },
  { id: 'description', label: '2. Service Scope' },
  { id: 'responsibilities', label: '3. Responsibilities' },
  { id: 'verification', label: '4. Provider Audit' },
  { id: 'liability', label: '5. Liability' },
]

export default function TermsPage() {
  return (
    <>
      <Navbar locale="en" localeSwitchPath="/terms" />

      <main className="bg-[#FAFAFA] min-h-screen">
        {/* Hero */}
        <section className="bg-white border-b border-slate-200/70">
          <div className="max-w-[1142px] mx-auto px-6 py-12 lg:py-16 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E6F4F3] text-[#00766C] rounded-full text-[11px] font-semibold uppercase tracking-[0.18em] mb-5">
              Legal Framework
            </div>
            <h1 className="text-[30px] lg:text-[40px] font-bold tracking-tight text-[#1A1C29] leading-tight">
              Terms of <span className="text-[#00766C]">Service</span>
            </h1>
            <p className="mt-4 text-[14px] text-slate-500">
              Last updated: March 2026 · Agreement v2.1
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
                    Agreement Index
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
                    <Scale className="w-5 h-5" />
                  </div>
                  <h3 className="mt-4 text-[15px] font-semibold text-[#1A1C29]">
                    Legal Transparency
                  </h3>
                  <p className="mt-1.5 text-[13px] text-slate-600 leading-relaxed">
                    Clear boundaries between the technology platform and the physical
                    rehabilitation services provided by clinicians.
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-[11px] font-semibold text-[#00766C] uppercase tracking-[0.16em]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Binding agreement
                  </div>
                </div>
              </aside>

              {/* Body */}
              <div className="lg:col-span-8 space-y-10 lg:space-y-12 text-[15px] text-slate-600 leading-relaxed">
                <section id="acceptance" className="scroll-mt-28">
                  <h2 className="text-[22px] lg:text-[24px] font-bold text-[#1A1C29] tracking-tight mb-4">
                    1. Acceptance of Terms
                  </h2>
                  <p className="text-[15px] text-[#1A1C29] font-semibold mb-3">
                    Welcome to BookPhysio.in. By using our website and services, you enter into a
                    binding legal agreement.
                  </p>
                  <p>
                    You agree to comply with and be bound by the following terms and conditions. If
                    you do not agree to these terms, please refrain from using our clinical
                    marketplace. These terms apply to all patients, visitors, and physiotherapy
                    providers globally.
                  </p>
                </section>

                <section id="description" className="scroll-mt-28">
                  <h2 className="text-[22px] lg:text-[24px] font-bold text-[#1A1C29] tracking-tight mb-4">
                    2. Service Description
                  </h2>
                  <div className="rounded-2xl bg-[#00766C] text-white p-6 lg:p-8 shadow-[0_1px_3px_rgba(15,23,42,0.04)] mb-4">
                    <FileText className="w-6 h-6 text-[#FF6B35] mb-3" />
                    <p className="text-[14px] lg:text-[15px] leading-relaxed text-white/85">
                      BookPhysio provides a digital platform connecting patients with
                      physiotherapists. We act strictly as an intermediary and marketplace.{' '}
                      <span className="text-white font-semibold">
                        BookPhysio does not provide medical advice or physiotherapy services
                        directly.
                      </span>
                    </p>
                  </div>
                  <p>Clinical outcomes are the sole responsibility of the attending physiotherapist.</p>
                </section>

                <section id="responsibilities" className="scroll-mt-28">
                  <h2 className="text-[22px] lg:text-[24px] font-bold text-[#1A1C29] tracking-tight mb-4">
                    3. User Responsibilities
                  </h2>
                  <ul className="space-y-3">
                    {[
                      'Users are responsible for providing accurate personal and medical history for clinical safety.',
                      'Booking charges and collection instructions are shown during checkout, and some sessions may still be settled directly with the provider only when that option is explicitly shown.',
                      'Cancellations must follow the established 4-hour advance window to ensure provider availability.',
                      'Users must respect the clinical boundaries of the physiotherapists during home-visit sessions.',
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

                <section id="verification" className="scroll-mt-28">
                  <h2 className="text-[22px] lg:text-[24px] font-bold text-[#1A1C29] tracking-tight mb-4">
                    4. Provider Verification
                  </h2>
                  <p>
                    We aim to verify all physiotherapists through their{' '}
                    <span className="text-[#1A1C29] font-semibold">
                      IAP (Indian Association of Physiotherapists) or State Council
                    </span>{' '}
                    registration. However, patients are advised to use their own judgment in
                    choosing the right provider for their clinical needs. BookPhysio is not liable
                    for any clinical outcome based on treatment decisions.
                  </p>
                </section>

                <section id="liability" className="scroll-mt-28">
                  <h2 className="text-[22px] lg:text-[24px] font-bold text-[#1A1C29] tracking-tight mb-4">
                    5. Limitation of Liability
                  </h2>
                  <p>
                    BookPhysio is responsible for operating the marketplace and payment workflow
                    with reasonable care, but the clinical advice, diagnosis, treatment plan, and
                    therapeutic outcome remain the responsibility of the treating physiotherapist.
                    To the extent permitted by law, our liability is limited to the platform fees
                    paid for the affected booking.
                  </p>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:p-8 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                  <div className="flex flex-col md:flex-row gap-5 items-center md:items-start text-center md:text-left">
                    <div className="w-12 h-12 rounded-full bg-[#FEE9DD] text-[#FF6B35] flex items-center justify-center shrink-0">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-[16px] font-semibold text-[#1A1C29]">
                        Notice of changes
                      </h3>
                      <p className="mt-1 text-[13px] text-slate-600 leading-relaxed">
                        These terms are subject to change without prior notice. Continued use of
                        the platform constitutes full agreement to the updated clinical framework.
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer locale="en" localeSwitchPath="/terms" />
    </>
  )
}
