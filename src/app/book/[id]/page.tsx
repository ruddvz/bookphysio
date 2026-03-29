import { Suspense } from 'react'
import BookingPageClient from './BookingPageClient'

export function generateStaticParams() {
  return [{ id: 'initial-setup' }]
}

export default function BookPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingPageClient />
    </Suspense>
  )
}
