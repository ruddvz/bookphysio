import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Skeleton } from '../ui/Skeleton'
import { EmptyState } from '../ui/EmptyState'
import { Search } from 'lucide-react'

describe('UI Performance Components', () => {
  it('Skeleton renders with animate-pulse class', () => {
    const { container } = render(<Skeleton className="w-10 h-10" />)
    expect(container.firstChild).toHaveClass('animate-pulse')
    expect(container.firstChild).toHaveClass('w-10')
  })

  it('EmptyState displays title and description', () => {
    render(
      <EmptyState 
        title="No items found" 
        description="Try searching for something else." 
        icon={Search} 
      />
    )
    expect(screen.getByText('No items found')).toBeInTheDocument()
    expect(screen.getByText('Try searching for something else.')).toBeInTheDocument()
  })

  it('EmptyState renders action button when provided', () => {
    render(
      <EmptyState 
        title="No items" 
        description="Nothing here" 
        icon={Search} 
        action={<button>Click me</button>}
      />
    )
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })
})
