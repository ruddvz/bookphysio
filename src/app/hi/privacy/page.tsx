import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ShieldCheck, Lock, Sparkles } from 'lucide-react'

export default function HindiPrivacyPage() {
  return (
    <>
      <Navbar locale="hi" localeSwitchPath="/privacy" />

      <main lang="hi" className="bg-white min-h-screen">
        <section className="bg-[#111111] text-white py-32 sm:py-48 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-bp-primary/15 rounded-full blur-[140px] -mr-80 -mt-80 animate-pulse duration-[10s]"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-bp-accent/5 rounded-full blur-[100px] -ml-40 -mb-40"></div>

          <div className="max-w-[1142px] mx-auto px-6 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full text-[12px] font-black uppercase tracking-[0.3em] mb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              डेटा प्रोटेक्शन ऑफिस
            </div>
            <h1 className="text-[56px] sm:text-[88px] font-black mb-8 tracking-tighter leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              प्राइवेसी <span className="text-bp-primary italic">पॉलिसी</span>
            </h1>
            <p className="text-[18px] sm:text-[24px] text-white/50 font-medium animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
              अंतिम अपडेट: मार्च 2026 • क्लिनिकल गवर्नेंस v4.2
            </p>
          </div>
        </section>

        <section className="py-24 sm:py-40 bg-white">
          <div className="max-w-[1142px] mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
              <div className="lg:col-span-4 sticky top-32 group">
                <div className="space-y-16">
                  <div>
                    <h2 className="text-[12px] font-black text-bp-primary uppercase tracking-[0.4em] mb-12">लीगल इंडेक्स</h2>
                    <ul className="space-y-6">
                      <li><a href="#introduction" className="text-[20px] font-black text-bp-primary hover:text-bp-primary transition-all flex items-center gap-4 group/item">1.0 परिचय <div className="w-1.5 h-1.5 rounded-full bg-bp-primary"></div></a></li>
                      <li><a href="#data-collection" className="text-[20px] font-black text-bp-body/40 hover:text-bp-primary transition-all">2.0 डेटा संग्रह</a></li>
                      <li><a href="#data-usage" className="text-[20px] font-black text-bp-body/40 hover:text-bp-primary transition-all">3.0 उपयोग</a></li>
                      <li><a href="#data-security" className="text-[20px] font-black text-bp-body/40 hover:text-bp-primary transition-all">4.0 सुरक्षा</a></li>
                      <li><a href="#sharing" className="text-[20px] font-black text-bp-body/40 hover:text-bp-primary transition-all">5.0 साझा करना</a></li>
                    </ul>
                  </div>

                  <div className="p-10 bg-bp-surface rounded-[40px] border border-bp-border/40 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-bp-primary/5 rounded-full blur-2xl -mr-16 -mt-16"></div>
                    <ShieldCheck className="w-10 h-10 text-bp-primary mb-8" />
                    <h3 className="text-[24px] font-black text-bp-primary mb-5 tracking-tight">क्लिनिकल गवर्नेंस</h3>
                    <p className="text-[17px] text-bp-body/60 font-medium leading-relaxed mb-8">
                      हम अकाउंट, बुकिंग और भुगतान से जुड़े डेटा की सुरक्षा के लिए लेयर्ड टेक्निकल और ऑपरेशनल कंट्रोल्स का उपयोग करते हैं।
                    </p>
                        <div className="flex items-center gap-3 text-bp-primary font-black text-[12px] uppercase tracking-widest">
                      <Lock className="w-4 h-4" /> सिक्योर्ड प्रोटोकॉल
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8">
                <div className="prose prose-lg max-w-none text-bp-body/70 font-medium leading-[1.9] space-y-24">
                  <section id="introduction" className="scroll-mt-32">
                    <div className="flex items-center gap-5 mb-10">
                      <div className="w-2.5 h-2.5 rounded-full bg-bp-accent shadow-[0_0_12px_rgba(255,107,53,0.4)]"></div>
                      <h2 className="text-[36px] font-black text-bp-primary tracking-tighter leading-none m-0">1.0 परिचय</h2>
                    </div>
                    <p className="text-[20px] text-bp-primary font-bold leading-relaxed mb-8">
                      BookPhysio.in पर आपकी गोपनीयता हमारी प्राथमिक जिम्मेदारी है।
                    </p>
                    <p>
                      यह पॉलिसी बताती है कि जब आप हमारी वेबसाइट, बुकिंग प्लेटफॉर्म, मोबाइल अनुभव और संबंधित सेवाओं का उपयोग करते हैं, तब हम कौन-सी जानकारी एकत्र करते हैं, उसका उपयोग कैसे करते हैं और किन परिस्थितियों में उसे साझा करते हैं।
                    </p>
                  </section>

                  <section id="data-collection" className="scroll-mt-32">
                    <div className="flex items-center gap-5 mb-10">
                      <div className="w-2.5 h-2.5 rounded-full bg-bp-primary shadow-[0_0_12px_rgba(0,118,108,0.4)]"></div>
                      <h2 className="text-[36px] font-black text-bp-primary tracking-tighter leading-none m-0">2.0 जानकारी का संग्रह</h2>
                    </div>
                    <p className="mb-10">बेहतर बुकिंग अनुभव और समन्वय के लिए हम निम्न प्रकार की जानकारी एकत्र कर सकते हैं:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 not-prose">
                      <div className="p-8 bg-bp-surface/50 border border-bp-border/40 rounded-[32px]">
                        <h4 className="text-[18px] font-black text-bp-primary mb-4">व्यक्तिगत डेटा</h4>
                        <p className="text-[16px] text-bp-body/60 italic">नाम, उम्र, जेंडर, फोन नंबर, ईमेल और शहर जैसी बुनियादी जानकारी।</p>
                      </div>
                      <div className="p-8 bg-bp-surface/50 border border-bp-border/40 rounded-[32px]">
                        <h4 className="text-[18px] font-black text-bp-primary mb-4">बुकिंग और क्लिनिकल संदर्भ</h4>
                        <p className="text-[16px] text-bp-body/60 italic">विज़िट का कारण, पसंदीदा विज़िट प्रकार और आपकी बुकिंग हिस्ट्री।</p>
                      </div>
                    </div>
                  </section>

                  <section id="data-usage" className="scroll-mt-32">
                    <div className="flex items-center gap-5 mb-10">
                      <div className="w-2.5 h-2.5 rounded-full bg-bp-accent"></div>
                      <h2 className="text-[36px] font-black text-bp-primary tracking-tighter leading-none m-0">3.0 आपकी जानकारी का उपयोग</h2>
                    </div>
                    <ul className="list-none p-0 space-y-6">
                      {[
                        'सत्यापित फिजियोथेरेपिस्ट के साथ आपकी बुकिंग को समन्वित और कन्फर्म करने के लिए।',
                        'प्रदाताओं के ICP पंजीकरण और क्लिनिकल क्रेडेंशियल्स की पुष्टि करने के लिए।',
                        'बुकिंग शुल्क, GST सारांश और भुगतान फ्लो को संभालने के लिए।',
                        'आवश्यक होने पर OTP, रिमाइंडर और बुकिंग अपडेट भेजने के लिए।',
                      ].map((item, index) => (
                        <li key={index} className="flex gap-4 items-start text-[18px]">
                          <div className="w-6 h-6 rounded-full bg-bp-primary/10 flex items-center justify-center shrink-0 mt-1">
                            <div className="w-2 h-2 rounded-full bg-bp-primary"></div>
                          </div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section id="data-security" className="scroll-mt-32">
                    <div className="flex items-center gap-5 mb-10">
                      <div className="w-2.5 h-2.5 rounded-full bg-bp-secondary"></div>
                      <h2 className="text-[36px] font-black text-bp-primary tracking-tighter leading-none m-0">4.0 सुरक्षा उपाय</h2>
                    </div>
                    <div className="p-10 bg-[#111111] rounded-[40px] text-white overflow-hidden relative group">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-bp-primary/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                      <Lock className="w-8 h-8 text-bp-accent mb-6" />
                      <p className="text-[19px] font-medium leading-relaxed opacity-80 relative z-10">
                        हम इंडस्ट्री-स्टैंडर्ड सुरक्षा उपाय अपनाते हैं ताकि आपकी जानकारी अनधिकृत एक्सेस, बदलाव या दुरुपयोग से सुरक्षित रहे। <span className="text-white font-black italic">हम आपका व्यक्तिगत या क्लिनिकल डेटा विज्ञापनदाताओं को नहीं बेचते।</span>
                      </p>
                    </div>
                  </section>

                  <section id="sharing" className="scroll-mt-32">
                    <div className="flex items-center gap-5 mb-10">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                      <h2 className="text-[36px] font-black text-bp-primary tracking-tighter leading-none m-0">5.0 जानकारी साझा करना</h2>
                    </div>
                    <p className="text-[18px] leading-relaxed">
                      हम वही जानकारी साझा करते हैं जो बुकिंग और प्लेटफॉर्म संचालन के लिए आवश्यक हो। इसमें चुने हुए प्रदाता के साथ अपॉइंटमेंट विवरण, भुगतान प्रोसेसर के साथ ट्रांजैक्शन डेटा, BookPhysio AI फीचर्स में आपके द्वारा भेजे गए प्रॉम्प्ट्स को उत्तर तैयार करने के लिए हमारे AI सेवा प्रदाताओं द्वारा प्रोसेस किया जाना, और कानून या नियामक आवश्यकता होने पर सीमित खुलासा शामिल हो सकता है।
                    </p>
                  </section>

                  <section className="bg-bp-surface px-12 py-12 rounded-[48px] mt-16 border border-bp-border/40 group">
                    <div className="flex flex-col md:flex-row gap-10 items-center text-center md:text-left">
                      <div className="w-20 h-20 rounded-3xl bg-white border border-bp-border/60 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <Sparkles className="w-10 h-10 text-bp-primary" />
                      </div>
                      <div>
                        <h3 className="text-[24px] font-black text-bp-primary mb-2">डेटा प्रोटेक्शन अधिकारी</h3>
                        <p className="text-[17px] text-bp-body/60 font-medium mb-4">अगर आपके पास डेटा सुरक्षा या गोपनीयता से जुड़े सवाल हैं, तो हमें लिखें।</p>
                        <a href="mailto:privacy@bookphysio.in" className="text-[18px] font-black text-bp-primary underline decoration-2 underline-offset-8 hover:text-bp-primary transition-colors italic">privacy@bookphysio.in</a>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer locale="hi" localeSwitchPath="/privacy" />
    </>
  )
}