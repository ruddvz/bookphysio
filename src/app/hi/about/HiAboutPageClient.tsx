'use client'

import { Globe, Heart, IndianRupee, ShieldCheck } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { StaticPageV2Chrome, type StaticTocItem } from '@/components/static/StaticPageV2Chrome'
import { useUiV2 } from '@/hooks/useUiV2'

const benefits = [
  {
    title: 'सत्यापित विशेषज्ञ',
    text: 'हम प्लेटफॉर्म पर शामिल हर फिजियोथेरेपिस्ट की डिग्री, पंजीकरण और क्लिनिकल अनुभव की जांच करते हैं।',
    icon: ShieldCheck,
    tint: 'bg-[#E6F4F3] text-[#00766C]',
  },
  {
    title: 'क्लिनिकल गहराई',
    text: 'ऑर्थोपेडिक, न्यूरोलॉजिकल और पीडियाट्रिक रिहैब जैसे क्षेत्रों पर विशेष ध्यान।',
    icon: Heart,
    tint: 'bg-[#FEE9DD] text-[#C4532A]',
  },
  {
    title: 'पारदर्शी प्राइसिंग',
    text: 'बुक करने से पहले ही फीस और विज़िट विकल्प साफ़ दिखते हैं। कोई छिपे हुए क्लिनिकल चार्ज नहीं।',
    icon: IndianRupee,
    tint: 'bg-[#E7EEFB] text-[#2F5EC4]',
  },
  {
    title: 'भारतभर की पहुंच',
    text: 'क्लिनिक विज़िट से लेकर होम विज़िट तक, विशेषज्ञ देखभाल को भारत के अधिक शहरों तक पहुंचाना।',
    icon: Globe,
    tint: 'bg-[#EDEAF8] text-[#5B4BC4]',
  },
]

const HI_ABOUT_TOC: StaticTocItem[] = [
  { id: 'hi-about-network', label: 'डिजिटल नेटवर्क' },
  { id: 'hi-about-pillars', label: 'भरोसे के स्तंभ' },
  { id: 'hi-about-recovery', label: 'बेहतर रिकवरी' },
]

function HiAboutHero() {
  return (
    <section className="bg-white border-b border-slate-200/70">
      <div className="max-w-[1142px] mx-auto px-6 py-12 lg:py-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E6F4F3] text-[#00766C] rounded-full text-[11px] font-semibold uppercase tracking-[0.18em] mb-5">
          सत्यापित मार्केटप्लेस
        </div>
        <h1 className="text-[30px] lg:text-[40px] font-bold tracking-tight text-[#1A1C29] leading-tight">
          भारत का <span className="text-[#00766C]">फिजियोथेरेपी-केंद्रित</span> प्लेटफॉर्म
        </h1>
        <p className="mt-4 text-[15px] lg:text-[17px] leading-relaxed max-w-[720px] mx-auto text-slate-600">
          हम मरीजों को सत्यापित फिजियोथेरेपिस्ट खोजने, विज़िट विकल्पों की तुलना करने और पूरे भारत में आसानी से बुक करने में मदद करते हैं।
        </p>
      </div>
    </section>
  )
}

function HiAboutBody({ withSectionIds }: { withSectionIds: boolean }) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-12 items-center">
        <div>
          <div className="w-10 h-1 bg-[#FF6B35] rounded-full mb-5" />
          <h2
            {...(withSectionIds ? { id: 'hi-about-network' } : {})}
            className="text-[24px] lg:text-[28px] font-bold text-[#1A1C29] tracking-tight leading-tight scroll-mt-28"
          >
            रिहैबिलिटेशन को समझने वाला डिजिटल नेटवर्क
          </h2>
          <div className="mt-5 space-y-4 text-[15px] text-slate-600 leading-relaxed">
            <p>
              BookPhysio.in भारत का ऐसा प्लेटफॉर्म है जो केवल फिजियोथेरेपी पर केंद्रित है। रिकवरी के लिए सिर्फ एक स्लॉट नहीं, बल्कि सही विशेषज्ञता, उपलब्धता और निरंतरता की आवश्यकता होती है।
            </p>
            <p>
              इसी वजह से हम मरीजों को सत्यापित प्रोफाइल, स्पष्ट क्रेडेंशियल्स और इन-क्लिनिक व होम-विज़िट दोनों विकल्पों के साथ बेहतर निर्णय लेने में मदद करते हैं।
            </p>
          </div>
        </div>
        <div className="aspect-square bg-white border border-slate-200 rounded-[var(--sq-lg)] flex items-center justify-center p-10 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-[#E6F4F3] text-[#00766C] flex items-center justify-center mb-4">
              <Globe className="w-8 h-8" />
            </div>
            <p className="text-[12px] font-semibold text-[#00766C] uppercase tracking-[0.2em]">
              नेशनल केयर नेटवर्क
            </p>
          </div>
        </div>
      </div>

      <div>
        <div className="text-center max-w-xl mx-auto mb-8 lg:mb-10">
          <p className="text-[11px] font-semibold text-[#FF6B35] uppercase tracking-[0.2em] mb-2">
            भरोसे के स्तंभ
          </p>
          <h2
            {...(withSectionIds ? { id: 'hi-about-pillars' } : {})}
            className="text-[24px] lg:text-[28px] font-bold text-[#1A1C29] tracking-tight scroll-mt-28"
          >
            जिससे निर्णय आसान हो
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {benefits.map(({ title, text, icon: Icon, tint }) => (
            <div
              key={title}
              className="rounded-[var(--sq-lg)] border border-slate-200 bg-white p-5 lg:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-all duration-200 hover:shadow-[0_4px_12px_rgba(15,23,42,0.06)] hover:border-[#00766C]/30"
            >
              <div className={`w-11 h-11 rounded-full flex items-center justify-center ${tint}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="mt-4 text-[16px] font-semibold text-[#1A1C29]">{title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[var(--sq-lg)] border border-slate-200 bg-white p-8 lg:p-12 text-center shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <div className="mx-auto w-12 h-12 rounded-full bg-[#FEE9DD] text-[#FF6B35] flex items-center justify-center mb-4">
          <Heart className="w-6 h-6" />
        </div>
        <h2
          {...(withSectionIds ? { id: 'hi-about-recovery' } : {})}
          className="text-[22px] lg:text-[26px] font-bold text-[#1A1C29] tracking-tight scroll-mt-28"
        >
          स्पष्ट खोज, बेहतर रिकवरी
        </h2>
        <p className="mt-3 text-[14px] lg:text-[15px] text-slate-600 max-w-[640px] mx-auto leading-relaxed">
          हमारा लक्ष्य फिजियोथेरेपी खोजने और बुक करने की प्रक्रिया को मरीजों और प्रदाताओं दोनों के लिए अधिक भरोसेमंद बनाना है।
        </p>
      </div>
    </>
  )
}

export function HiAboutPageClient() {
  const v2 = useUiV2()

  if (!v2) {
    return (
      <>
        <Navbar locale="hi" localeSwitchPath="/about" />
        <main lang="hi" className="bg-[#FAFAFA] min-h-screen">
          <HiAboutHero />
          <section className="py-12 lg:py-16">
            <div className="max-w-[1142px] mx-auto px-6 space-y-12 lg:space-y-16">
              <HiAboutBody withSectionIds={false} />
            </div>
          </section>
        </main>
        <Footer locale="hi" localeSwitchPath="/about" />
      </>
    )
  }

  return (
    <>
      <Navbar locale="hi" localeSwitchPath="/about" />
      <main lang="hi" className="bg-[#FAFAFA] min-h-screen">
        <StaticPageV2Chrome
          lastUpdated="मार्च 2026"
          tocItems={HI_ABOUT_TOC}
          hero={<HiAboutHero />}
          body={
            <div className="space-y-12 lg:space-y-16">
              <HiAboutBody withSectionIds />
            </div>
          }
        />
      </main>
      <Footer locale="hi" localeSwitchPath="/about" />
    </>
  )
}
