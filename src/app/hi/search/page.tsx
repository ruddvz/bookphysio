import { Suspense } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SearchContent from '@/app/search/SearchContent'

export default function HindiSearchPage() {
  return (
    <div className="bg-bp-surface min-h-screen flex flex-col">
      <Navbar locale="hi" />

      <main className="flex-1">
        <Suspense fallback={
          <div className="max-w-[1142px] mx-auto px-6 md:px-[60px] py-24 text-center text-bp-body/60">
            खोज परिणाम लोड हो रहे हैं...
          </div>
        }>
          <SearchContent locale="hi" />
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}
