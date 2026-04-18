import { randomInt } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { Resend } from 'resend'

const OTP_EXPIRY_MINUTES = 10

function generateCode(): string {
  return String(randomInt(100000, 1000000))
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function createAndSendEmailOtp(
  email: string,
  userId: string,
): Promise<{ ok: boolean; error?: string }> {
  const resendApiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://bookphysio.in'

  if (!resendApiKey || !fromEmail) {
    return { ok: false, error: 'Email service not configured' }
  }

  const code = generateCode()
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString()

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from('email_otps')
    .insert({ user_id: userId, email: email.toLowerCase(), code, expires_at: expiresAt })
    .select('id')
    .single()

  if (insertError || !inserted) {
    console.error('email_otps insert failed:', insertError)
    return { ok: false, error: 'Failed to create verification code' }
  }

  const resend = new Resend(resendApiKey)
  const { error: sendError } = await resend.emails.send({
    from: fromEmail,
    to: email,
    subject: 'Your bookphysio.in verification code',
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:0 auto;padding:40px 24px;">
        <img src="${escapeHtml(appUrl)}/logo.png" alt="bookphysio.in" style="height:32px;margin-bottom:32px;" />
        <h2 style="color:#00766C;font-size:24px;font-weight:900;margin:0 0 12px;">Verify your email</h2>
        <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 8px;">
          Use the code below to verify your bookphysio.in provider account.
        </p>
        <p style="color:#666;font-size:13px;margin:0 0 28px;">
          This code expires in ${OTP_EXPIRY_MINUTES} minutes.
        </p>
        <div style="background:#F5F5F5;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
          <span style="font-size:40px;font-weight:900;letter-spacing:12px;color:#00766C;font-family:monospace;">
            ${code}
          </span>
        </div>
        <p style="color:#666;font-size:13px;line-height:1.6;margin:0 0 8px;">
          If you did not create a bookphysio.in provider account, you can safely ignore this email.
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
        <p style="color:#999;font-size:12px;margin:0;">bookphysio.in — Physiotherapy booking for India</p>
      </div>
    `,
  })

  if (sendError) {
    console.error('Resend send error:', sendError)
    // Clean up the orphaned OTP record so it cannot be verified
    const { error: cleanupError } = await supabaseAdmin.from('email_otps').delete().eq('id', inserted.id)
    if (cleanupError) console.error('email_otps cleanup failed:', cleanupError)
    return { ok: false, error: 'Failed to send verification email' }
  }

  return { ok: true }
}
