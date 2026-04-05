import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ShieldCheck, IndianRupee, Globe, Heart } from 'lucide-react'

const benefits = [
  {
    title: 'सत्यापित विशेषज्ञ',
    text: 'हम प्लेटफॉर्म पर शामिल हर फिजियोथेरेपिस्ट की डिग्री, पंजीकरण और क्लिनिकल अनुभव की जांच करते हैं।',
    icon: ShieldCheck,
  },
  {
    title: 'क्लिनिकल गहराई',
    text: 'ऑर्थोपेडिक, न्यूरोलॉजिकल और पीडियाट्रिक रिहैब जैसे क्षेत्रों पर विशेष ध्यान।',
    icon: Heart,
  },
  {
    title: 'पारदर्शी प्राइसिंग',
    text: 'बुक करने से पहले ही फीस और विज़िट विकल्प साफ़ दिखते हैं। कोई छिपे हुए क्लिनिकल चार्ज नहीं।',
    icon: IndianRupee,
  },
  {
    title: 'भारतभर की पहुंच',
    text: 'क्लिनिक विज़िट से लेकर होम विज़िट तक, विशेषज्ञ देखभाल को भारत के अधिक शहरों तक पहुंचाना।',
    icon: Globe,
  },
]

export default function HindiAboutPage() {
  return (
    <>
      <Navbar locale="hi" localeSwitchPath="/about" />

      <main lang="hi" className="bg-white min-h-screen">
        <section className="bg-[#111111] text-white py-32 sm:py-48 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-bp-primary/20 rounded-full blur-[120px] -mr-64 -mt-64"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-bp-accent/10 rounded-full blur-[120px] -ml-64 -mb-64"></div>

          <div className="max-w-[1142px] mx-auto px-6 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[12px] font-bold uppercase tracking-[0.2em] mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              सत्यापित मार्केटप्लेस
            </div>
            <h1 className="text-[52px] sm:text-[84px] font-bold mb-10 tracking-tighter leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              फिजियोथेरेपी के लिए भारत का <span className="text-bp-primary">फोकस्ड प्लेटफॉर्म।</span>
            </h1>
            <p className="text-[18px] sm:text-[22px] leading-relaxed max-w-[800px] mx-auto text-white/60 font-medium animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
              हम मरीजों को सत्यापित फिजियोथेरेपिस्ट खोजने, विज़िट विकल्पों की तुलना करने और पूरे भारत में आसानी से बुक करने में मदद करते हैं।
            </p>
          </div>
        </section>

        <section className="py-32">
          <div className="max-w-[1142px] mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center mb-32">
              <div className="relative">
                <div className="w-1.5 h-12 bg-bp-accent rounded-full mb-8"></div>
                <h2 className="text-[44px] font-bold text-bp-primary mb-8 tracking-tighter leading-tight">रिहैबिलिटेशन को समझने वाला डिजिटल नेटवर्क</h2>
                <div className="space-y-6">
                  <p className="text-[19px] leading-[1.8] text-bp-body/70 font-medium">
                    BookPhysio.in भारत का ऐसा प्लेटफॉर्म है जो केवल फिजियोथेरेपी पर केंद्रित है। रिकवरी के लिए सिर्फ एक स्लॉट नहीं, बल्कि सही विशेषज्ञता, उपलब्धता और निरंतरता की आवश्यकता होती है।
                  </p>
                  <p className="text-[19px] leading-[1.8] text-bp-body/70 font-medium">
                    इसी वजह से हम मरीजों को सत्यापित प्रोफाइल, स्पष्ट क्रेडेंशियल्स और इन-क्लिनिक व होम-विज़िट दोनों विकल्पों के साथ बेहतर निर्णय लेने में मदद करते हैं।
                  </p>
                </div>
              </div>
              <div className="aspect-square bg-bp-surface border border-bp-border/40 rounded-[48px] flex items-center justify-center p-12 text-[#9CA3AF] relative group overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)]">
                <div className="absolute inset-0 bg-gradient-to-br from-bp-primary/5 to-transparent group-hover:from-bp-primary/10 transition-all duration-700"></div>
                <div className="text-center relative z-10 scale-110 group-hover:scale-125 transition-transform duration-1000">
                  <Globe className="w-24 h-24 mx-auto mb-6 text-bp-primary/20" />
                  <p className="text-[14px] font-bold text-bp-primary uppercase tracking-[0.3em]">नेशनल केयर नेटवर्क</p>
                </div>
              </div>
            </div>

            <div className="mb-32">
              <div className="text-center max-w-2xl mx-auto mb-20">
                <p className="text-[12px] font-bold text-bp-accent uppercase tracking-[0.3em] mb-4">क्यों भरोसा करें</p>
                <h2 className="text-[40px] font-bold text-bp-primary tracking-tighter leading-none">जिससे निर्णय आसान हो</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {benefits.map(({ title, text, icon: Icon }, idx) => (
                  <div key={idx} className="flex flex-col p-10 bg-white border border-bp-border/40 rounded-[32px] hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.08)] hover:border-bp-primary/30 transition-all duration-500 group">
                    <div className="w-16 h-16 rounded-2xl bg-bp-surface flex items-center justify-center mb-8 group-hover:bg-bp-primary group-hover:text-white transition-all duration-500">
                      <Icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-[22px] font-bold text-bp-primary mb-4 tracking-tight">{title}</h3>
                    <p className="text-[16px] leading-relaxed text-bp-body/60 font-medium">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center p-20 bg-[#111111] rounded-[64px] border border-white/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-bp-primary/20 to-transparent opacity-50"></div>
              <div className="relative z-10">
                <Heart className="w-16 h-16 text-bp-accent mx-auto mb-8 animate-pulse" />
                <h2 className="text-[48px] font-bold text-white mb-6 tracking-tighter">स्पष्ट खोज, बेहतर रिकवरी</h2>
                <p className="text-[20px] text-white/50 max-w-[700px] mx-auto font-medium leading-relaxed">
                  हमारा लक्ष्य फिजियोथेरेपी खोजने और बुक करने की प्रक्रिया को मरीजों और प्रदाताओं दोनों के लिए अधिक भरोसेमंद बनाना है।
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer locale="hi" localeSwitchPath="/about" />
    </>
  )
}