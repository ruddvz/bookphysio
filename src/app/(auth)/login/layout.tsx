import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Log in to BookPhysio — India's Physiotherapy Network",
  description: 'Sign in to access your recovery dashboard, appointments, and messages on BookPhysio.',
  alternates: {
    canonical: '/login',
  },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}