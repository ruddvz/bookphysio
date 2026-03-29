'use client';

import { User, Mail, Smartphone, MapPin, Check } from 'lucide-react'

export default function PatientProfile() {
  return (
    <div className="max-w-[800px] mx-auto px-6 py-12 animate-in fade-in duration-500 delay-100 fill-mode-both">
      <h1 className="text-[32px] font-bold text-[#333333] tracking-tight mb-8">
        Profile & Settings
      </h1>

      <div className="bg-white rounded-[12px] border border-[#E5E5E5] shadow-sm p-8">
        
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#E6F4F3] text-[#00766C] text-xl font-bold">
            RV
          </div>
          <div>
            <h2 className="text-[20px] font-semibold text-[#333333]">Rahul Verma</h2>
            <p className="text-[15px] text-[#666666]">Patient Account</p>
          </div>
        </div>

        <form className="flex flex-col gap-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <label className="block text-[14px] font-semibold text-[#333333] mb-2">First Name</label>
              <div className="relative">
                <input 
                  type="text" 
                  defaultValue="Rahul" 
                  className="w-full pl-10 pr-4 py-3 border border-[#E5E5E5] rounded-[8px] bg-white text-[15px] text-[#333333] focus:border-[#00766C] focus:ring-1 focus:ring-[#00766C] outline-none transition-shadow" 
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
              </div>
            </div>
            
            <div className="relative">
              <label className="block text-[14px] font-semibold text-[#333333] mb-2">Last Name</label>
              <div className="relative">
                <input 
                  type="text" 
                  defaultValue="Verma" 
                  className="w-full pl-10 pr-4 py-3 border border-[#E5E5E5] rounded-[8px] bg-white text-[15px] text-[#333333] focus:border-[#00766C] focus:ring-1 focus:ring-[#00766C] outline-none transition-shadow" 
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <label className="block text-[14px] font-semibold text-[#333333] mb-2">Mobile Number</label>
              <div className="relative">
                <input 
                  type="text" 
                  defaultValue="+91 98765 00000" 
                  disabled 
                  className="w-full pl-10 pr-4 py-3 border border-[#E5E5E5] rounded-[8px] bg-[#F9FAFB] text-[15px] text-[#6B7280] cursor-not-allowed outline-none" 
                />
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
              </div>
              <p className="mt-1.5 text-[12px] text-[#9CA3AF]">Verified via OTP</p>
            </div>
            
            <div className="relative">
              <label className="block text-[14px] font-semibold text-[#333333] mb-2">Email Address</label>
              <div className="relative">
                <input 
                  type="email" 
                  defaultValue="rahul@example.com" 
                  className="w-full pl-10 pr-4 py-3 border border-[#E5E5E5] rounded-[8px] bg-white text-[15px] text-[#333333] focus:border-[#00766C] focus:ring-1 focus:ring-[#00766C] outline-none transition-shadow" 
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
              </div>
            </div>
          </div>

          <div className="relative mt-2">
            <label className="block text-[14px] font-semibold text-[#333333] mb-2">City</label>
            <div className="relative">
              <input 
                type="text" 
                defaultValue="Mumbai" 
                className="w-full pl-10 pr-4 py-3 border border-[#E5E5E5] rounded-[8px] bg-white text-[15px] text-[#333333] focus:border-[#00766C] focus:ring-1 focus:ring-[#00766C] outline-none transition-shadow" 
              />
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
            </div>
          </div>

          <hr className="border-t border-[#E5E5E5] my-4" />

          <div className="flex justify-end">
            <button 
              type="button" 
              className="flex items-center gap-2 px-8 py-3 bg-[#00766C] hover:bg-[#005A52] text-white rounded-[24px] text-[16px] font-semibold transition-colors duration-200 outline-none"
            >
              <Check className="w-5 h-5" />
              Save Changes
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
