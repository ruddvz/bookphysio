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
    expect(screen.queryByText(/Synchronizing registry data/i)).not.toBeInTheDocument()
  })
}

function getTimeInputs(container: HTMLElement) {
  return Array.from(container.querySelectorAll('input[type="time"]')) as HTMLInputElement[]
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
    expect(screen.getByText(/5\s*Active/i)).toBeInTheDocument()
  })

  it('toggles a day and updates active count', () => {
    render(<ProviderAvailability />)
    return waitForAvailabilityEditor().then(() => {
      const toggle = screen.getByLabelText(/Saturday/i)
      fireEvent.click(toggle)
      expect(screen.getByText(/6\s*Active/i)).toBeInTheDocument()
    })
  })

  it('shows error if end time is before start time', async () => {
    const { container } = render(<ProviderAvailability />)
    await waitForAvailabilityEditor()
    const [startInput, endInput] = getTimeInputs(container)
    
    fireEvent.change(startInput, { target: { value: '18:00' } })
    fireEvent.change(endInput, { target: { value: '09:00' } })
    
    const saveButton = screen.getByRole('button', { name: /Commit Changes/i })
    fireEvent.click(saveButton)
    
    expect(await screen.findByText(/End time must be after start time/i, {}, { timeout: 10000 })).toBeInTheDocument()
  }, 15000)

  it('clears stale day slot errors after removing an invalid extra range', async () => {
    const { container } = render(<ProviderAvailability />)
    await waitForAvailabilityEditor()

    fireEvent.click(screen.getAllByRole('button', { name: /\+ Add range/i })[0]!)

    const timeInputs = getTimeInputs(container)
    fireEvent.change(timeInputs[2]!, { target: { value: '18:00' } })
    fireEvent.change(timeInputs[3]!, { target: { value: '09:00' } })

    fireEvent.click(screen.getByRole('button', { name: /Commit Changes/i }))

    expect(await screen.findByText(/End time must be after start time/i)).toBeInTheDocument()

    fireEvent.click(screen.getAllByRole('button', { name: /Remove/i })[0]!)

    await waitFor(() => {
      expect(screen.queryByText(/End time must be after start time/i)).not.toBeInTheDocument()
    })
  })

  it('disables save button when no changes are made', async () => {
    render(<ProviderAvailability />)
    await waitForAvailabilityEditor()
    const saveButton = screen.getByRole('button', { name: /Commit Changes/i })
    expect(saveButton).toBeDisabled()
  })

  it('enables save button when a change is made', () => {
    render(<ProviderAvailability />)
    return waitForAvailabilityEditor().then(() => {
      const toggle = screen.getByLabelText(/Saturday/i)
      fireEvent.click(toggle)

      const saveButton = screen.getByRole('button', { name: /Commit Changes/i })
      expect(saveButton).toBeEnabled()
    })
  })

  it('shows success message on successful save', async () => {
    render(<ProviderAvailability />)
    await waitForAvailabilityEditor()
    const toggle = screen.getByLabelText(/Saturday/i)
    fireEvent.click(toggle)
    
    const saveButton = screen.getByRole('button', { name: /Commit Changes/i })
    fireEvent.click(saveButton)
    
    expect(await screen.findByText(/Registry Deployed Successfully/i)).toBeInTheDocument()
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

    const { container } = render(<ProviderAvailability />)

    await waitFor(() => {
      const [startInput, endInput] = getTimeInputs(container)
      expect(startInput).toHaveValue('09:00')
      expect(endInput).toHaveValue('10:00')
    })

    expect(screen.getByText(/1\s*Active/i)).toBeInTheDocument()
  })

  it('updates slot duration', async () => {
    render(<ProviderAvailability />)
    await waitForAvailabilityEditor()
    const durationBtn = await screen.findByText(/60 Minutes/i, {}, { timeout: 10000 })
    fireEvent.click(durationBtn)
    
    expect(await screen.findByRole('button', { name: /Commit Changes/i }, { timeout: 10000 })).toBeEnabled()
  }, 15000)

  it('allows multiple time ranges for the same day and saves them', async () => {
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

    render(<ProviderAvailability />)
    await waitForAvailabilityEditor()

    fireEvent.click(screen.getAllByRole('button', { name: /\+ Add range/i })[0]!)

    const mondayCard = screen.getByLabelText(/Monday/i).closest('.group')
    const mondayTimeInputs = mondayCard
      ? Array.from(mondayCard.querySelectorAll('input[type="time"]'))
      : []

    expect(mondayTimeInputs).toHaveLength(4)

    fireEvent.click(screen.getByRole('button', { name: /Commit Changes/i }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/provider/availability',
        expect.objectContaining({
          method: 'POST',
        }),
      )
    })

    const postCall = fetchMock.mock.calls.find(([, init]) => init?.method === 'POST')
    const payload = JSON.parse(String(postCall?.[1]?.body))
    expect(payload.schedule.Monday.slots).toHaveLength(2)
  })

  it('keeps the editor interactive when the initial registry sync fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((input: string, init?: RequestInit) => {
        if (!init?.method || init.method === 'GET') {
          return Promise.reject(new Error('network down'))
        }

        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, created: 42 }),
        })
      })
    )

    render(<ProviderAvailability />)

    expect(await screen.findByText(/Failed to synchronize availability registry/i)).toBeInTheDocument()

    const saturdayToggle = screen.getByLabelText(/Saturday/i)
    expect(saturdayToggle).toBeEnabled()

    fireEvent.click(saturdayToggle)

    expect(screen.getByRole('button', { name: /Commit Changes/i })).toBeEnabled()
  })

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

        expect(screen.getByText(/Ambiguity detected in recurring hours for Tuesday/i)).toBeInTheDocument()
        expect(screen.getByText(/0\s*Active/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Tuesday/i)).toBeDisabled()
        expect(screen.getByRole('button', { name: /Commit Changes/i })).toBeDisabled()
      })
})
