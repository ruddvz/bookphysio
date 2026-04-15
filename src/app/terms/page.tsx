import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { FileText, AlertCircle, Scale, CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service — BookPhysio.in',
  description:
    'Terms of use for the BookPhysio.in physiotherapy booking platform, covering accounts, bookings, payments, and provider responsibilities.',
  alternates: { canonical: 'https://bookphysio.in/terms' },
  openGraph: {
    title: 'Terms of Service — BookPhysio.in',
    description: 'Terms of use for BookPhysio.in.',
    url: 'https://bookphysio.in/terms',
    siteName: 'BookPhysio.in',
    locale: 'en_IN',
    type: 'website',
  },
}

const SECTIONS = [
  { id: 'acceptance', label: '1. Acceptance of terms' },
  { id: 'eligibility', label: '2. Eligibility' },
  { id: 'service', label: '3. What BookPhysio is' },
  { id: 'not-medical', label: '4. Not a medical service' },
  { id: 'accounts', label: '5. Accounts and access' },
  { id: 'bookings', label: '6. Bookings and payments' },
  { id: 'cancellation', label: '7. Cancellations and refunds' },
  { id: 'conduct', label: '8. Acceptable use' },
  { id: 'provider', label: '9. Provider obligations' },
  { id: 'content', label: '10. Content and intellectual property' },
  { id: 'liability', label: '11. Limitation of liability' },
  { id: 'indemnity', label: '12. Indemnity' },
  { id: 'termination', label: '13. Suspension and termination' },
  { id: 'law', label: '14. Governing law and disputes' },
  { id: 'changes', label: '15. Changes to these terms' },
  { id: 'contact', label: '16. Contact and grievance' },
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
              Last updated: April 2026
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
                    On this page
                  </h2>
                  <ul className="space-y-2">
                    {SECTIONS.map((s) => (
                      <li key={s.id}>
                        <a
                          href={`#${s.id}`}
                          className="block rounded-[var(--sq-sm)] px-4 py-3 text-[14px] font-semibold text-[#1A1C29] border border-slate-200 bg-white hover:border-[#00766C]/40 hover:bg-[#E6F4F3]/40 transition-colors"
                        >
                          {s.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-[var(--sq-lg)] border border-slate-200 bg-white p-5 lg:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                  <div className="w-11 h-11 rounded-full bg-[#E6F4F3] text-[#00766C] flex items-center justify-center">
                    <Scale className="w-5 h-5" />
                  </div>
                  <h3 className="mt-4 text-[15px] font-semibold text-[#1A1C29]">
                    Plain-language summary
                  </h3>
                  <p className="mt-1.5 text-[13px] text-slate-600 leading-relaxed">
                    BookPhysio is a booking platform. Physiotherapists provide the actual care. You need to use the site honestly and respectfully, and a few fair rules apply to refunds, liability and disputes.
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
                    1. Acceptance of terms
                  </h2>
                  <p className="mb-3">
                    These Terms of Service (&quot;Terms&quot;) form a legally binding agreement between you and BookPhysio.in (&quot;BookPhysio&quot;, &quot;we&quot;, &quot;us&quot;). By creating an account, booking a session or otherwise using the Platform, you confirm that you have read, understood and agreed to these Terms and to our{' '}
                    <a href="/privacy" className="font-semibold text-[#00766C] hover:text-[#005A52] underline underline-offset-4">Privacy Policy</a>.
                  </p>
                  <p>
                    If you do not agree with any part of these Terms, please do not use the Platform.
                  </p>
                </section>

                <section id="eligibility" className="scroll-mt-28">
                  <h2 className="text-[22px] lg:text-[24px] font-bold text-[#1A1C29] tracking-tight mb-4">
                    2. Eligibility
                  </h2>
                  <p>
                    You must be at least eighteen years old and legally able to enter into a contract under Indian law to use the Platform. If you are booking on behalf of a minor or a dependent family member, you confirm that you have the authority to do so and accept these Terms for them.
                  </p>
                </section>

                <section id="service" className="scroll-mt-28">
                  <h2 className="text-[22px] lg:text-[24px] font-bold text-[#1A1C29] tracking-tight mb-4">
                    3. What BookPhysio is
                  </h2>
                  <div className="rounded-[var(--sq-lg)] bg-[#00766C] text-white p-6 lg:p-8 shadow-[0_1px_3px_rgba(15,23,42,0.04)] mb-4">
                    <FileText className="w-6 h-6 text-[#FF6B35] mb-3" />
                    <p className="text-[14px] lg:text-[15px] leading-relaxed text-white/85">
                      BookPhysio is an online platform that helps patients find, compare and book sessions with independent physiotherapists practising in India.{' '}
                      <span className="text-white font-semibold">
                        We act as an intermediary under Section 79 of the Information Technology Act, 2000, and we do not provide physiotherapy or any other healthcare service ourselves.
                      </span>
                    </p>
                  </div>
                  <p>
                    The physiotherapists you book through the Platform are independent professionals. They are not our employees, agents or partners in any legal sense, and they are solely responsible for the clinical care they deliver.
                  </p>
                </section>

                <section id="not-medical" className="scroll-mt-28">
                  <h2 className="text-[22px] lg:text-[24px] font-bold text-[#1A1C29] tracking-tight mb-4">
                    4. Not a medical service
                  </h2>
                  <p className="mb-3">
                    Nothing on the Platform is medical advice, diagnosis, prescription or treatment. Any information we show about conditions, techniques or recovery is general educational content and should not be relied on for clinical decisions.
                  </p>
                  <p>
                    If you are having a medical emergency, please call your local emergency number or visit the nearest hospital. Do not use BookPhysio to seek urgent or emergency care.
                  </p>
                </section>

                <section id="accounts" className="scroll-mt-28">
                  <h2 className="text-[22px] lg:text-[24px] font-bold text-[#1A1C29] tracking-tight mb-4">
                    5. Accounts and access
                  </h2>
                  <ul className="space-y-3">
                    {[
                      'You agree to provide accurate, current and complete information when you register, and to keep it updated.',
                      'You are responsible for keeping your mobile number, OTP and login details confidential, and for every activity that takes place under your account.',
                      'You must notify us immediately if you suspect that your account has been used without your permission.',
                      'We may refuse to create, suspend or close an account if we reasonably believe it has been used to break these Terms or the law.',
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

                <section id="bookings" className="scroll-mt-28">
                  <h2 className="text-[22px] lg:text-[24px] font-bold text-[#1A1C29] tracking-tight mb-4">
                    6. Bookings and payments
                  </h2>
                  <p className="mb-3">
                    Session fees, applicable Goods and Services Tax (GST) and the payment option (online checkout or pay-at-visit, where the provider has enabled it) are shown clearly before you confirm a booking. All prices are in Indian Rupees (INR).
                  </p>
                  <p className="mb-3">
                    Online payments are handled by Razorpay and its partner banks. By completing a payment, you also agree to the applicable terms of the payment processor. We issue a GST-compliant invoice for every online payment processed through the Platform.
                  </p>
                  <p>
                    A booking is only confirmed once the provider has accepted it and you have received a confirmation message. If a booking cannot be honoured, you will receive a full refund of any amount already charged.
                  </p>
                </section>

                <section id="cancellation" className="scroll-mt-28">
                  <h2 className="text-[22px] lg:text-[24px] font-bold text-[#1A1C29] tracking-tight mb-4">
                    7. Cancellations and refunds
                  </h2>
                  <ul className="space-y-3">
                    {[
                      'You can cancel or reschedule a session free of charge up to four hours before the scheduled start time through your Patient Dashboard.',
                      'Cancellations made within four hours of the session, or no-shows, may be charged in full at the provider\u2019s discretion.',
                      'If the provider cancels, or if the session cannot take place for reasons attributable to the provider or BookPhysio, you will receive a full refund to the original payment method.',
                      'Refunds for eligible online payments are usually processed within five to seven working days, though the exact time depends on your bank.',
                      'If you believe a session was not delivered as promised, please contact us within seven days so that we can investigate with the provider.',
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

                <section id="conduct" className="scroll-mt-28">
                  <h2 className="text-[22px] lg:text-[24px] font-bold text-[#1A1C29] tracking-tight mb-4">
                    8. Acceptable use
                  </h2>
                  <p className="mb-3">You agree not to:</p>
                  <ul className="space-y-3">
                    {[
                      'Use the Platform for anything unlawful, fraudulent or harmful.',
                      'Misrepresent your identity, medical needs or relationship with a minor or dependent.',
                      'Harass, threaten, defame or behave inappropriately towards providers, staff or other users.',
                      'Attempt to access, scrape, reverse-engineer or disrupt the Platform or its security measures.',
                      'Post content that is misleading, defamatory, obscene, infringing or otherwise unlawful.',
                      'Use the Platform to solicit patients or promote services outside a booking context, unless we have given you written permission to do so.',
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

                <section id="provider" className="scroll-mt-28">
                  <h2 className="text-[22px] lg:text-[24px] font-bold text-[#1A1C29] tracking-tight mb-4">
                    9. Provider obligations
                  </h2>
                  <p className="mb-3">
                    Physiotherapists listed on the Platform are expected to:
                  </p>
                  <ul className="space-y-3">
                    {[
                      'Hold valid and current registration with the Indian Association of Physiotherapists (IAP) or a recognised State Council, and share their registration details with us for verification.',
                      'Provide care that follows the professional and ethical standards set by the IAP and any applicable state regulator.',
                      'Keep their availability, pricing and service details accurate, and honour confirmed bookings.',
                      'Handle patient information confidentially and only use it for the purpose of delivering care.',
                      'Issue appropriate receipts or invoices for any amounts collected directly at a pay-at-visit session.',
                    ].map((item) => (
                      <li key={item} className="flex gap-3 items-start">
                        <div className="w-5 h-5 rounded-full bg-[#E6F4F3] flex items-center justify-center shrink-0 mt-0.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#00766C]" />
                        </div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-5">
                    BookPhysio verifies registration details to the extent reasonably possible, but cannot guarantee the clinical outcome of any session. Patients are encouraged to exercise their own judgement when choosing a provider.
                  </p>
                </section>

                <section id="content" className="scroll-mt-28">
                  <h2 className="text-[22px] lg:text-[24px] font-bold text-[#1A1C29] tracking-tight mb-4">
                    10. Content and intellectual property
                  </h2>
                  <p className="mb-3">
                    The BookPhysio name, logo, design, site code and editorial content are owned by BookPhysio or its licensors and are protected by Indian and international intellectual property laws. You may not copy, modify, distribute, sell or create derivative works from any part of the Platform without our written permission, other than for personal, non-commercial use of the features we provide.
                  </p>
                  <p>
                    When you submit content to the Platform (such as reviews, booking notes or profile details), you keep ownership of it, but you grant us a non-exclusive, royalty-free, worldwide licence to host, display and use that content for the purpose of operating and improving the Platform.
                  </p>
                </section>

                <section id="liability" className="scroll-mt-28">
                  <h2 className="text-[22px] lg:text-[24px] font-bold text-[#1A1C29] tracking-tight mb-4">
                    11. Limitation of liability
                  </h2>
                  <p className="mb-3">
                    The Platform is provided on an &quot;as is&quot; and &quot;as available&quot; basis. We take reasonable care to keep the site running and the information on it accurate, but we do not guarantee that it will always be free of errors, interruptions or security incidents.
                  </p>
                  <p className="mb-3">
                    To the fullest extent permitted by Indian law, BookPhysio, its founders, employees and service providers are not liable for any clinical outcome, indirect loss, loss of data, loss of profits, or any special or consequential damages arising from your use of the Platform or from any session delivered by a provider you booked through it.
                  </p>
                  <p>
                    Our total liability to you for any claim connected with the Platform or a booking will not exceed the total platform fees actually paid by you for that booking.
                  </p>
                </section>

                <section id="indemnity" className="scroll-mt-28">
                  <h2 className="text-[22px] lg:text-[24px] font-bold text-[#1A1C29] tracking-tight mb-4">
                    12. Indemnity
                  </h2>
                  <p>
                    You agree to indemnify and hold BookPhysio harmless from any claim, demand, loss or expense (including reasonable legal fees) arising out of your breach of these Terms, your misuse of the Platform, or your violation of any law or the rights of another person.
                  </p>
                </section>

                <section id="termination" className="scroll-mt-28">
                  <h2 className="text-[22px] lg:text-[24px] font-bold text-[#1A1C29] tracking-tight mb-4">
                    13. Suspension and termination
                  </h2>
                  <p>
                    You can close your account at any time by writing to{' '}
                    <a href="mailto:support@bookphysio.in" className="font-semibold text-[#00766C] hover:text-[#005A52] underline underline-offset-4">support@bookphysio.in</a>.
                    We may suspend or terminate your access if we reasonably believe you have broken these Terms, put other users at risk, or engaged in unlawful activity. Sections of these Terms that by their nature should survive termination (such as liability, indemnity, content licence, and governing law) will continue to apply.
                  </p>
                </section>

                <section id="law" className="scroll-mt-28">
                  <h2 className="text-[22px] lg:text-[24px] font-bold text-[#1A1C29] tracking-tight mb-4">
                    14. Governing law and disputes
                  </h2>
                  <p className="mb-3">
                    These Terms are governed by the laws of India. If a dispute arises, we first ask you to contact us so we can try to resolve it informally within thirty days.
                  </p>
                  <p>
                    If informal resolution is not possible, the dispute will be submitted to the exclusive jurisdiction of the competent courts in Bengaluru, Karnataka, India, unless mandatory consumer-protection laws require otherwise.
                  </p>
                </section>

                <section id="changes" className="scroll-mt-28">
                  <h2 className="text-[22px] lg:text-[24px] font-bold text-[#1A1C29] tracking-tight mb-4">
                    15. Changes to these terms
                  </h2>
                  <p>
                    We may update these Terms from time to time. When we make material changes, we will update the date at the top of this page and, where appropriate, notify registered users by email or an in-app notice. Your continued use of the Platform after an update means you accept the revised Terms.
                  </p>
                </section>

                <section id="contact" className="scroll-mt-28 rounded-[var(--sq-lg)] border border-slate-200 bg-white p-6 lg:p-8 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                  <div className="flex flex-col md:flex-row gap-5 items-start text-left">
                    <div className="w-12 h-12 rounded-full bg-[#FEE9DD] text-[#FF6B35] flex items-center justify-center shrink-0">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-[16px] font-semibold text-[#1A1C29]">
                        16. Contact and grievance
                      </h3>
                      <p className="mt-2 text-[13px] text-slate-600 leading-relaxed">
                        For general questions about these Terms, write to{' '}
                        <a href="mailto:support@bookphysio.in" className="font-semibold text-[#00766C] hover:text-[#005A52] underline underline-offset-4">support@bookphysio.in</a>.
                      </p>
                      <p className="mt-2 text-[13px] text-slate-600 leading-relaxed">
                        For grievances under the Information Technology (Intermediary Guidelines) Rules, 2021 and the DPDP Act, 2023, please write to our Grievance Officer at{' '}
                        <a href="mailto:grievance@bookphysio.in" className="font-semibold text-[#00766C] hover:text-[#005A52] underline underline-offset-4">grievance@bookphysio.in</a>.
                        We aim to acknowledge grievances within forty-eight hours and resolve them within fifteen working days.
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
