import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const createClientMock = vi.fn()
const getBillLogoDataUriMock = vi.fn()
const getDemoProfileByIdMock = vi.fn()
const getDemoSessionFromCookiesMock = vi.fn()
const renderToBufferMock = vi.fn()
const userSingleMock = vi.fn()
const providerMaybeSingleMock = vi.fn()

const usersQuery = {
  select: vi.fn(() => usersQuery),
  eq: vi.fn(() => usersQuery),
  single: (...args: unknown[]) => userSingleMock(...args),
}

const providersQuery = {
  select: vi.fn(() => providersQuery),
  eq: vi.fn(() => providersQuery),
  maybeSingle: (...args: unknown[]) => providerMaybeSingleMock(...args),
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: (...args: unknown[]) => createClientMock(...args),
}))

vi.mock('@/lib/demo/session', () => ({
  getDemoProfileById: (...args: unknown[]) => getDemoProfileByIdMock(...args),
  getDemoSessionFromCookies: (...args: unknown[]) => getDemoSessionFromCookiesMock(...args),
}))

vi.mock('@/lib/bills/logo', () => ({
  getBillLogoDataUri: (...args: unknown[]) => getBillLogoDataUriMock(...args),
}))

vi.mock('@/components/bills/BillPdfDocument', () => ({
  BillPdfDocument: () => null,
}))

vi.mock('@react-pdf/renderer', () => ({
  renderToBuffer: (...args: unknown[]) => renderToBufferMock(...args),
}))

const validBody = {
  patient_name: 'Rahul Sharma',
  patient_phone: '+91 98765 43210',
  patient_address: 'Mumbai, Maharashtra',
  invoice_date: '2026-04-07',
  invoice_number: 'INV-2026-001',
  line_items: [
    { description: 'Initial assessment', visit_count: 1, rate_inr: 950 },
    { description: 'Follow-up session', visit_count: 2, rate_inr: 525 },
  ],
  include_gst: true,
  notes: 'Continue home exercise plan for two weeks.',
  provider_name: 'Dr Priya Iyer',
  provider_phone: '+91 99887 77665',
  provider_email: 'priya@example.com',
  provider_specialization: 'Sports Physiotherapist',
  provider_clinic_address: 'Andheri West, Mumbai',
  provider_registration_no: 'IAP-2026-44',
}

describe('POST /api/provider/bills/generate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    userSingleMock.mockResolvedValue({
      data: {
        role: 'provider',
        full_name: 'Server Provider Name',
        phone: '+91 90000 00002',
      },
      error: null,
    })
    providerMaybeSingleMock.mockResolvedValue({
      data: { iap_registration_no: 'IAP-SERVER-987' },
      error: null,
    })
    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'provider-1', email: 'provider@bookphysio.in' } },
        }),
      },
      from: vi.fn((table: string) => {
        if (table === 'users') {
          return usersQuery
        }

        if (table === 'providers') {
          return providersQuery
        }

        throw new Error(`Unhandled table: ${table}`)
      }),
    })
    getDemoSessionFromCookiesMock.mockResolvedValue(null)
    getDemoProfileByIdMock.mockReturnValue(null)
    getBillLogoDataUriMock.mockResolvedValue('data:image/png;base64,abc123')
    renderToBufferMock.mockResolvedValue(Buffer.from('%PDF-1.4 mock invoice'))
  })

  it('returns a branded PDF attachment for authenticated providers using server-side provider identity', async () => {
    const { POST } = await import('../provider/bills/generate/route')
    const response = await POST(
      new NextRequest('http://localhost/api/provider/bills/generate', {
        method: 'POST',
        body: JSON.stringify({
          ...validBody,
          invoice_number: 'INV 2026/001',
          provider_name: 'Forged Provider Name',
          provider_phone: '+91 91111 11111',
          provider_email: 'forged@example.com',
          provider_registration_no: 'IAP-FORGED-001',
        }),
      })
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/pdf')
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(response.headers.get('Content-Disposition')).toBe(
      'attachment; filename="bookphysio-invoice-INV_2026_001.pdf"'
    )
    expect(getBillLogoDataUriMock).toHaveBeenCalledTimes(1)
    expect(renderToBufferMock).toHaveBeenCalledTimes(1)

    const pdfElement = renderToBufferMock.mock.calls[0][0] as {
      props: {
        bill: typeof validBody & { invoice_number: string }
        logoSrc: string | null
      }
    }

    expect(pdfElement.props.bill.invoice_number).toBe('INV 2026/001')
    expect(pdfElement.props.bill.provider_name).toBe('Server Provider Name')
    expect(pdfElement.props.bill.provider_phone).toBe('+91 90000 00002')
    expect(pdfElement.props.bill.provider_email).toBe('provider@bookphysio.in')
    expect(pdfElement.props.bill.provider_registration_no).toBe('IAP-SERVER-987')
    expect(pdfElement.props.logoSrc).toBe('data:image/png;base64,abc123')
  })

  it('rejects unauthenticated users before rendering the PDF', async () => {
    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
        }),
      },
      from: vi.fn(),
    })

    const { POST } = await import('../provider/bills/generate/route')
    const response = await POST(
      new NextRequest('http://localhost/api/provider/bills/generate', {
        method: 'POST',
        body: JSON.stringify(validBody),
      })
    )

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Unauthorized' })
    expect(getBillLogoDataUriMock).not.toHaveBeenCalled()
    expect(renderToBufferMock).not.toHaveBeenCalled()
  })

  it('rejects authenticated non-provider users', async () => {
    userSingleMock.mockResolvedValue({
      data: {
        role: 'patient',
        full_name: 'Patient User',
        phone: '+91 98888 88888',
      },
      error: null,
    })

    const { POST } = await import('../provider/bills/generate/route')
    const response = await POST(
      new NextRequest('http://localhost/api/provider/bills/generate', {
        method: 'POST',
        body: JSON.stringify(validBody),
      })
    )

    expect(response.status).toBe(403)
    expect(await response.json()).toEqual({ error: 'Forbidden' })
    expect(renderToBufferMock).not.toHaveBeenCalled()
  })

  it('supports demo providers without a Supabase auth session', async () => {
    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
        }),
      },
      from: vi.fn(),
    })
    getDemoSessionFromCookiesMock.mockResolvedValue({
      role: 'provider',
      userId: 'demo-provider-id',
    })
    getDemoProfileByIdMock.mockReturnValue({
      role: 'provider',
      fullName: 'Dr. Demo Provider',
      phone: '+91 97777 77777',
      email: 'demo-provider@bookphysio.in',
    })

    const { POST } = await import('../provider/bills/generate/route')
    const response = await POST(
      new NextRequest('http://localhost/api/provider/bills/generate', {
        method: 'POST',
        body: JSON.stringify(validBody),
      })
    )

    expect(response.status).toBe(200)
    const pdfElement = renderToBufferMock.mock.calls[0][0] as {
      props: {
        bill: typeof validBody
      }
    }

    expect(pdfElement.props.bill.provider_name).toBe('Dr. Demo Provider')
    expect(pdfElement.props.bill.provider_phone).toBe('+91 97777 77777')
    expect(pdfElement.props.bill.provider_email).toBe('demo-provider@bookphysio.in')
    expect(pdfElement.props.bill.provider_registration_no).toBe('IAP-DEMO-123')
  })

  it('returns validation errors for malformed bill payloads', async () => {
    const { POST } = await import('../provider/bills/generate/route')
    const response = await POST(
      new NextRequest('http://localhost/api/provider/bills/generate', {
        method: 'POST',
        body: JSON.stringify({ patient_name: 'A' }),
      })
    )

    expect(response.status).toBe(400)
    const body = await response.json() as {
      error: string
      details: { fieldErrors: Record<string, string[]> }
    }

    expect(body.error).toBe('Invalid input')
    expect(body.details.fieldErrors.line_items).toBeDefined()
    expect(getBillLogoDataUriMock).not.toHaveBeenCalled()
    expect(renderToBufferMock).not.toHaveBeenCalled()
  })

  it('surfaces render failures as a 500 response', async () => {
    renderToBufferMock.mockRejectedValue(new Error('Failed to decode logo image'))

    const { POST } = await import('../provider/bills/generate/route')
    const response = await POST(
      new NextRequest('http://localhost/api/provider/bills/generate', {
        method: 'POST',
        body: JSON.stringify(validBody),
      })
    )

    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ error: 'Failed to generate bill PDF' })
  })
})