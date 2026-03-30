import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="py-24 bg-[#F7F8F9] min-h-screen">
        <div className="max-w-[800px] mx-auto px-6">
          <div className="bg-white rounded-[16px] border border-[#E5E5E5] p-12 shadow-sm">
            <h1 className="text-[40px] font-bold text-[#333333] mb-4 tracking-tight">Terms of Service</h1>
            <p className="text-[#666666] mb-12 pb-6 border-b border-[#E5E5E5]">Last updated: March 2026</p>
            
            <div className="space-y-10 text-[17px] leading-[1.8] text-[#555555]">
              <section>
                <h2 className="text-[24px] font-bold text-[#333333] mb-4">Acceptance of Terms</h2>
                <p>
                  Welcome to BookPhysio.in. By using our website and services, you agree to comply with and be bound by 
                  the following terms and conditions. If you do not agree to these terms, please refrain from using 
                  our platform.
                </p>
              </section>

              <section>
                <h2 className="text-[24px] font-bold text-[#333333] mb-4">Service Description</h2>
                <p>
                  BookPhysio provides a digital platform connecting patients with physiotherapists for professional 
                  consultations. We act strictly as an intermediary and marketplace. <span className="font-semibold text-[#00766C]">BookPhysio does not provide medical advice or physiotherapy services directly.</span>
                </p>
              </section>

              <section>
                <h2 className="text-[24px] font-bold text-[#333333] mb-4">User Responsibilities</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Users are responsible for providing accurate and honest personal and medical information during the booking process.</li>
                  <li>Payments for services must be made through the platform using the chosen payment method at checkout.</li>
                  <li>Cancellations and rescheduling must follow the 4-hour advance window policies as shown on your dashboard.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-[24px] font-bold text-[#333333] mb-4">Provider Verification</h2>
                <p>
                   We aim to verify all physiotherapists on the platform through their ICP (Indian Council of Physiotherapy) 
                   registration. However, patients are advised to use their own judgment in choosing the right provider for 
                   their clinical needs. BookPhysio is not liable for any clinical outcome of the treatments provided.
                </p>
              </section>

              <section className="bg-[#FEF3C7]/40 -mx-12 px-12 py-10 rounded-[12px] mt-16 border border-[#FEF3C7]">
                 <h3 className="text-[20px] font-bold text-[#D97706] mb-2">Note to Users</h3>
                 <p className="text-[#333333] opacity-80 mb-0">These terms are subject to change without prior notice. Continued use of the platform constitutes agreement to the updated terms.</p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
