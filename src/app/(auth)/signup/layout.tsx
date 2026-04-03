import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create your BookPhysio account',
  description: 'Create your BookPhysio account to book verified physiotherapists near you.',
  robots: { index: false, follow: false },
  alternates: {
    canonical: '/signup',
  },
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children
}