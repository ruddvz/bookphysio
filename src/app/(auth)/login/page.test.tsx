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

vi.mock('@/components/auth/DemoAccessPanel', () => ({
  DemoAccessPanel: () => <div>Demo access panel</div>,
}))

describe('LoginPage', () => {
  it('shows the demo access section', () => {
    render(<LoginPage />)

    expect(screen.getByText(/demo access panel/i)).toBeInTheDocument()
  })

  it('renders the centered auth wordmark linked to home', () => {
    render(<LoginPage />)

    const link = screen.getByRole('link', { name: /bookphysio home/i })

    expect(link).toHaveAttribute('href', '/')
    expect(link.className).toContain('mx-auto')
    expect(screen.getByRole('img', { name: 'BookPhysio.in' })).toHaveAttribute('src', '/logo.png')
  })
})