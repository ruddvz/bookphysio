'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Search, UserCheck, CalendarDays, Sparkles, Building2, CalendarRange, WalletCards, ArrowRight } from 'lucide-react'

const PATIENT_STEPS = [
  {
    icon: Search,
    title: 'खोजें',
    text: 'अपनी समस्या, रिकवरी लक्ष्य या किसी फिजियोथेरेपिस्ट का नाम दर्ज करें और अपना शहर चुनें।',
  },
  {
    icon: UserCheck,
    title: 'प्रदाता चुनें',
    text: 'विशेषज्ञता, रेटिंग, फीस और विज़िट फ़ॉर्मेट के आधार पर सत्यापित विकल्पों की तुलना करें।',
  },
  {
    icon: CalendarDays,
    title: 'स्लॉट चुनें',
    text: 'प्रदाता की उपलब्धता के अनुसार अपनी सुविधाजनक तारीख और समय तय करें।',
  },
  {
    icon: Sparkles,
    title: 'तुरंत बुक करें',
    text: 'रिक्वेस्ट कन्फर्म करें और अपनी रिकवरी यात्रा को बिना अनावश्यक देरी के शुरू करें।',
  },
]

const PROVIDER_STEPS = [
  {
    icon: Building2,
    title: 'प्रैक्टिस रजिस्टर करें',
    text: 'अपना प्रोफेशनल प्रोफाइल, IAP/State Council नंबर और क्लिनिक विवरण जोड़ें।',
  },
  {
    icon: CalendarRange,
    title: 'उपलब्धता सेट करें',
    text: 'वर्किंग आवर्स, स्लॉट अवधि और विज़िट प्रकार तय करें।',
  },
  {
    icon: CalendarDays,
    title: 'बुकिंग संभालें',
    text: 'सभी अपॉइंटमेंट्स को एक ही डैशबोर्ड से स्वीकारें और व्यवस्थित रखें।',
  },
  {
    icon: WalletCards,
    title: 'अर्निंग्स ट्रैक करें',
    text: 'साप्ताहिक और मासिक कमाई को GST-संगत सारांश के साथ देखें।',
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

      <main lang="hi" className="min-h-screen bg-white">
        <section className="border-b border-[#D9E7E5] bg-[#F9FBFB] py-16 md:py-20">
          <div className="mx-auto max-w-[1142px] px-6 text-center">
            <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-bp-accent">यह कैसे काम करता है</p>
            <h1 className="mt-4 text-[42px] font-bold tracking-tight text-bp-primary md:text-[56px]">
              भारत में ऑनलाइन फिजियोथेरेपिस्ट कैसे बुक करें
            </h1>
            <p className="mx-auto mt-5 max-w-[640px] text-[18px] leading-8 text-bp-body md:text-[20px]">
              चार स्पष्ट चरणों में सही फिजियो खोजें, विकल्पों की तुलना करें और अपना स्लॉट कन्फर्म करें।
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href={primaryCtaHref}
                className="inline-flex items-center gap-2 rounded-full bg-bp-accent px-7 py-3 text-[16px] font-bold text-white transition-colors hover:bg-bp-primary"
              >
                {primaryCtaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <span className="rounded-full border border-[#D9E7E5] bg-white px-4 py-3 text-[14px] font-medium text-[#5F6C69]">
                बड़े भारतीय शहरों में सत्यापित फिजियो उपलब्ध
              </span>
            </div>

            <div className="mx-auto mt-10 inline-flex rounded-[32px] bg-bp-accent/10 p-1 shadow-inner">
              {activeTab === 'patient' ? (
                <button
                  onClick={() => setActiveTab('patient')}
                  type="button"
                  aria-pressed="true"
                  className="px-8 py-3 rounded-[28px] font-bold text-[16px] transition-all bg-bp-accent text-white shadow-lg"
                >
                  मरीजों के लिए
                </button>
              ) : (
                <button
                  onClick={() => setActiveTab('patient')}
                  type="button"
                  aria-pressed="false"
                  className="px-8 py-3 rounded-[28px] font-bold text-[16px] transition-all text-bp-accent hover:bg-white/50"
                >
                  मरीजों के लिए
                </button>
              )}
              {activeTab === 'provider' ? (
                <button
                  onClick={() => setActiveTab('provider')}
                  type="button"
                  aria-pressed="true"
                  className="px-8 py-3 rounded-[28px] font-bold text-[16px] transition-all bg-bp-accent text-white shadow-lg"
                >
                  फिजियोथेरेपिस्ट्स के लिए
                </button>
              ) : (
                <button
                  onClick={() => setActiveTab('provider')}
                  type="button"
                  aria-pressed="false"
                  className="px-8 py-3 rounded-[28px] font-bold text-[16px] transition-all text-bp-accent hover:bg-white/50"
                >
                  फिजियोथेरेपिस्ट्स के लिए
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="pb-16 pt-8 md:pb-20 md:pt-10">
          <div className="mx-auto max-w-[1142px] px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {activeSteps.map((step, idx) => (
                <div key={idx} className="relative group rounded-[20px] border border-bp-border bg-white p-6 text-left transition-all hover:border-bp-accent hover:shadow-xl md:p-8">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-bp-accent/10 transition-colors group-hover:bg-bp-accent">
                    <step.icon className="h-7 w-7 text-bp-accent group-hover:text-white" />
                  </div>
                  <div className="mt-5 text-[12px] font-bold uppercase tracking-[0.18em] text-[#8C9693]">चरण {idx + 1}</div>
                  <h3 className="mt-2 text-[22px] font-bold text-bp-primary group-hover:text-bp-accent">{step.title}</h3>
                  <p className="text-[16px] leading-relaxed text-bp-body">{step.text}</p>

                  {idx < 3 && (
                    <div className="absolute left-[calc(100%-20px)] top-10 z-10 hidden w-20 text-bp-accent opacity-35 lg:block">
                      <ArrowRight className="h-10 w-10" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-bp-accent/10 py-16 md:py-20">
          <div className="mx-auto max-w-[1142px] px-6">
            <div className="relative overflow-hidden rounded-[24px] border border-bp-border bg-white p-10 shadow-sm md:flex md:items-center md:justify-between md:gap-10 md:p-16">
              <div className="absolute top-0 right-0 w-32 h-32 bg-bp-accent/10 rounded-bl-full opacity-50"></div>
              <div className="relative z-10 flex-1">
                <h2 className="text-[36px] font-bold text-bp-primary mb-4 leading-tight">
                  {activeTab === 'patient' ? 'रिकवरी की शुरुआत स्पष्ट निर्णय से करें।' : 'अपने प्रैक्टिस को डिजिटल तरीके से बढ़ाएं।'}
                </h2>
                <p className="text-[18px] text-bp-body mb-8 max-w-[500px]">
                  {activeTab === 'patient'
                    ? 'इन-क्लिनिक और होम विज़िट दोनों विकल्पों के साथ सत्यापित विशेषज्ञों तक जल्दी पहुंचें।'
                    : 'ऐसे प्लेटफॉर्म से जुड़ें जो आपकी उपलब्धता, बुकिंग और कमाई को एक जगह संभालता है।'}
                </p>
                <Link
                  href={primaryCtaHref}
                  className="inline-flex items-center gap-2 rounded-[32px] bg-bp-accent px-10 py-4 text-[18px] font-bold text-white transition-colors hover:bg-bp-primary shadow-lg"
                >
                  {primaryCtaLabel}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
              <div className="flex h-64 w-full flex-col justify-center rounded-[24px] border border-[#D9E7E5] bg-[#F3F7F6] p-6 text-left md:w-1/3">
                <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-bp-accent">वर्कफ़्लो स्नैपशॉट</p>
                <p className="mt-3 text-[18px] font-semibold text-bp-primary">
                  {activeTab === 'patient'
                    ? 'खोजें, तुलना करें, स्लॉट चुनें और कन्फर्म करें।'
                    : 'रजिस्टर करें, घंटे सेट करें, बुकिंग लें और कमाई ट्रैक करें।'}
                </p>
                <ul className="mt-5 space-y-3 text-[14px] text-[#5F6C69]">
                  {activeSteps.map((step, index) => (
                    <li key={step.title} className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[12px] font-bold text-bp-accent">
                        {index + 1}
                      </span>
                      {step.title}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer locale="hi" localeSwitchPath="/how-it-works" />
    </>
  )
}