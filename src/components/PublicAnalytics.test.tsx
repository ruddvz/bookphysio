import { act, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockUsePathname = vi.fn()
const mockAnalyticsRender = vi.fn()

vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}))

vi.mock('@vercel/analytics/react', () => ({
  Analytics: ({ path, route }: { path?: string | null; route?: string | null }) => {
    mockAnalyticsRender({ path, route })
    return <div data-path={path ?? ''} data-route={route ?? ''} data-testid="vercel-analytics" />
  },
}))

import { PublicAnalytics, shouldTrackPublicPath } from './PublicAnalytics'

describe('PublicAnalytics', () => {
  beforeEach(() => {
    window.localStorage.clear()
    mockAnalyticsRender.mockReset()
    mockUsePathname.mockReset()
    mockUsePathname.mockReturnValue('/')
  })

  it('tracks only consented public marketing and search routes', () => {
    expect(shouldTrackPublicPath('/')).toBe(true)
    expect(shouldTrackPublicPath('/search')).toBe(true)
    expect(shouldTrackPublicPath('/city/mumbai')).toBe(true)
    expect(shouldTrackPublicPath('/specialty/sports')).toBe(true)
    expect(shouldTrackPublicPath('/book/placeholder')).toBe(false)
    expect(shouldTrackPublicPath('/doctor/placeholder')).toBe(false)
    expect(shouldTrackPublicPath('/patient/dashboard')).toBe(false)
    expect(shouldTrackPublicPath('/admin')).toBe(false)
  })

  it('renders analytics after consent is accepted on public routes', async () => {
    mockUsePathname.mockReturnValue('/search')
    render(<PublicAnalytics />)

    expect(screen.queryByTestId('vercel-analytics')).toBeNull()

    await act(async () => {
      window.localStorage.setItem('cookie-consent', 'accepted')
      window.dispatchEvent(new Event('cookie-consent-changed'))
    })

    await waitFor(() => {
      expect(screen.getByTestId('vercel-analytics')).toBeInTheDocument()
    })

    expect(screen.getByTestId('vercel-analytics')).toHaveAttribute('data-path', '/search')
    expect(screen.getByTestId('vercel-analytics')).toHaveAttribute('data-route', '/search')
  })

  it('keeps analytics disabled on private routes even with consent', () => {
    window.localStorage.setItem('cookie-consent', 'accepted')
    mockUsePathname.mockReturnValue('/patient/dashboard')

    render(<PublicAnalytics />)

    expect(screen.queryByTestId('vercel-analytics')).toBeNull()
  })

  it('stops rendering analytics after navigation into a private route', async () => {
    window.localStorage.setItem('cookie-consent', 'accepted')
    mockUsePathname.mockReturnValue('/search')

    const view = render(<PublicAnalytics />)

    await waitFor(() => {
      expect(screen.getByTestId('vercel-analytics')).toHaveAttribute('data-path', '/search')
    })

    mockUsePathname.mockReturnValue('/patient/dashboard')
    view.rerender(<PublicAnalytics />)

    expect(screen.queryByTestId('vercel-analytics')).toBeNull()
  })
})
