import { ReactNode } from 'react'
import type { Metadata, Viewport } from 'next'
import { DashboardShell } from '@/components/dashboard/DashboardShell'

export const metadata: Metadata = {
  title: {
    default: 'BookPhysio Admin',
    template: '%s | BookPhysio Admin',
  },
  manifest: '/manifest-admin.json',
  appleWebApp: {
    title: 'BookPhysio Admin',
    capable: true,
    statusBarStyle: 'default',
  },
  icons: {
    apple: '/icon-admin-192.png?v=20260411',
  },
}

export const viewport: Viewport = {
  themeColor: '#1a1a2e',
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell role="admin">{children}</DashboardShell>
  )
}
