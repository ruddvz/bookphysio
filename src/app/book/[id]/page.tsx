import dynamic from 'next/dynamic'
const BookingInner = dynamic(() => import('./BookingInner'), { ssr: false })

export async function generateStaticParams() {
  return [] as { id: string }[]
}

export default function BookPage() {
  return <BookingInner />
}
