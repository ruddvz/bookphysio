import { ReactNode } from 'react'
import type { Metadata, Viewport } from 'next'
import { DashboardShell } from '@/components/dashboard/DashboardShell'

export const metadata: Metadata = {
  title: {
    default: 'BookPhysio Patient',
    template: '%s | BookPhysio Patient',
  },
  manifest: '/manifest-patient.json',
  appleWebApp: {
    title: 'BookPhysio Patient',
    capable: true,
    statusBarStyle: 'default',
  },
  icons: {
    apple: '/icon-patient-192.png?v=20260411',
  },
}

export const viewport: Viewport = {
  themeColor: '#1e40af',
}

export default function PatientLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell role="patient">{children}</DashboardShell>
  )
}
