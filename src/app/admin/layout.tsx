'use client'

import { ReactNode } from 'react'
import { LayoutDashboard, ShieldCheck, Users, BarChart3 } from 'lucide-react'
import TopPillNav, { type NavItem } from '@/components/dashboard/TopPillNav'

const navItems: NavItem[] = [
  { href: '/admin',           label: 'Overview',  icon: LayoutDashboard, exact: true },
  { href: '/admin/listings',  label: 'Approvals', icon: ShieldCheck },
  { href: '/admin/users',     label: 'Users',     icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <TopPillNav
      role="admin"
      items={navItems}
      profileHref="/admin"
      roleLabel="Administrator"
    >
      {children}
    </TopPillNav>
  )
}
