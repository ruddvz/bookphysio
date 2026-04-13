import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('RESEND_API_KEY is required in production')
  }
  console.warn('WARNING: RESEND_API_KEY is not set. Email features will fail.')
}

const resend = new Resend(process.env.RESEND_API_KEY ?? '')

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
  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
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
    subject: `Reminder: Appointment with ${providerName} tomorrow`,
    html: `
      <h2>Appointment Reminder</h2>
      <p>Hi ${patientName},</p>
      <p>This is a reminder that your appointment with <strong>${providerName}</strong> is coming up.</p>
      <ul>
        <li><strong>Date:</strong> ${appointmentDate}</li>
        <li><strong>Time:</strong> ${appointmentTime}</li>
        <li><strong>Type:</strong> ${visitType === 'home_visit' ? 'Home Visit' : 'Clinic Visit'}</li>
      </ul>
      <p><a href="${appUrl}/patient/appointments/${appointmentId}">View appointment details</a></p>
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
  if (!process.env.RESEND_FROM_EMAIL) {
    throw new Error('RESEND_FROM_EMAIL is required to send emails')
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://bookphysio.in'
  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to,
    subject: `How was your session with ${providerName}?`,
    html: `
      <h2>Share Your Experience</h2>
      <p>Hi ${patientName},</p>
      <p>We hope your session with <strong>${providerName}</strong> went well!</p>
      <p>Your feedback helps other patients find great care and helps providers improve.</p>
      <p><a href="${appUrl}/patient/appointments/${appointmentId}?review=true" style="background:#00766C;color:white;padding:12px 24px;border-radius:24px;text-decoration:none;display:inline-block;">Leave a Review</a></p>
      <p style="color:#666;font-size:13px;">This usually takes less than a minute.</p>
    `,
  })
}
