import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="py-20 min-h-screen">
        <div className="max-w-[800px] mx-auto px-6">
          <h1 className="text-[32px] font-bold text-[#333333] mb-6 tracking-tight">Privacy Policy</h1>
          <p className="text-[#666666] mb-6">Last updated: March 2026</p>
          <div className="text-[16px] leading-[1.8] text-[#333333] prose prose-headings:text-[#333333]">
            <p>At BookPhysio.in, your privacy is our top priority. This Privacy Policy describes how we collect, use, and share your information when you use our platform.</p>
            <h2 className="text-[24px] font-semibold mt-8 mb-4">What Information We Collect</h2>
            <p>We may collect personal details such as your name, contact information, and medical preferences to provide health-related services.</p>
            <h2 className="text-[24px] font-semibold mt-8 mb-4">How We Use your Information</h2>
            <p>Your information is used to facilitate appointment bookings with physiotherapists and to improve our platform&apos;s user experience.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
