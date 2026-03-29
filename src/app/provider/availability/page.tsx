'use client';

import { Clock, Check, Settings } from 'lucide-react'

export default function ProviderAvailability() {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  return (
    <div className="max-w-[800px] mx-auto px-6 py-12 animate-in fade-in duration-500 delay-100 fill-mode-both">
      
      <div className="mb-8">
        <h1 className="text-[32px] font-bold text-[#333333] tracking-tight mb-2">
          Availability Settings
        </h1>
        <p className="text-[16px] text-[#666666]">
          Set your recurring weekly working hours and session duration.
        </p>
      </div>

      <div className="bg-white rounded-[12px] border border-[#E5E5E5] shadow-sm p-8">
        
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-[#E6F4F3] text-[#00766C] rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
          <h2 className="text-[20px] font-semibold text-[#333333]">
            Weekly Schedule
          </h2>
        </div>
        <p className="text-[15px] text-[#666666] mb-8">
          Toggle the days you are available and adjust the start/end times.
        </p>

        <div className="flex flex-col gap-4 mb-10">
          {days.map(day => {
            const isSunday = day === 'Sunday'
            return (
              <div key={day} className={`flex items-center justify-between p-4 rounded-lg border ${isSunday ? 'bg-[#F9FAFB] border-[#F3F4F6]' : 'bg-white border-[#E5E5E5]'}`}>
                <label className={`flex items-center gap-3 text-[15px] font-medium w-[140px] cursor-pointer ${isSunday ? 'text-[#9CA3AF]' : 'text-[#333333]'}`}>
                  <input 
                    type="checkbox" 
                    defaultChecked={!isSunday} 
                    className="w-4 h-4 text-[#00766C] rounded border-[#CCCCCC] focus:ring-[#00766C]"
                  />
                  {day}
                </label>
                
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <input 
                      type="time" 
                      defaultValue="09:00" 
                      disabled={isSunday}
                      className={`px-3 py-2 text-[15px] border rounded-md outline-none w-[110px]
                        ${isSunday ? 'border-[#E5E5E5] text-[#9CA3AF] bg-transparent' : 'border-[#E5E5E5] text-[#333333] focus:border-[#00766C] bg-white'}
                      `}
                    />
                  </div>
                  <span className="text-[#999999] font-medium">to</span>
                  <div className="relative">
                    <input 
                      type="time" 
                      defaultValue="18:00" 
                      disabled={isSunday}
                      className={`px-3 py-2 text-[15px] border rounded-md outline-none w-[110px]
                        ${isSunday ? 'border-[#E5E5E5] text-[#9CA3AF] bg-transparent' : 'border-[#E5E5E5] text-[#333333] focus:border-[#00766C] bg-white'}
                      `}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="pt-8 border-t border-[#E5E5E5]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#E6F4F3] text-[#00766C] rounded-lg">
              <Settings className="w-5 h-5" />
            </div>
            <h2 className="text-[20px] font-semibold text-[#333333]">
              Slot Duration
            </h2>
          </div>
          
          <div className="flex gap-6 mb-8 mt-6">
            {['30', '45', '60'].map(mins => (
              <label key={mins} className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="radio" 
                  name="duration" 
                  value={mins} 
                  defaultChecked={mins === '30'} 
                  className="w-4 h-4 text-[#00766C] border-[#CCCCCC] focus:ring-[#00766C]"
                />
                <span className="text-[15px] font-medium text-[#333333] group-hover:text-[#00766C] transition-colors">{mins} mins</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-start">
          <button className="flex items-center gap-2 px-8 py-3 bg-[#00766C] hover:bg-[#005A52] text-white rounded-[24px] text-[16px] font-semibold transition-colors duration-200 outline-none">
            <Check className="w-5 h-5" />
            Save Availability
          </button>
        </div>

      </div>
    </div>
  )
}
