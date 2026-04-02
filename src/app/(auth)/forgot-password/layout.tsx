import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Recover access to BookPhysio',
  description: 'Reset your BookPhysio access with an email magic link or verified mobile number.',
  alternates: {
    canonical: '/forgot-password',
  },
}

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children
}