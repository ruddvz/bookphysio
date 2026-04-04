'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ChevronDown, Sparkles } from 'lucide-react'

const FAQS = [
  {
    category: 'मरीज',
    items: [
      {
        question: 'मैं अपॉइंटमेंट कैसे बुक करूं?',
        answer: 'अपनी समस्या, फिजियोथेरेपिस्ट का नाम या रिकवरी लक्ष्य खोजें, प्रदाता चुनें, तारीख और समय चुनें, फिर बुकिंग कन्फर्म करें। आवश्यक होने पर मोबाइल OTP के जरिए पुष्टि दिखाई जाएगी।',
      },
      {
        question: 'ICP Verified का क्या मतलब है?',
        answer: 'ICP सत्यापन का मतलब है कि हमने प्रदाता के पंजीकरण, क्रेडेंशियल्स और क्लिनिकल अनुभव की जांच की है ताकि मरीज अधिक भरोसे के साथ निर्णय ले सकें।',
      },
      {
        question: 'क्या होम विज़िट उपलब्ध है?',
        answer: 'हाँ, कई फिजियोथेरेपिस्ट होम विज़िट प्रदान करते हैं। आप खोज परिणामों में विज़िट प्रकार के आधार पर फ़िल्टर कर सकते हैं और संबंधित फीस देख सकते हैं।',
      },
      {
        question: 'सेशन की पेमेंट कैसे होती है?',
        answer: 'फिलहाल कुछ बुकिंग्स BookPhysio के जरिए रिज़र्व होती हैं और भुगतान विज़िट के दौरान प्रदाता को किया जाता है। जहां ऑनलाइन भुगतान उपलब्ध होगा, वह चेकआउट पर स्पष्ट रूप से दिखेगा।',
      },
      {
        question: 'क्या मैं अपनी बुकिंग कैंसल या रीशेड्यूल कर सकता/सकती हूँ?',
        answer: 'हाँ, अपॉइंटमेंट समय से कम-से-कम 4 घंटे पहले तक आप Patient Dashboard से कैंसल या रीशेड्यूल कर सकते हैं।',
      },
    ],
  },
  {
    category: 'फिजियोथेरेपिस्ट्स',
    items: [
      {
        question: 'मैं BookPhysio पर प्रदाता के रूप में कैसे जुड़ूं?',
        answer: 'नेविगेशन में "फिजियोथेरेपिस्ट्स के लिए" विकल्प चुनें या Doctor Signup पेज पर जाएँ। आपको अपना ICP नंबर और प्रैक्टिस विवरण जमा करना होगा।',
      },
      {
        question: 'लिस्टिंग के लिए क्या शुल्क है?',
        answer: 'BookPhysio पर बुनियादी लिस्टिंग निःशुल्क है। सफल बुकिंग्स पर प्लेटफॉर्म शुल्क या भुगतान संरचना स्पष्ट रूप से प्रदर्शित की जाती है।',
      },
      {
        question: 'क्या मुझे अपना डैशबोर्ड मिलेगा?',
        answer: 'हाँ, प्रत्येक सत्यापित प्रदाता को कैलेंडर, अपॉइंटमेंट्स, उपलब्धता और अर्निंग्स को मैनेज करने के लिए डैशबोर्ड मिलता है।',
      },
    ],
  },
] as const

export default function HindiFAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null)

  const toggle = (id: string) => {
    setOpenIndex(openIndex === id ? null : id)
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.flatMap((category) =>
      category.items.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      }))
    ),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Navbar locale="hi" localeSwitchPath="/faq" />

      <main lang="hi" className="bg-white min-h-screen">
        <section className="bg-[#111111] text-white py-32 sm:py-48 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-bp-primary/15 rounded-full blur-[140px] -mr-80 -mt-80 animate-pulse duration-[10s]"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-bp-accent/5 rounded-full blur-[100px] -ml-40 -mb-40"></div>

          <div className="max-w-[1142px] mx-auto px-6 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full text-[12px] font-black uppercase tracking-[0.3em] mb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              क्लिनिकल सपोर्ट डेस्क
            </div>
            <h1 className="text-[56px] sm:text-[88px] font-black mb-8 tracking-tighter leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              हम <span className="text-bp-primary italic">कैसे मदद करें?</span>
            </h1>
            <p className="text-[18px] sm:text-[24px] leading-relaxed max-w-[750px] mx-auto text-white/50 font-medium animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
              बुकिंग, सत्यापन, विज़िट प्रकार और प्लेटफॉर्म नीतियों से जुड़े सबसे सामान्य सवालों के जवाब यहां दिए गए हैं।
            </p>
          </div>
        </section>

        <section className="py-24 sm:py-40 bg-white">
          <div className="max-w-[1142px] mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
              <div className="lg:col-span-4 sticky top-32 group">
                <div className="space-y-16">
                  <div>
                    <h2 className="text-[12px] font-black text-bp-primary uppercase tracking-[0.4em] mb-12">FAQ इंडेक्स</h2>
                    <ul className="space-y-6">
                      {FAQS.map((category) => (
                        <li key={category.category}>
                          <a
                            href={`#${category.category}`}
                            className="text-[20px] font-black text-bp-primary hover:text-bp-primary transition-all flex items-center gap-4 group/item"
                          >
                            {category.category}
                            <div className="w-1.5 h-1.5 rounded-full bg-bp-primary opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-10 bg-bp-surface rounded-[40px] border border-bp-border/40 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-bp-primary/5 rounded-full blur-2xl -mr-16 -mt-16"></div>
                    <Sparkles className="w-10 h-10 text-bp-primary mb-8 animate-bounce duration-[3s]" />
                    <h3 className="text-[24px] font-black text-bp-primary mb-5 tracking-tight">बुकिंग में मदद चाहिए?</h3>
                    <p className="text-[17px] text-bp-body/60 font-medium leading-relaxed mb-8">
                      हमारी टीम बुकिंग फ्लो, प्रदाता सत्यापन और प्लेटफॉर्म उपयोग से जुड़े सवालों में सहायता कर सकती है।
                    </p>
                    <a
                      href="mailto:support@bookphysio.in"
                      className="block w-full py-5 bg-[#111111] text-white rounded-full font-black text-[14px] uppercase tracking-[0.2em] text-center hover:bg-bp-primary hover:shadow-xl transition-all duration-500"
                    >
                      सपोर्ट से संपर्क करें
                    </a>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-32">
                {FAQS.map((category) => (
                  <div key={category.category} id={category.category} className="scroll-mt-32">
                    <div className="flex items-center gap-5 mb-12">
                      <div className="w-2.5 h-2.5 rounded-full bg-bp-accent shadow-[0_0_12px_rgba(255,107,53,0.4)]"></div>
                      <h2 className="text-[36px] font-black text-bp-primary tracking-tighter leading-none">{category.category}</h2>
                    </div>
                    <div className="space-y-6">
                      {category.items.map((item, idx) => {
                        const id = `${category.category}-${idx}`
                        const isOpen = openIndex === id

                        return (
                          <div
                            key={id}
                            className={`group border ${isOpen ? 'border-bp-primary/40 bg-bp-surface/30 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.05)]' : 'border-bp-border/40 bg-white hover:border-bp-primary/20 hover:shadow-lg'} rounded-[32px] overflow-hidden transition-all duration-700`}
                          >
                            <button
                              onClick={() => toggle(id)}
                              className="w-full text-left px-10 py-8 flex items-center justify-between focus:outline-none"
                            >
                              <span className={`text-[21px] font-black tracking-tight ${isOpen ? 'text-bp-primary' : 'text-bp-body/80'} group-hover:text-bp-primary transition-all duration-500`}>
                                {item.question}
                              </span>
                              <div className={`w-12 h-12 rounded-full border ${isOpen ? 'bg-bp-primary border-bp-primary' : 'border-bp-border/60'} flex items-center justify-center shrink-0 transition-all duration-500`}>
                                <ChevronDown className={`w-6 h-6 ${isOpen ? 'text-white rotate-180' : 'text-bp-body/30'}`} />
                              </div>
                            </button>
                            <div className={`grid transition-all duration-700 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                              <div className="overflow-hidden">
                                <div className="px-10 pb-10 text-[18px] text-bp-body/60 font-medium leading-[1.8] border-t border-bp-border/10 mt-4 pt-8">
                                  {item.answer}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer locale="hi" localeSwitchPath="/faq" />
    </>
  )
}