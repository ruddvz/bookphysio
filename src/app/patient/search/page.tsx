'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, ArrowRight } from 'lucide-react'
import { PatientSearchV2Rail } from './PatientSearchV2Rail'

export default function PatientSearch() {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null)
  const [selectedMode, setSelectedMode] = useState<'clinic' | 'home_visit' | 'video' | null>(null)
  const [pincode, setPincode] = useState('')

  return (
    <div className="max-w-[1040px] mx-auto px-6 py-12 animate-in fade-in duration-500 delay-100 fill-mode-both">
      <PatientSearchV2Rail
        selectedSpecialty={selectedSpecialty ?? undefined}
        onSpecialtyChange={setSelectedSpecialty}
        selectedMode={selectedMode ?? undefined}
        onModeChange={setSelectedMode}
        pincode={pincode}
        onPincodeChange={setPincode}
      />

      <div className="bg-white rounded-[var(--sq-lg)] border border-slate-200 shadow-sm py-16 px-8 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 flex items-center justify-center mb-5">
          <Search className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-[24px] font-bold text-slate-900 mb-6">
          Ready to book your next session?
        </h2>

        <Link
          href="/search"
          className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-[16px] font-semibold no-underline transition-colors"
        >
          Search physiotherapists
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  )
}
