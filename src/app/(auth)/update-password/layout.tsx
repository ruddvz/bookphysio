import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Set a new password — BookPhysio',
  description: 'Complete your BookPhysio password recovery by setting a new password.',
  alternates: {
    canonical: '/update-password',
  },
}

export default function UpdatePasswordLayout({ children }: { children: React.ReactNode }) {
  return children
}