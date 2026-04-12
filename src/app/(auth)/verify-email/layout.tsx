import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Check your email — BookPhysio',
  description: 'Verify your email address to complete your BookPhysio registration.',
  robots: { index: false, follow: false },
  alternates: {
    canonical: '/verify-email',
  },
}

export default function VerifyEmailLayout({ children }: { children: React.ReactNode }) {
  return children
}
