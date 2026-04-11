import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Brain,
  ClipboardCheck,
  Dumbbell,
  Home,
  Monitor,
  RefreshCcw,
  ShieldCheck,
  Clock,
  MapPin,
  IndianRupee,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { SERVICES } from '@/lib/services'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Physiotherapy Services — BookPhysio',
  description:
    'Browse physiotherapy services available on BookPhysio — from initial assessments and follow-up sessions to sports rehab, neuro rehabilitation, home visits, and ergonomic assessments. Transparent pricing in ₹.',
  openGraph: {
    title: 'Physiotherapy Services — BookPhysio',
    description: 'Browse physiotherapy services with transparent pricing. Book verified physiotherapists across India.',
    url: 'https://bookphysio.in/services',
  },
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  ClipboardCheck,
  RefreshCcw,
  Home,
  Dumbbell,
  Brain,
  Monitor,
}

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'BookPhysio Physiotherapy Services',
  description: 'Physiotherapy services available on BookPhysio.in',
  itemListElement: SERVICES.map((s, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    item: {
      '@type': 'MedicalTherapy',
      name: s.name,
      description: s.description,
      offers: {
        '@type': 'Offer',
        price: s.startingPrice,
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
      },
    },
  })),
}

export default function ServicesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <Navbar />
      <main>
        {/* Hero */}
        <section
          className="relative pt-28 pb-20 md:pt-36 md:pb-28"
          style={{ background: 'linear-gradient(155deg, #F0EEFF 0%, #E8F8F7 40%, #FFF5F8 75%, #FFF8F0 100%)' }}
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-30"
              style={{ background: 'radial-gradient(circle, #C4B5E8 0%, transparent 70%)' }}
            />
            <div
              className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full opacity-25"
              style={{ background: 'radial-gradient(circle, #7DCFC9 0%, transparent 70%)' }}
            />
          </div>

          <div className="bp-container relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-indigo-100 text-indigo-700 text-[12px] font-bold uppercase tracking-widest mb-6 backdrop-blur-sm">
                <ShieldCheck size={14} />
                IAP-verified physiotherapists
              </div>
              <h1 className="text-[36px] md:text-[52px] font-extrabold tracking-tight leading-[1.08] mb-5" style={{ color: '#2D2B55' }}>
                Physiotherapy services
                <br />
                <span className="text-gradient-lavender">tailored to you.</span>
              </h1>
              <p className="text-[17px] md:text-[19px] leading-relaxed max-w-2xl mx-auto mb-8" style={{ color: '#5A5880' }}>
                From your first assessment to long-term rehabilitation — transparent pricing, verified providers, and sessions at the clinic or at home.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/search"
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-full text-white text-[15px] font-bold transition-all hover:-translate-y-0.5 group"
                  style={{
                    background: 'linear-gradient(135deg, #8B9BD8, #7DCFC9)',
                    boxShadow: '0 4px 16px rgba(139,155,216,0.40)',
                  }}
                >
                  Find a physiotherapist
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/packages"
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-full border border-indigo-200 bg-white/60 backdrop-blur-sm text-slate-700 text-[15px] font-bold hover:bg-white/80 transition-all"
                >
                  View session packs
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Trust stats strip */}
        <section className="bg-white border-b border-slate-100">
          <div className="bp-container py-6">
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
              {[
                { icon: ShieldCheck, label: 'IAP verified providers', color: 'text-indigo-600' },
                { icon: IndianRupee, label: 'Transparent ₹ pricing', color: 'text-teal-600' },
                { icon: MapPin, label: '10+ cities across India', color: 'text-violet-600' },
                { icon: Clock, label: 'Same-day slots available', color: 'text-amber-600' },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className={`flex items-center gap-2 text-[14px] font-semibold ${color}`}>
                  <Icon size={16} />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-20 md:py-28" aria-label="Available services">
          <div className="bp-container">
            <div className="max-w-2xl mb-14">
              <div className="bp-kicker mb-4">Our services</div>
              <h2 className="text-slate-900 mb-4 tracking-tight">
                Everything from assessment to recovery.
              </h2>
              <p className="text-slate-500 text-[17px] leading-relaxed">
                Each service is delivered by IAP-verified physiotherapists with real-time availability. What you see is what you pay — no hidden fees.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {SERVICES.map((service) => {
                const Icon = ICON_MAP[service.icon] ?? ClipboardCheck
                return (
                  <article
                    key={service.slug}
                    className={cn(
                      'group flex flex-col p-7 rounded-2xl border bg-white',
                      'transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/60',
                      service.tint.border,
                    )}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-5">
                      <div className={cn('w-13 h-13 rounded-xl flex items-center justify-center', service.tint.bg, service.tint.text)}>
                        <Icon size={24} />
                      </div>
                      <div className="text-right">
                        <div className="text-[22px] font-bold text-slate-900">₹{service.startingPrice}</div>
                        <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">starting from</div>
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className={cn('text-[18px] font-bold mb-1 transition-colors group-hover:text-indigo-700', service.tint.text)}>
                      {service.name}
                    </h3>
                    <p className="text-slate-500 text-[13px] font-medium mb-3">{service.subtitle}</p>
                    <p className="text-slate-500 text-[14px] leading-relaxed mb-5 flex-1">{service.description}</p>

                    {/* Meta pills */}
                    <div className="flex flex-wrap items-center gap-2 mb-5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-[12px] font-medium">
                        <Clock size={11} />
                        {service.duration}
                      </span>
                      {service.visitTypes.map((type) => (
                        <span
                          key={type}
                          className={cn(
                            'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-medium',
                            type === 'home'
                              ? 'bg-violet-50 border border-violet-200 text-violet-700'
                              : 'bg-teal-50 border border-teal-200 text-teal-700',
                          )}
                        >
                          {type === 'home' ? <Home size={11} /> : <MapPin size={11} />}
                          {type === 'home' ? 'Home visit' : 'In-clinic'}
                        </span>
                      ))}
                    </div>

                    {/* Ideal for */}
                    <div className="mb-5">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Ideal for</div>
                      <div className="flex flex-wrap gap-1.5">
                        {service.idealFor.map((item) => (
                          <span key={item} className="px-2 py-1 rounded-md bg-slate-50 text-slate-600 text-[11px] font-medium">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* What's included */}
                    <div className="mb-6">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Includes</div>
                      <ul className="space-y-1.5">
                        {service.includes.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-[13px] text-slate-600">
                            <div className="w-4 h-4 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5">
                              <ShieldCheck size={9} className="text-indigo-500" />
                            </div>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* CTA */}
                    <Link
                      href="/search"
                      className="flex items-center justify-center gap-2 py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-[14px] font-semibold hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all group/btn"
                    >
                      Book this service
                      <ArrowRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* How packages work CTA */}
        <section className="bg-slate-950 py-20 md:py-28 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-500/8 rounded-full blur-[100px]" />

          <div className="bp-container relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="bp-kicker mb-6" style={{ background: 'rgba(139,155,216,0.1)', borderColor: 'rgba(139,155,216,0.2)', color: '#C7CEEF' }}>
                Save more with session packs
              </div>
              <h2 className="text-white text-[32px] md:text-[44px] font-extrabold tracking-tight leading-tight mb-5">
                Need multiple sessions?
                <br />
                <span className="text-gradient-lavender">Save up to 25%.</span>
              </h2>
              <p className="text-slate-400 text-[17px] leading-relaxed max-w-xl mx-auto mb-8">
                Most physiotherapy treatment plans require 5–20 sessions. Our session packs give you meaningful discounts while keeping the flexibility to book any provider, any time.
              </p>
              <Link
                href="/packages"
                className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-[15px] hover:bg-indigo-500 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/20 group"
              >
                View session packs
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ section */}
        <section className="py-20 md:py-28 bg-slate-50 border-t border-slate-100" aria-label="Service FAQs">
          <div className="bp-container">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <div className="bp-kicker mb-4 mx-auto">Common questions</div>
                <h2 className="text-slate-900 tracking-tight">About our services</h2>
              </div>

              <div className="space-y-4">
                {[
                  {
                    q: 'Do I need a doctor\'s referral to book?',
                    a: 'No. You can book directly with any physiotherapist on BookPhysio without a referral. However, if your doctor has recommended physiotherapy, sharing that information with your physio will help them plan your treatment.',
                  },
                  {
                    q: 'How do I know which service to choose?',
                    a: 'If this is your first visit, start with an Initial Assessment. Your physiotherapist will evaluate your condition and recommend the right treatment plan, including whether you need follow-up sessions, home visits, or specialist care.',
                  },
                  {
                    q: 'Are the prices shown the final prices?',
                    a: 'Yes. The price shown includes all fees. GST is computed and displayed before you confirm. There are no hidden charges, booking fees, or surprise costs.',
                  },
                  {
                    q: 'Can I switch between clinic and home visits?',
                    a: 'Absolutely. If a provider offers both visit types, you can choose clinic or home visit for each individual session. Home visits may have a different fee to cover travel.',
                  },
                  {
                    q: 'What happens if I need to cancel?',
                    a: 'You can cancel or reschedule up to 4 hours before your appointment for a full refund. Cancellations within 4 hours may be subject to the provider\'s cancellation policy.',
                  },
                ].map(({ q, a }) => (
                  <details
                    key={q}
                    className="group p-6 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-colors"
                  >
                    <summary className="flex items-center justify-between cursor-pointer text-[15px] font-semibold text-slate-900 list-none">
                      {q}
                      <ArrowRight size={16} className="text-slate-400 group-open:rotate-90 transition-transform shrink-0 ml-4" />
                    </summary>
                    <p className="mt-3 text-slate-500 text-[14px] leading-relaxed">{a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
