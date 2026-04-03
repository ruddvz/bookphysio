import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ShieldCheck, Home, IndianRupee, Zap, Globe, Heart } from 'lucide-react'

const benefits = [
  { title: 'Verified Experts', text: 'Every therapist on our platform is verified for credentials and clinical experience.', icon: ShieldCheck },
  { title: 'Clinical Depth', text: 'Specialized focus on orthopedic, neurological, and pediatric rehabilitation.', icon: Heart },
  { title: 'Transparent Pricing', text: 'Know exactly what you pay before you book. No hidden clinical charges.', icon: IndianRupee },
  { title: 'India-Wide Reach', text: 'Connecting expert care to every corner of India, from clinics to your home.', icon: Globe },
]

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main className="bg-white min-h-screen">
        {/* Full-width Hero Section */}
        <section className="bg-[#111111] text-white py-32 sm:py-48 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-bp-primary/20 rounded-full blur-[120px] -mr-64 -mt-64"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-bp-accent/10 rounded-full blur-[120px] -ml-64 -mb-64"></div>
          
          <div className="max-w-[1142px] mx-auto px-6 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[12px] font-black uppercase tracking-[0.2em] mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
               Verified Marketplace
            </div>
            <h1 className="text-[52px] sm:text-[84px] font-black mb-10 tracking-tighter leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              India&apos;s focused platform for <span className="text-bp-primary">Physiotherapy.</span>
            </h1>
            <p className="text-[18px] sm:text-[22px] leading-relaxed max-w-[800px] mx-auto text-white/60 font-medium animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
              We help patients discover verified physiotherapists, compare visit options, and book clearly across India.
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-32">
          <div className="max-w-[1142px] mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center mb-32">
              <div className="relative">
                <div className="w-1.5 h-12 bg-bp-accent rounded-full mb-8"></div>
                <h2 className="text-[44px] font-black text-bp-primary mb-8 tracking-tighter leading-tight">A New Paradigm in Rehabilitation</h2>
                <div className="space-y-6">
                  <p className="text-[19px] leading-[1.8] text-bp-body/70 font-medium">
                    BookPhysio.in is India&apos;s leading platform dedicated exclusively to physiotherapy.
                    We understand that recovery requires more than just a session—it requires specialized expertise and continuity.
                  </p>
                  <p className="text-[19px] leading-[1.8] text-bp-body/70 font-medium">
                    Our platform connects patients with verified provider profiles and clearly listed credentials
                    for both in-clinic and home-visit care, making it easier to choose and book the right provider.
                  </p>
                </div>
              </div>
              <div className="aspect-square bg-bp-surface border border-bp-border/40 rounded-[48px] flex items-center justify-center p-12 text-[#9CA3AF] relative group overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)]">
                 <div className="absolute inset-0 bg-gradient-to-br from-bp-primary/5 to-transparent group-hover:from-bp-primary/10 transition-all duration-700"></div>
                 <div className="text-center relative z-10 scale-110 group-hover:scale-125 transition-transform duration-1000">
                    <Globe className="w-24 h-24 mx-auto mb-6 text-bp-primary/20" />
                    <p className="text-[14px] font-black text-bp-primary uppercase tracking-[0.3em]">National Care Network</p>
                 </div>
              </div>
            </div>

            <div className="mb-32">
              <div className="text-center max-w-2xl mx-auto mb-20">
                 <p className="text-[12px] font-black text-bp-accent uppercase tracking-[0.3em] mb-4">Precision Pillars</p>
                 <h2 className="text-[40px] font-black text-bp-primary tracking-tighter leading-none">Why Experts Choose Us</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {benefits.map(({ title, text, icon: Icon }, idx) => (
                  <div key={idx} className="flex flex-col p-10 bg-white border border-bp-border/40 rounded-[32px] hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.08)] hover:border-bp-primary/30 transition-all duration-500 group">
                    <div className="w-16 h-16 rounded-2xl bg-bp-surface flex items-center justify-center mb-8 group-hover:bg-bp-primary group-hover:text-white transition-all duration-500">
                      <Icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-[22px] font-black text-bp-primary mb-4 tracking-tight">{title}</h3>
                    <p className="text-[16px] leading-relaxed text-bp-body/60 font-medium">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center p-20 bg-[#111111] rounded-[64px] border border-white/5 relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-bp-primary/20 to-transparent opacity-50"></div>
               <div className="relative z-10">
                  <Heart className="w-16 h-16 text-bp-accent mx-auto mb-8 animate-pulse" />
                  <h2 className="text-[48px] font-black text-white mb-6 tracking-tighter">Leading Clinical Recovery</h2>
                  <p className="text-[20px] text-white/50 max-w-[700px] mx-auto font-medium leading-relaxed">
                    We are dedicated to making physiotherapy discovery and booking clearer for patients and providers alike.
                  </p>
               </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
