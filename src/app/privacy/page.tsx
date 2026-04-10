import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ShieldCheck, Lock, Sparkles } from 'lucide-react'

const SECTIONS = [
  { id: 'about', label: '1. About this policy' },
  { id: 'information-we-collect', label: '2. Information we collect' },
  { id: 'how-we-use', label: '3. How we use your information' },
  { id: 'sharing', label: '4. How we share information' },
  { id: 'retention', label: '5. How long we keep data' },
  { id: 'security', label: '6. Security measures' },
  { id: 'your-rights', label: '7. Your rights' },
  { id: 'cookies', label: '8. Cookies and tracking' },
  { id: 'children', label: '9. Children and minors' },
  { id: 'changes', label: '10. Updates to this policy' },
  { id: 'contact', label: '11. Grievance Officer' },
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
                    Our commitment
                  </h3>
                  <p className="mt-1.5 text-[13px] text-slate-600 leading-relaxed">
                    We collect only the information we actually need to run the booking service, and we never sell your personal or health data to advertisers.
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-[11px] font-semibold text-[#00766C] uppercase tracking-[0.16em]">
                    <Lock className="w-3.5 h-3.5" /> Encrypted in transit
                  </div>
                </div>
              </aside>

              {/* Body */}
              <div className="lg:col-span-8 space-y-10 lg:space-y-12 text-[15px] text-slate-600 leading-relaxed">
                <section id="about" className="scroll-mt-28">
                  <h2 className="text-[22px] lg:text-[24px] font-bold text-[#1A1C29] tracking-tight mb-4">
                    1. About this policy
                  </h2>
                  <p className="mb-3">
                    This Privacy Policy explains how BookPhysio.in (&quot;BookPhysio&quot;, &quot;we&quot;, &quot;us&quot;) collects, uses, shares and protects your personal information when you use our website, mobile web experience and related services (together, the &quot;Platform&quot;).
                  </p>
                  <p className="mb-3">
                    BookPhysio acts as a Data Fiduciary under the Digital Personal Data Protection Act, 2023 (the &quot;DPDP Act&quot;) with respect to the personal data of patients who book sessions on the Platform. For data submitted by providers during onboarding, we act both as a Data Fiduciary (for your account details) and as a processor of information you publish on your public profile.
                  </p>
                  <p>
                    If you do not agree with this policy, please do not use the Platform. By creating an account or making a booking, you confirm that you have read and accepted the terms below.
                  </p>
                </section>

                <section id="information-we-collect" className="scroll-mt-28">
                  <h2 className="text-[22px] lg:text-[24px] font-bold text-[#1A1C29] tracking-tight mb-4">
                    2. Information we collect
                  </h2>
                  <p className="mb-5">
                    We try to collect only what is needed to deliver a booking and support you after the session. The main categories are listed below.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                      <h4 className="text-[14px] font-semibold text-[#1A1C29]">Account details</h4>
                      <p className="mt-1.5 text-[13px] text-slate-600 leading-relaxed">
                        Name, mobile number, optional email, age band and gender, and your login history.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                      <h4 className="text-[14px] font-semibold text-[#1A1C29]">Booking details</h4>
                      <p className="mt-1.5 text-[13px] text-slate-600 leading-relaxed">
                        Reason for visit, visit type (clinic or home), selected provider, session date, address for home visits, and booking notes you write.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                      <h4 className="text-[14px] font-semibold text-[#1A1C29]">Payment details</h4>
                      <p className="mt-1.5 text-[13px] text-slate-600 leading-relaxed">
                        Razorpay transaction identifiers, amount, GST details on invoices, and refund status. We do not store your full card number or UPI PIN.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                      <h4 className="text-[14px] font-semibold text-[#1A1C29]">Provider profile data</h4>
                      <p className="mt-1.5 text-[13px] text-slate-600 leading-relaxed">
                        For physiotherapists: IAP or State Council registration number, qualifications, clinic address, consultation fees and service areas.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                      <h4 className="text-[14px] font-semibold text-[#1A1C29]">Device and usage data</h4>
                      <p className="mt-1.5 text-[13px] text-slate-600 leading-relaxed">
                        IP address, browser type, device identifiers, referring URL, pages viewed, and basic error logs, used for safety and debugging.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                      <h4 className="text-[14px] font-semibold text-[#1A1C29]">Support communications</h4>
                      <p className="mt-1.5 text-[13px] text-slate-600 leading-relaxed">
                        Messages and attachments you send to our support team, and our replies.
                      </p>
                    </div>
                  </div>
                </section>

                <section id="how-we-use" className="scroll-mt-28">
                  <h2 className="text-[22px] lg:text-[24px] font-bold text-[#1A1C29] tracking-tight mb-4">
                    3. How we use your information
                  </h2>
                  <ul className="space-y-3">
                    {[
                      'Create and secure your account, including mobile OTP verification through MSG91.',
                      'Confirm and manage your bookings, send appointment reminders and status updates by SMS or email.',
                      'Process payments and refunds through Razorpay, and generate GST-compliant invoices.',
                      'Verify that listed physiotherapists hold valid IAP or State Council registration.',
                      'Respond to your support requests, investigate issues and improve the Platform.',
                      'Detect fraud, abuse and security incidents, and comply with our legal obligations in India.',
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
                    We do not use your personal or health information for targeted advertising, and we do not sell it to third parties.
                  </p>
                </section>

                <section id="sharing" className="scroll-mt-28">
                  <h2 className="text-[22px] lg:text-[24px] font-bold text-[#1A1C29] tracking-tight mb-4">
                    4. How we share information
                  </h2>
                  <p className="mb-3">
                    We share the minimum amount of information needed to deliver the service. The main recipients are:
                  </p>
                  <ul className="space-y-3">
                    {[
                      'Your selected physiotherapist, who receives your name, contact number, booking notes and address (for home visits) so the session can take place.',
                      'Payment processors (Razorpay and its partner banks) to handle payments, refunds and chargebacks.',
                      'Messaging providers (MSG91 for SMS and OTP, Resend or a similar provider for email) strictly to deliver transactional messages.',
                      'Cloud and infrastructure providers (such as Supabase and Vercel) that host our database, authentication and application.',
                      'Professional advisors, such as auditors and lawyers, where required for running the business.',
                      'Regulators, law-enforcement authorities and courts, where we are legally required to disclose information.',
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

                <section id="retention" className="scroll-mt-28">
                  <h2 className="text-[22px] lg:text-[24px] font-bold text-[#1A1C29] tracking-tight mb-4">
                    5. How long we keep data
                  </h2>
                  <p className="mb-3">
                    We keep your personal information only for as long as we need it to provide the service and to meet our legal obligations.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex gap-3 items-start">
                      <div className="w-5 h-5 rounded-full bg-[#E6F4F3] flex items-center justify-center shrink-0 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00766C]" />
                      </div>
                      <span>Account and booking records are retained while your account is active and for up to eight years after closure, in line with Indian tax and accounting rules.</span>
                    </li>
                    <li className="flex gap-3 items-start">
                      <div className="w-5 h-5 rounded-full bg-[#E6F4F3] flex items-center justify-center shrink-0 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00766C]" />
                      </div>
                      <span>Payment and invoice records are retained for the period required by the Income Tax Act, 1961 and the CGST Act, 2017.</span>
                    </li>
                    <li className="flex gap-3 items-start">
                      <div className="w-5 h-5 rounded-full bg-[#E6F4F3] flex items-center justify-center shrink-0 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00766C]" />
                      </div>
                      <span>Server logs and debug data are typically kept for up to ninety days.</span>
                    </li>
                  </ul>
                </section>

                <section id="security" className="scroll-mt-28">
                  <h2 className="text-[22px] lg:text-[24px] font-bold text-[#1A1C29] tracking-tight mb-4">
                    6. Security measures
                  </h2>
                  <div className="rounded-2xl bg-[#00766C] text-white p-6 lg:p-8 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                    <Lock className="w-6 h-6 text-[#FF6B35] mb-3" />
                    <p className="text-[14px] lg:text-[15px] leading-relaxed text-white/85">
                      We use TLS encryption for data in transit, row-level access controls on our database, signed session cookies, rate limiting on sensitive endpoints and strict secret management. Payment card details are handled entirely by Razorpay and never touch our servers.{' '}
                      <span className="text-white font-semibold">
                        No online service can guarantee perfect security, but we take reasonable steps to protect your information and will notify affected users in line with Indian law if a serious breach occurs.
                      </span>
                    </p>
                  </div>
                </section>

                <section id="your-rights" className="scroll-mt-28">
                  <h2 className="text-[22px] lg:text-[24px] font-bold text-[#1A1C29] tracking-tight mb-4">
                    7. Your rights
                  </h2>
                  <p className="mb-3">
                    Subject to the DPDP Act and applicable law, you have the right to:
                  </p>
                  <ul className="space-y-3">
                    {[
                      'Access a summary of the personal data we hold about you and how it is being processed.',
                      'Correct information that is inaccurate, incomplete or out of date.',
                      'Ask us to erase your account and related personal data, where we are not legally required to keep it.',
                      'Withdraw any consent you have given us, at any time, without affecting processing that took place before withdrawal.',
                      'Nominate another individual to exercise these rights on your behalf in case of death or incapacity.',
                      'Raise a grievance with our Grievance Officer, and, if unresolved, with the Data Protection Board of India once it is operational.',
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
                    To exercise any of these rights, write to us at{' '}
                    <a href="mailto:privacy@bookphysio.in" className="font-semibold text-[#00766C] hover:text-[#005A52] underline underline-offset-4">
                      privacy@bookphysio.in
                    </a>{' '}
                    from the mobile number or email linked to your account. We aim to respond within thirty days.
                  </p>
                </section>

                <section id="cookies" className="scroll-mt-28">
                  <h2 className="text-[22px] lg:text-[24px] font-bold text-[#1A1C29] tracking-tight mb-4">
                    8. Cookies and tracking
                  </h2>
                  <p>
                    We use a small number of first-party cookies to keep you signed in, remember your language preference and protect the site from abuse. We do not use third-party advertising cookies or behavioural tracking. You can block or clear cookies in your browser settings, but some parts of the site, such as login, may stop working correctly if you do so.
                  </p>
                </section>

                <section id="children" className="scroll-mt-28">
                  <h2 className="text-[22px] lg:text-[24px] font-bold text-[#1A1C29] tracking-tight mb-4">
                    9. Children and minors
                  </h2>
                  <p>
                    The Platform is intended for adults aged eighteen and above. Parents or legal guardians may book sessions on behalf of a minor in their care. In those cases, the consent given and the information provided must relate to the guardian&apos;s own account, and the guardian remains responsible for the minor&apos;s care decisions.
                  </p>
                </section>

                <section id="changes" className="scroll-mt-28">
                  <h2 className="text-[22px] lg:text-[24px] font-bold text-[#1A1C29] tracking-tight mb-4">
                    10. Updates to this policy
                  </h2>
                  <p>
                    We may update this policy from time to time to reflect changes in the Platform, the law, or our practices. When we make a material change, we will update the date at the top of this page and, where appropriate, notify you by email or through the site. Continued use of the Platform after an update means you accept the revised policy.
                  </p>
                </section>

                <section id="contact" className="scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-6 lg:p-8 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                  <div className="flex flex-col md:flex-row gap-5 items-start text-left">
                    <div className="w-12 h-12 rounded-full bg-[#E6F4F3] text-[#00766C] flex items-center justify-center shrink-0">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-[16px] font-semibold text-[#1A1C29]">
                        11. Grievance Officer
                      </h3>
                      <p className="mt-2 text-[13px] text-slate-600 leading-relaxed">
                        In line with the DPDP Act, 2023 and the Information Technology (Intermediary Guidelines) Rules, 2021, you can reach our Grievance Officer for any privacy or content-related concern.
                      </p>
                      <p className="mt-3 text-[13px] text-slate-600 leading-relaxed">
                        Email:{' '}
                        <a
                          href="mailto:grievance@bookphysio.in"
                          className="font-semibold text-[#00766C] hover:text-[#005A52] underline underline-offset-4"
                        >
                          grievance@bookphysio.in
                        </a>
                      </p>
                      <p className="mt-1 text-[13px] text-slate-600 leading-relaxed">
                        Response time: within fifteen working days of a valid complaint.
                      </p>
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
