import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ShieldCheck, Home, IndianRupee, Zap, Globe, Heart } from 'lucide-react'

const benefits = [
  { title: 'Verified Experts', text: 'Every therapist on our platform is verified for credentials and clinical experience.', icon: ShieldCheck },
  { title: 'Convenience First', text: 'Choose between visiting a clinic or having a therapist come to your home.', icon: Home },
  { title: 'Transparent Pricing', text: 'Know exactly what you pay before you book. No hidden charges or registration fees.', icon: IndianRupee },
  { title: 'Seamless Booking', text: 'Book your session in under a minute with our intuitive interface.', icon: Zap },
]

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main className="bg-white min-h-screen">
        {/* Full-width Hero Section */}
        <section className="bg-gradient-to-br from-[#00766C] to-[#005A52] text-white py-24 sm:py-32 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -ml-48 -mb-48"></div>
          
          <div className="max-w-[1142px] mx-auto px-6 text-center relative z-10">
            <h1 className="text-[48px] sm:text-[64px] font-bold mb-6 tracking-tight leading-tight">
              India&apos;s Premier Physiotherapy Booking Platform
            </h1>
            <p className="text-[20px] sm:text-[24px] leading-relaxed max-w-[800px] mx-auto opacity-90 font-medium">
              Making high-quality physiotherapy accessible and convenient across India. 
              We&apos;re bridging the gap between expert care and those who need it.
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-24">
          <div className="max-w-[1142px] mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
              <div>
                <h2 className="text-[36px] font-bold text-[#333333] mb-6 tracking-tight">Who We Are</h2>
                <p className="text-[18px] leading-[1.8] text-[#555555] mb-6">
                  BookPhysio is India&apos;s leading platform dedicated exclusively to physiotherapy.
                  We understand that recovering from an injury or managing chronic pain requires
                  specialized attention and consistent care.
                </p>
                <p className="text-[18px] leading-[1.8] text-[#555555]">
                  Our platform connects patients with verified, ICP-registered physiotherapists
                  for in-clinic and home-visit sessions, ensuring you get the care
                  you need, wherever you are.
                </p>
              </div>
              <div className="h-[400px] bg-[#F7F8F9] border border-[#E5E5E5] rounded-[24px] flex items-center justify-center p-12 text-[#9CA3AF] relative group">
                 <div className="absolute inset-0 bg-[#00766C]/5 rounded-[24px] group-hover:bg-[#00766C]/10 transition-colors"></div>
                 <div className="text-center relative z-10">
                    <Globe className="w-16 h-16 mx-auto mb-4 text-[#00766C]/30" />
                    <p className="font-semibold text-[#00766C]/50">Connecting India to Expert Care</p>
                 </div>
              </div>
            </div>

            <div className="mb-24">
              <h2 className="text-[36px] font-bold text-[#333333] text-center mb-16 tracking-tight">Why BookPhysio?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {benefits.map(({ title, text, icon: Icon }, idx) => (
                  <div key={idx} className="flex flex-col p-8 bg-white border border-[#E5E5E5] rounded-[16px] hover:shadow-lg hover:border-[#00766C] transition-all">
                    <div className="w-14 h-14 rounded-full bg-[#E6F4F3] flex items-center justify-center mb-6">
                      <Icon className="w-7 h-7 text-[#00766C]" />
                    </div>
                    <h3 className="text-[20px] font-bold text-[#333333] mb-3">{title}</h3>
                    <p className="text-[15px] leading-relaxed text-[#666666]">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center p-16 bg-[#F9FAFB] rounded-[32px] border border-[#E5E5E5]">
               <Heart className="w-12 h-12 text-[#00766C] mx-auto mb-6" />
               <h2 className="text-[32px] font-bold text-[#333333] mb-4">India&apos;s First Physio-Only Platform</h2>
               <p className="text-[18px] text-[#666666] max-w-[700px] mx-auto">
                 We are committed to putting the focus on rehabilitation and recovery. Our goal is to empower every Indian to live a more mobile, pain-free life.
               </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
