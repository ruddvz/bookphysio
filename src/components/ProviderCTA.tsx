'use client'

import { cn } from "@/lib/utils";
import { CheckCircle2, TrendingUp, Users, Calendar, ArrowUpRight } from "lucide-react";
import Link from "next/link";

const bullets = [
  { icon: Users, text: "Connect with thousands of patients seeking expert care" },
  { icon: TrendingUp, text: "Smart scheduling reduces no-shows by up to 30%" },
  { icon: Calendar, text: "Full integration with your existing clinic management" },
];

export default function ProviderCTA() {
  return (
    <section className="py-16 md:py-24 bg-[#004D40] relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-600/20 rounded-full blur-[120px] -mr-32 -mt-32 opacity-60"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-700/20 rounded-full blur-[100px] -ml-20 -mb-20 opacity-40"></div>
      
      <div className="max-w-[1240px] mx-auto px-6 md:px-[60px] relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 md:gap-20">
          
          {/* Left Column: Premium Preview */}
          <div className="w-full lg:w-1/2 group">
             <div className="relative">
                {/* Glow Effect */}
                <div className="absolute -inset-4 bg-teal-400/20 rounded-[48px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                
                <div className="relative bg-teal-900/40 p-4 rounded-[42px] border border-white/10 shadow-2xl backdrop-blur-sm overflow-hidden scale-100 group-hover:scale-[1.02] transition-transform duration-700 ease-out">
                   {/* CSS Dashboard Mockup — no image needed */}
                   <div className="w-full rounded-[28px] bg-gradient-to-br from-teal-900 to-[#003830] p-6 flex flex-col gap-4">
                      <div className="flex items-center justify-between mb-1">
                         <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-400/60"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400/60"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400/60"></div>
                         </div>
                         <div className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black text-white/40 uppercase tracking-widest">Dashboard</div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                         {[['12', 'Today'], ['4.9★', 'Rating'], ['98%', 'Attend.']].map(([val, lbl]) => (
                            <div key={lbl} className="bg-white/10 rounded-2xl p-4">
                               <p className="text-[18px] font-black text-white">{val}</p>
                               <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{lbl}</p>
                            </div>
                         ))}
                      </div>
                      <div className="bg-white/5 rounded-2xl p-4 flex flex-col gap-2.5">
                         {['9:00 AM · Rahul V. · Back Pain', '10:30 AM · Priya S. · ACL Rehab', '12:00 PM · Ananya N. · Neuro'].map((item) => (
                            <div key={item} className="flex items-center gap-3">
                               <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></div>
                               <p className="text-[11px] font-bold text-white/60">{item}</p>
                            </div>
                         ))}
                      </div>
                   </div>

                   {/* Overlay Stats Card */}
                   <div className="absolute top-6 right-6 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl">
                      <div className="flex items-center gap-2 mb-1">
                         <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                         <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Growth</p>
                      </div>
                      <p className="text-[20px] font-black text-white">+142%</p>
                      <p className="text-[10px] font-bold text-white/40">Patient volume</p>
                   </div>
                </div>
             </div>
          </div>

          {/* Right Column: Copy & Action */}
          <div className="w-full lg:w-1/2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/10 rounded-full text-[12px] font-black text-emerald-400 uppercase tracking-widest mb-6">
               Practice Solutions
            </div>
            
            <h2 className="text-[36px] md:text-[52px] font-black text-white leading-[1.1] tracking-tight mb-8">
              Grow your practice <span className="text-emerald-400 italic">instantly.</span>
            </h2>
            
            <p className="text-[18px] md:text-[21px] font-bold text-white/50 leading-relaxed mb-10">
              Join the elite network of physiotherapists using BookPhysio to fill their calendars, reduce overhead, and focus on patient recovery.
            </p>

            <div className="space-y-6 mb-12">
              {bullets.map((bullet, i) => (
                <div key={i} className="flex items-start gap-4 group/item">
                  <div className="mt-1 p-2 bg-teal-900/50 rounded-xl text-emerald-400 group-hover/item:bg-emerald-400 group-hover/item:text-[#004D40] transition-all">
                    <bullet.icon size={20} strokeWidth={2.5} />
                  </div>
                  <p className="text-[17px] font-black text-white/90 leading-snug pt-1">{bullet.text}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
               <Link
                href="/auth/register/provider"
                className="w-full sm:w-auto px-10 py-5 bg-white text-[#004D40] text-[18px] font-black rounded-2xl shadow-xl shadow-teal-950/20 hover:bg-emerald-50 hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center justify-center gap-3"
               >
                 Get Started
                 <ArrowUpRight size={22} className="stroke-[3]" />
               </Link>
               <Link href="#" className="text-[15px] font-black text-white/60 hover:text-white transition-colors underline decoration-white/20 underline-offset-4">
                  Schedule a Demo
               </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
