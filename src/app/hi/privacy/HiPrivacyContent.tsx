import { ShieldCheck, Lock, Sparkles } from 'lucide-react'
import { HI_PRIVACY_SECTIONS } from './hi-privacy-constants'

export function HiPrivacyAsideV1() {
  return (
    <aside className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
      <div>
        <h2 className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.2em] mb-4">
          लीगल इंडेक्स
        </h2>
        <ul className="space-y-2">
          {HI_PRIVACY_SECTIONS.map((section) => (
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
      <HiPrivacyCommitmentCard />
    </aside>
  )
}

export function HiPrivacyCommitmentCard() {
  return (
    <div className="rounded-[var(--sq-lg)] border border-slate-200 bg-white p-5 lg:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <div className="w-11 h-11 rounded-full bg-[#E6F4F3] text-[#00766C] flex items-center justify-center">
        <ShieldCheck className="w-5 h-5" />
      </div>
      <h3 className="mt-4 text-[15px] font-semibold text-[#1A1C29]">क्लिनिकल गवर्नेंस</h3>
      <p className="mt-1.5 text-[13px] text-slate-600 leading-relaxed">
        हम अकाउंट, बुकिंग और भुगतान डेटा की सुरक्षा के लिए तकनीकी और परिचालन स्तर के सुरक्षा उपाय अपनाते हैं।
      </p>
      <div className="mt-4 flex items-center gap-2 text-[11px] font-semibold text-[#00766C] uppercase tracking-[0.16em]">
        <Lock className="w-3.5 h-3.5" /> सुरक्षित प्रोटोकॉल
      </div>
    </div>
  )
}

export function HiPrivacyBodySections() {
  return (
    <div className="space-y-10 lg:space-y-12 text-[15px] text-slate-600 leading-relaxed">
      <section id="introduction" className="scroll-mt-28">
        <h2 className="text-[22px] lg:text-[24px] font-bold text-[#1A1C29] tracking-tight mb-4">
          1. परिचय
        </h2>
        <p className="text-[15px] text-[#1A1C29] font-semibold mb-3">
          BookPhysio.in पर आपकी गोपनीयता हमारी मुख्य जिम्मेदारी है।
        </p>
        <p>
          यह पॉलिसी बताती है कि जब आप हमारी वेबसाइट, बुकिंग प्लेटफॉर्म, मोबाइल अनुभव और संबंधित सेवाओं का उपयोग करते हैं, तब हम कौन-सी जानकारी एकत्र करते हैं, उसका उपयोग कैसे करते हैं और किन परिस्थितियों में उसे साझा करते हैं।
        </p>
      </section>

      <section id="data-collection" className="scroll-mt-28">
        <h2 className="text-[22px] lg:text-[24px] font-bold text-[#1A1C29] tracking-tight mb-4">
          2. जानकारी का संग्रह
        </h2>
        <p className="mb-5">
          बेहतर बुकिंग अनुभव और क्लिनिकल समन्वय के लिए हम निम्न प्रकार की जानकारी एकत्र कर सकते हैं:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-[var(--sq-lg)] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <h4 className="text-[14px] font-semibold text-[#1A1C29]">व्यक्तिगत डेटा</h4>
            <p className="mt-1.5 text-[13px] text-slate-600 leading-relaxed">
              नाम, उम्र, जेंडर, फोन नंबर, ईमेल और शहर जैसी बुनियादी जानकारी।
            </p>
          </div>
          <div className="rounded-[var(--sq-lg)] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <h4 className="text-[14px] font-semibold text-[#1A1C29]">बुकिंग और क्लिनिकल संदर्भ</h4>
            <p className="mt-1.5 text-[13px] text-slate-600 leading-relaxed">
              विज़िट का कारण, पसंदीदा विज़िट प्रकार और आपकी बुकिंग हिस्ट्री।
            </p>
          </div>
        </div>
      </section>

      <section id="data-usage" className="scroll-mt-28">
        <h2 className="text-[22px] lg:text-[24px] font-bold text-[#1A1C29] tracking-tight mb-4">
          3. आपकी जानकारी का उपयोग
        </h2>
        <ul className="space-y-3">
          {[
            'सत्यापित फिजियोथेरेपिस्ट के साथ आपकी बुकिंग को समन्वित और कन्फर्म करने के लिए।',
            'प्रदाताओं के IAP/State Council पंजीकरण और क्लिनिकल क्रेडेंशियल्स की पुष्टि करने के लिए।',
            'बुकिंग शुल्क, GST सारांश और बुकिंग फ्लो में दिखने वाले ऑनलाइन चेकआउट या पे-एट-विज़िट विकल्प को संभालने के लिए।',
            'आवश्यक होने पर OTP, रिमाइंडर और बुकिंग अपडेट भेजने के लिए।',
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

      <section id="data-security" className="scroll-mt-28">
        <h2 className="text-[22px] lg:text-[24px] font-bold text-[#1A1C29] tracking-tight mb-4">
          4. सुरक्षा उपाय
        </h2>
        <div className="rounded-[var(--sq-lg)] bg-[#00766C] text-white p-6 lg:p-8 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <Lock className="w-6 h-6 text-[#FF6B35] mb-3" />
          <p className="text-[14px] lg:text-[15px] leading-relaxed text-white/85">
            हम इंडस्ट्री-स्टैंडर्ड तकनीकी और संगठनात्मक उपाय अपनाते हैं ताकि आपकी जानकारी अनधिकृत एक्सेस, बदलाव या दुरुपयोग से सुरक्षित रहे।{' '}
            <span className="text-white font-semibold">
              हम आपका व्यक्तिगत या क्लिनिकल डेटा विज्ञापनदाताओं को नहीं बेचते।
            </span>
          </p>
        </div>
      </section>

      <section id="sharing" className="scroll-mt-28">
        <h2 className="text-[22px] lg:text-[24px] font-bold text-[#1A1C29] tracking-tight mb-4">
          5. जानकारी साझा करना
        </h2>
        <p>
          हम वही जानकारी साझा करते हैं जो बुकिंग और प्लेटफॉर्म संचालन के लिए आवश्यक हो। इसमें चुने हुए प्रदाता के साथ अपॉइंटमेंट विवरण, ऑनलाइन चेकआउट के लिए हमारे भुगतान प्रोसेसर के साथ ट्रांजैक्शन डेटा या बुकिंग में स्पष्ट रूप से दिखाए गए पे-एट-विज़िट विकल्प के लिए आवश्यक विवरण, BookPhysio AI फीचर्स में आपके द्वारा भेजे गए प्रॉम्प्ट्स को उत्तर तैयार करने के लिए हमारे AI सेवा प्रदाताओं द्वारा प्रोसेस किया जाना, और कानून या नियामक आवश्यकता होने पर सीमित खुलासा शामिल हो सकता है।
        </p>
      </section>

      <section id="contact" className="scroll-mt-28 rounded-[var(--sq-lg)] border border-slate-200 bg-white p-6 lg:p-8 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col md:flex-row gap-5 items-center md:items-start text-center md:text-left">
          <div className="w-12 h-12 rounded-full bg-[#E6F4F3] text-[#00766C] flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-[16px] font-semibold text-[#1A1C29]">डेटा प्रोटेक्शन अधिकारी</h3>
            <p className="mt-1 text-[13px] text-slate-600 leading-relaxed">
              अगर आपके पास डेटा सुरक्षा या गोपनीयता प्रोटोकॉल से जुड़े सवाल हैं, तो हमें लिखें।
            </p>
            <a
              href="mailto:privacy@bookphysio.in"
              className="mt-2 inline-block text-[14px] font-semibold text-[#00766C] hover:text-[#005A52] underline underline-offset-4"
            >
              privacy@bookphysio.in
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
