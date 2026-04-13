'use client'

import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-[#F7F8F9] flex flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 text-2xl">
        !
      </div>
      <h1 className="text-[22px] font-bold text-[#1A1C29]">Something went wrong</h1>
      <p className="text-[14px] text-slate-600 max-w-sm">
        An unexpected error occurred. Please try again.
      </p>
      {error.digest ? (
        <p className="text-[12px] text-slate-500">Reference: {error.digest}</p>
      ) : null}
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-[#00766C] px-6 py-3 text-[14px] font-semibold text-white hover:bg-[#005A52] transition-colors"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border border-slate-300 px-6 py-3 text-[14px] font-semibold text-slate-700 hover:bg-white transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
