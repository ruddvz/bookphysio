import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How to Book a Physiotherapist Online in India | BookPhysio.in',
  description: 'Book a physiotherapist in 4 steps — search by condition, compare verified experts, pick a slot, and confirm. Same-day home visits and clinic sessions available.',
  alternates: {
    canonical: '/how-it-works',
  },
}

export default function HowItWorksLayout({ children }: { children: React.ReactNode }) {
  return children
}