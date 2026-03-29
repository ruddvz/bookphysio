'use client'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <h1 className="text-[72px] font-bold text-[#00766C] mb-2 tracking-tight">404</h1>
        <h2 className="text-[24px] font-semibold text-[#333333] mb-4">Page Not Found</h2>
        <p className="text-[#666666] mb-8 max-w-md">
          We couldn&apos;t find the page you&apos;re looking for. Let&apos;s get you back to health!
        </p>
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#00766C] hover:bg-[#005A52] text-white rounded-full text-[15px] font-semibold no-underline transition-colors"
        >
          <Home className="w-4 h-4" />
          Go Back Home
        </Link>
      </main>
      <Footer />
    </>
  )
}
