import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import SpecialtyPage, { generateMetadata } from './page'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}))

describe('SpecialtyPage', () => {
  const mockParams = Promise.resolve({ slug: 'sports' })

  it('renders correctly with given specialty', async () => {
    const Result = await SpecialtyPage({ params: mockParams })
    render(Result)
    
    expect(screen.getByText('Sports Sciences Physiotherapists')).toBeInTheDocument()
    expect(screen.getByText(/injury prevention, athletic rehabilitation/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /search sports sciences/i })).toHaveAttribute('href', '/search?specialty=sports')
  })

  it('generates correct metadata', async () => {
    const metadata = await generateMetadata({ params: mockParams })
    expect(metadata.title).toContain('Best Sports Sciences Physiotherapists in India')
    expect(metadata.description).toContain('athletic rehabilitation')
  })

  it('returns not found metadata for unknown specialties', async () => {
    const mockParamsEmpty = Promise.resolve({ slug: 'pain-management' })
    const metadata = await generateMetadata({ params: mockParamsEmpty })

    expect(metadata.title).toBe('Not Found | BookPhysio.in')
  })
})
