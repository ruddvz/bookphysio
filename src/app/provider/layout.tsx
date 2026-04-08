'use client'

import { ReactNode } from 'react'
import {
  LayoutDashboard,
  Calendar,
  Users,
  TrendingUp,
  Clock,
  Receipt,
} from 'lucide-react'
import TopPillNav, { type NavItem } from '@/components/dashboard/TopPillNav'

const navItems: NavItem[] = [
  { href: '/provider/dashboard',    label: 'Overview',     icon: LayoutDashboard, exact: true },
  { href: '/provider/calendar',     label: 'Schedule',     icon: Calendar },
  { href: '/provider/patients',     label: 'Patients',     icon: Users },
  { href: '/provider/earnings',     label: 'Earnings',     icon: TrendingUp },
  { href: '/provider/availability', label: 'Availability', icon: Clock },
  { href: '/provider/bills/new',    label: 'Bills',        icon: Receipt },
]

export default function ProviderLayout({ children }: { children: ReactNode }) {
  return (
    <TopPillNav
      role="provider"
      items={navItems}
      notificationsHref="/provider/notifications"
      messagesHref="/provider/messages"
      profileHref="/provider/profile"
      roleLabel="Practitioner"
    >
      {children}
    </TopPillNav>
  )
}
