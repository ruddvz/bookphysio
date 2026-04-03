import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Join as a Physiotherapist — BookPhysio',
  description: 'Create your physiotherapist profile, set your availability, and start accepting bookings on BookPhysio.',
  robots: { index: false, follow: false },
  alternates: {
    canonical: '/doctor-signup',
  },
}

export default function DoctorSignupLayout({ children }: { children: React.ReactNode }) {
  return children
}