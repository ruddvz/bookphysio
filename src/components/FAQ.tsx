'use client'

import { useState } from 'react'
import { Plus, Minus, HelpCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    id: 1,
    question: "How do I verify the qualifications of a physiotherapist?",
    answer: "Every provider on BookPhysio must go through a strict verification process. We verify their clinical registrations, professional indemnity insurance, and clinical experience. You can see their verified credentials on their profile page."
  },
  {
    id: 2,
    question: "Can I book a home visit session?",
    answer: "Yes, many of our experts offer home visit sessions. You can filter by 'Home Visit' during your search to see available practitioners who can visit your location."
  },
  {
    id: 3,
    question: "Do you accept health insurance?",
    answer: "We support over 20+ insurance partners. You can check the 'Accepted Insurances' section on each practitioner's profile or filter your search by your specific insurance provider."
  },
  {
    id: 4,
    question: "How do online sessions work?",
    answer: "Online sessions are conducted through our secure, high-definition telehealth platform. Once you book, you'll receive a link to join the session from your dashboard."
  },
  {
    id: 5,
    question: "What is your cancellation policy?",
    answer: "You can cancel or reschedule any appointment up to 24 hours before the scheduled time for a full refund. Cancellations made within 24 hours may incur a small fee depending on the practitioner."
  }
];

export default function FAQ() {
  const [openId, setOpenId] = useState<number | null>(1)

  return (
    <section className="py-24 md:py-32 bg-white relative overflow-hidden">
      <div className="max-w-[1240px] mx-auto px-6 md:px-[60px]">
        <div className="flex flex-col items-center mb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-50 rounded-full text-[12px] font-black text-[#666666] uppercase tracking-widest mb-6">
              <HelpCircle size={14} className="text-[#00766C]" />
              Help Center
            </div>
            <h2 className="text-[36px] md:text-[52px] font-black text-[#333333] tracking-tighter leading-none mb-6">
              Common <span className="text-[#00766C]">questions.</span>
            </h2>
        </div>

        <div className="max-w-[800px] mx-auto space-y-4">
          {faqs.map((faq) => (
            <div 
              key={faq.id} 
              className={cn(
                "group rounded-[32px] border transition-all duration-300 overflow-hidden",
                openId === faq.id 
                  ? "bg-white border-[#00766C] shadow-2xl shadow-teal-900/5 ring-1 ring-[#00766C]/20" 
                  : "bg-gray-50/50 border-gray-100 hover:bg-white hover:border-gray-200"
              )}
            >
              <button 
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                className="w-full px-8 py-7 flex items-center justify-between text-left gap-4"
              >
                <span className={cn(
                  "text-[18px] font-black tracking-tight leading-tight transition-colors",
                  openId === faq.id ? "text-[#00766C]" : "text-[#333333]"
                )}>
                  {faq.question}
                </span>
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
                  openId === faq.id ? "bg-[#00766C] text-white rotate-0" : "bg-white border border-gray-100 text-gray-400 rotate-90"
                )}>
                  {openId === faq.id ? <Minus size={20} className="stroke-[3]" /> : <Plus size={20} className="stroke-[3]" />}
                </div>
              </button>
              
              <div className={cn(
                "transition-all duration-300 ease-in-out",
                openId === faq.id ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"
              )}>
                <div className="px-8 pb-8 text-[16px] font-bold text-gray-400 leading-relaxed max-w-[700px]">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
            <p className="text-[14px] font-black text-gray-400 uppercase tracking-widest mb-6">Didn't find what you're looking for?</p>
            <Link href="/contact" className="px-8 py-4 bg-[#333333] text-white text-[16px] font-black rounded-2xl shadow-xl hover:bg-[#00766C] transition-all">
               Contact Support
            </Link>
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
