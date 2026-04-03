import type { ReactElement, ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/font/google', () => ({
  Inter: () => ({ variable: '--font-inter' }),
  Fraunces: () => ({ variable: '--font-fraunces' }),
}))

vi.mock('@/app/providers', () => ({
  Providers: ({ children }: { children: ReactNode }) => children,
}))

import RootLayout, { metadata } from './layout'

describe('RootLayout metadata regressions', () => {
  it('exports complete social metadata', () => {
    expect(metadata.metadataBase?.toString()).toBe('https://bookphysio.in/')

    expect(metadata.openGraph).toMatchObject({
      title: 'Book Physiotherapists Online in India | Home Visits | BookPhysio.in',
      description: "India's first physio-only platform. ICP-verified physiotherapists for home visits and in-clinic sessions across 18 Indian cities.",
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
        alt: 'BookPhysio — Book Verified Physiotherapists in India',
      },
    ])

    expect(metadata.twitter).toEqual({
      card: 'summary_large_image',
      title: 'Book Physiotherapists Online in India | Home Visits | BookPhysio.in',
      description: "India's first physio-only platform. ICP-verified physiotherapists for home visits and in-clinic sessions across 18 Indian cities.",
      images: ['/opengraph-image'],
    })
  })

  it('avoids non-standard html scroll attributes', () => {
    const tree = RootLayout({ children: <div>Homepage</div> }) as ReactElement<{ 'data-scroll-behavior'?: string }>

    expect(tree.props['data-scroll-behavior']).toBeUndefined()
  })
})