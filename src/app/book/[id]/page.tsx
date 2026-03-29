import dynamic from 'next/dynamic'

const BookingPageClient = dynamic(() => import('./BookingPageClient'))

export function generateStaticParams() { return [] }

export default function BookPage() {
  return <BookingPageClient />
}
