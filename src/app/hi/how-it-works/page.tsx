'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import {
  Activity,
  ArrowRight,
  Building2,
  CalendarDays,
  CalendarRange,
  Search,
  UserCheck,
  WalletCards,
} from 'lucide-react'

const PATIENT_STEPS = [
  {
    icon: Search,
    title: 'खोजें',
    text: 'अपनी समस्या, रिकवरी लक्ष्य या किसी फिजियोथेरेपिस्ट का नाम दर्ज करें और अपना शहर चुनें।',
    tint: 'bg-[#E6F4F3] text-[#00766C]',
  },
  {
    icon: UserCheck,
    title: 'प्रदाता चुनें',
    text: 'विशेषज्ञता, रेटिंग, फीस और विज़िट फ़ॉर्मेट के आधार पर सत्यापित विकल्पों की तुलना करें।',
    tint: 'bg-[#EDEAF8] text-[#5B4BC4]',
  },
  {
    icon: CalendarDays,
    title: 'स्लॉट चुनें',
    text: 'प्रदाता की उपलब्धता के अनुसार अपनी सुविधाजनक तारीख और समय तय करें।',
    tint: 'bg-[#FEE9DD] text-[#C4532A]',
  },
  {
    icon: Activity,
    title: 'तुरंत बुक करें',
    text: 'रिक्वेस्ट कन्फर्म करें और अपनी रिकवरी यात्रा को बिना अनावश्यक देरी के शुरू करें।',
    tint: 'bg-[#FFE4EC] text-[#B53A63]',
  },
]

const PROVIDER_STEPS = [
  {
    icon: Building2,
    title: 'प्रैक्टिस रजिस्टर करें',
    text: 'अपना प्रोफेशनल प्रोफाइल, IAP/State Council नंबर और क्लिनिक विवरण जोड़ें।',
    tint: 'bg-[#E6F4F3] text-[#00766C]',
  },
  {
    icon: CalendarRange,
    title: 'उपलब्धता सेट करें',
    text: 'वर्किंग आवर्स, स्लॉट अवधि और विज़िट प्रकार तय करें।',
    tint: 'bg-[#EDEAF8] text-[#5B4BC4]',
  },
  {
    icon: CalendarDays,
    title: 'बुकिंग संभालें',
    text: 'सभी अपॉइंटमेंट्स को एक ही डैशबोर्ड से स्वीकारें और व्यवस्थित रखें।',
    tint: 'bg-[#FEE9DD] text-[#C4532A]',
  },
  {
    icon: WalletCards,
    title: 'अर्निंग्स ट्रैक करें',
    text: 'साप्ताहिक और मासिक कमाई को GST-संगत सारांश के साथ देखें।',
    tint: 'bg-[#FFE4EC] text-[#B53A63]',
  },
]

export default function HindiHowItWorksPage() {
  const [activeTab, setActiveTab] = useState<'patient' | 'provider'>('patient')
  const activeSteps = activeTab === 'patient' ? PATIENT_STEPS : PROVIDER_STEPS
  const primaryCtaHref = activeTab === 'patient' ? '/search' : '/doctor-signup'
  const primaryCtaLabel = activeTab === 'patient' ? 'अभी खोज शुरू करें' : 'अपना प्रैक्टिस जोड़ें'

  return (
    <>
      <Navbar locale="hi" localeSwitchPath="/how-it-works" />

      <main lang="hi" className="bg-[#FAFAFA] min-h-screen">
        <section className="bg-white border-b border-slate-200/70">
          <div className="max-w-[1142px] mx-auto px-6 py-12 lg:py-16 text-center">
            <div className="sr-only inline-flex items-center gap-2 px-3 py-1 bg-[#E6F4F3] text-[#00766C] rounded-full text-[11px] font-semibold uppercase tracking-[0.18em] mb-5">
              यह कैसे काम करता है
            </div>
            <h1 className="text-[30px] lg:text-[40px] font-bold tracking-tight text-[#1A1C29] leading-tight">
              भारत में ऑनलाइन <span className="text-[#00766C]">फिजियोथेरेपिस्ट बुक करें</span>
            </h1>
            <p className="mt-4 text-[15px] lg:text-[17px] leading-relaxed max-w-[680px] mx-auto text-slate-600">
              चार स्पष्ट चरणों में सही फिजियो खोजें, विकल्पों की तुलना करें और अपना स्लॉट कन्फर्म करें।
            </p>

            <div className="mt-8 inline-flex items-center gap-1 rounded-full bg-slate-100 p-1 border border-slate-200">
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
        </section>

        <section className="py-12 lg:py-16">
          <div className="max-w-[1142px] mx-auto px-6">
            <div className="grid gap-4 lg:gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {activeSteps.map((step, idx) => (
                <div
                  key={step.title}
                  className="relative rounded-[var(--sq-lg)] border border-slate-200 bg-white p-5 lg:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-all duration-200 hover:shadow-[0_4px_12px_rgba(15,23,42,0.06)] hover:border-[#00766C]/30"
                >
                  <div className="flex items-start justify-between">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center ${step.tint}`}>
                      <step.icon className="w-5 h-5" strokeWidth={2.2} />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      चरण 0{idx + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 text-[16px] font-semibold text-[#1A1C29]">{step.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-12 lg:pb-16">
          <div className="max-w-[1142px] mx-auto px-6">
            <div className="rounded-[var(--sq-lg)] border border-slate-200 bg-white p-6 lg:p-10 shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="max-w-xl text-center md:text-left">
                <h2 className="text-[22px] lg:text-[26px] font-bold text-[#1A1C29] tracking-tight leading-tight">
                  {activeTab === 'patient'
                    ? 'रिकवरी की शुरुआत स्पष्ट निर्णय से करें।'
                    : 'अपनी प्रैक्टिस को डिजिटल तरीके से बढ़ाएं।'}
                </h2>
                <p className="mt-2 text-[14px] text-slate-600 leading-relaxed">
                  {activeTab === 'patient'
                    ? 'इन-क्लिनिक और होम विज़िट दोनों विकल्पों के साथ सत्यापित विशेषज्ञों तक जल्दी पहुंचें।'
                    : 'ऐसे प्लेटफॉर्म से जुड़ें जो आपकी उपलब्धता, बुकिंग और कमाई को एक जगह संभालता है।'}
                </p>
              </div>
              <Link
                href={primaryCtaHref}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#00766C] px-6 py-3 text-[14px] font-semibold text-white hover:bg-[#005A52] transition-colors shadow-[0_4px_12px_rgba(0,118,108,0.18)] w-full md:w-auto"
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