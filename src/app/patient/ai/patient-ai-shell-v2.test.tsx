import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PatientAIShellV2 } from './PatientAIShellV2'

const useUiV2Mock = vi.fn<() => boolean>(() => true)

vi.mock('@/hooks/useUiV2', () => ({
  useUiV2: () => useUiV2Mock(),
}))

function ChatStub() {
  return <div data-testid="chat-stub">chat</div>
}

describe('PatientAIShellV2', () => {
  beforeEach(() => {
    useUiV2Mock.mockReturnValue(true)
  })

  it('renders children unchanged when ui-v2 is off', () => {
    useUiV2Mock.mockReturnValue(false)
    const { container } = render(
      <PatientAIShellV2 mode="motio">
        <ChatStub />
      </PatientAIShellV2>
    )
    expect(screen.getByTestId('chat-stub')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="patient-ai-pulse-v2"]')).toBeNull()
  })

  it('shows motio pulse strip with patient-role tokens when ui-v2 is on', () => {
    render(
      <PatientAIShellV2 mode="motio">
        <ChatStub />
      </PatientAIShellV2>
    )
    expect(screen.getByTestId('patient-ai-pulse-v2')).toBeInTheDocument()
    expect(screen.getByLabelText('motio pulse trend')).toBeInTheDocument()
    expect(screen.getByText('Recovery triage pulse')).toBeInTheDocument()
    expect(screen.getByText('Triage-ready')).toBeInTheDocument()
    expect(screen.getByText('+14%')).toBeInTheDocument()
    expect(screen.getByTestId('chat-stub')).toBeInTheDocument()
  })

  it('shows pai pulse strip with distinct badge copy when ui-v2 is on', () => {
    render(
      <PatientAIShellV2 mode="pai">
        <ChatStub />
      </PatientAIShellV2>
    )
    expect(screen.getByLabelText('pai pulse trend')).toBeInTheDocument()
    expect(screen.getByText('Clinical knowledge pulse')).toBeInTheDocument()
    expect(screen.getByText('Evidence depth')).toBeInTheDocument()
    expect(screen.getByText('+11%')).toBeInTheDocument()
  })

  it('exposes an accessible region label for the pulse strip', () => {
    render(
      <PatientAIShellV2 mode="motio">
        <ChatStub />
      </PatientAIShellV2>
    )
    expect(screen.getByRole('region', { name: 'AI assistant pulse' })).toBeInTheDocument()
  })
})
