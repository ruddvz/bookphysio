import { Suspense } from 'react'
import BookingInner from './BookingInner'

export function generateStaticParams() {
  return [{ id: 'placeholder' }]
}

export default function BookPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bp-surface flex items-center justify-center"><div className="text-bp-body text-[15px]">Loading…</div></div>}>
      <BookingInner />
    </Suspense>
  )
}
