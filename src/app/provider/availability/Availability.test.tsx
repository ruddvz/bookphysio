import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ProviderAvailability from './page'

describe('ProviderAvailability', () => {
  it('renders initial schedule with correct counts', () => {
    render(<ProviderAvailability />)
    expect(screen.getByText(/5 of 7 days active/i)).toBeInTheDocument()
  })

  it('toggles a day and updates active count', () => {
    render(<ProviderAvailability />)
    const toggle = screen.getByLabelText(/Toggle Saturday/i)
    fireEvent.click(toggle)
    expect(screen.getByText(/6 of 7 days active/i)).toBeInTheDocument()
  })

  it('shows error if end time is before start time', () => {
    render(<ProviderAvailability />)
    const startInput = screen.getByLabelText(/Monday start time/i)
    const endInput = screen.getByLabelText(/Monday end time/i)
    
    fireEvent.change(startInput, { target: { value: '18:00' } })
    fireEvent.change(endInput, { target: { value: '09:00' } })
    
    const saveButton = screen.getByRole('button', { name: /Save Availability/i })
    fireEvent.click(saveButton)
    
    expect(screen.getByText(/End time must be after start time/i)).toBeInTheDocument()
  })

  it('disables save button when no changes are made', () => {
    render(<ProviderAvailability />)
    const saveButton = screen.getByRole('button', { name: /Save Availability/i })
    expect(saveButton).toBeDisabled()
  })

  it('enables save button when a change is made', () => {
    render(<ProviderAvailability />)
    const toggle = screen.getByLabelText(/Toggle Saturday/i)
    fireEvent.click(toggle)
    
    const saveButton = screen.getByRole('button', { name: /Save Availability/i })
    expect(saveButton).toBeEnabled()
  })

  it('shows success message on successful save', async () => {
    render(<ProviderAvailability />)
    const toggle = screen.getByLabelText(/Toggle Saturday/i)
    fireEvent.click(toggle)
    
    const saveButton = screen.getByRole('button', { name: /Save Availability/i })
    fireEvent.click(saveButton)
    
    expect(screen.getByText(/Availability saved successfully/i)).toBeInTheDocument()
    expect(saveButton).toBeDisabled()
  })

  it('updates slot duration', () => {
    render(<ProviderAvailability />)
    const durationBtn = screen.getByText(/60 mins/i)
    fireEvent.click(durationBtn)
    
    expect(durationBtn).toHaveClass('bg-[#00766C]')
    expect(screen.getByRole('button', { name: /Save Availability/i })).toBeEnabled()
  })
})
