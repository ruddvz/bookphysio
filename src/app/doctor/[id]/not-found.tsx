import Link from 'next/link'
import { UserCheck } from 'lucide-react'

export default function DoctorNotFound() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center gap-5 px-6">
      <div className="w-14 h-14 bg-[#E6F4F3] rounded-full flex items-center justify-center text-[#00766C]">
        <UserCheck size={28} />
      </div>
      <div className="text-center">
        <h1 className="text-[22px] font-bold text-[#1A1C29] mb-1.5">Expert not found</h1>
        <p className="text-[14px] text-slate-600 max-w-sm leading-relaxed">
          We couldn&apos;t find the specialist you&apos;re looking for. Please try searching for another expert.
        </p>
      </div>
      <Link
        href="/search"
        className="rounded-full bg-[#00766C] px-6 py-3 text-[14px] font-semibold text-white hover:bg-[#005A52] transition-colors shadow-[0_4px_12px_rgba(0,118,108,0.18)]"
      >
        Back to search
      </Link>
    </div>
  )
}