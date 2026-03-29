import { CalendarDays, Clock, MapPin, Download, RefreshCw, X, Stethoscope, CreditCard, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export function generateStaticParams() {
  return [{ id: '1' }]
}

export default async function PatientAppointmentDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <div className="max-w-[800px] mx-auto px-6 py-12 animate-in fade-in duration-500 delay-100 fill-mode-both">
      <Link href="/patient/appointments" className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#666666] hover:text-[#333333] no-underline mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Appointments
      </Link>

      <h1 className="text-[32px] font-bold text-[#333333] tracking-tight mb-1">
        Appointment Detail
      </h1>
      <p className="text-[15px] text-[#666666] mb-8">
        Ref: <span className="font-mono">BP-2026-{id || '0042'}</span>
      </p>

      <div className="bg-white rounded-[12px] border border-[#E5E5E5] shadow-sm p-8 mb-6">
        {/* Doctor Info */}
        <div className="flex gap-6 items-start mb-8">
          <div className="w-20 h-20 rounded-full bg-[#E6F4F3] flex items-center justify-center shrink-0">
            <Stethoscope className="w-9 h-9 text-[#00766C]" />
          </div>
          <div>
            <h2 className="text-[24px] font-bold text-[#333333] mb-1">Dr. Priya Sharma</h2>
            <p className="text-[15px] text-[#666666] mb-4">Sports Physiotherapist</p>
            <div className="flex flex-col gap-2">
              <p className="flex items-center gap-2 text-[16px] font-semibold text-[#00766C]">
                <CalendarDays className="w-5 h-5" />
                Mon, 28 Mar 2026 · 2:30 PM
              </p>
              <p className="flex items-center gap-2 text-[15px] text-[#333333]">
                <MapPin className="w-4 h-4 text-[#666666]" />
                In-clinic · Andheri West, Mumbai
              </p>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="border-t border-[#E5E5E5] pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="flex items-center gap-2 text-[14px] text-[#666666] mb-1">
              <CreditCard className="w-4 h-4" />
              Total Paid (UPI)
            </p>
            <p className="text-[24px] font-bold text-[#333333]">₹826</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 border border-[#E5E5E5] rounded-lg bg-white text-[14px] font-semibold text-[#333333] hover:bg-[#F9FAFB] transition-colors cursor-pointer outline-none">
            <Download className="w-4 h-4" />
            Download Receipt
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button className="flex items-center gap-2 px-6 py-3 bg-[#00766C] hover:bg-[#005A52] text-white rounded-full text-[15px] font-semibold transition-colors cursor-pointer outline-none">
          <RefreshCw className="w-4 h-4" />
          Reschedule
        </button>
        <button className="flex items-center gap-2 px-6 py-3 border border-[#DC2626] text-[#DC2626] hover:bg-[#FEF2F2] rounded-full text-[15px] font-semibold transition-colors cursor-pointer outline-none">
          <X className="w-4 h-4" />
          Cancel Appointment
        </button>
      </div>
    </div>
  )
}
