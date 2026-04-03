import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ — Physiotherapy Booking Questions | BookPhysio.in',
  description: 'Answers to common questions about booking physiotherapists, home visits, ICP verification, payments, and cancellations on BookPhysio.in.',
  alternates: {
    canonical: '/faq',
  },
}

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return children
}
