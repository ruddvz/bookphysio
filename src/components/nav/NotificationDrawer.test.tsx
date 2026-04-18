import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { NotificationDrawer } from './NotificationDrawer'

let mockUser: { id: string } | null = { id: 'u1' }
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: mockUser }),
}))

let profileRole: 'patient' | 'provider' | 'admin' | undefined = 'patient'

const invalidateMock = vi.fn()
const mutateMock = vi.fn()

vi.mock('@tanstack/react-query', async (orig) => {
  const actual = await orig<typeof import('@tanstack/react-query')>()
  return {
    ...actual,
    useQuery: (opts: { queryKey: unknown[] }) => {
      const key = opts.queryKey[0]
      if (key === 'navbar-profile') {
        return { data: { role: profileRole }, isLoading: false }
      }
      if (key === 'notifications' && opts.queryKey[1] === 'drawer') {
        return {
          data: {
            notifications: [
              {
                id: 'n1',
                type: 'appointment_confirmed',
                title: 'Booking confirmed',
                body: 'Your session is booked',
                read: false,
                created_at: new Date().toISOString(),
              },
            ],
          },
          isLoading: false,
        }
      }
      return { data: null, isLoading: false }
    },
    useMutation: () => ({
      mutate: mutateMock,
      isPending: false,
    }),
    useQueryClient: () => ({
      invalidateQueries: invalidateMock,
    }),
  }
})

describe('NotificationDrawer', () => {
  beforeEach(() => {
    mockUser = { id: 'u1' }
    profileRole = 'patient'
    mutateMock.mockClear()
    invalidateMock.mockClear()
  })

  it('renders nothing for guest', () => {
    mockUser = null
    const { container } = render(<NotificationDrawer />)
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing for admin role', () => {
    profileRole = 'admin'
    const { container } = render(<NotificationDrawer />)
    expect(container.firstChild).toBeNull()
  })

  it('opens drawer and shows unread count for patient', async () => {
    profileRole = 'patient'
    render(<NotificationDrawer />)
    fireEvent.click(screen.getByTestId('notification-drawer-trigger'))
    await waitFor(() => {
      expect(screen.getByTestId('notification-drawer')).toBeInTheDocument()
    })
    expect(screen.getByText(/1 unread/i)).toBeInTheDocument()
  })

  it('fires mark all read', async () => {
    profileRole = 'patient'
    render(<NotificationDrawer />)
    fireEvent.click(screen.getByTestId('notification-drawer-trigger'))
    await waitFor(() => screen.getByTestId('notification-mark-all'))
    fireEvent.click(screen.getByTestId('notification-mark-all'))
    expect(mutateMock).toHaveBeenCalled()
  })
})
