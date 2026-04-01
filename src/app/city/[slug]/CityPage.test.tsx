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
    // Dr. Priya lives in Mumbai in mock data
    expect(screen.getByText(/Dr. Priya Sharma/i)).toBeInTheDocument()
  })

  it('shows empty state for cities with no mock doctors', async () => {
    const mockParamsSurat = Promise.resolve({ slug: 'surat' })
    const Result = await CityPage({ params: mockParamsSurat })
    render(Result)
    
    expect(screen.getByText('No providers currently in Surat')).toBeInTheDocument()
    expect(screen.getByText(/Explore Other Cities/i)).toBeInTheDocument()
  })

  it('generates correct metadata for a city', async () => {
    const metadata = await generateMetadata({ params: mockParams })
    expect(metadata.title).toContain('Best Physiotherapists in Mumbai')
    expect(metadata.description).toContain('Find top-rated physiotherapists in Mumbai')
  })
})
