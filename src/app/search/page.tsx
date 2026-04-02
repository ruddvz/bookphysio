import { Suspense } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SearchContent from './SearchContent'

export default function SearchPage() {
  return (
    <div className="bg-bp-surface min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <Suspense fallback={
          <div className="max-w-[1142px] mx-auto px-6 md:px-[60px] py-24 text-center text-bp-body/60">
            Loading search results...
          </div>
        }>
          <SearchContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}
