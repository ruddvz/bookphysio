export function generateStaticParams() { return [] }

import { User, Phone, MapPin, ClipboardList, CheckCircle } from 'lucide-react'

export default async function ProviderAppointmentDetail({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params

  return (
    <div className="max-w-[800px] mx-auto px-6 py-12 animate-in fade-in duration-500 delay-100 fill-mode-both">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[32px] font-bold text-[#333333] tracking-tight">
            Consultation Details
          </h1>
          <p className="text-[15px] font-medium text-[#00766C] mt-1">
            Confirmed Status
          </p>
        </div>
        <span className="font-mono text-[14px] font-medium px-3 py-1 bg-[#F3F4F6] text-[#666666] border border-[#E5E5E5] rounded-[6px]">
          Ref: BP-2026-{id || '9982'}
        </span>
      </div>

      <div className="bg-white rounded-[12px] border border-[#E5E5E5] shadow-sm mb-6">
        
        {/* Patient Info Header */}
        <div className="p-6 border-b border-[#E5E5E5] bg-[#F9FAFB] rounded-t-[12px]">
          <h2 className="text-[18px] font-bold text-[#333333] flex items-center gap-2">
            <User className="w-5 h-5 text-[#00766C]" />
            Patient Information
          </h2>
        </div>

        <div className="flex flex-col md:flex-row gap-6 md:gap-12 p-6 border-b border-[#E5E5E5]">
          <div className="flex gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#E6F4F3] text-[#00766C] font-bold text-lg">
              RV
            </div>
            <div>
              <p className="text-[12px] font-bold tracking-wider text-[#9CA3AF] uppercase mb-1">Name</p>
              <p className="text-[16px] font-semibold text-[#333333]">Rahul Verma</p>
            </div>
          </div>
          
          <div className="flex gap-3 items-center">
            <div className="p-2 rounded-full bg-[#F3F4F6] text-[#6B7280]">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[12px] font-bold tracking-wider text-[#9CA3AF] uppercase mb-1">Phone</p>
              <p className="text-[16px] font-semibold text-[#333333]">+91 98765 00000</p>
            </div>
          </div>

          <div className="flex gap-3 items-center">
            <div className="p-2 rounded-full bg-[#E6F4F3] text-[#00766C]">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[12px] font-bold tracking-wider text-[#9CA3AF] uppercase mb-1">Visit Type</p>
              <p className="text-[16px] font-semibold text-[#333333]">In-clinic</p>
            </div>
          </div>
        </div>

        {/* Clinical Notes Section */}
        <div className="p-6">
          <h2 className="text-[18px] font-bold text-[#333333] flex items-center gap-2 mb-6">
            <ClipboardList className="w-5 h-5 text-[#00766C]" />
            Clinical Notes
          </h2>
          
          <textarea 
            rows={5} 
            placeholder="Log clinical observations, treatment provided, differential diagnoses, and next steps..."
            className="w-full p-4 border border-[#E5E5E5] rounded-[8px] text-[15px] text-[#333333] resize-y placeholder:text-[#9CA3AF] focus:border-[#00766C] focus:ring-1 focus:ring-[#00766C] outline-none transition-shadow"
          />
          
          <div className="flex justify-end mt-4">
            <button className="flex items-center gap-2 px-6 py-2.5 bg-[#00766C] hover:bg-[#005A52] text-white rounded-[24px] text-[15px] font-semibold transition-colors duration-200 outline-none">
              <CheckCircle className="w-4 h-4" />
              Save Notes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
