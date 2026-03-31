'use client'

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Search, Star, CalendarCheck, ArrowRight, CheckCircle2 } from "lucide-react";

interface StepData {
  icon: any;
  title: string;
  description: string;
  cta: string;
  href: string;
  step: number;
}

const steps: StepData[] = [
  { step: 1, icon: Search, title: "Find Your Match", description: "Search by injury, name, or specialty. Filter by verified credentials and availability.", cta: "Start Searching", href: "/search" },
  { step: 2, icon: Star, title: "Choose with Confidence", description: "Read detailed profiles, verified patient reviews, and experience history for every expert.", cta: "Meet Experts", href: "/search" },
  { step: 3, icon: CalendarCheck, title: "Book Instantly", description: "Select a time that works for you. Book in-clinic, home, or online sessions in just 2 minutes.", cta: "Schedule Session", href: "/search" },
];

function StepItem({ icon: Icon, title, description, cta, href, step }: StepData) {
  return (
    <div className="relative group flex flex-col items-center text-center px-4">
      {/* Connector Line (Desktop Only) */}
      {step < 3 && (
        <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-px border-t-2 border-dashed border-gray-100 -z-10" />
      )}
      
      <div className="relative mb-10">
        {/* Step Pulse Background */}
        <div className="absolute inset-0 bg-teal-50 rounded-[40px] scale-150 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out -rotate-12 group-hover:rotate-0"></div>
        
        {/* Icon Container */}
        <div className="relative w-24 h-24 bg-white rounded-[32px] shadow-2xl flex items-center justify-center border border-gray-50 transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-2">
           <Icon size={40} className="text-[#00766C]" strokeWidth={2.5} />
           
           {/* Step Badge */}
           <div className="absolute -top-3 -right-3 w-10 h-10 bg-[#FF6B35] text-white rounded-2xl flex items-center justify-center font-black text-sm shadow-lg shadow-orange-100">
              0{step}
           </div>
        </div>
      </div>

      <div className="max-w-[280px]">
        <h3 className="text-[22px] font-black text-[#333333] tracking-tight leading-tight mb-3 group-hover:text-[#00766C] transition-colors">
          {title}
        </h3>
        <p className="text-[15px] font-bold text-gray-400 mb-6 leading-relaxed">
          {description}
        </p>
        <Link
          href={href}
          className="inline-flex items-center gap-2 text-[14px] font-black text-[#00766C] uppercase tracking-widest hover:gap-3 transition-all"
        >
          {cta} <ArrowRight size={16} strokeWidth={3} />
        </Link>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section className="py-24 md:py-40 bg-white border-y border-gray-50">
      <div className="max-w-[1240px] mx-auto px-6 md:px-[60px]">
        <div className="flex flex-col items-center mb-20 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-teal-50 rounded-full text-[12px] font-black text-[#00766C] uppercase tracking-widest mb-6">
              <CheckCircle2 size={14} />
              Simple Process
            </div>
            <h2 className="text-[36px] md:text-[52px] font-black text-[#333333] tracking-tight leading-[1.1] mb-6">
              Physiotherapy that <span className="text-[#00766C]">works for you</span>
            </h2>
            <p className="text-[18px] md:text-[21px] font-bold text-gray-400 max-w-[650px] leading-relaxed">
              We've redesigned the booking experience to be transparent, fast, and completely stress-free.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-16 md:gap-x-12">
          {steps.map((step) => (
            <StepItem key={step.step} {...step} />
          ))}
        </div>

        {/* Bottom Trust CTA */}
        <div className="mt-24 p-8 md:p-12 bg-gray-50/50 rounded-[40px] border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <h4 className="text-[20px] font-black text-[#333333] mb-2">Ready to start your recovery?</h4>
              <p className="text-[16px] font-bold text-gray-400">Join 10,000+ patients who found their perfect physio on BookPhysio.</p>
           </div>
           <Link href="/search" className="px-10 py-5 bg-[#00766C] text-white text-[18px] font-black rounded-2xl shadow-xl shadow-teal-100 hover:bg-[#005A52] hover:scale-105 transition-all">
              Book Your Appointment
           </Link>
        </div>
      </div>
    </section>
  );
}
