import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { StepConfirm } from './StepConfirm'

describe('StepConfirm', () => {
  it('requires a visit address before continuing with a home visit booking', () => {
    const onNext = vi.fn()

    render(
      <StepConfirm
        doctor={{}}
        booking={{ visitType: 'home_visit' }}
        onNext={onNext}
      />,
    )

    fireEvent.change(screen.getByPlaceholderText(/enter patient's full name/i), {
      target: { value: 'Aarav Kapoor' },
    })
    fireEvent.change(screen.getByPlaceholderText(/98765 43210/i), {
      target: { value: '9876543210' },
    })

    fireEvent.click(screen.getByRole('button', { name: /continue to booking/i }))

    expect(onNext).not.toHaveBeenCalled()
    expect(screen.getByText(/a complete home visit address is required/i)).toBeInTheDocument()
  })
})