'use client'

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Activity, Brain, Bone, Baby, UserRound, Heart, ChevronRight, Sparkles, MoveRight } from "lucide-react";

interface Specialty {
  icon: any;
  label: string;
  href: string;
  bgColor: string;
  iconColor: string;
  description: string;
}

const specialties: Specialty[] = [
  { 
    icon: Activity, 
    label: "Sports Physio", 
    description: "Athletic injuries & performance", 
    href: "/search?specialty=Sports+Physio", 
    bgColor: "bg-[#DCE9FD]", // --color-section-blue
    iconColor: "text-blue-600"
  },
  { 
    icon: Brain, 
    label: "Neuro Physio", 
    description: "Brain, spine & nerve recovery", 
    href: "/search?specialty=Neuro+Physio", 
    bgColor: "bg-[#FEFAE6]", // --color-section-yellow
    iconColor: "text-amber-600"
  },
  { 
    icon: Bone, 
    label: "Ortho Physio", 
    description: "Joint pain & bone health", 
    href: "/search?specialty=Ortho+Physio", 
    bgColor: "bg-[#FDFACE]", // --color-section-cream
    iconColor: "text-orange-600" 
  },
  { 
    icon: Baby, 
    label: "Paediatric", 
    description: "Child growth & motor skills", 
    href: "/search?specialty=Paediatric+Physio", 
    bgColor: "bg-[#FFC794]/30", // --color-section-peach (muted)
    iconColor: "text-rose-600"
  },
  { 
    icon: Heart, 
    label: "Women's Health", 
    description: "Pre-natal & pelvic wellness", 
    href: "/search?specialty=Womens+Health", 
    bgColor: "bg-purple-50", 
    iconColor: "text-purple-600"
  },
  { 
    icon: UserRound, 
    label: "Geriatric", 
    description: "Senior mobility & strength", 
    href: "/search?specialty=Geriatric+Physio", 
    bgColor: "bg-[#F9F8F7]", // --color-section-beige
    iconColor: "text-teal-700"
  },
];

function SpecialtyCard({ icon: Icon, label, description, href, bgColor, iconColor }: Specialty) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex flex-col p-8 rounded-[40px] transition-all duration-500 h-full",
        "bg-white border-2 border-transparent hover:border-[#00766C]/10 hover:shadow-[0_32px_64px_-16px_rgba(0,118,108,0.12)] hover:-translate-y-3 overflow-hidden"
      )}
    >
      {/* Background Decorative Element */}
      <div className={cn(
        "absolute top-0 right-0 w-32 h-32 rounded-bl-[100px] opacity-20 transition-all duration-500 group-hover:scale-150 group-hover:opacity-40",
        bgColor
      )}></div>
      
      <div className={cn(
        "w-20 h-20 rounded-[30px] mb-8 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3 relative z-10 shadow-sm",
        bgColor
      )}>
        <Icon size={36} strokeWidth={2.5} className={iconColor} />
      </div>
      
      <div className="relative z-10 flex flex-col flex-1">
        <h3 className="text-[22px] font-black text-[#333333] leading-tight mb-2 tracking-tight">
          {label}
        </h3>
        <p className="text-[15px] font-bold text-gray-400 group-hover:text-gray-500 transition-colors leading-snug">
          {description}
        </p>

        <div className="mt-auto pt-8 flex items-center gap-2 text-[14px] font-black text-[#00766C] opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
           Find Specialist <MoveRight size={16} strokeWidth={3} />
        </div>
      </div>
    </Link>
  );
}

export default function TopSpecialties() {
  return (
    <section className="py-20 md:py-28 bg-white relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-teal-50/30 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-orange-50/30 rounded-full blur-[100px] translate-x-1/4 translate-y-1/4"></div>

      <div className="max-w-[1240px] mx-auto px-6 md:px-[60px] relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-[#F9F8F7] border border-gray-100 rounded-2xl text-[13px] font-black text-[#00766C] uppercase tracking-[0.15em] mb-6">
              <Sparkles size={16} className="text-[#059669]" />
              EXPERT CARE DIRECTORY
            </div>
            <h2 className="text-[48px] md:text-[64px] font-black text-[#333333] tracking-tighter leading-[0.95] mb-6">
              Search by clinical <br />
              <span className="text-[#00766C] italic relative">
                specialty.
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-orange-200/50" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 25 0, 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                </svg>
              </span>
            </h2>
            <p className="text-[20px] md:text-[22px] font-bold text-gray-400 leading-relaxed">
              From athletic recovery to neuro-rehabilitation, connect with India's highest-rated physiotherapy practitioners.
            </p>
          </div>
          
          <Link href="/search" className="group shrink-0 h-16 px-10 bg-[#333333] text-white rounded-[24px] flex items-center gap-4 text-[17px] font-black hover:bg-[#00766C] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-gray-200">
             Explore All 24+ Categories 
             <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" strokeWidth={3} />
             </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {specialties.map((s) => (
            <SpecialtyCard key={s.label} {...s} />
          ))}
        </div>

        {/* Bottom Trust Signifier */}
        <div className="mt-12 pt-10 border-t border-gray-50 flex flex-wrap items-center justify-center gap-12 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
           <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-xl font-black">AI</div>
              <span className="text-[14px] font-black tracking-widest text-gray-500">SMART MATCHING</span>
           </div>
           <div className="h-6 w-px bg-gray-100 hidden md:block"></div>
           <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-xl font-black">✓</div>
              <span className="text-[14px] font-black tracking-widest text-gray-500">IAP CERTIFIED</span>
           </div>
           <div className="h-6 w-px bg-gray-100 hidden md:block"></div>
           <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-xl font-black">24/7</div>
              <span className="text-[14px] font-black tracking-widest text-gray-500">INSTANT BOOKING</span>
           </div>
        </div>
      </div>
    </section>
  );
}
