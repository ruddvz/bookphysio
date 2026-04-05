import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { FileText, AlertCircle, Scale, CheckCircle2 } from 'lucide-react'

export default function HindiTermsPage() {
  return (
    <>
      <Navbar locale="hi" localeSwitchPath="/terms" />

      <main lang="hi" className="bg-white min-h-screen">
        <section className="bg-[#111111] text-white py-32 sm:py-48 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-bp-primary/15 rounded-full blur-[140px] -mr-80 -mt-80 animate-pulse duration-[10s]"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-bp-accent/5 rounded-full blur-[100px] -ml-40 -mb-40"></div>

          <div className="max-w-[1142px] mx-auto px-6 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full text-[12px] font-bold uppercase tracking-[0.3em] mb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              लीगल फ्रेमवर्क
            </div>
            <h1 className="text-[56px] sm:text-[88px] font-bold mb-8 tracking-tighter leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              सेवा की <span className="text-bp-primary italic">शर्तें</span>
            </h1>
            <p className="text-[18px] sm:text-[24px] text-white/50 font-medium animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
              अंतिम अपडेट: मार्च 2026 • Agreement v2.1
            </p>
          </div>
        </section>

        <section className="py-24 sm:py-40 bg-white">
          <div className="max-w-[1142px] mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
              <div className="lg:col-span-4 sticky top-32 group">
                <div className="space-y-16">
                  <div>
                    <h2 className="text-[12px] font-bold text-bp-primary uppercase tracking-[0.4em] mb-12">एग्रीमेंट इंडेक्स</h2>
                    <ul className="space-y-6">
                      <li><a href="#acceptance" className="text-[20px] font-bold text-bp-primary hover:text-bp-primary transition-all flex items-center gap-4 group/item">1.0 स्वीकृति <div className="w-1.5 h-1.5 rounded-full bg-bp-primary"></div></a></li>
                      <li><a href="#description" className="text-[20px] font-bold text-bp-body/40 hover:text-bp-primary transition-all">2.0 सेवा का दायरा</a></li>
                      <li><a href="#responsibilities" className="text-[20px] font-bold text-bp-body/40 hover:text-bp-primary transition-all">3.0 जिम्मेदारियाँ</a></li>
                      <li><a href="#verification" className="text-[20px] font-bold text-bp-body/40 hover:text-bp-primary transition-all">4.0 प्रदाता सत्यापन</a></li>
                      <li><a href="#liability" className="text-[20px] font-bold text-bp-body/40 hover:text-bp-primary transition-all">5.0 देयता</a></li>
                    </ul>
                  </div>

                  <div className="p-10 bg-bp-surface rounded-[40px] border border-bp-border/40 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-bp-primary/5 rounded-full blur-2xl -mr-16 -mt-16"></div>
                    <Scale className="w-10 h-10 text-bp-primary mb-8" />
                    <h3 className="text-[24px] font-bold text-bp-primary mb-5 tracking-tight">कानूनी पारदर्शिता</h3>
                    <p className="text-[17px] text-bp-body/60 font-medium leading-relaxed mb-8">
                      ये शर्तें तकनीकी प्लेटफॉर्म और क्लिनिकल सेवा के बीच जिम्मेदारियों की स्पष्ट सीमा तय करती हैं।
                    </p>
                    <div className="flex items-center gap-3 text-bp-primary font-bold text-[12px] uppercase tracking-widest">
                      <CheckCircle2 className="w-4 h-4" /> बाइंडिंग एग्रीमेंट
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8">
                <div className="prose prose-lg max-w-none text-bp-body/70 font-medium leading-[1.9] space-y-24">
                  <section id="acceptance" className="scroll-mt-32">
                    <div className="flex items-center gap-5 mb-10">
                      <div className="w-2.5 h-2.5 rounded-full bg-bp-accent shadow-[0_0_12px_rgba(255,107,53,0.4)]"></div>
                      <h2 className="text-[36px] font-bold text-bp-primary tracking-tighter leading-none m-0">1.0 शर्तों की स्वीकृति</h2>
                    </div>
                    <p className="text-[20px] text-bp-primary font-bold leading-relaxed mb-8">
                      BookPhysio.in का उपयोग करके आप इन शर्तों से बाध्य होने के लिए सहमत होते हैं।
                    </p>
                    <p>
                      यदि आप इन शर्तों से सहमत नहीं हैं, तो कृपया प्लेटफॉर्म का उपयोग न करें। ये नियम मरीजों, आगंतुकों और प्लेटफॉर्म पर सूचीबद्ध फिजियोथेरेपिस्ट्स सभी पर लागू होते हैं।
                    </p>
                  </section>

                  <section id="description" className="scroll-mt-32">
                    <div className="flex items-center gap-5 mb-10">
                      <div className="w-2.5 h-2.5 rounded-full bg-bp-primary shadow-[0_0_12px_rgba(0,118,108,0.4)]"></div>
                      <h2 className="text-[36px] font-bold text-bp-primary tracking-tighter leading-none m-0">2.0 सेवा का विवरण</h2>
                    </div>
                    <div className="p-10 bg-[#111111] rounded-[40px] text-white overflow-hidden relative group mb-10">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-bp-primary/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                      <FileText className="w-8 h-8 text-bp-accent mb-6" />
                      <p className="text-[19px] font-medium leading-relaxed opacity-80 relative z-10">
                        BookPhysio मरीजों को फिजियोथेरेपिस्ट्स से जोड़ने वाला डिजिटल प्लेटफॉर्म है। <span className="text-white font-bold italic">हम स्वयं चिकित्सा सलाह या उपचार प्रदान नहीं करते।</span>
                      </p>
                    </div>
                    <p>क्लिनिकल निर्णय और उपचार परिणाम की जिम्मेदारी संबंधित प्रदाता की रहती है।</p>
                  </section>

                  <section id="responsibilities" className="scroll-mt-32">
                    <div className="flex items-center gap-5 mb-10">
                      <div className="w-2.5 h-2.5 rounded-full bg-bp-accent"></div>
                      <h2 className="text-[36px] font-bold text-bp-primary tracking-tighter leading-none m-0">3.0 उपयोगकर्ता जिम्मेदारियाँ</h2>
                    </div>
                    <ul className="list-none p-0 space-y-6">
                      {[
                        'मरीजों को सही व्यक्तिगत और बुकिंग-संबंधित जानकारी देनी होगी।',
                        'फीस, भुगतान निर्देश और विज़िट प्रकार चेकआउट या बुकिंग सारांश में जैसा दिखे, उसका पालन करना होगा।',
                        'कैंसलेशन या रीशेड्यूल के लिए प्लेटफॉर्म की समय सीमा का पालन करना होगा।',
                        'होम-विज़िट या इन-क्लिनिक सेशन के दौरान प्रदाता की पेशेवर सीमाओं का सम्मान करना होगा।',
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

                  <section id="verification" className="scroll-mt-32">
                    <div className="flex items-center gap-5 mb-10">
                      <div className="w-2.5 h-2.5 rounded-full bg-bp-secondary"></div>
                      <h2 className="text-[36px] font-bold text-bp-primary tracking-tighter leading-none m-0">4.0 प्रदाता सत्यापन</h2>
                    </div>
                    <p className="text-[18px] leading-relaxed">
                      हम उपलब्ध जानकारी और ICP पंजीकरण के आधार पर प्रदाताओं की प्रोफाइल सत्यापित करने का प्रयास करते हैं। फिर भी अंतिम चयन और उपचार के बारे में निर्णय उपयोगकर्ता और प्रदाता के बीच होता है।
                    </p>
                  </section>

                  <section id="liability" className="scroll-mt-32">
                    <div className="flex items-center gap-5 mb-10">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                      <h2 className="text-[36px] font-bold text-bp-primary tracking-tighter leading-none m-0">5.0 देयता की सीमा</h2>
                    </div>
                    <p className="text-[18px] leading-relaxed">
                      BookPhysio प्लेटफॉर्म के संचालन, बुकिंग फ्लो और भुगतान समन्वय को उचित सावधानी से चलाने का प्रयास करता है। उपचार योजना, क्लिनिकल सलाह और रिकवरी परिणाम की जिम्मेदारी उपचार देने वाले फिजियोथेरेपिस्ट की होती है। कानून द्वारा अनुमत सीमा तक हमारी देयता संबंधित बुकिंग के प्लेटफॉर्म शुल्क तक सीमित होगी।
                    </p>
                  </section>

                  <section className="bg-bp-surface px-12 py-12 rounded-[48px] mt-16 border border-bp-border/40 group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-bp-accent/5 rounded-full blur-2xl -mr-16 -mt-16"></div>
                    <div className="flex flex-col md:flex-row gap-10 items-center text-center md:text-left relative z-10">
                      <div className="w-20 h-20 rounded-3xl bg-white border border-bp-border/60 flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                        <AlertCircle className="w-10 h-10 text-bp-accent" />
                      </div>
                      <div>
                        <h3 className="text-[24px] font-bold text-bp-primary mb-2">परिवर्तनों की सूचना</h3>
                        <p className="text-[17px] text-bp-body/60 font-medium mb-0">
                          ये शर्तें समय-समय पर अपडेट हो सकती हैं। प्लेटफॉर्म का निरंतर उपयोग नई शर्तों की स्वीकृति माना जाएगा।
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer locale="hi" localeSwitchPath="/terms" />
    </>
  )
}