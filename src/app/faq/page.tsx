'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ChevronDown, Sparkles } from 'lucide-react'

const FAQS = [
  {
    category: 'Patients',
    items: [
      {
        question: 'How do I book an appointment?',
        answer: 'Simply search for your condition or a physiotherapist, choose a provider, select your preferred date and time, and click "Book Session". You\'ll receive an OTP on your mobile to confirm.',
      },
      {
        question: 'What is IAP Verified?',
        answer: 'IAP (Indian Association of Physiotherapists) or State Council verification means we have manually checked the credentials, professional registration, and experience of the physiotherapist to ensure patient safety.',
      },
      {
        question: 'Are home visits available?',
        answer: 'Yes, many of our therapists offer home visit services. You can filter your search results to see providers who offer "Home Visit" and see their specific fees for home sessions.',
      },
      {
        question: 'How do I pay for my session?',
        answer: 'Right now sessions are reserved through BookPhysio and the consultation amount is collected during the visit. When online payments are enabled for a booking flow, that will be shown clearly during checkout.',
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
        answer: 'Click on the "For Providers" button in the navigation or visit the Doctor Signup page. You will need to provide your IAP/State Council registration number and practice details.',
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

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.flatMap((cat) =>
      cat.items.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      }))
    ),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Navbar locale="en" localeSwitchPath="/faq" />

      <main className="bg-white min-h-screen">
        {/* Full-width Hero Section - Editorial Style */}
        <section className="bg-bp-surface text-bp-primary py-24 sm:py-32 relative overflow-hidden border-b border-bp-border">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-bp-accent/5 rounded-full blur-[140px] -mr-80 -mt-80"></div>
          
          <div className="max-w-[1142px] mx-auto px-6 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-bp-accent/5 border border-bp-accent/10 rounded-full text-[12px] font-bold uppercase tracking-[0.3em] mb-10 text-bp-accent">
               Support Desk
            </div>
            <h1 className="text-[56px] sm:text-[72px] font-bold mb-8 tracking-tighter leading-[0.9] text-bp-primary">
              How can we <span className="text-bp-accent italic">help?</span>
            </h1>
            <p className="text-[18px] sm:text-[22px] leading-relaxed max-w-[750px] mx-auto text-bp-body/60 font-medium">
              Search our clinical protocols, booking policies, and provider verification standards for a seamless recovery journey.
            </p>
          </div>
        </section>

        {/* FAQ Content Section */}
        <section className="py-24 sm:py-40 bg-white">
          <div className="max-w-[1142px] mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
              
              {/* Sidebar Category List */}
              <div className="lg:col-span-4 sticky top-32 group">
                 <div className="space-y-16">
                    <div>
                       <h2 className="text-[12px] font-bold text-bp-primary uppercase tracking-[0.4em] mb-12">Clinical Index</h2>
                       <ul className="space-y-6">
                          {FAQS.map((category) => (
                             <li key={category.category}>
                                <a 
                                  href={`#${category.category.toLowerCase().replace(/\s+/g, '-')}`} 
                                  className="text-[20px] font-bold text-bp-primary hover:text-bp-primary transition-all flex items-center gap-4 group/item"
                                >
                                   {category.category}
                                   <div className="w-1.5 h-1.5 rounded-full bg-bp-primary opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                                </a>
                             </li>
                          ))}
                       </ul>
                    </div>

                    <div className="p-10 bg-bp-surface rounded-2xl border border-bp-border/40 relative overflow-hidden group">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-bp-primary/5 rounded-full blur-2xl -mr-16 -mt-16"></div>
                       <Sparkles className="w-10 h-10 text-bp-primary mb-8 animate-bounce duration-[3s]" />
                       <h3 className="text-[24px] font-bold text-bp-primary mb-5 tracking-tight">Need Booking Help?</h3>
                       <p className="text-[17px] text-bp-body/60 font-medium leading-relaxed mb-8">
                         Our support team can help with booking guidance, provider verification questions, and platform issues.
                       </p>
                       <a
                         href="mailto:support@bookphysio.in"
                         className="block w-full py-5 bg-bp-primary text-white rounded-xl font-bold text-[14px] uppercase tracking-[0.2em] text-center hover:bg-bp-accent hover:shadow-xl transition-all duration-500"
                       >
                         Contact Support
                       </a>
                    </div>
                 </div>
              </div>

              {/* Main FAQ Accordion */}
              <div className="lg:col-span-8 space-y-32">
                {FAQS.map((category) => (
                  <div key={category.category} id={category.category.toLowerCase().replace(/\s+/g, '-')} className="scroll-mt-32">
                    <div className="flex items-center gap-5 mb-12">
                       <div className="w-2.5 h-2.5 rounded-full bg-bp-accent shadow-[0_0_12px_rgba(255,107,53,0.4)]"></div>
                       <h2 className="text-[36px] font-bold text-bp-primary tracking-tighter leading-none">{category.category}</h2>
                    </div>
                    <div className="space-y-6">
                      {category.items.map((item, idx) => {
                        const id = `${category.category}-${idx}`
                        const isOpen = openIndex === id
                        return (
                          <div
                            key={id}
                            className={`group border ${isOpen ? 'border-bp-accent/40 bg-bp-accent/5 shadow-sm' : 'border-bp-border/40 bg-white hover:border-bp-accent/20 hover:shadow-lg'} rounded-2xl overflow-hidden transition-all duration-700`}
                          >
                            <button
                              onClick={() => toggle(id)}
                              className="w-full text-left px-10 py-8 flex items-center justify-between group focus:outline-none"
                            >
                              <span className={`text-[21px] font-bold tracking-tight ${isOpen ? 'text-bp-primary' : 'text-bp-body/80'} group-hover:text-bp-primary transition-all duration-500`}>
                                {item.question}
                              </span>
                              <div className={`w-12 h-12 rounded-full border ${isOpen ? 'bg-bp-primary border-bp-primary' : 'border-bp-border/60'} flex items-center justify-center shrink-0 transition-all duration-500`}>
                                <ChevronDown className={`w-6 h-6 ${isOpen ? 'text-white rotate-180' : 'text-bp-body/30'}`} />
                              </div>
                            </button>
                            <div className={`grid transition-all duration-700 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                              <div className="overflow-hidden">
                                <div className="px-10 pb-10 text-[18px] text-bp-body/60 font-medium leading-[1.8] border-t border-bp-border/10 mt-4 pt-8">
                                  {item.answer}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer locale="en" localeSwitchPath="/faq" />
    </>
  )
}
