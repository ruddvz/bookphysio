import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ShieldCheck, IndianRupee, Globe, Heart } from 'lucide-react'

const benefits = [
  {
    title: 'Verified Experts',
    text: 'Every therapist on our platform is verified for credentials and clinical experience.',
    icon: ShieldCheck,
    tint: 'bg-[#E6F4F3] text-[#00766C]',
  },
  {
    title: 'Clinical Depth',
    text: 'Specialized focus on orthopedic, neurological, and pediatric rehabilitation.',
    icon: Heart,
    tint: 'bg-[#FEE9DD] text-[#C4532A]',
  },
  {
    title: 'Transparent Pricing',
    text: 'Know exactly what you pay before you book. No hidden clinical charges.',
    icon: IndianRupee,
    tint: 'bg-[#E7EEFB] text-[#2F5EC4]',
  },
  {
    title: 'India-Wide Reach',
    text: 'Connecting expert care to every corner of India, from clinics to your home.',
    icon: Globe,
    tint: 'bg-[#EDEAF8] text-[#5B4BC4]',
  },
]

export default function AboutPage() {
  return (
    <>
      <Navbar locale="en" localeSwitchPath="/about" />

      <main className="bg-[#FAFAFA] min-h-screen">
        {/* Hero */}
        <section className="bg-white border-b border-slate-200/70">
          <div className="max-w-[1142px] mx-auto px-6 py-12 lg:py-16 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E6F4F3] text-[#00766C] rounded-full text-[11px] font-semibold uppercase tracking-[0.18em] mb-5">
              Verified Marketplace
            </div>
            <h1 className="text-[30px] lg:text-[40px] font-bold tracking-tight text-[#1A1C29] leading-tight">
              India&apos;s focused platform for{' '}
              <span className="text-[#00766C]">Physiotherapy</span>
            </h1>
            <p className="mt-4 text-[15px] lg:text-[17px] leading-relaxed max-w-[720px] mx-auto text-slate-600">
              We help patients discover verified physiotherapists, compare visit options, and book
              clearly across India.
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="py-12 lg:py-16">
          <div className="max-w-[1142px] mx-auto px-6 space-y-12 lg:space-y-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-12 items-center">
              <div>
                <div className="w-10 h-1 bg-[#FF6B35] rounded-full mb-5" />
                <h2 className="text-[24px] lg:text-[28px] font-bold text-[#1A1C29] tracking-tight leading-tight">
                  A new paradigm in rehabilitation
                </h2>
                <div className="mt-5 space-y-4 text-[15px] text-slate-600 leading-relaxed">
                  <p>
                    BookPhysio.in is India&apos;s leading platform dedicated exclusively to
                    physiotherapy. Recovery requires more than just a session — it requires
                    specialized expertise and continuity.
                  </p>
                  <p>
                    Our platform connects patients with verified provider profiles and clearly
                    listed credentials for both in-clinic and home-visit care, making it easier to
                    choose and book the right provider.
                  </p>
                </div>
              </div>
              <div className="aspect-square bg-white border border-slate-200 rounded-2xl flex items-center justify-center p-10 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-[#E6F4F3] text-[#00766C] flex items-center justify-center mb-4">
                    <Globe className="w-8 h-8" />
                  </div>
                  <p className="text-[12px] font-semibold text-[#00766C] uppercase tracking-[0.2em]">
                    National care network
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="text-center max-w-xl mx-auto mb-8 lg:mb-10">
                <p className="text-[11px] font-semibold text-[#FF6B35] uppercase tracking-[0.2em] mb-2">
                  Precision pillars
                </p>
                <h2 className="text-[24px] lg:text-[28px] font-bold text-[#1A1C29] tracking-tight">
                  Why experts choose us
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {benefits.map(({ title, text, icon: Icon, tint }) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-slate-200 bg-white p-5 lg:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-all duration-200 hover:shadow-[0_4px_12px_rgba(15,23,42,0.06)] hover:border-[#00766C]/30"
                  >
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center ${tint}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="mt-4 text-[16px] font-semibold text-[#1A1C29]">{title}</h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-8 lg:p-12 text-center shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
              <div className="mx-auto w-12 h-12 rounded-full bg-[#FEE9DD] text-[#FF6B35] flex items-center justify-center mb-4">
                <Heart className="w-6 h-6" />
              </div>
              <h2 className="text-[22px] lg:text-[26px] font-bold text-[#1A1C29] tracking-tight">
                Leading clinical recovery
              </h2>
              <p className="mt-3 text-[14px] lg:text-[15px] text-slate-600 max-w-[640px] mx-auto leading-relaxed">
                We are dedicated to making physiotherapy discovery and booking clearer for patients
                and providers alike.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer locale="en" localeSwitchPath="/about" />
    </>
  )
}
