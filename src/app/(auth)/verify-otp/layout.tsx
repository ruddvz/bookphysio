import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Verify your mobile number — BookPhysio',
  description: 'Enter your one-time password to continue signing in to BookPhysio.',
  alternates: {
    canonical: '/verify-otp',
  },
}

export default function VerifyOtpLayout({ children }: { children: React.ReactNode }) {
  return children
}