import type { ImgHTMLAttributes } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import LoginPage from './page'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('next/image', () => ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  default: ({ alt = '', fill, priority, ...props }: ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; priority?: boolean }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithOAuth: vi.fn(),
    },
  }),
}))

describe('LoginPage', () => {
  it('renders the email and password fields without exposing raw credentials', () => {
    render(<LoginPage />)

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.queryByText(/demo accounts/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/90000 00000/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/99999 99999/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/51972 92391/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/999999/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/111111/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/264200/i)).not.toBeInTheDocument()
  })

  it('renders the auth wordmark linked to home', () => {
    render(<LoginPage />)

    const link = screen.getByRole('link', { name: /bookphysio home/i })

    expect(link).toHaveAttribute('href', '/')
    expect(link.className).toContain('justify-center')
    expect(screen.getByRole('img', { name: 'BookPhysio.in' })).toHaveAttribute('src', '/logo.png')
  })
})