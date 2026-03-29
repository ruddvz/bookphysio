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

          <div className="flex justify-end gap-3">
            <button type="button" className="flex items-center gap-2 px-6 py-3 border border-[#E5E5E5] bg-transparent rounded-[24px] text-[15px] font-semibold text-[#666666] hover:bg-[#F9FAFB] transition-colors cursor-pointer outline-none">
              <X className="w-4 h-4" />
              Discard
            </button>
            <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-[#00766C] hover:bg-[#005A52] text-white rounded-[24px] text-[15px] font-semibold transition-colors cursor-pointer outline-none">
              <Check className="w-4 h-4" />
              Save Profile
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
