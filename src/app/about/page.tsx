import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ShieldCheck, Home, Video, IndianRupee, Zap } from 'lucide-react'

const benefits = [
  { title: 'Verified Experts', text: 'Every therapist on our platform is verified for credentials and clinical experience.', icon: ShieldCheck },
  { title: 'Convenience First', text: 'Choose between visiting a clinic, having a therapist come to your home, or connecting online.', icon: Home },
  { title: 'Transparent Pricing', text: 'Know exactly what you pay before you book. No hidden charges or registration fees.', icon: IndianRupee },
  { title: 'Seamless Booking', text: 'Book your session in under a minute with our intuitive interface.', icon: Zap },
]

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main className="bg-white min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#00766C] to-[#005A52] text-white py-20">
          <div className="max-w-[800px] mx-auto px-6 text-center">
            <h1 className="text-[48px] font-bold mb-6 tracking-tight">Our Mission</h1>
            <p className="text-[20px] leading-relaxed opacity-90">
              Making high-quality physiotherapy accessible and convenient across India.
              We&apos;re bridging the gap between expert care and those who need it.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-20">
          <div className="max-w-[800px] mx-auto px-6">
            <div className="mb-16">
              <h2 className="text-[32px] font-semibold text-[#333333] mb-6">Who We Are</h2>
              <p className="text-[18px] leading-[1.8] text-[#555555]">
                BookPhysio is India&apos;s leading platform dedicated exclusively to physiotherapy.
                We understand that recovering from an injury or managing chronic pain requires
                specialised attention and consistent care.
              </p>
              <p className="text-[18px] leading-[1.8] text-[#555555] mt-4">
                Our platform connects patients with verified, ICP-registered physiotherapists
                for in-clinic, home-visit, and online sessions, ensuring you get the care
                you need, wherever you are.
              </p>
            </div>

            <div className="mb-16">
              <h2 className="text-[32px] font-semibold text-[#333333] mb-6">Why BookPhysio?</h2>
              <ul className="list-none p-0 flex flex-col gap-6">
                {benefits.map(({ title, text, icon: Icon }, idx) => (
                  <li key={idx} className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#E6F4F3] flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-[#00766C]" />
                    </div>
                    <div>
                      <h3 className="text-[20px] font-semibold text-[#333333] mb-1">{title}</h3>
                      <p className="text-[16px] leading-relaxed text-[#666666]">{text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
