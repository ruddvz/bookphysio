'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'

const FAQS = [
  {
    category: 'Patients',
    items: [
      {
        question: 'How do I book an appointment?',
        answer: 'Simply search for your condition or a physiotherapist, choose a provider, select your preferred date and time, and click "Book Session". You\'ll receive an OTP on your mobile to confirm.',
      },
      {
        question: 'What is ICP Verified?',
        answer: 'ICP (Indian Council of Physiotherapy) verification means we have manually checked the credentials, professional registration, and experience of the physiotherapist to ensure patient safety.',
      },
      {
        question: 'Are home visits available?',
        answer: 'Yes, many of our therapists offer home visit services. You can filter your search results to see providers who offer "Home Visit" and see their specific fees for home sessions.',
      },
      {
        question: 'How do I pay for my session?',
        answer: 'You can pay online via UPI, Credit/Debit Cards, or Net Banking. Some clinics also allow "Pay at Clinic", which you can select during current checkout.',
      },
       {
        question: 'Can I cancel or reschedule my booking?',
        answer: 'Yes, you can cancel or reschedule up to 4 hours before the appointment time through your Patient Dashboard without any penalty.',
      },
    ]
  },
  {
    category: 'Physiotherapists',
    items: [
      {
        question: 'How can I join BookPhysio as a provider?',
        answer: 'Click on the "For Providers" button in the navigation or visit the Doctor Signup page. You will need to provide your ICP registration number and practice details.',
      },
      {
        question: 'What are the charges for listing?',
        answer: 'Listing on BookPhysio is free. We charge a nominal platform fee only on successful bookings made through our platform.',
      },
      {
        question: 'Do I get my own dashboard?',
        answer: 'Yes, every registered provider gets a comprehensive dashboard to manage their calendar, appointments, patient records, and earnings.',
      },
    ]
  }
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null)

  const toggle = (id: string) => {
    setOpenIndex(openIndex === id ? null : id)
  }

  return (
    <>
      <Navbar />

      <main className="bg-[#F7F8F9] min-h-screen py-20">
        <div className="max-w-[800px] mx-auto px-6">
          <div className="text-center mb-16">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#E6F4F3] flex items-center justify-center mb-6">
              <HelpCircle className="w-8 h-8 text-[#00766C]" />
            </div>
            <h1 className="text-[40px] font-bold text-[#333333] tracking-tight mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-[18px] text-[#666666]">
              Everything you need to know about using BookPhysio.in
            </p>
          </div>

          <div className="flex flex-col gap-10">
            {FAQS.map((category) => (
              <div key={category.category}>
                <h2 className="text-[24px] font-bold text-[#333333] mb-6 border-b border-[#E5E5E5] pb-2">
                  {category.category}
                </h2>
                <div className="flex flex-col gap-3">
                  {category.items.map((item, idx) => {
                    const id = `${category.category}-${idx}`
                    const isOpen = openIndex === id
                    return (
                      <div
                        key={id}
                        className={`bg-white rounded-[8px] border ${isOpen ? 'border-[#00766C] shadow-md' : 'border-[#E5E5E5]'} transition-all`}
                      >
                        <button
                          onClick={() => toggle(id)}
                          className="w-full text-left px-6 py-5 flex items-center justify-between group focus:outline-none"
                        >
                          <span className={`text-[17px] font-semibold ${isOpen ? 'text-[#00766C]' : 'text-[#333333]'} group-hover:text-[#00766C] transition-colors`}>
                            {item.question}
                          </span>
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5 text-[#00766C]" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-[#9CA3AF] group-hover:text-[#00766C]" />
                          )}
                        </button>
                        {isOpen && (
                          <div className="px-6 pb-6 text-[16px] text-[#555555] leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
                            {item.answer}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-20 p-8 bg-[#E6F4F3] rounded-[16px] text-center">
             <h3 className="text-[20px] font-bold text-[#00766C] mb-2">Still have questions?</h3>
             <p className="text-[#333333] opacity-80 mb-6">Our support team is here to help you 24/7.</p>
             <button className="px-8 py-3 bg-[#00766C] text-white font-semibold rounded-[24px] hover:bg-[#005A52] transition-colors">
               Contact Support
             </button>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
