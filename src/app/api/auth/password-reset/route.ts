import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { buildConfiguredAppUrl, getRequestIpAddress } from '@/lib/server/runtime'
import { otpRatelimit } from '@/lib/upstash'
import { Resend } from 'resend'

const maskedResponse = { message: 'If an account exists, a password reset email has been sent.' }

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const email =
    typeof body === 'object' && body && typeof (body as { email?: unknown }).email === 'string'
      ? (body as { email: string }).email.trim().toLowerCase()
      : null

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
  }

  const ip = getRequestIpAddress(request)
  try {
    if (ip) {
      const ipLimit = await otpRatelimit.limit(`password-reset:ip:${ip}`)
      if (!ipLimit.success) {
        return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
      }
    }
    const emailLimit = await otpRatelimit.limit(`password-reset:${email}`)
    if (!emailLimit.success) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    }
  } catch {
    // Rate limiter unavailable — allow through
  }

  const callbackUrl = buildConfiguredAppUrl('/auth/callback')
  if (!callbackUrl) {
    return NextResponse.json({ error: 'App URL not configured' }, { status: 500 })
  }
  callbackUrl.searchParams.set('next', '/update-password')

  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: { redirectTo: callbackUrl.toString() },
  })

  if (error || !data?.properties?.action_link) {
    // Mask errors to avoid user enumeration
    return NextResponse.json(maskedResponse)
  }

  const resetLink = data.properties.action_link
  const resendApiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://bookphysio.in'

  if (!resendApiKey || !fromEmail) {
    console.error('Resend not configured: missing RESEND_API_KEY or RESEND_FROM_EMAIL')
    return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
  }

  const resend = new Resend(resendApiKey)
  const { error: sendError } = await resend.emails.send({
    from: fromEmail,
    to: email,
    subject: 'Reset your bookphysio.in password',
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:0 auto;padding:40px 24px;">
        <img src="${escapeHtml(appUrl)}/logo.png" alt="bookphysio.in" style="height:32px;margin-bottom:32px;" />
        <h2 style="color:#00766C;font-size:24px;font-weight:900;margin:0 0 12px;">Reset your password</h2>
        <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 24px;">
          We received a request to reset the password for your bookphysio.in account
          associated with <strong>${escapeHtml(email)}</strong>.
        </p>
        <a href="${escapeHtml(resetLink)}"
           style="display:inline-block;background:#FF6B35;color:#fff;font-size:15px;font-weight:900;padding:14px 28px;border-radius:24px;text-decoration:none;margin-bottom:24px;">
          Reset Password
        </a>
        <p style="color:#666;font-size:13px;line-height:1.6;margin:0 0 8px;">
          This link expires in 1 hour. If you did not request a password reset, you can safely ignore this email.
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
        <p style="color:#999;font-size:12px;margin:0;">bookphysio.in — Physiotherapy booking for India</p>
      </div>
    `,
  })

  if (sendError) {
    console.error('Resend send error:', sendError)
    return NextResponse.json({ error: 'Failed to send email. Please try again.' }, { status: 500 })
  }

  return NextResponse.json(maskedResponse)
}
