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

  it('renders a fixed admin icon avatar and no breadcrumb strip for admin', () => {
    render(
      <TopPillNav
        role="admin"
        items={[
          { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
          { href: '/admin/listings', label: 'Approvals', icon: Bell },
        ]}
        profileHref="/admin"
        roleLabel="Administrator"
      >
        <div>Admin content</div>
      </TopPillNav>,
    )

    expect(screen.getByTestId('admin-avatar-icon')).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Breadcrumb' })).not.toBeInTheDocument()
    expect(screen.queryByText('AK')).not.toBeInTheDocument()
  })

  it('does not render the old visible greeting text for dashboard users', () => {
    const { container } = render(
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
      </TopPillNav>,
    )

    expect(screen.queryByText('Aarav Kapoor')).not.toBeInTheDocument()
    expect(container.textContent).not.toMatch(/good morning|good afternoon|good evening/i)
  })
})