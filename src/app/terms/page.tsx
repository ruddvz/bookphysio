import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="py-20 min-h-screen">
        <div className="max-w-[800px] mx-auto px-6">
          <h1 className="text-[32px] font-bold text-[#333333] mb-6 tracking-tight">Terms of Service</h1>
          <p className="text-[#666666] mb-6">Last updated: March 2026</p>
          <div className="text-[16px] leading-[1.8] text-[#333333]">
            <p>Welcome to BookPhysio.in. By using our website, you agree to comply with and be bound by the following terms.</p>
            <h2 className="text-[24px] font-semibold mt-8 mb-4">Service Description</h2>
            <p>BookPhysio provides a booking platform connecting patients with physiotherapists. We do not provide medical advice or services directly.</p>
            <h2 className="text-[24px] font-semibold mt-8 mb-4">User Responsibilities</h2>
            <p>Users are responsible for providing accurate personal and medical info when booking a session.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
