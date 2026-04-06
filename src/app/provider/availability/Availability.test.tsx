import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'
import ProviderAvailability from './page'

function buildDefaultOpenSlots() {
  return [
    '2026-04-06T03:30:00.000Z',
    '2026-04-07T03:30:00.000Z',
    '2026-04-08T03:30:00.000Z',
    '2026-04-09T03:30:00.000Z',
    '2026-04-10T03:30:00.000Z',
  ].map((starts_at) => ({
    starts_at,
    ends_at: new Date(Date.parse(starts_at) + 30 * 60 * 1000).toISOString(),
    is_booked: false,
    is_blocked: false,
  }))
}

async function waitForAvailabilityEditor() {
  await waitFor(() => {
    expect(screen.queryByText(/Loading your current schedule/i)).not.toBeInTheDocument()
  })
}

describe('ProviderAvailability', () => {
  beforeEach(() => {
    const fetchMock = vi.fn((input: string, init?: RequestInit) => {
      if (!init?.method || init.method === 'GET') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ slots: buildDefaultOpenSlots() }),
        })
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({ success: true, created: 42 }),
      })
    })

    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders initial schedule with correct counts', async () => {
    render(<ProviderAvailability />)
    await waitForAvailabilityEditor()
    expect(screen.getByText(/5 of 7 days active/i)).toBeInTheDocument()
  })

  it('toggles a day and updates active count', () => {
    render(<ProviderAvailability />)
    return waitForAvailabilityEditor().then(() => {
      const toggle = screen.getByLabelText(/Toggle Saturday/i)
      fireEvent.click(toggle)
      expect(screen.getByText(/6 of 7 days active/i)).toBeInTheDocument()
    })
  })

  it('shows error if end time is before start time', async () => {
    render(<ProviderAvailability />)
    await waitForAvailabilityEditor()
    const startInput = screen.getByLabelText(/Monday start time/i)
    const endInput = screen.getByLabelText(/Monday end time/i)
    
    fireEvent.change(startInput, { target: { value: '18:00' } })
    fireEvent.change(endInput, { target: { value: '09:00' } })
    
    const saveButton = screen.getByRole('button', { name: /Save Availability/i })
    fireEvent.click(saveButton)
    
    expect(await screen.findByText(/End time must be after start time/i, {}, { timeout: 10000 })).toBeInTheDocument()
  }, 15000)

  it('disables save button when no changes are made', async () => {
    render(<ProviderAvailability />)
    await waitForAvailabilityEditor()
    const saveButton = screen.getByRole('button', { name: /Save Availability/i })
    expect(saveButton).toBeDisabled()
  })

  it('enables save button when a change is made', () => {
    render(<ProviderAvailability />)
    return waitForAvailabilityEditor().then(() => {
      const toggle = screen.getByLabelText(/Toggle Saturday/i)
      fireEvent.click(toggle)

      const saveButton = screen.getByRole('button', { name: /Save Availability/i })
      expect(saveButton).toBeEnabled()
    })
  })

  it('shows success message on successful save', async () => {
    render(<ProviderAvailability />)
    await waitForAvailabilityEditor()
    const toggle = screen.getByLabelText(/Toggle Saturday/i)
    fireEvent.click(toggle)
    
    const saveButton = screen.getByRole('button', { name: /Save Availability/i })
    fireEvent.click(saveButton)
    
    expect(await screen.findByText(/slots generated for the next 4 weeks/i)).toBeInTheDocument()
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/provider/availability', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }))
    })
    expect(saveButton).toBeDisabled()
  })

  it('hydrates the editor from existing availability before editing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          slots: [
            {
              starts_at: '2026-04-06T03:30:00.000Z',
              ends_at: '2026-04-06T04:00:00.000Z',
              is_booked: false,
              is_blocked: false,
            },
            {
              starts_at: '2026-04-06T04:00:00.000Z',
              ends_at: '2026-04-06T04:30:00.000Z',
              is_booked: false,
              is_blocked: false,
            },
          ],
        }),
      })
    )

    render(<ProviderAvailability />)

    await waitFor(() => {
      expect(screen.getByLabelText(/Monday start time/i)).toHaveValue('09:00')
      expect(screen.getByLabelText(/Monday end time/i)).toHaveValue('10:00')
    })

    expect(screen.getByText(/1 of 7 days active/i)).toBeInTheDocument()
  })

  it('updates slot duration', async () => {
    render(<ProviderAvailability />)
    await waitForAvailabilityEditor()
    const durationBtn = await screen.findByText(/60 mins/i, {}, { timeout: 10000 })
    fireEvent.click(durationBtn)
    
    expect(durationBtn).toHaveClass('bg-bp-accent')
    expect(await screen.findByRole('button', { name: /Save Availability/i }, { timeout: 10000 })).toBeEnabled()
  }, 15000)

      it('blocks editing when recurring hours cannot be safely inferred from booked-only days', async () => {
        vi.stubGlobal(
          'fetch',
          vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
              slots: [
                {
                  starts_at: '2026-04-07T10:30:00.000Z',
                  ends_at: '2026-04-07T11:00:00.000Z',
                  is_booked: true,
                  is_blocked: false,
                },
              ],
            }),
          })
        )

        render(<ProviderAvailability />)
        await waitForAvailabilityEditor()

        expect(screen.getByText(/cannot safely infer recurring hours for Tuesday/i)).toBeInTheDocument()
        expect(screen.getByText(/0 of 7 days active/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Toggle Tuesday/i)).toBeDisabled()
        expect(screen.getByRole('button', { name: /Save Availability/i })).toBeDisabled()
      })
})
