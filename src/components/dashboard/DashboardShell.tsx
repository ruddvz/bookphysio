'use client'

import { ReactNode } from 'react'
import {
  LayoutDashboard,
  Calendar,
  FileText,
  CreditCard,
  Users,
  TrendingUp,
  Clock,
  Receipt,
  ShieldCheck,
  BarChart3,
  Sparkles,
} from 'lucide-react'
import TopPillNav, { type NavItem, type NavRole } from '@/components/dashboard/TopPillNav'
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt'

const NAV_CONFIG: Record<
  NavRole,
  {
    items: NavItem[]
    notificationsHref?: string
    messagesHref?: string
    profileHref?: string
    roleLabel: string
  }
> = {
  patient: {
    items: [
      { href: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      { href: '/patient/appointments', label: 'Appointments', icon: Calendar },
      { href: '/patient/records', label: 'Records', icon: FileText },
      { href: '/patient/payments', label: 'Payments', icon: CreditCard },
    ],
    notificationsHref: '/patient/notifications',
    messagesHref: '/patient/messages',
    profileHref: '/patient/profile',
    roleLabel: 'Patient',
  },
  provider: {
    items: [
      { href: '/provider/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
      { href: '/provider/ai-assistant', label: 'AI', icon: Sparkles },
      { href: '/provider/calendar', label: 'Schedule', icon: Calendar },
      { href: '/provider/patients', label: 'Patients', icon: Users },
      { href: '/provider/earnings', label: 'Earnings', icon: TrendingUp },
      { href: '/provider/availability', label: 'Availability', icon: Clock },
      { href: '/provider/bills/new', label: 'Bills', icon: Receipt },
    ],
    notificationsHref: '/provider/notifications',
    messagesHref: '/provider/messages',
    profileHref: '/provider/profile',
    roleLabel: 'Practitioner',
  },
  admin: {
    items: [
      { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
      { href: '/admin/listings', label: 'Approvals', icon: ShieldCheck },
      { href: '/admin/users', label: 'Users', icon: Users },
      { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    ],
    profileHref: '/admin',
    roleLabel: 'Administrator',
  },
}

export function DashboardShell({
  role,
  children,
}: {
  role: NavRole
  children: ReactNode
}) {
  const config = NAV_CONFIG[role]

  return (
    <TopPillNav
      role={role}
      items={config.items}
      notificationsHref={config.notificationsHref}
      messagesHref={config.messagesHref}
      profileHref={config.profileHref}
      roleLabel={config.roleLabel}
    >
      <PWAInstallPrompt role={role} />
      {children}
    </TopPillNav>
  )
}
