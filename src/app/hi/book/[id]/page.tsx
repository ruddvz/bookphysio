import { Suspense } from 'react'
import BookingInner from '@/app/book/[id]/BookingInner'

export function generateStaticParams() {
  return [{ id: 'placeholder' }]
}

export default function HindiBookPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bp-surface flex items-center justify-center"><div className="text-bp-body text-[15px]">लोड हो रहा है…</div></div>}>
      <BookingInner locale="hi" />
    </Suspense>
  )
}
