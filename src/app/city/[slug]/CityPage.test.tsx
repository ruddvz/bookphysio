import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import CityPage, { generateMetadata } from './page'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}))

describe('CityPage', () => {
  const mockParams = Promise.resolve({ slug: 'mumbai' })

  it('renders correctly for Mumbai', async () => {
    const Result = await CityPage({ params: mockParams })
    render(Result)
    
    expect(screen.getByText('Physiotherapists in Mumbai')).toBeInTheDocument()
    expect(screen.getByText(/Find top-rated physiotherapists in Mumbai/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /search in mumbai/i })).toHaveAttribute('href', '/search?location=Mumbai')
  })

  it('keeps the surat landing page usable with a search CTA', async () => {
    const mockParamsSurat = Promise.resolve({ slug: 'surat' })
    const Result = await CityPage({ params: mockParamsSurat })
    render(Result)
    
    expect(screen.getByText('Physiotherapists in Surat')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /search in surat/i })).toHaveAttribute('href', '/search?location=Surat')
  })

  it('generates correct metadata for a city', async () => {
    const metadata = await generateMetadata({ params: mockParams })
    expect(metadata.title).toContain('Best Physiotherapists in Mumbai')
    expect(metadata.description).toContain('Find top-rated physiotherapists in Mumbai')
  })
})
