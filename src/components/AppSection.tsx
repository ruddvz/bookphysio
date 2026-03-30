import Link from 'next/link';
import { Smartphone, Apple, PlayCircle } from 'lucide-react';

export default function AppSection() {
  return (
    <section className="bg-[#FFC794] py-16 md:py-24 overflow-hidden relative">
      {/* Decorative background element */}
      <div className="absolute -bottom-24 -right-24 w-64 md:w-96 h-64 md:h-96 bg-[#FEED5A] rounded-full blur-3xl opacity-50"></div>
      
      <div className="max-w-[1142px] mx-auto px-6 md:px-[60px] relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Content Column */}
          <div className="flex-1 text-center lg:text-left">
             <div className="inline-flex items-center gap-2 px-4 py-1 bg-white/20 rounded-full text-[12px] font-bold text-[#333333] uppercase tracking-wider mb-6">
                <Smartphone className="w-4 h-4" />
                Mobile First
             </div>
             
             <h2 className="text-[32px] md:text-[44px] font-bold text-[#333333] leading-tight mb-6 tracking-tight">
               Thousands of physios. <br className="hidden md:block" /> One app.
             </h2>
             
             <p className="text-[17px] md:text-[19px] text-[#333333] opacity-90 leading-relaxed mb-10 max-w-[500px] mx-auto lg:mx-0">
               The BookPhysio app is the quickest, easiest way to book and keep track of your physiotherapy appointments, all in one place.
             </p>

             {/* QR Code - Hidden on Mobile */}
             <div className="hidden md:flex items-center gap-6 mb-10">
                <div className="p-2 bg-white rounded-[12px] border-2 border-white shadow-xl">
                   <div className="w-24 h-24 bg-[#F3F4F6] flex items-center justify-center text-[11px] text-[#9CA3AF] text-center font-bold">
                      QR <br/> CODE
                   </div>
                </div>
                <div className="text-left">
                   <p className="text-[14px] font-bold text-[#333333]">Scan to download</p>
                   <p className="text-[13px] text-[#333333] opacity-70">Point your camera at the QR code to get the app.</p>
                </div>
             </div>

             {/* App Store Buttons - Visible Everywhere */}
             <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <Link href="#" className="flex items-center gap-3 bg-black text-white px-6 py-3 rounded-[12px] hover:bg-[#1a1a1a] transition-colors border border-white/10 group">
                   <Apple className="w-6 h-6 group-hover:scale-110 transition-transform" />
                   <div className="text-left">
                      <p className="text-[10px] uppercase font-bold leading-none mb-1 opacity-70">Download on the</p>
                      <p className="text-[16px] font-bold leading-none">App Store</p>
                   </div>
                </Link>
                <Link href="#" className="flex items-center gap-3 bg-black text-white px-6 py-3 rounded-[12px] hover:bg-[#1a1a1a] transition-colors border border-white/10 group">
                   <PlayCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                   <div className="text-left">
                      <p className="text-[10px] uppercase font-bold leading-none mb-1 opacity-70">Get it on</p>
                      <p className="text-[16px] font-bold leading-none">Google Play</p>
                   </div>
                </Link>
             </div>
          </div>

          {/* Visual Column (Phone) */}
          <div className="flex-1 flex justify-center relative">
             <div className="w-[260px] md:w-[300px] h-[520px] md:h-[600px] bg-white rounded-[40px] border-[8px] border-[#333333] shadow-2xl relative overflow-hidden flex flex-col">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#333333] rounded-b-[18px]"></div>
                
                {/* App UI Placeholder */}
                <div className="flex-1 bg-[#F9FBFB] p-6 pt-12">
                   <div className="w-12 h-12 bg-[#00766C]/10 rounded-full mb-4"></div>
                   <div className="h-4 w-3/4 bg-[#E5E7EB] rounded-full mb-2"></div>
                   <div className="h-4 w-1/2 bg-[#E5E7EB] rounded-full mb-8"></div>
                   
                   <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="h-24 bg-white rounded-[12px] border border-[#E5E7EB]"></div>
                      <div className="h-24 bg-white rounded-[12px] border border-[#E5E7EB]"></div>
                   </div>
                   
                   <div className="h-32 bg-white rounded-[16px] border border-[#E5E7EB] shadow-sm"></div>
                </div>
             </div>
             
             {/* Floating elements for desktop */}
             <div className="hidden md:block absolute -left-10 top-1/4 p-4 bg-white rounded-[16px] shadow-lg border border-[#E5E7EB] animate-bounce duration-[3000ms]">
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-[14px]">✅</div>
                   <p className="text-[13px] font-bold">Booking confirmed</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
