'use client'

import { ReactNode } from 'react'
import {
  LayoutDashboard,
  Calendar,
  FileText,
  CreditCard,
} from 'lucide-react'
import TopPillNav, { type NavItem } from '@/components/dashboard/TopPillNav'
import { DashboardManifest } from '@/components/DashboardManifest'
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt'

const navItems: NavItem[] = [
  { href: '/patient/dashboard',    label: 'Dashboard',    icon: LayoutDashboard, exact: true },
  { href: '/patient/appointments', label: 'Appointments', icon: Calendar },
  { href: '/patient/records',      label: 'Records',      icon: FileText },
  { href: '/patient/payments',     label: 'Payments',     icon: CreditCard },
]

export default function PatientLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <DashboardManifest role="patient" />
      <TopPillNav
        role="patient"
        items={navItems}
        notificationsHref="/patient/notifications"
        messagesHref="/patient/messages"
        profileHref="/patient/profile"
        roleLabel="Patient"
      >
        <PWAInstallPrompt role="patient" />
        {children}
      </TopPillNav>
    </>
  )
}
