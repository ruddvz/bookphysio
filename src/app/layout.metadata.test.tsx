import type { ReactElement, ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/font/google', () => ({
  Inter: () => ({ variable: '--font-inter' }),
  Fraunces: () => ({ variable: '--font-fraunces' }),
  Outfit: () => ({ variable: '--font-outfit' }),
}))

vi.mock('@/app/providers', () => ({
  Providers: ({ children }: { children: ReactNode }) => children,
}))

vi.mock('@/components/CookieConsent', () => ({
  CookieConsent: () => <div data-testid="cookie-consent" />,
}))

vi.mock('@/components/PublicAnalytics', () => ({
  PublicAnalytics: () => <div data-testid="vercel-analytics" />,
}))

import RootLayout, { metadata } from './layout'

describe('RootLayout metadata regressions', () => {
  it('exports complete social metadata', () => {
    expect(metadata.metadataBase?.toString()).toBe('https://bookphysio.in/')

    expect(metadata.openGraph).toMatchObject({
      title: 'Book Physiotherapists Online in India | Home Visits | BookPhysio.in',
      description: 'BookPhysio is a focused booking platform for physiotherapy in India. Find IAP-verified physiotherapists for home visits and in-clinic sessions.',
      siteName: 'BookPhysio',
      type: 'website',
      url: 'https://bookphysio.in',
      locale: 'en_IN',
    })

    expect(metadata.openGraph?.images).toEqual([
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'BookPhysio: Book Verified Physiotherapists in India',
      },
    ])

    expect(metadata.twitter).toEqual({
      card: 'summary_large_image',
      title: 'Book Physiotherapists Online in India | Home Visits | BookPhysio.in',
      description: 'BookPhysio is a focused booking platform for physiotherapy in India. Find IAP-verified physiotherapists for home visits and in-clinic sessions.',
      images: ['/opengraph-image'],
    })
  })

  it('avoids non-standard html scroll attributes', () => {
    const tree = RootLayout({ children: <div>Homepage</div> }) as ReactElement<{ 'data-scroll-behavior'?: string }>

    expect(tree.props['data-scroll-behavior']).toBeUndefined()
  })

  it('renders Vercel analytics exactly once in the body', () => {
    const tree = RootLayout({ children: <div>Homepage</div> }) as ReactElement<{ children: ReactNode }>
    const body = tree.props.children as ReactElement<{ children: ReactNode }>

    render(<>{body.props.children}</>)

    expect(screen.getAllByTestId('vercel-analytics')).toHaveLength(1)
  })
})