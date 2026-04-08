import { type NextRequest, NextResponse } from 'next/server'
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer'
import { createElement, type ReactElement } from 'react'
import { getDemoProfileById, getDemoSessionFromCookies } from '@/lib/demo/session'
import { createClient } from '@/lib/supabase/server'
import { getBillLogoDataUri } from '@/lib/bills/logo'
import { generateBillSchema } from '@/lib/clinical/types'
import { BillPdfDocument } from '@/components/bills/BillPdfDocument'

export const runtime = 'nodejs'

interface ProviderIdentity {
  providerName: string
  providerPhone: string | null
  providerEmail: string | null
  providerRegistrationNo: string | null
}

async function resolveProviderIdentity(
  request: NextRequest,
  supabase: Awaited<ReturnType<typeof createClient>>,
  user: { id: string; email?: string | null } | null,
): Promise<ProviderIdentity | NextResponse> {
  const demoSession = !user ? await getDemoSessionFromCookies(request.cookies) : null

  if (!user && demoSession?.role === 'provider') {
    const demoProfile = getDemoProfileById(demoSession.userId)

    if (!demoProfile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return {
      providerName: demoProfile.fullName,
      providerPhone: demoProfile.phone,
      providerEmail: demoProfile.email,
      providerRegistrationNo: 'IAP-DEMO-123',
    }
  }

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: providerUser } = await supabase
    .from('users')
    .select('role, full_name, phone')
    .eq('id', user.id)
    .single()

  if (providerUser?.role !== 'provider') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: providerProfile } = await supabase
    .from('providers')
    .select('iap_registration_no')
    .eq('id', user.id)
    .maybeSingle()

  return {
    providerName: providerUser.full_name || 'Provider',
    providerPhone: providerUser.phone ?? null,
    providerEmail: user.email ?? null,
    providerRegistrationNo: providerProfile?.iap_registration_no ?? null,
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const providerIdentity = await resolveProviderIdentity(req, supabase, user)
  if (providerIdentity instanceof NextResponse) {
    return providerIdentity
  }

  const body = await req.json().catch(() => null)
  const parsed = generateBillSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const logoSrc = await getBillLogoDataUri()
    const bill = {
      ...parsed.data,
      provider_name: providerIdentity.providerName,
      provider_phone: providerIdentity.providerPhone,
      provider_email: providerIdentity.providerEmail,
      provider_registration_no: providerIdentity.providerRegistrationNo,
    }
    const element = createElement(BillPdfDocument, {
      bill,
      logoSrc,
    }) as unknown as ReactElement<DocumentProps>
    const buffer = await renderToBuffer(element)
    const safeName = bill.invoice_number.replace(/[^a-zA-Z0-9_-]/g, '_')
    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="bookphysio-invoice-${safeName}.pdf"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err: unknown) {
    console.error('[api/provider/bills/generate] Failed to render bill PDF:', err)
    return NextResponse.json({ error: 'Failed to generate bill PDF' }, { status: 500 })
  }
}
