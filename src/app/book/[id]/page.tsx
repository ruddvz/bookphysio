import { Suspense } from 'react'
import BookingInner from './BookingInner'

export function generateStaticParams() {
  return [] as never[]
}

export default function BookPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F7F8F9] flex items-center justify-center"><div className="text-[#666666] text-[15px]">Loading…</div></div>}>
      <BookingInner />
    </Suspense>
  )
}
