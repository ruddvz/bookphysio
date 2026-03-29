import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { HelpCircle } from 'lucide-react'

const FAQS = [
  {
    question: 'How do I book an appointment?',
    answer: 'Simply search for your condition or a physiotherapist, choose a provider, select your preferred date and time, and click "Book Session".',
  },
  {
    question: 'What is ICP Verified?',
    answer: 'ICP (Indian Council of Physiotherapy) verification means we have manually checked the credentials and professional registration of the physiotherapist.',
  },
  {
    question: 'Are home visits available?',
    answer: 'Yes, many of our therapists offer home visit services. You can filter your search results to see providers who offer the "Home Visit" option.',
  },
  {
    question: 'How do I pay for my session?',
    answer: 'You can pay online via UPI, Credit/Debit Cards, Net Banking, or choose to pay at the clinic in some cases.',
  },
]

export default function FAQPage() {
  return (
    <>
      <Navbar />

      <main className="bg-[#F7F8F9] min-h-screen py-20">
        <div className="max-w-[800px] mx-auto px-6">
          <div className="text-center mb-12">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#E6F4F3] flex items-center justify-center mb-6">
              <HelpCircle className="w-8 h-8 text-[#00766C]" />
            </div>
            <h1 className="text-[40px] font-bold text-[#333333] tracking-tight">
              Frequently Asked Questions
            </h1>
          </div>

          <div className="flex flex-col gap-6">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-[12px] border border-[#E5E5E5] p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-[20px] font-semibold text-[#333333] mb-3">
                  {faq.question}
                </h3>
                <p className="text-[16px] leading-relaxed text-[#555555]">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
