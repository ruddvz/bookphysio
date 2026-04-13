'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function DoctorProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[doctor-profile] Unhandled error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#F7F8F9] flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl">👨‍⚕️</span>
        </div>
        <h2 className="text-[22px] font-bold text-[#333] mb-2">Couldn&apos;t load this profile</h2>
        <p className="text-[15px] text-[#666] mb-6 leading-relaxed">
          Something went wrong loading the physiotherapist&apos;s profile. Please try again or search for another provider.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#00766C] text-white text-[14px] font-semibold rounded-full hover:bg-[#005A52] transition-colors"
          >
            Try again
          </button>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-6 py-3 border border-[#E5E7EB] text-[#333] text-[14px] font-semibold rounded-full hover:bg-slate-50 transition-colors"
          >
            Search providers
          </Link>
        </div>
      </div>
    </div>
  )
}
