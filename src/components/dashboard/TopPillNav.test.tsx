/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text */
import { render, screen, waitFor } from '@testing-library/react'
import { Bell, LayoutDashboard } from 'lucide-react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import TopPillNav from './TopPillNav'

let mockUser: {
  id?: string
  phone?: string
  user_metadata?: {
    full_name?: string
  }
} | null = {
  id: 'user-1',
  user_metadata: {
    full_name: 'Aarav Kapoor',
  },
}

vi.mock('next/navigation', () => ({
  usePathname: () => '/patient/dashboard',
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
}))

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    signOut: vi.fn().mockResolvedValue(undefined),
  }),
}))

vi.mock('@/components/BpLogo', () => ({
  default: () => <div>BookPhysio</div>,
}))

describe('TopPillNav', () => {
  beforeEach(() => {
    mockUser = {
      id: 'user-1',
      user_metadata: {
        full_name: 'Aarav Kapoor',
      },
    }
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('No mock configured')))
  })

  it('keeps message and notification shortcuts visible on small screens when provided', async () => {
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

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1)
    })

    expect(screen.getByRole('link', { name: 'Notifications' })).not.toHaveClass('hidden')
    expect(screen.getByRole('link', { name: 'Messages' })).not.toHaveClass('hidden')
  })

  it('clears a stale avatar when the next profile has no avatar image', async () => {
    const fetchMock = vi.mocked(fetch)

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ avatar_url: 'https://example.com/aarav.jpg' }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ avatar_url: null }),
      } as Response)

    const props = {
      role: 'patient' as const,
      items: [
        { href: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      ],
      profileHref: '/patient/profile',
      roleLabel: 'Patient',
    }

    const { rerender } = render(
      <TopPillNav {...props}>
        <div>Dashboard content</div>
      </TopPillNav>
    )

    await screen.findByRole('img', { name: 'Aarav Kapoor' })

    mockUser = {
      id: 'user-2',
      user_metadata: {
        full_name: 'Bhavna Nair',
      },
    }

    rerender(
      <TopPillNav {...props}>
        <div>Dashboard content</div>
      </TopPillNav>
    )

    await waitFor(() => {
      expect(screen.queryByRole('img', { name: 'Bhavna Nair' })).not.toBeInTheDocument()
    })

    expect(screen.getByText('BN')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
