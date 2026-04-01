'use client'

import { User, Briefcase, Award, Globe, ShieldCheck, Check, X } from 'lucide-react'

export default function ProviderProfile() {
  return (
    <div className="max-w-[800px] mx-auto px-6 py-12 animate-in fade-in duration-500 delay-100 fill-mode-both">
      <h1 className="text-[32px] font-bold text-[#333333] tracking-tight mb-8">
        Practice Profile
      </h1>

      <div className="bg-white rounded-[12px] border border-[#E5E5E5] shadow-sm p-8">
        {/* Avatar Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#E6F4F3] text-[#00766C] text-xl font-bold">
            LP
          </div>
          <div>
            <h2 className="text-[20px] font-semibold text-[#333333]">lokistr</h2>
            <p className="text-[15px] text-[#666666]">Provider Account</p>
          </div>
        </div>

        <form className="flex flex-col gap-6">
          
          {/* Display Name */}
          <div>
            <label className="block text-[14px] font-semibold text-[#333333] mb-2">
              Display Name
            </label>
            <div className="relative">
              <input 
                type="text" 
                defaultValue="lokistr"
                className="w-full pl-10 pr-4 py-3 border border-[#E5E5E5] rounded-[8px] bg-white text-[15px] text-[#333333] focus:border-[#00766C] focus:ring-1 focus:ring-[#00766C] outline-none transition-shadow"
              />
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
            </div>
          </div>

          {/* Professional Bio */}
          <div>
            <label className="block text-[14px] font-semibold text-[#333333] mb-2">
              Professional Bio
            </label>
            <textarea 
              rows={4}
              placeholder="Tell patients about your specific experience and approach to physiotherapy..."
              className="w-full p-4 border border-[#E5E5E5] rounded-[8px] bg-white text-[15px] text-[#333333] placeholder:text-[#9CA3AF] resize-y focus:border-[#00766C] focus:ring-1 focus:ring-[#00766C] outline-none transition-shadow"
            />
          </div>

          {/* Specializations */}
          <div>
            <label className="block text-[14px] font-semibold text-[#333333] mb-2">
              Specializations
            </label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="e.g. Sports Injuries, Post-Surgery Rehab"
                className="w-full pl-10 pr-4 py-3 border border-[#E5E5E5] rounded-[8px] bg-white text-[15px] text-[#333333] placeholder:text-[#9CA3AF] focus:border-[#00766C] focus:ring-1 focus:ring-[#00766C] outline-none transition-shadow"
              />
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
            </div>
          </div>

          {/* ICP + Languages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[14px] font-semibold text-[#333333] mb-2">
                ICP Registration Number
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="ICP-MH-XXXX-XXXXX"
                  className="w-full pl-10 pr-4 py-3 border border-[#E5E5E5] rounded-[8px] bg-white text-[15px] text-[#333333] placeholder:text-[#9CA3AF] focus:border-[#00766C] focus:ring-1 focus:ring-[#00766C] outline-none transition-shadow"
                />
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
              </div>
            </div>
            <div>
              <label className="block text-[14px] font-semibold text-[#333333] mb-2">
                Languages Spoken
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="English, Hindi, Marathi"
                  className="w-full pl-10 pr-4 py-3 border border-[#E5E5E5] rounded-[8px] bg-white text-[15px] text-[#333333] placeholder:text-[#9CA3AF] focus:border-[#00766C] focus:ring-1 focus:ring-[#00766C] outline-none transition-shadow"
                />
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
              </div>
            </div>
          </div>

          <hr className="border-t border-[#E5E5E5] my-4" />

          <div className="flex justify-end gap-3 mb-10">
            <button type="button" className="flex items-center gap-2 px-6 py-4 border-2 border-gray-100 rounded-2xl text-[14px] font-black text-gray-400 hover:bg-gray-50 transition-all active:scale-95">
              Discard Changes
            </button>
            <button type="submit" className="flex items-center gap-2 px-10 py-4 bg-[#333333] hover:bg-[#00766C] text-white rounded-2xl text-[14px] font-black transition-all shadow-xl shadow-gray-200 active:scale-95">
              Save Practice Profile
            </button>
          </div>
        </form>
      </div>

      {/* Trust & Security Section */}
      <div className="mt-12 bg-[#F8FAFC] rounded-[48px] p-10 border-2 border-dashed border-gray-200">
        <div className="flex flex-col md:flex-row gap-10 items-start">
           <div className="flex-1">
              <div className="w-16 h-16 bg-teal-100 rounded-3xl flex items-center justify-center text-[#00766C] mb-6">
                 <ShieldCheck size={32} strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-black text-[#333333] tracking-tighter mb-3">Clinical Verification</h3>
              <p className="text-[15px] font-bold text-gray-400 leading-relaxed mb-8">
                 Verified providers receive 4x more patient inquiries. Upload your medical registration or degree certificate to unlock the <span className="text-[#00766C]">Verified Badge</span>.
              </p>
              
              <div className="space-y-4">
                 <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-[#00766C]"><Award size={20} /></div>
                    <div className="flex flex-col">
                       <span className="text-[13px] font-black text-[#333333]">Degree Certificate</span>
                       <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Mandatory for badge</span>
                    </div>
                    <button className="ml-auto text-[13px] font-black text-[#00766C] pr-2">Upload</button>
                 </div>
                 <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm opacity-60">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400"><Award size={20} /></div>
                    <div className="flex flex-col">
                       <span className="text-[13px] font-black text-gray-400">Clinic Registration</span>
                       <span className="text-[11px] font-bold text-gray-300 uppercase tracking-widest">Optional but recommended</span>
                    </div>
                    <button className="ml-auto text-[13px] font-black text-gray-300 pr-2">Upload</button>
                 </div>
              </div>
           </div>

           {/* Watermark Preview Simulation */}
           <div className="w-full md:w-[320px] shrink-0 bg-white p-6 rounded-[32px] shadow-2xl shadow-slate-200 border border-slate-100 relative overflow-hidden group">
              {/* Animated Watermark Overlay */}
              <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center rotate-[-30deg] opacity-[0.03] select-none group-hover:opacity-[0.07] transition-opacity">
                <span className="text-[60px] font-black text-[#00766C] whitespace-nowrap uppercase tracking-[0.2em]">VERIFIED</span>
              </div>
              <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center rotate-[-30deg] translate-y-24 opacity-[0.03] select-none group-hover:opacity-[0.07] transition-opacity">
                <span className="text-[60px] font-black text-[#00766C] whitespace-nowrap uppercase tracking-[0.2em]">BOOKPHYSIO</span>
              </div>

              <div className="relative z-20">
                 <div className="flex items-center justify-between mb-8">
                    <div className="flex gap-1">
                       <div className="w-2 h-2 rounded-full bg-[#00766C]" />
                       <div className="w-2 h-2 rounded-full bg-gray-100" />
                       <div className="w-2 h-2 rounded-full bg-gray-100" />
                    </div>
                    <span className="bg-teal-50 text-[#00766C] text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">Trust Standard</span>
                 </div>

                 <div className="aspect-[3/4] bg-slate-50 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-slate-100 mb-6 group-hover:bg-teal-50/50 transition-colors">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-200 shadow-sm mb-4 group-hover:scale-110 transition-transform">
                       <Award size={32} />
                    </div>
                    <span className="text-[12px] font-black text-slate-300">Preview Watermarked Asset</span>
                 </div>

                 <div className="space-y-3">
                    <div className="h-2 w-full bg-slate-50 rounded-full" />
                    <div className="h-2 w-3/4 bg-slate-50 rounded-full" />
                    <div className="h-2 w-1/2 bg-teal-100 rounded-full" />
                 </div>

                 <div className="mt-8 flex items-center gap-3 p-3 bg-[#00766C]/5 rounded-2xl border border-[#00766C]/10">
                    <div className="w-8 h-8 bg-[#00766C] rounded-xl flex items-center justify-center text-white"><ShieldCheck size={16} /></div>
                    <span className="text-[11px] font-black text-[#00766C] leading-none uppercase tracking-widest">Protected by Motio-Armor</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

    </div>
  )
}
