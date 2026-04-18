import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set')
}

const resend = new Resend(process.env.RESEND_API_KEY)

/** Escape HTML special characters to prevent injection in email templates. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Sanitize a string for use in email subject lines (strip CR/LF to prevent header injection). */
function sanitizeSubject(str: string): string {
  return str.replace(/[\r\n]+/g, ' ').trim()
}

export async function sendBookingConfirmation({
  to,
  patientName,
  providerName,
  appointmentDate,
  appointmentTime,
  visitType,
  amountInr,
}: {
  to: string
  patientName: string
  providerName: string
  appointmentDate: string
  appointmentTime: string
  visitType: string
  amountInr: number
}) {
  if (!process.env.RESEND_FROM_EMAIL) {
    throw new Error('RESEND_FROM_EMAIL is required to send emails')
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://bookphysio.in'
  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to,
    subject: `Appointment Confirmed — ${sanitizeSubject(providerName)}`,
    html: `
      <h2>Appointment Confirmed</h2>
      <p>Hi ${escapeHtml(patientName)},</p>
      <p>Your appointment with <strong>${escapeHtml(providerName)}</strong> is confirmed.</p>
      <ul>
        <li><strong>Date:</strong> ${escapeHtml(appointmentDate)}</li>
        <li><strong>Time:</strong> ${escapeHtml(appointmentTime)}</li>
        <li><strong>Type:</strong> ${escapeHtml(visitType)}</li>
        <li><strong>Fee:</strong> ₹${amountInr}</li>
      </ul>
      <p>You can manage your appointment at <a href="${appUrl}/appointments">bookphysio.in</a></p>
    `,
  })
}

export async function sendAppointmentReminder({
  to,
  patientName,
  providerName,
  appointmentDate,
  appointmentTime,
  visitType,
  appointmentId,
}: {
  to: string
  patientName: string
  providerName: string
  appointmentDate: string
  appointmentTime: string
  visitType: string
  appointmentId: string
}) {
  if (!process.env.RESEND_FROM_EMAIL) {
    throw new Error('RESEND_FROM_EMAIL is required to send emails')
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://bookphysio.in'
  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to,
    subject: `Reminder: Appointment with ${sanitizeSubject(providerName)} tomorrow`,
    html: `
      <h2>Appointment Reminder</h2>
      <p>Hi ${escapeHtml(patientName)},</p>
      <p>This is a reminder that your appointment with <strong>${escapeHtml(providerName)}</strong> is coming up.</p>
      <ul>
        <li><strong>Date:</strong> ${escapeHtml(appointmentDate)}</li>
        <li><strong>Time:</strong> ${escapeHtml(appointmentTime)}</li>
        <li><strong>Type:</strong> ${visitType === 'home_visit' ? 'Home Visit' : 'Clinic Visit'}</li>
      </ul>
      <p><a href="${appUrl}/patient/appointments/${encodeURIComponent(appointmentId)}">View appointment details</a></p>
    `,
  })
}

/** Shared branded HTML wrapper for all transactional auth emails. */
function renderAuthEmail({
  title,
  preheader,
  bodyHtml,
  cta,
}: {
  title: string
  preheader: string
  bodyHtml: string
  cta?: { label: string; url: string }
}): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://bookphysio.in'
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:#F7F8F9;font-family:Inter,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(preheader)}</div>
  <div style="max-width:480px;margin:40px auto;background:#fff;border-radius:12px;padding:40px 32px;box-shadow:0 1px 4px rgba(0,0,0,.06);">
    <img src="${escapeHtml(appUrl)}/logo.png" alt="bookphysio.in" style="height:28px;margin-bottom:28px;" />
    <h2 style="color:#00766C;font-size:22px;font-weight:900;margin:0 0 12px;">${escapeHtml(title)}</h2>
    ${bodyHtml}
    ${cta ? `<a href="${escapeHtml(cta.url)}" style="display:inline-block;background:#FF6B35;color:#fff;font-size:15px;font-weight:900;padding:14px 28px;border-radius:24px;text-decoration:none;margin:20px 0;">${escapeHtml(cta.label)}</a>` : ''}
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
    <p style="color:#999;font-size:12px;margin:0;">bookphysio.in — Physiotherapy booking for India</p>
  </div>
</body>
</html>`
}

export async function sendAdminNewProviderAlert({
  providerName,
  email,
  submittedAt,
}: {
  providerName: string
  email: string
  submittedAt: string
}) {
  const adminEmail = process.env.ADMIN_ALERT_EMAIL
  const fromEmail = process.env.RESEND_FROM_EMAIL
  if (!adminEmail || !fromEmail) return
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://bookphysio.in'

  return resend.emails.send({
    from: fromEmail,
    to: adminEmail,
    subject: `New provider application: ${sanitizeSubject(providerName)}`,
    html: renderAuthEmail({
      title: 'New Provider Application',
      preheader: `${providerName} has submitted a provider application for review.`,
      bodyHtml: `
        <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 16px;">
          A new physiotherapist has submitted an application and is awaiting review.
        </p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;color:#555;margin-bottom:16px;">
          <tr><td style="padding:6px 0;font-weight:600;width:120px;">Name</td><td>${escapeHtml(providerName)}</td></tr>
          <tr><td style="padding:6px 0;font-weight:600;">Email</td><td>${escapeHtml(email)}</td></tr>
          <tr><td style="padding:6px 0;font-weight:600;">Submitted</td><td>${escapeHtml(submittedAt)}</td></tr>
        </table>
      `,
      cta: { label: 'Review Application', url: `${appUrl}/admin/listings` },
    }),
  }).catch((e: unknown) => console.error('[resend] sendAdminNewProviderAlert failed:', e))
}

export async function sendReviewPrompt({
  to,
  patientName,
  providerName,
  appointmentId,
}: {
  to: string
  patientName: string
  providerName: string
  appointmentId: string
}) {
  if (!process.env.RESEND_FROM_EMAIL) {
    throw new Error('RESEND_FROM_EMAIL is required to send emails')
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://bookphysio.in'
  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to,
    subject: `How was your session with ${sanitizeSubject(providerName)}?`,
    html: `
      <h2>Share Your Experience</h2>
      <p>Hi ${escapeHtml(patientName)},</p>
      <p>We hope your session with <strong>${escapeHtml(providerName)}</strong> went well!</p>
      <p>Your feedback helps other patients find great care and helps providers improve.</p>
      <p><a href="${appUrl}/patient/appointments/${encodeURIComponent(appointmentId)}?review=true" style="background:#00766C;color:white;padding:12px 24px;border-radius:24px;text-decoration:none;display:inline-block;">Leave a Review</a></p>
      <p style="color:#666;font-size:13px;">This usually takes less than a minute.</p>
    `,
  })
}
