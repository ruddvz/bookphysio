import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

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
    from: process.env.RESEND_FROM_EMAIL!,
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
