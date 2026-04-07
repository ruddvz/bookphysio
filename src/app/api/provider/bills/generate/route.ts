import { type NextRequest, NextResponse } from 'next/server'
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer'
import { createElement, type ReactElement } from 'react'
import { createClient } from '@/lib/supabase/server'
import { generateBillSchema } from '@/lib/clinical/types'
import { BillPdfDocument } from '@/components/bills/BillPdfDocument'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = generateBillSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const element = createElement(BillPdfDocument, { bill: parsed.data }) as unknown as ReactElement<DocumentProps>
    const buffer = await renderToBuffer(element)
    const safeName = parsed.data.invoice_number.replace(/[^a-zA-Z0-9_-]/g, '_')
    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="bookphysio-invoice-${safeName}.pdf"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to render PDF'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
