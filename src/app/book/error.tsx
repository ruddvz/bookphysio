'use client'

import Link from 'next/link'

export default function BookingError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-[#F7F8F9] flex flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center text-red-500 text-xl font-bold">
        !
      </div>
      <h1 className="text-[20px] font-bold text-[#1A1C29]">Booking error</h1>
      <p className="text-[14px] text-slate-600 max-w-sm">
        {error.message || 'Something went wrong with your booking. Please try again.'}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-[#00766C] px-6 py-3 text-[14px] font-semibold text-white hover:bg-[#005A52] transition-colors"
        >
          Try again
        </button>
        <Link
          href="/search"
          className="rounded-full border border-slate-300 px-6 py-3 text-[14px] font-semibold text-slate-700 hover:bg-white transition-colors"
        >
          Find a provider
        </Link>
      </div>
    </div>
  )
}
