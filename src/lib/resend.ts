import { Resend } from 'resend'
import {
  bookingConfirmationTemplate,
  providerNewBookingTemplate,
  appointmentCancellationTemplate,
  welcomePatientTemplate,
  welcomeProviderTemplate,
  providerApprovedTemplate,
  type BookingConfirmationData,
  type ProviderNewBookingData,
  type AppointmentCancellationData,
  type WelcomePatientData,
  type WelcomeProviderData,
  type ProviderApprovedData,
} from './email/templates'

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder-resend-key')
const FROM = process.env.RESEND_FROM_EMAIL ?? 'noreply@mail.bookphysio.in'

// All email sends are best-effort — callers should wrap in try/catch.

export async function sendBookingConfirmation(to: string, data: BookingConfirmationData) {
  const { subject, html } = bookingConfirmationTemplate(data)
  return resend.emails.send({ from: FROM, to, subject, html })
}

export async function sendProviderNewBooking(to: string, data: ProviderNewBookingData) {
  const { subject, html } = providerNewBookingTemplate(data)
  return resend.emails.send({ from: FROM, to, subject, html })
}

export async function sendAppointmentCancellation(to: string, data: AppointmentCancellationData) {
  const { subject, html } = appointmentCancellationTemplate(data)
  return resend.emails.send({ from: FROM, to, subject, html })
}

export async function sendWelcomePatient(to: string, data: WelcomePatientData) {
  const { subject, html } = welcomePatientTemplate(data)
  return resend.emails.send({ from: FROM, to, subject, html })
}

export async function sendWelcomeProvider(to: string, data: WelcomeProviderData) {
  const { subject, html } = welcomeProviderTemplate(data)
  return resend.emails.send({ from: FROM, to, subject, html })
}

export async function sendProviderApproved(to: string, data: ProviderApprovedData) {
  const { subject, html } = providerApprovedTemplate(data)
  return resend.emails.send({ from: FROM, to, subject, html })
}
