import { FileText, AlertCircle, Scale, CheckCircle2 } from 'lucide-react'
import { HI_TERMS_SECTIONS } from './hi-terms-constants'

export function HiTermsAsideV1() {
  return (
    <aside className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
      <div>
        <h2 className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.2em] mb-4">
          एग्रीमेंट इंडेक्स
        </h2>
        <ul className="space-y-2">
          {HI_TERMS_SECTIONS.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="block rounded-[var(--sq-sm)] px-4 py-3 text-[14px] font-semibold text-[#1A1C29] border border-slate-200 bg-white hover:border-[#00766C]/40 hover:bg-[#E6F4F3]/40 transition-colors"
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <HiTermsSummaryCard />
    </aside>
  )
}

export function HiTermsSummaryCard() {
  return (
    <div className="rounded-[var(--sq-lg)] border border-slate-200 bg-white p-5 lg:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <div className="w-11 h-11 rounded-full bg-[#E6F4F3] text-[#00766C] flex items-center justify-center">
        <Scale className="w-5 h-5" />
      </div>
      <h3 className="mt-4 text-[15px] font-semibold text-[#1A1C29]">कानूनी पारदर्शिता</h3>
      <p className="mt-1.5 text-[13px] text-slate-600 leading-relaxed">
        ये शर्तें तकनीकी प्लेटफॉर्म और क्लिनिकल सेवा के बीच जिम्मेदारियों की स्पष्ट सीमा तय करती हैं।
      </p>
      <div className="mt-4 flex items-center gap-2 text-[11px] font-semibold text-[#00766C] uppercase tracking-[0.16em]">
        <CheckCircle2 className="w-3.5 h-3.5" /> बाइंडिंग एग्रीमेंट
      </div>
    </div>
  )
}

export function HiTermsBodySections() {
  return (
    <div className="space-y-10 lg:space-y-12 text-[15px] text-slate-600 leading-relaxed">
      <section id="acceptance" className="scroll-mt-28">
        <h2 className="text-[22px] lg:text-[24px] font-bold text-[#1A1C29] tracking-tight mb-4">
          1. शर्तों की स्वीकृति
        </h2>
        <p className="text-[15px] text-[#1A1C29] font-semibold mb-3">
          BookPhysio.in का उपयोग करके आप इन शर्तों से बाध्य होने के लिए सहमत होते हैं।
        </p>
        <p>
          यदि आप इन शर्तों से सहमत नहीं हैं, तो कृपया प्लेटफॉर्म का उपयोग न करें। ये नियम मरीजों, आगंतुकों और प्लेटफॉर्म पर सूचीबद्ध फिजियोथेरेपिस्ट्स सभी पर लागू होते हैं।
        </p>
      </section>

      <section id="description" className="scroll-mt-28">
        <h2 className="text-[22px] lg:text-[24px] font-bold text-[#1A1C29] tracking-tight mb-4">
          2. सेवा का विवरण
        </h2>
        <div className="rounded-[var(--sq-lg)] bg-[#00766C] text-white p-6 lg:p-8 shadow-[0_1px_3px_rgba(15,23,42,0.04)] mb-4">
          <FileText className="w-6 h-6 text-[#FF6B35] mb-3" />
          <p className="text-[14px] lg:text-[15px] leading-relaxed text-white/85">
            BookPhysio मरीजों को फिजियोथेरेपिस्ट्स से जोड़ने वाला डिजिटल प्लेटफॉर्म है।{' '}
            <span className="text-white font-semibold">
              हम स्वयं चिकित्सा सलाह या उपचार प्रदान नहीं करते।
            </span>
          </p>
        </div>
        <p>क्लिनिकल निर्णय और उपचार परिणाम की जिम्मेदारी संबंधित प्रदाता की रहती है।</p>
      </section>

      <section id="responsibilities" className="scroll-mt-28">
        <h2 className="text-[22px] lg:text-[24px] font-bold text-[#1A1C29] tracking-tight mb-4">
          3. उपयोगकर्ता जिम्मेदारियाँ
        </h2>
        <ul className="space-y-3">
          {[
            'मरीजों को सही व्यक्तिगत और बुकिंग-संबंधित जानकारी देनी होगी।',
            'फीस, भुगतान निर्देश और विज़िट प्रकार चेकआउट या बुकिंग सारांश में जैसा दिखे, उसका पालन करना होगा, जिसमें स्पष्ट रूप से दिखाया गया पे-एट-विज़िट विकल्प भी शामिल हो सकता है।',
            'कैंसलेशन या रीशेड्यूल के लिए प्लेटफॉर्म की समय सीमा का पालन करना होगा।',
            'होम-विज़िट या इन-क्लिनिक सेशन के दौरान प्रदाता की पेशेवर सीमाओं का सम्मान करना होगा।',
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
          4. प्रदाता सत्यापन
        </h2>
        <p>
          हम उपलब्ध जानकारी और IAP/State Council पंजीकरण के आधार पर प्रदाताओं की प्रोफाइल सत्यापित करने का प्रयास करते हैं। फिर भी अंतिम चयन और उपचार के बारे में निर्णय उपयोगकर्ता और प्रदाता के बीच होता है।
        </p>
      </section>

      <section id="liability" className="scroll-mt-28">
        <h2 className="text-[22px] lg:text-[24px] font-bold text-[#1A1C29] tracking-tight mb-4">
          5. देयता की सीमा
        </h2>
        <p>
          BookPhysio प्लेटफॉर्म के संचालन, बुकिंग फ्लो और भुगतान समन्वय को उचित सावधानी से चलाने का प्रयास करता है। उपचार योजना, क्लिनिकल सलाह और रिकवरी परिणाम की जिम्मेदारी उपचार देने वाले फिजियोथेरेपिस्ट की होती है। कानून द्वारा अनुमत सीमा तक हमारी देयता संबंधित बुकिंग के प्लेटफॉर्म शुल्क तक सीमित होगी।
        </p>
      </section>

      <section id="contact" className="scroll-mt-28 rounded-[var(--sq-lg)] border border-slate-200 bg-white p-6 lg:p-8 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col md:flex-row gap-5 items-center md:items-start text-center md:text-left">
          <div className="w-12 h-12 rounded-full bg-[#FEE9DD] text-[#FF6B35] flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-[16px] font-semibold text-[#1A1C29]">परिवर्तनों की सूचना</h3>
            <p className="mt-1 text-[13px] text-slate-600 leading-relaxed">
              ये शर्तें समय-समय पर अपडेट हो सकती हैं। प्लेटफॉर्म का निरंतर उपयोग नई शर्तों की स्वीकृति माना जाएगा।
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
