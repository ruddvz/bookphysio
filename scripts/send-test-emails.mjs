#!/usr/bin/env node
/**
 * Test email sender — fires all 7 transactional templates to a target address.
 *
 * Usage:
 *   RESEND_API_KEY=re_xxx RESEND_FROM_EMAIL=noreply@mail.bookphysio.in \
 *   node scripts/send-test-emails.mjs
 *
 * Or with a .env file in the project root:
 *   node scripts/send-test-emails.mjs
 */

import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '../.env')

// Load .env if present
if (existsSync(envPath)) {
  const lines = readFileSync(envPath, 'utf8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx < 0) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = val
  }
}

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'noreply@mail.bookphysio.in'
const TO_EMAIL = process.argv[2] ?? 'PVR6675@gmail.com'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://bookphysio.in'

if (!RESEND_API_KEY || RESEND_API_KEY === 're_xxxx') {
  console.error('❌  RESEND_API_KEY is not set. Add it to .env or export it before running.')
  process.exit(1)
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function authWrapper({ title, preheader, bodyHtml, cta }) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#F7F8F9;font-family:Inter,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;">${esc(preheader)}</div>
  <div style="max-width:480px;margin:40px auto;background:#fff;border-radius:12px;padding:40px 32px;box-shadow:0 1px 4px rgba(0,0,0,.06);">
    <img src="${esc(APP_URL)}/logo.png" alt="bookphysio.in" style="height:28px;margin-bottom:28px;" />
    <h2 style="color:#00766C;font-size:22px;font-weight:900;margin:0 0 12px;">${esc(title)}</h2>
    ${bodyHtml}
    ${cta ? `<a href="${esc(cta.url)}" style="display:inline-block;background:#FF6B35;color:#fff;font-size:15px;font-weight:900;padding:14px 28px;border-radius:24px;text-decoration:none;margin:20px 0;">${esc(cta.label)}</a>` : ''}
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
    <p style="color:#999;font-size:12px;margin:0;">bookphysio.in — Physiotherapy booking for India</p>
  </div>
</body>
</html>`
}

async function send({ subject, html, label }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_EMAIL, to: TO_EMAIL, subject, html }),
  })
  const data = await res.json()
  if (!res.ok) {
    console.error(`❌  [${label}] Failed:`, data)
  } else {
    console.log(`✅  [${label}] Sent → id: ${data.id}`)
  }
  return res.ok
}

// ─── Test data ────────────────────────────────────────────────────────────────

const PROVIDER = 'Dr. Priya Sharma'
const PATIENT = 'Rahul Verma'
const DATE = 'Tuesday, 29 April 2026'
const TIME = '10:30 AM IST'
const APPT_ID = 'test-appt-001'
const OTP_CODE = '482916'

// ─── 1. Booking Confirmation ──────────────────────────────────────────────────

await send({
  label: '1 · Booking Confirmation',
  subject: `Appointment Confirmed — ${PROVIDER}`,
  html: authWrapper({
    title: 'Appointment Confirmed',
    preheader: `Your appointment with ${PROVIDER} is confirmed.`,
    bodyHtml: `
      <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 16px;">Hi ${esc(PATIENT)},</p>
      <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 16px;">
        Your appointment with <strong>${esc(PROVIDER)}</strong> is confirmed.
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#555;margin-bottom:16px;">
        <tr><td style="padding:6px 0;font-weight:600;width:80px;">Date</td><td>${DATE}</td></tr>
        <tr><td style="padding:6px 0;font-weight:600;">Time</td><td>${TIME}</td></tr>
        <tr><td style="padding:6px 0;font-weight:600;">Type</td><td>Home Visit</td></tr>
        <tr><td style="padding:6px 0;font-weight:600;">Fee</td><td>₹800</td></tr>
      </table>
    `,
    cta: { label: 'View Appointment', url: `${APP_URL}/patient/appointments/${APPT_ID}` },
  }),
})

// ─── 2. Appointment Reminder ──────────────────────────────────────────────────

await send({
  label: '2 · Appointment Reminder',
  subject: `Reminder: Appointment with ${PROVIDER} tomorrow`,
  html: authWrapper({
    title: 'Appointment Reminder',
    preheader: `Don't forget — your appointment with ${PROVIDER} is coming up.`,
    bodyHtml: `
      <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 16px;">Hi ${esc(PATIENT)},</p>
      <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 16px;">
        This is a reminder that your appointment with <strong>${esc(PROVIDER)}</strong> is coming up.
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#555;margin-bottom:16px;">
        <tr><td style="padding:6px 0;font-weight:600;width:80px;">Date</td><td>${DATE}</td></tr>
        <tr><td style="padding:6px 0;font-weight:600;">Time</td><td>${TIME}</td></tr>
        <tr><td style="padding:6px 0;font-weight:600;">Type</td><td>Home Visit</td></tr>
      </table>
      <div style="background:#E6F4F3;border-radius:8px;padding:16px;margin-top:8px;font-size:13px;color:#00766C;">
        Tip: For home visits, ensure your address is up to date in your profile.
      </div>
    `,
    cta: { label: 'View Appointment Details', url: `${APP_URL}/patient/appointments/${APPT_ID}` },
  }),
})

// ─── 3. Email OTP Verification ────────────────────────────────────────────────

await send({
  label: '3 · Email OTP Verification',
  subject: 'Your bookphysio.in verification code',
  html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Verify your email</title></head>
<body style="margin:0;padding:0;background:#F7F8F9;font-family:Inter,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;">Your verification code expires in 10 minutes.</div>
  <div style="max-width:480px;margin:40px auto;background:#fff;border-radius:12px;padding:40px 32px;box-shadow:0 1px 4px rgba(0,0,0,.06);">
    <img src="${esc(APP_URL)}/logo.png" alt="bookphysio.in" style="height:32px;margin-bottom:32px;" />
    <h2 style="color:#00766C;font-size:24px;font-weight:900;margin:0 0 12px;">Verify your email</h2>
    <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 8px;">
      Use the code below to verify your bookphysio.in provider account.
    </p>
    <p style="color:#666;font-size:13px;margin:0 0 28px;">This code expires in 10 minutes.</p>
    <div style="background:#F5F5F5;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
      <span style="font-size:40px;font-weight:900;letter-spacing:12px;color:#00766C;font-family:monospace;">${OTP_CODE}</span>
    </div>
    <p style="color:#666;font-size:13px;line-height:1.6;margin:0 0 8px;">
      If you did not create a bookphysio.in provider account, you can safely ignore this email.
    </p>
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
    <p style="color:#999;font-size:12px;margin:0;">bookphysio.in — Physiotherapy booking for India</p>
  </div>
</body>
</html>`,
})

// ─── 4. Password Reset OTP ────────────────────────────────────────────────────

await send({
  label: '4 · Password Reset OTP',
  subject: 'Your bookphysio.in password reset code',
  html: authWrapper({
    title: 'Reset your password',
    preheader: 'Your 6-digit reset code expires in 15 minutes.',
    bodyHtml: `
      <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 16px;">
        Use the code below to reset your bookphysio.in password.
        If you did not request this, you can ignore this email.
      </p>
      <div style="background:#F5F5F5;border-radius:12px;padding:24px;text-align:center;margin-bottom:8px;">
        <span style="font-size:40px;font-weight:900;letter-spacing:12px;color:#00766C;font-family:monospace;">${OTP_CODE}</span>
      </div>
      <p style="color:#666;font-size:13px;margin:0 0 16px;">This code expires in 15 minutes.</p>
      <p style="color:#666;font-size:13px;margin:0;">
        If you didn't request a password reset, no action is needed. Your password won't change.
      </p>
    `,
  }),
})

// ─── 5. Admin — New Provider Alert ───────────────────────────────────────────

await send({
  label: '5 · Admin New Provider Alert',
  subject: `New provider application: ${PROVIDER}`,
  html: authWrapper({
    title: 'New Provider Application',
    preheader: `${PROVIDER} has submitted a provider application for review.`,
    bodyHtml: `
      <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 16px;">
        A new physiotherapist has submitted an application and is awaiting review.
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#555;margin-bottom:16px;">
        <tr><td style="padding:6px 0;font-weight:600;width:120px;">Name</td><td>${esc(PROVIDER)}</td></tr>
        <tr><td style="padding:6px 0;font-weight:600;">Email</td><td>priya.sharma@example.com</td></tr>
        <tr><td style="padding:6px 0;font-weight:600;">Submitted</td><td>${DATE} at ${TIME}</td></tr>
      </table>
    `,
    cta: { label: 'Review Application', url: `${APP_URL}/admin/listings` },
  }),
})

// ─── 6. Review Request ────────────────────────────────────────────────────────

await send({
  label: '6 · Review Request',
  subject: `How was your session with ${PROVIDER}?`,
  html: authWrapper({
    title: 'How was your session?',
    preheader: `Share your experience with ${PROVIDER} — it takes under a minute.`,
    bodyHtml: `
      <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 16px;">Hi ${esc(PATIENT)},</p>
      <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 16px;">
        We hope your session with <strong>${esc(PROVIDER)}</strong> went well!
      </p>
      <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 20px;">
        Your feedback helps other patients find great care and helps physiotherapists improve.
      </p>
      <div style="text-align:center;margin:20px 0;font-size:28px;color:#FF6B35;letter-spacing:4px;">★★★★★</div>
    `,
    cta: { label: 'Leave a Review', url: `${APP_URL}/patient/appointments/${APPT_ID}?review=true` },
  }),
})

// append subtext after cta — done inline below
await send({
  label: '6b · Review Request (with subtext)',
  subject: `[Preview] How was your session with ${PROVIDER}?`,
  html: authWrapper({
    title: 'How was your session?',
    preheader: `Share your experience with ${PROVIDER} — it takes under a minute.`,
    bodyHtml: `
      <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 16px;">Hi ${esc(PATIENT)},</p>
      <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 16px;">
        We hope your session with <strong>${esc(PROVIDER)}</strong> went well!
      </p>
      <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 20px;">
        Your feedback helps other patients find great care and helps physiotherapists improve.
      </p>
      <div style="text-align:center;margin:20px 0;font-size:28px;color:#FF6B35;letter-spacing:4px;">★★★★★</div>
      <a href="${esc(APP_URL)}/patient/appointments/${APPT_ID}?review=true" style="display:inline-block;background:#00766C;color:#fff;font-size:15px;font-weight:900;padding:14px 28px;border-radius:24px;text-decoration:none;margin:4px 0 8px;">Leave a Review</a>
      <p style="color:#666;font-size:13px;margin:0;">This usually takes less than a minute.</p>
    `,
  }),
})

// ─── 7. Admin Daily Summary ───────────────────────────────────────────────────

const mockSummaryHtml = `
  <p style="color:#333;font-size:15px;line-height:1.6;">
    Yesterday was a solid day for BookPhysio.in. Booking volume was above average with strong completion rates.
    Revenue targets are on track. One provider approval is pending admin action.
  </p>
  <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0;">
    <tr style="background:#F5F5F5;">
      <th style="text-align:left;padding:8px 12px;font-weight:700;">Metric</th>
      <th style="text-align:right;padding:8px 12px;font-weight:700;">Value</th>
    </tr>
    <tr><td style="padding:8px 12px;border-top:1px solid #eee;">Total Appointments</td><td style="text-align:right;padding:8px 12px;border-top:1px solid #eee;">24</td></tr>
    <tr><td style="padding:8px 12px;border-top:1px solid #eee;">Completed</td><td style="text-align:right;padding:8px 12px;border-top:1px solid #eee;">19</td></tr>
    <tr><td style="padding:8px 12px;border-top:1px solid #eee;">Cancelled</td><td style="text-align:right;padding:8px 12px;border-top:1px solid #eee;">3</td></tr>
    <tr><td style="padding:8px 12px;border-top:1px solid #eee;">No-shows</td><td style="text-align:right;padding:8px 12px;border-top:1px solid #eee;">2</td></tr>
    <tr><td style="padding:8px 12px;border-top:1px solid #eee;">Revenue</td><td style="text-align:right;padding:8px 12px;border-top:1px solid #eee;">₹15,200</td></tr>
    <tr><td style="padding:8px 12px;border-top:1px solid #eee;">New Patients</td><td style="text-align:right;padding:8px 12px;border-top:1px solid #eee;">7</td></tr>
    <tr><td style="padding:8px 12px;border-top:1px solid #eee;">Pending Approvals</td><td style="text-align:right;padding:8px 12px;border-top:1px solid #eee;">1</td></tr>
  </table>
  <div style="background:#FFF3E0;border-left:4px solid #FF6B35;padding:12px 16px;border-radius:4px;margin:16px 0;font-size:13px;color:#333;">
    ⚠️ Alert: 1 provider application pending review for over 48 hours.
  </div>
  <p style="color:#555;font-size:13px;line-height:1.6;margin:16px 0 0;">
    Recommendations: (1) Approve pending provider to increase supply. (2) Follow up on 2 no-show patients.
    (3) Completion rate of 79% is near target — monitor tomorrow.
  </p>
`

await send({
  label: '7 · Admin Daily Summary',
  subject: `BookPhysio Daily Digest — ${DATE}`,
  html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>BookPhysio Daily Digest</title></head>
<body style="margin:0;padding:0;background:#F7F8F9;font-family:Inter,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;">Your daily platform digest for ${DATE}.</div>
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;padding:40px 32px;box-shadow:0 1px 4px rgba(0,0,0,.06);">
    <img src="${esc(APP_URL)}/logo.png" alt="bookphysio.in" style="height:28px;margin-bottom:28px;" />
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:20px;">
      <h2 style="color:#00766C;font-size:22px;font-weight:900;margin:0;">BookPhysio Daily Digest</h2>
      <span style="background:#E6F4F3;color:#00766C;border-radius:24px;padding:4px 12px;font-size:13px;font-weight:700;">Health Score: 82/100</span>
    </div>
    <p style="color:#666;font-size:13px;margin:0 0 20px;">${DATE}</p>
    ${mockSummaryHtml}
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
    <p style="color:#999;font-size:12px;margin:0;">bookphysio.in — Internal Operations Report — Do not forward</p>
  </div>
</body>
</html>`,
})

console.log('\nDone. Check your inbox at', TO_EMAIL)
