import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ProviderAIAssistantV2 } from './ProviderAIAssistantV2'

const useUiV2Mock = vi.fn<() => boolean>(() => true)
vi.mock('@/hooks/useUiV2', () => ({ useUiV2: () => useUiV2Mock() }))

vi.mock('next/dynamic', () => ({
  default: () => {
    function MockChat() {
      return <div data-testid="mock-ai-chat">Chat</div>
    }
    return MockChat
  },
}))

describe('ProviderAIAssistantV2', () => {
  it('returns null when v2 flag is off', () => {
    useUiV2Mock.mockReturnValue(false)
    const { container } = render(<ProviderAIAssistantV2 />)
    expect(container.firstChild).toBeNull()
    useUiV2Mock.mockReturnValue(true)
  })

  it('renders v2-ai-root when flag is on', () => {
    render(<ProviderAIAssistantV2 />)
    expect(screen.getByTestId('v2-ai-root')).toBeInTheDocument()
  })

  it('shows Clinical AI Assistant heading', () => {
    render(<ProviderAIAssistantV2 />)
    expect(screen.getByRole('heading', { name: /clinical ai assistant/i })).toBeInTheDocument()
  })

  it('renders capability chips container', () => {
    render(<ProviderAIAssistantV2 />)
    expect(screen.getByTestId('v2-capability-chips')).toBeInTheDocument()
  })

  it('shows all three capability chips', () => {
    render(<ProviderAIAssistantV2 />)
    expect(screen.getByText('Visit-note autodraft')).toBeInTheDocument()
    expect(screen.getByText('Treatment plan builder')).toBeInTheDocument()
    expect(screen.getByText('Patient summary')).toBeInTheDocument()
  })
})
