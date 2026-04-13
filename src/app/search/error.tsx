'use client'

import { useEffect } from 'react'

export default function SearchError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[search] Unhandled error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#F7F8F9] flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl">🔍</span>
        </div>
        <h2 className="text-[22px] font-bold text-[#333] mb-2">Search ran into a problem</h2>
        <p className="text-[15px] text-[#666] mb-6 leading-relaxed">
          We couldn&apos;t load the search results. This is usually temporary — please try again.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#00766C] text-white text-[14px] font-semibold rounded-full hover:bg-[#005A52] transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
