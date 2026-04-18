import { randomInt } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getResendClient, renderAuthEmail } from '@/lib/resend'
import { assertEmailServiceConfigured } from '@/lib/email/preflight'

const OTP_EXPIRY_MINUTES = 15

function generateCode(): string {
  return String(randomInt(100000, 1000000))
}

export async function createAndSendPasswordResetOtp(
  email: string,
  userId: string,
): Promise<{ ok: boolean; error?: string }> {
  const preflight = assertEmailServiceConfigured()
  if (!preflight.ok) {
    return { ok: false, error: 'Email service not configured' }
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL!

  const code = generateCode()
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString()

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from('password_reset_otps')
    .insert({ user_id: userId, email: email.toLowerCase(), code, expires_at: expiresAt })
    .select('id')
    .single()

  if (insertError || !inserted) {
    console.error('password_reset_otps insert failed:', insertError)
    return { ok: false, error: 'Failed to create reset code' }
  }

  const { error: sendError } = await getResendClient().emails.send({
    from: fromEmail,
    to: email,
    subject: 'Your bookphysio.in password reset code',
    html: renderAuthEmail({
      title: 'Reset your password',
      preheader: `Your 6-digit code expires in ${OTP_EXPIRY_MINUTES} minutes.`,
      bodyHtml: `
        <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 16px;">
          Use the code below to reset your bookphysio.in password. If you did not request this, you can ignore this email.
        </p>
        <div style="background:#F5F5F5;border-radius:12px;padding:24px;text-align:center;margin-bottom:8px;">
          <span style="font-size:40px;font-weight:900;letter-spacing:12px;color:#00766C;font-family:monospace;">
            ${code}
          </span>
        </div>
        <p style="color:#666;font-size:13px;margin:0;">
          This code expires in ${OTP_EXPIRY_MINUTES} minutes.
        </p>
      `,
    }),
  })

  if (sendError) {
    console.error('Resend password reset send error:', sendError)
    return { ok: false, error: 'Failed to send reset email' }
  }

  return { ok: true }
}

export async function verifyPasswordResetOtp(
  email: string,
  code: string,
): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  const normalizedEmail = email.trim().toLowerCase()
  const normalizedCode = code.trim()

  const { data: rows, error } = await supabaseAdmin
    .from('password_reset_otps')
    .select('id, user_id, expires_at, used_at')
    .eq('email', normalizedEmail)
    .eq('code', normalizedCode)
    .is('used_at', null)
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) {
    console.error('password_reset_otps lookup failed:', error)
    return { ok: false, error: 'lookup_failed' }
  }

  const row = rows?.[0]
  if (!row) {
    return { ok: false, error: 'invalid' }
  }

  if (row.used_at) {
    return { ok: false, error: 'used' }
  }

  if (new Date(row.expires_at) < new Date()) {
    return { ok: false, error: 'expired' }
  }

  const { error: updateError } = await supabaseAdmin
    .from('password_reset_otps')
    .update({ used_at: new Date().toISOString() })
    .eq('id', row.id)

  if (updateError) {
    console.error('password_reset_otps mark used failed:', updateError)
    return { ok: false, error: 'update_failed' }
  }

  return { ok: true, userId: row.user_id }
}
