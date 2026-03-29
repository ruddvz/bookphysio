import { ArrowLeft, User, Phone, MessageSquare, Clock, CheckCircle, FileText } from 'lucide-react'
import Link from 'next/link'

export function generateStaticParams() {
  return [{ id: '1' }]
}

export default async function ProviderPatientDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <div className="max-w-[800px] mx-auto px-6 py-12 animate-in fade-in duration-500 delay-100 fill-mode-both">
      <Link href="/provider/patients" className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#666666] hover:text-[#333333] no-underline mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Patients
      </Link>

      <h1 className="text-[32px] font-bold text-[#333333] tracking-tight mb-1">
        Patient Record
      </h1>
      <p className="text-[15px] text-[#666666] mb-8">
        ID: <span className="font-mono">PTR-{id || '4421'}</span>
      </p>

      <div className="bg-white rounded-[12px] border border-[#E5E5E5] shadow-sm p-8">
        {/* Patient Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8">
          <div className="flex items-center gap-5">
             <div className="w-16 h-16 rounded-full bg-[#E6F4F3] flex items-center justify-center text-[24px] text-[#00766C] font-bold shrink-0">
               RV
             </div>
             <div>
               <h2 className="text-[24px] font-bold text-[#333333] mb-1">Rahul Verma</h2>
               <p className="flex items-center gap-1.5 text-[15px] text-[#666666]">
                 <Phone className="w-4 h-4" />
                 +91 98765 00000
               </p>
             </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-[#E5E5E5] rounded-lg bg-white text-[14px] font-semibold text-[#333333] hover:bg-[#F9FAFB] transition-colors cursor-pointer outline-none">
            <MessageSquare className="w-4 h-4" />
            Message Patient
          </button>
        </div>

        {/* Visit History */}
        <h3 className="flex items-center gap-2 text-[18px] font-semibold text-[#333333] mb-4 border-t border-[#E5E5E5] pt-6">
          <FileText className="w-5 h-5 text-[#00766C]" />
          Visit History
        </h3>
        
        <div className="border border-[#E5E5E5] rounded-[10px] overflow-hidden">
          <div className="px-5 py-4 bg-[#F9FAFB] border-b border-[#E5E5E5] flex justify-between items-center">
            <div className="flex items-center gap-2 text-[15px] font-semibold text-[#333333]">
              <Clock className="w-4 h-4 text-[#666666]" />
              Mon, 28 Mar 2026
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-semibold bg-[#F0FDF4] text-[#059669]">
              <CheckCircle className="w-3 h-3" />
              Completed
            </span>
          </div>
          <div className="px-5 py-4 text-[14px] text-[#555555] leading-relaxed">
            <strong className="text-[#333333]">Notes:</strong> Patient reported mild lower back pain (4/10). Administered deep tissue massage and assigned core strengthening exercises. Follow-up in 2 weeks.
          </div>
        </div>

      </div>
    </div>
  )
}
