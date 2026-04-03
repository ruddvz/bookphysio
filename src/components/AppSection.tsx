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
             <div className="inline-flex items-center gap-2 px-4 py-1 bg-white/20 rounded-full text-[12px] font-bold text-bp-primary uppercase tracking-wider mb-6">
                <Smartphone className="w-4 h-4" />
                Mobile First
             </div>
             
             <h2 className="text-[32px] md:text-[44px] font-bold text-bp-primary leading-tight mb-6 tracking-tight">
               Thousands of physios. <br className="hidden md:block" /> One app.
             </h2>
             
             <p className="text-[17px] md:text-[19px] text-bp-primary opacity-90 leading-relaxed mb-10 max-w-[500px] mx-auto lg:mx-0">
               The BookPhysio app is the quickest, easiest way to book and keep track of your physiotherapy appointments, all in one place.
             </p>

             {/* QR Code - Hidden on Mobile */}
             <div className="hidden md:flex items-center gap-6 mb-10">
                <div className="p-2 bg-white rounded-[16px] border border-bp-border shadow-xl">
                   <svg width="96" height="96" viewBox="0 0 100 100" className="opacity-90">
                      {/* Positional Squares */}
                      <path d="M10 10h30v30H10zM15 15h20v20H15zM20 20h10v10H20z" fill="#111" />
                      <path d="M60 10h30v30H60zM65 15h20v20H65zM70 20h10v10H70z" fill="#111" />
                      <path d="M10 60h30v30H10zM15 65h20v20H15zM20 70h10v10H20z" fill="#111" />
                      {/* Data Blocks */}
                      <path d="M50 10h5v10h-5zM45 25h10v5h-10zM50 40h15v5H50zM10 45h20v10H10zM35 45h10v5H35zM70 50h20v5H70zM10 55h5v5h-5zM60 65h15v10H60zM80 65h10v5H80zM60 80h5v10h-5zM70 85h20v5H70zM85 75h5v5h-5zM50 60h5v20h-5zM35 60h10v10H35z" fill="#111" />
                   </svg>
                </div>
                <div className="text-left">
                   <p className="text-[14px] font-bold text-bp-primary">Scan to download</p>
                   <p className="text-[13px] text-bp-primary opacity-70">Point your camera at the QR code to get the app.</p>
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
             <div className="w-[260px] md:w-[300px] h-[520px] md:h-[600px] bg-white rounded-[40px] border-[8px] border-bp-primary shadow-2xl relative overflow-hidden flex flex-col">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-bp-primary rounded-b-[18px]"></div>
                
                {/* App UI Placeholder */}
                <div className="flex-1 bg-[#F9FBFB] p-6 pt-12">
                   <div className="w-12 h-12 bg-bp-accent/10 rounded-full mb-4"></div>
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
