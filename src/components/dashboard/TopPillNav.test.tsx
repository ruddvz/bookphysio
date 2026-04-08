import { render, screen } from '@testing-library/react'
import { Bell, LayoutDashboard } from 'lucide-react'
import { describe, expect, it, vi } from 'vitest'
import TopPillNav from './TopPillNav'

vi.mock('next/navigation', () => ({
  usePathname: () => '/patient/dashboard',
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      user_metadata: {
        full_name: 'Aarav Kapoor',
      },
    },
    signOut: vi.fn().mockResolvedValue(undefined),
  }),
}))

vi.mock('@/components/BpLogo', () => ({
  default: () => <div>BookPhysio</div>,
}))

describe('TopPillNav', () => {
  it('keeps message and notification shortcuts visible on small screens when provided', () => {
    render(
      <TopPillNav
        role="patient"
        items={[
          { href: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
          { href: '/patient/alerts', label: 'Alerts', icon: Bell },
        ]}
        notificationsHref="/patient/notifications"
        messagesHref="/patient/messages"
        profileHref="/patient/profile"
        roleLabel="Patient"
      >
        <div>Dashboard content</div>
      </TopPillNav>
    )

    expect(screen.getByRole('link', { name: 'Notifications' })).not.toHaveClass('hidden')
    expect(screen.getByRole('link', { name: 'Messages' })).not.toHaveClass('hidden')
  })
})