import dynamic from 'next/dynamic'

const BookingPageClient = dynamic(() => import('./BookingPageClient'), { ssr: false })

export async function generateStaticParams() { return [] as never[] }

export default function BookPage() {
  return <BookingPageClient />
}
