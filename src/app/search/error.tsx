'use client'

import { useEffect } from 'react'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function SearchError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="bg-[#F7F8F9] min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto mb-5 text-xl font-bold">
            !
          </div>
          <h1 className="text-[20px] font-bold text-[#1A1C29] mb-2">Search unavailable</h1>
          <p className="text-[14px] text-slate-600 mb-6">
            We couldn&apos;t load results. Please try again.
          </p>
          <button
            onClick={reset}
            className="rounded-full bg-[#00766C] px-6 py-3 text-[14px] font-semibold text-white hover:bg-[#005A52] transition-colors"
          >
            Retry search
          </button>
        </div>
      </main>
      <Footer />
    </div>
  )
}
