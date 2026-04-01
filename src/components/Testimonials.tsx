'use client'

import { Star, Quote, CheckCircle2 } from "lucide-react";
import Image from "next/image";

const testimonials = [
  {
    id: 1,
    content: "The easiest way to find a verified sports physio. In just two minutes, I had my appointment booked. The care I received was top-notch.",
    author: "Arjun Mehta",
    role: "Professional Athlete",
    rating: 5,
    city: "Mumbai"
  },
  {
    id: 2,
    content: "Recovering from my knee surgery was daunting until I found BookPhysio. Having a specialist come to my home has been a game-changer.",
    author: "Sarah Kapoor",
    role: "IT Professional",
    rating: 5,
    city: "Delhi NCR"
  },
  {
    id: 3,
    content: "Verified credentials matter! I finally felt safe booking treatment online for my mother. Highly recommend the platform for its transparency.",
    author: "Vikram Singh",
    role: "Business Owner",
    rating: 5,
    city: "Bangalore"
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-gray-50/50 relative overflow-hidden">
      <div className="max-w-[1240px] mx-auto px-6 md:px-[60px]">
        <div className="flex flex-col items-center mb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-teal-50 rounded-full text-[12px] font-black text-[#00766C] uppercase tracking-widest mb-6">
              <Star size={14} className="fill-[#00766C]" />
              Patient Success
            </div>
            <h2 className="text-[36px] md:text-[52px] font-black text-[#333333] tracking-tight leading-none mb-6">
              What our <span className="text-[#00766C]">patients are saying</span>
            </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div key={t.id} className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/40 relative group hover:-translate-y-2 transition-all duration-500">
               <Quote className="absolute top-8 right-10 w-12 h-12 text-teal-50 opacity-0 group-hover:opacity-100 transition-opacity" />
               
               <div className="flex gap-1 mb-6">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={16} className="fill-orange-400 text-orange-400" />
                  ))}
               </div>
               
               <p className="text-[17px] font-bold text-[#333333] leading-relaxed mb-8 italic">
                 "{t.content}"
               </p>

               <div className="flex items-center gap-4 pt-6 border-t border-gray-50">
                  <div className="w-12 h-12 rounded-full bg-teal-900 flex items-center justify-center text-white font-black text-[18px]">
                     {t.author.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-[16px] font-black text-[#333333] mb-0.5">{t.author}</h4>
                    <div className="flex items-center gap-2 text-[12px] font-bold text-gray-400 uppercase tracking-widest">
                       <span>{t.role}</span>
                       <span className="w-1 h-1 bg-gray-300 rounded-full" />
                       <span className="text-[#00766C]">{t.city}</span>
                    </div>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
