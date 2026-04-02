import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How BookPhysio Works',
  description: 'Learn how patients and physiotherapists use BookPhysio to search, book, and manage care.',
  alternates: {
    canonical: '/how-it-works',
  },
}

export default function HowItWorksLayout({ children }: { children: React.ReactNode }) {
  return children
}