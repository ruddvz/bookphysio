import { Suspense } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SearchContent from '@/app/search/SearchContent'

export default function HindiSearchPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <Navbar locale="hi" />

      <main className="flex-1">
        <Suspense fallback={
          <div className="max-w-[1142px] mx-auto px-6 md:px-[60px] py-24 text-center text-slate-500">
            खोज परिणाम लोड हो रहे हैं...
          </div>
        }>
          <SearchContent locale="hi" />
        </Suspense>
      </main>

      <Footer locale="hi" />
    </div>
  )
}
