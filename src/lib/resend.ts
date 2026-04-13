import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY && process.env.NODE_ENV === 'production') {
  throw new Error(
    '[resend] RESEND_API_KEY must be set in production.'
  )
}

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder-resend-key')

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
  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'noreply@bookphysio.in',
    to,
    subject: `Appointment Confirmed — ${providerName}`,
    html: `
      <h2>Appointment Confirmed</h2>
      <p>Hi ${patientName},</p>
      <p>Your appointment with <strong>${providerName}</strong> is confirmed.</p>
      <ul>
        <li><strong>Date:</strong> ${appointmentDate}</li>
        <li><strong>Time:</strong> ${appointmentTime}</li>
        <li><strong>Type:</strong> ${visitType}</li>
        <li><strong>Fee:</strong> ₹${amountInr}</li>
      </ul>
      <p>You can manage your appointment at <a href="${process.env.NEXT_PUBLIC_APP_URL}/appointments">bookphysio.in</a></p>
    `,
  })
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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bookphysio.in'
  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'noreply@bookphysio.in',
    to,
    subject: `How was your session with ${providerName}?`,
    html: `
      <div style="font-family: Inter, system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
        <h2 style="color: #00766C; font-size: 24px; margin-bottom: 8px;">How was your visit?</h2>
        <p style="color: #333; font-size: 16px; line-height: 1.6;">Hi ${patientName},</p>
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          We hope your session with <strong>${providerName}</strong> went well.
          Your feedback helps other patients find the right physiotherapist and helps providers improve their care.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${appUrl}/patient/appointments/${appointmentId}?review=true"
             style="display: inline-block; background: #00766C; color: white; padding: 14px 32px; border-radius: 24px; text-decoration: none; font-weight: 700; font-size: 15px;">
            Leave a review
          </a>
        </div>
        <p style="color: #999; font-size: 13px; text-align: center;">
          It only takes a minute and makes a big difference.
        </p>
      </div>
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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bookphysio.in'
  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'noreply@bookphysio.in',
    to,
    subject: `Reminder: Session with ${providerName} tomorrow`,
    html: `
      <div style="font-family: Inter, system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
        <h2 style="color: #00766C; font-size: 24px; margin-bottom: 8px;">Your session is tomorrow</h2>
        <p style="color: #333; font-size: 16px; line-height: 1.6;">Hi ${patientName},</p>
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          This is a reminder about your upcoming appointment:
        </p>
        <div style="background: #E6F4F3; border-radius: 16px; padding: 20px; margin: 20px 0;">
          <p style="margin: 4px 0; color: #00766C; font-weight: 700; font-size: 18px;">${providerName}</p>
          <p style="margin: 4px 0; color: #333;">${appointmentDate} at ${appointmentTime}</p>
          <p style="margin: 4px 0; color: #666; font-size: 14px;">${visitType === 'home_visit' ? 'Home Visit' : 'In-Clinic Visit'}</p>
        </div>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${appUrl}/patient/appointments/${appointmentId}"
             style="display: inline-block; background: #00766C; color: white; padding: 14px 32px; border-radius: 24px; text-decoration: none; font-weight: 700; font-size: 15px;">
            View appointment details
          </a>
        </div>
      </div>
    `,
  })
}
