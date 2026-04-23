'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { gsap, useGSAP } from '@/lib/gsap-client'
import {
  Activity,
  ArrowRight,
  Building2,
  CalendarDays,
  CalendarRange,
  Clock,
  Home,
  Search,
  ShieldCheck,
  UserCheck,
  WalletCards,
} from 'lucide-react'

const PATIENT_CHARACTER = '/images/characters/physio-female-presenting.png'
const PROVIDER_CHARACTER = '/images/characters/physio-male-laptop.png'

const PATIENT_STEPS = [
  {
    num: '01',
    icon: Search,
    title: 'खोजें',
    text: 'अपनी समस्या, रिकवरी लक्ष्य या किसी फिजियोथेरेपिस्ट का नाम दर्ज करें और अपना शहर चुनें।',
    tint: 'bg-[#E6F4F3] text-[#00766C]',
  },
  {
    num: '02',
    icon: UserCheck,
    title: 'डॉक्टर चुनें',
    text: 'विशेषज्ञता, रेटिंग, फीस और विज़िट फ़ॉर्मेट के आधार पर सत्यापित विकल्पों की तुलना करें।',
    tint: 'bg-[#EDEAF8] text-[#5B4BC4]',
  },
  {
    num: '03',
    icon: CalendarDays,
    title: 'स्लॉट चुनें',
    text: 'प्रदाता की उपलब्धता के अनुसार अपनी सुविधाजनक तारीख और समय तय करें।',
    tint: 'bg-[#FEE9DD] text-[#C4532A]',
  },
  {
    num: '04',
    icon: Activity,
    title: 'तुरंत बुक करें',
    text: 'रिक्वेस्ट कन्फर्म करें और अपनी रिकवरी यात्रा को बिना अनावश्यक देरी के शुरू करें।',
    tint: 'bg-[#FFE4EC] text-[#B53A63]',
  },
]

const PROVIDER_STEPS = [
  {
    num: '01',
    icon: Building2,
    title: 'प्रैक्टिस रजिस्टर करें',
    text: 'अपना प्रोफेशनल प्रोफाइल, IAP/State Council नंबर और क्लिनिक विवरण जोड़ें।',
    tint: 'bg-[#E6F4F3] text-[#00766C]',
  },
  {
    num: '02',
    icon: CalendarRange,
    title: 'उपलब्धता सेट करें',
    text: 'वर्किंग आवर्स, स्लॉट अवधि और विज़िट प्रकार तय करें।',
    tint: 'bg-[#EDEAF8] text-[#5B4BC4]',
  },
  {
    num: '03',
    icon: CalendarDays,
    title: 'बुकिंग संभालें',
    text: 'सभी अपॉइंटमेंट्स को एक ही डैशबोर्ड से स्वीकारें और व्यवस्थित रखें।',
    tint: 'bg-[#FEE9DD] text-[#C4532A]',
  },
  {
    num: '04',
    icon: WalletCards,
    title: 'अर्निंग्स ट्रैक करें',
    text: 'साप्ताहिक और मासिक कमाई को GST-संगत सारांश के साथ देखें।',
    tint: 'bg-[#FFE4EC] text-[#B53A63]',
  },
]

const PATIENT_TRUST = [
  { icon: ShieldCheck, text: 'IAP-सत्यापित फिजियोथेरेपिस्ट' },
  { icon: Clock,       text: 'OTP से तुरंत बुकिंग की पुष्टि' },
  { icon: Home,        text: 'क्लिनिक और होम विज़िट दोनों उपलब्ध' },
]

const PROVIDER_TRUST = [
  { icon: ShieldCheck, text: 'क्रेडेंशियल-वेरिफाइड लिस्टिंग' },
  { icon: Clock,       text: 'रियल-टाइम कैलेंडर मैनेजमेंट' },
  { icon: Home,        text: 'क्लिनिक और होम विज़िट बुकिंग' },
]

export default function HindiHowItWorksPage() {
  const [activeTab, setActiveTab] = useState<'patient' | 'provider'>('patient')
  const activeSteps = activeTab === 'patient' ? PATIENT_STEPS : PROVIDER_STEPS
  const primaryCtaHref = activeTab === 'patient' ? '/search' : '/doctor-signup'
  const primaryCtaLabel = activeTab === 'patient' ? 'अभी खोज शुरू करें' : 'डॉक्टर के रूप में जुड़ें'
  const trust = activeTab === 'patient' ? PATIENT_TRUST : PROVIDER_TRUST
  const character = activeTab === 'patient' ? PATIENT_CHARACTER : PROVIDER_CHARACTER

  const heroScope = useRef<HTMLElement>(null)
  const stepsScope = useRef<HTMLElement>(null)
  const ctaScope = useRef<HTMLElement>(null)

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.from('[data-hiw-hero]', {
      y: 20, opacity: 0, duration: 0.6, ease: 'power2.out', stagger: 0.1,
    })
  }, { scope: heroScope })

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.from('[data-hiw-step]', {
      y: 24, opacity: 0, duration: 0.5, ease: 'power2.out', stagger: 0.08,
    })
  }, { scope: stepsScope, dependencies: [activeTab] })

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.from('[data-hiw-cta]', {
      y: 20, opacity: 0, duration: 0.6, ease: 'power2.out',
      scrollTrigger: { trigger: ctaScope.current, start: 'top 85%', once: true },
    })
  }, { scope: ctaScope })

  return (
    <>
      <Navbar locale="hi" localeSwitchPath="/how-it-works" />

      <main lang="hi" className="bg-[#FAFAFA] min-h-screen">

        {/* Hero */}
        <section ref={heroScope} className="bg-white border-b border-slate-200/70 overflow-hidden">
          <div className="max-w-[1142px] mx-auto px-6 py-12 lg:py-16">
            <div className="grid lg:grid-cols-[1fr_300px] gap-10 items-center">

              <div>
                <h1 data-hiw-hero className="text-[30px] lg:text-[40px] font-bold tracking-tight text-[#1A1C29] leading-tight mb-4">
                  भारत में ऑनलाइन{' '}
                  <span className="text-[#00766C]">फिजियोथेरेपिस्ट बुक करें</span>
                </h1>
                <p data-hiw-hero className="text-[15px] lg:text-[17px] leading-relaxed max-w-[560px] text-slate-600 mb-8">
                  चार स्पष्ट चरणों में सही फिजियो खोजें, विकल्पों की तुलना करें और अपना स्लॉट कन्फर्म करें।
                </p>

                <div className="flex flex-col gap-2.5 mb-8">
                  {trust.map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-[var(--sq-xs)] bg-[#E6F4F3] border border-[#00766C]/20 flex items-center justify-center shrink-0">
                        <Icon size={12} className="text-[#00766C]" />
                      </div>
                      <span className="text-[14px] text-slate-600">{text}</span>
                    </div>
                  ))}
                </div>

                <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 p-1 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setActiveTab('patient')}
                    className={`py-2 px-5 rounded-full text-[13px] font-semibold transition-colors ${
                      activeTab === 'patient'
                        ? 'bg-white text-[#00766C] shadow-sm'
                        : 'text-slate-500 hover:text-[#1A1C29]'
                    }`}
                  >
                    मरीजों के लिए
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('provider')}
                    className={`py-2 px-5 rounded-full text-[13px] font-semibold transition-colors ${
                      activeTab === 'provider'
                        ? 'bg-white text-[#00766C] shadow-sm'
                        : 'text-slate-500 hover:text-[#1A1C29]'
                    }`}
                  >
                    फिजियोथेरेपिस्ट्स के लिए
                  </button>
                </div>
              </div>

              <div className="hidden lg:flex justify-center items-end">
                <div className="relative">
                  <div className="w-[220px] h-[220px] rounded-[60px] bg-[#E6F4F3]" aria-hidden="true" />
                  <Image
                    src={character}
                    alt=""
                    aria-hidden="true"
                    width={200}
                    height={300}
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 object-contain object-bottom"
                    sizes="(min-width: 1024px) 200px, 0px"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Steps */}
        <section ref={stepsScope} className="py-12 lg:py-16">
          <div className="max-w-[1142px] mx-auto px-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {activeSteps.map((step) => (
                <div
                  key={step.title}
                  data-hiw-step
                  className="relative rounded-[var(--sq-lg)] border border-slate-200 bg-white p-6 lg:p-8 shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-all duration-200 hover:shadow-[0_4px_12px_rgba(15,23,42,0.07)] hover:border-[#00766C]/30 group"
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${step.tint}`}>
                      <step.icon className="w-5 h-5" strokeWidth={2.2} />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 group-hover:text-[#00766C]/50 transition-colors">
                      चरण {step.num}
                    </span>
                  </div>
                  <h3 className="text-[17px] font-bold text-[#1A1C29] mb-2 group-hover:text-[#00766C] transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-[13px] leading-relaxed text-slate-500">{step.text}</p>
                  <div className="absolute left-0 top-6 bottom-6 w-[3px] rounded-full bg-[#00766C] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section ref={ctaScope} className="pb-12 lg:pb-16">
          <div className="max-w-[1142px] mx-auto px-6">
            <div
              data-hiw-cta
              className="rounded-[var(--sq-xl)] bg-[#1A1C29] p-8 lg:p-12 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#00766C]/10 rounded-full blur-[80px] pointer-events-none" aria-hidden="true" />

              <div className="hidden lg:block shrink-0 relative z-10 select-none">
                <Image
                  src={PROVIDER_CHARACTER}
                  alt=""
                  aria-hidden="true"
                  width={140}
                  height={210}
                  className="object-contain object-bottom drop-shadow-2xl"
                  sizes="(min-width: 1024px) 140px, 0px"
                />
              </div>

              <div className="flex-1 text-center md:text-left relative z-10">
                <h2 className="text-[24px] lg:text-[28px] font-bold text-white tracking-tight leading-tight">
                  {activeTab === 'patient'
                    ? 'रिकवरी की शुरुआत स्पष्ट निर्णय से करें।'
                    : 'अपनी प्रैक्टिस को डिजिटल तरीके से बढ़ाएं।'}
                </h2>
                <p className="mt-3 text-[15px] text-slate-400 leading-relaxed">
                  {activeTab === 'patient'
                    ? 'इन-क्लिनिक और होम विज़िट दोनों विकल्पों के साथ सत्यापित विशेषज्ञों तक जल्दी पहुंचें।'
                    : 'ऐसे प्लेटफॉर्म से जुड़ें जो आपकी उपलब्धता, बुकिंग और कमाई को एक जगह संभालता है।'}
                </p>
              </div>

              <Link
                href={primaryCtaHref}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#00766C] px-7 py-3.5 text-[15px] font-semibold text-white hover:bg-[#005A52] transition-colors shadow-[0_4px_16px_rgba(0,118,108,0.25)] w-full md:w-auto shrink-0 relative z-10"
              >
                {primaryCtaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer locale="hi" localeSwitchPath="/how-it-works" />
    </>
  )
}
