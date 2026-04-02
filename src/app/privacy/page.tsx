import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="py-32 bg-bp-surface min-h-screen">
        <div className="max-w-[760px] mx-auto px-6">
          <div className="relative group p-12 bg-white border border-bp-border rounded-[40px] shadow-2xl shadow-bp-primary/5 transition-all duration-700">
            <h1 className="text-[48px] font-black text-bp-primary mb-2 tracking-tighter">Privacy Policy</h1>
            <p className="text-[14px] text-bp-body/40 font-bold uppercase tracking-widest mb-12 pb-8 border-b border-bp-border">Last updated: March 2026</p>
            
            <div className="space-y-12 text-[17px] leading-[1.8] text-bp-body/70 font-medium">
              <section>
                <h2 className="text-[26px] font-black text-bp-primary mb-6 tracking-tight flex items-center gap-3">
                   <div className="w-2 h-8 bg-bp-accent rounded-full"></div>
                   Introduction
                </h2>
                <p>
                  At BookPhysio.in, your privacy is our top priority. This Privacy Policy describes how we collect, use, 
                  and share your personal information when you use our website, mobile application, and-related services 
                  (collectively, the &quot;Platform&quot;).
                </p>
              </section>

              <section>
                <h2 className="text-[24px] font-bold text-[#333333] mb-4">What Information We Collect</h2>
                <p className="mb-4">To provide you with the best experience and clinical care, we may collect:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Personal Information:</strong> Name, age, gender, phone number, and email.</li>
                  <li><strong>Clinical Information:</strong> Reason for visit, preferred visit types (in-clinic, home), and historical records of bookings.</li>
                  <li><strong>Payment Information:</strong> Transaction details through our secure payment gateway providers (Razorpay).</li>
                </ul>
              </section>

              <section>
                <h2 className="text-[24px] font-bold text-[#333333] mb-4">How We Use Your Information</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>To facilitate and confirm your bookings with physiotherapists.</li>
                  <li>To verify the credentials of providers using the platform.</li>
                  <li>To process payments and generate receipts with GST calculations.</li>
                  <li>To send reminders and updates regarding your upcoming sessions.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-[24px] font-bold text-[#333333] mb-4">Data Security</h2>
                <p>
                  We implement industry-standard technical and organizational measures to safeguard your information 
                  against unauthorized access, modification, or destruction. We do not sell your personal data to advertisers.
                </p>
              </section>

              <section className="bg-[#E6F4F3] -mx-12 px-12 py-10 rounded-[12px] mt-16">
                 <h3 className="text-[20px] font-bold text-[#00766C] mb-2">Questions regarding data privacy?</h3>
                 <p className="text-[#333333] opacity-80 mb-0">Contact our data protection officer at <span className="font-semibold underline">privacy@bookphysio.in</span></p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
