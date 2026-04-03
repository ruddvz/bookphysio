import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { StepSuccess } from './StepSuccess'

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}))

describe('StepSuccess', () => {
  let capturedBlob: Blob | null = null
  let originalCreateObjectURL: typeof URL.createObjectURL | undefined
  let originalRevokeObjectURL: typeof URL.revokeObjectURL | undefined

  beforeEach(() => {
    capturedBlob = null
    originalCreateObjectURL = URL.createObjectURL
    originalRevokeObjectURL = URL.revokeObjectURL

    URL.createObjectURL = vi.fn((blob: Blob) => {
      capturedBlob = blob
      return 'blob:mock'
    })
    URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    URL.createObjectURL = originalCreateObjectURL as typeof URL.createObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL as typeof URL.revokeObjectURL
    vi.restoreAllMocks()
  })

  it('escapes receipt HTML before generating the downloadable receipt', async () => {
    const originalCreateElement = document.createElement.bind(document)
    const anchorElement = originalCreateElement('a')
    const clickMock = vi.spyOn(anchorElement, 'click').mockImplementation(() => {})

    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'a') {
        return anchorElement
      }

      return originalCreateElement(tagName)
    })

    render(
      <StepSuccess
        doctorName={'Dr. <Aria & Co>'}
        date="2026-04-15"
        time="10:30 AM"
        visitType="home_visit"
        location={'<Clinic, Block A & Level 2>'}
        totalPaid={1416}
        gstAmount={216}
        paymentMethod="card"
        refNumber={'BP-<42>'}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /digital receipt/i }))

    await waitFor(async () => {
      const html = await capturedBlob?.text()
      expect(html).toContain('Dr. &lt;Aria &amp; Co&gt;')
      expect(html).toContain('&lt;Clinic, Block A &amp; Level 2&gt;')
      expect(html).toContain('BP-&lt;42&gt;')
      expect(html).not.toContain('Dr. <Aria & Co>')
    })
    expect(clickMock).toHaveBeenCalled()
  })

  it('writes UTC ICS timestamps and escapes reserved ICS characters', async () => {
    const originalCreateElement = document.createElement.bind(document)
    const anchorElement = originalCreateElement('a')
    const clickMock = vi.spyOn(anchorElement, 'click').mockImplementation(() => {})

    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'a') {
        return anchorElement
      }

      return originalCreateElement(tagName)
    })

    render(
      <StepSuccess
        doctorName="Dr. Aria"
        date="2026-04-15"
        time="10:30 AM"
        visitType="in_clinic"
        location="Clinic, Block A; Level 2"
        totalPaid={1416}
        gstAmount={216}
        paymentMethod="pay_at_clinic"
        refNumber="BP-42"
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /sync calendar/i }))

    await waitFor(async () => {
      const ics = await capturedBlob?.text()
      expect(ics).toContain('DTSTART:20260415T050000Z')
      expect(ics).toContain('DTEND:20260415T060000Z')
      expect(ics).toContain('LOCATION:Clinic\\, Block A\\; Level 2')
      expect(ics).toContain('DESCRIPTION:BookPhysio appointment. Ref: BP-42. Visit Type: in_clinic.')
    })
    expect(clickMock).toHaveBeenCalled()
  })
})