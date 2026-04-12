import { ReactNode } from 'react'
import type { Metadata, Viewport } from 'next'
import { DashboardShell } from '@/components/dashboard/DashboardShell'

export const metadata: Metadata = {
  title: {
    default: 'BookPhysio Provider',
    template: '%s | BookPhysio Provider',
  },
  manifest: '/manifest-provider.json',
  appleWebApp: {
    title: 'BookPhysio Provider',
    capable: true,
    statusBarStyle: 'default',
  },
  icons: {
    apple: '/icon-provider-192.png?v=20260411',
  },
}

export const viewport: Viewport = {
  themeColor: '#7c3aed',
}

export default function ProviderLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell role="provider">{children}</DashboardShell>
  )
}
