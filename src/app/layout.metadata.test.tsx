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
      title: 'BookPhysio — Book Physiotherapists',
      description: 'Find and book physiotherapists near you.',
      siteName: 'BookPhysio',
      type: 'website',
      url: 'https://bookphysio.in',
      locale: 'en_IN',
    })

    expect(metadata.openGraph?.images).toEqual([
      {
        url: '/icon.png',
        width: 512,
        height: 512,
        alt: 'BookPhysio brand mark',
      },
    ])

    expect(metadata.twitter).toEqual({
      card: 'summary',
      title: 'BookPhysio — Book Physiotherapists',
      description: 'Find and book physiotherapists near you. In-clinic and home visits available across India.',
      images: ['/icon.png'],
    })
  })

  it('avoids non-standard html scroll attributes', () => {
    const tree = RootLayout({ children: <div>Homepage</div> }) as ReactElement

    expect(tree.props['data-scroll-behavior']).toBeUndefined()
  })
})