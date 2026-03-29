import BookingPageClient from './BookingPageClient'

export async function generateStaticParams() { return [] as never[] }

export default function BookPage() {
  return <BookingPageClient />
}
