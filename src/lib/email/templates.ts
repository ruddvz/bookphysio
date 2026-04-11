// BookPhysio.in — Transactional email HTML templates
// From: noreply@mail.bookphysio.in
// All amounts in ₹ (integer rupees). All dates in en-IN locale.

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://bookphysio.in'

// ─── Shared layout ───────────────────────────────────────────────────────────

function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#F7F8F9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F8F9;padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

      <!-- Header -->
      <tr>
        <td style="background:#0B3B32;border-radius:8px 8px 0 0;padding:24px 32px;">
          <a href="${APP_URL}" style="text-decoration:none;">
            <span style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">BookPhysio<span style="color:#12B3A0;">.in</span></span>
          </a>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="background:#ffffff;padding:32px;border-left:1px solid #EBE1D2;border-right:1px solid #EBE1D2;">
          ${body}
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#FBF9F4;border:1px solid #EBE1D2;border-top:none;border-radius:0 0 8px 8px;padding:20px 32px;">
          <p style="margin:0 0 8px;font-size:12px;color:#616B68;line-height:1.6;">
            Need help? Reply to this email or reach us at
            <a href="mailto:help@bookphysio.in" style="color:#0B3B32;text-decoration:none;">help@bookphysio.in</a>
          </p>
          <p style="margin:0;font-size:12px;color:#616B68;line-height:1.6;">
            <a href="${APP_URL}" style="color:#0B3B32;text-decoration:none;">bookphysio.in</a>
            &nbsp;·&nbsp;
            <a href="${APP_URL}/privacy" style="color:#0B3B32;text-decoration:none;">Privacy</a>
            &nbsp;·&nbsp;
            <a href="${APP_URL}/terms" style="color:#0B3B32;text-decoration:none;">Terms</a>
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`
}

function heading(text: string): string {
  return `<h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0B3B32;line-height:1.3;">${text}</h1>`
}

function para(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;color:#333333;line-height:1.6;">${text}</p>`
}

function muted(text: string): string {
  return `<p style="margin:0 0 16px;font-size:14px;color:#616B68;line-height:1.6;">${text}</p>`
}

function ctaButton(label: string, href: string): string {
  return `<table cellpadding="0" cellspacing="0" style="margin:8px 0 24px;">
    <tr>
      <td style="background:#FF6B35;border-radius:24px;">
        <a href="${href}" style="display:inline-block;padding:12px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">${label}</a>
      </td>
    </tr>
  </table>`
}

function secondaryButton(label: string, href: string): string {
  return `<table cellpadding="0" cellspacing="0" style="margin:8px 0 24px;">
    <tr>
      <td style="background:#0B3B32;border-radius:24px;">
        <a href="${href}" style="display:inline-block;padding:12px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">${label}</a>
      </td>
    </tr>
  </table>`
}

function detailCard(rows: Array<[string, string]>): string {
  const rowsHtml = rows.map(([label, value]) => `
    <tr>
      <td style="padding:10px 16px;font-size:13px;color:#616B68;white-space:nowrap;border-bottom:1px solid #EBE1D2;">${label}</td>
      <td style="padding:10px 16px;font-size:14px;color:#0B3B32;font-weight:600;border-bottom:1px solid #EBE1D2;">${value}</td>
    </tr>`).join('')

  return `<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #EBE1D2;border-radius:8px;margin:0 0 24px;overflow:hidden;">
    ${rowsHtml}
  </table>`
}

function divider(): string {
  return `<hr style="border:none;border-top:1px solid #EBE1D2;margin:24px 0;" />`
}

function badge(text: string, color: string = '#12B3A0'): string {
  return `<span style="display:inline-block;background:${color}1A;color:${color};border:1px solid ${color}40;border-radius:20px;padding:3px 12px;font-size:12px;font-weight:600;">${text}</span>`
}

// ─── Templates ───────────────────────────────────────────────────────────────

export interface BookingConfirmationData {
  patientName: string
  providerName: string
  appointmentDate: string
  appointmentTime: string
  visitType: string
  amountInr: number
  appointmentId: string
}

export function bookingConfirmationTemplate(data: BookingConfirmationData): { subject: string; html: string } {
  const visitLabel = data.visitType === 'home_visit' ? 'Home Visit' : 'In-Clinic'
  const manageUrl = `${APP_URL}/patient/appointments/${data.appointmentId}`

  const body = `
    ${heading('Your appointment is confirmed')}
    ${badge('Confirmed', '#12B3A0')}
    <br /><br />
    ${para(`Hi <strong>${data.patientName}</strong>,`)}
    ${para(`Great news — your session with <strong>${data.providerName}</strong> is booked and confirmed.`)}
    ${detailCard([
      ['Physiotherapist', data.providerName],
      ['Date', data.appointmentDate],
      ['Time', data.appointmentTime],
      ['Visit Type', visitLabel],
      ['Amount Paid', `₹${data.amountInr}`],
    ])}
    ${ctaButton('View Appointment', manageUrl)}
    ${divider()}
    ${muted('You can reschedule or cancel up to 2 hours before your appointment from your dashboard.')}
    ${muted('For any changes or questions, contact us at <a href="mailto:help@bookphysio.in" style="color:#0B3B32;">help@bookphysio.in</a> or <a href="mailto:book@bookphysio.in" style="color:#0B3B32;">book@bookphysio.in</a>.')}
  `
  return {
    subject: `Appointment Confirmed — ${data.providerName} on ${data.appointmentDate}`,
    html: layout('Appointment Confirmed — BookPhysio.in', body),
  }
}

// ─────────────────────────────────────────────────────────────────────────────

export interface ProviderNewBookingData {
  providerName: string
  patientName: string
  appointmentDate: string
  appointmentTime: string
  visitType: string
  amountInr: number
  appointmentId: string
}

export function providerNewBookingTemplate(data: ProviderNewBookingData): { subject: string; html: string } {
  const visitLabel = data.visitType === 'home_visit' ? 'Home Visit' : 'In-Clinic'
  const dashUrl = `${APP_URL}/provider/appointments`

  const body = `
    ${heading('New appointment booked')}
    ${badge('New Booking', '#0B3B32')}
    <br /><br />
    ${para(`Hi <strong>${data.providerName}</strong>,`)}
    ${para(`A patient has booked a session with you. Here are the details:`)}
    ${detailCard([
      ['Patient', data.patientName],
      ['Date', data.appointmentDate],
      ['Time', data.appointmentTime],
      ['Visit Type', visitLabel],
      ['Fee', `₹${data.amountInr}`],
    ])}
    ${secondaryButton('View in Dashboard', dashUrl)}
    ${divider()}
    ${muted('Log in to your provider dashboard to view full patient details, add clinical notes, and manage your schedule.')}
    ${muted('Questions? Contact <a href="mailto:support@bookphysio.in" style="color:#0B3B32;">support@bookphysio.in</a>')}
  `
  return {
    subject: `New Booking — ${data.patientName} on ${data.appointmentDate}`,
    html: layout('New Appointment — BookPhysio.in', body),
  }
}

// ─────────────────────────────────────────────────────────────────────────────

export interface AppointmentCancellationData {
  patientName: string
  providerName: string
  appointmentDate: string
  appointmentTime: string
  visitType: string
}

export function appointmentCancellationTemplate(data: AppointmentCancellationData): { subject: string; html: string } {
  const visitLabel = data.visitType === 'home_visit' ? 'Home Visit' : 'In-Clinic'
  const searchUrl = `${APP_URL}/search`

  const body = `
    ${heading('Appointment cancelled')}
    ${badge('Cancelled', '#616B68')}
    <br /><br />
    ${para(`Hi <strong>${data.patientName}</strong>,`)}
    ${para(`Your appointment with <strong>${data.providerName}</strong> has been cancelled.`)}
    ${detailCard([
      ['Physiotherapist', data.providerName],
      ['Date', data.appointmentDate],
      ['Time', data.appointmentTime],
      ['Visit Type', visitLabel],
    ])}
    ${ctaButton('Book a New Session', searchUrl)}
    ${divider()}
    ${muted('If you did not cancel this appointment or need assistance with a refund, please contact us at <a href="mailto:help@bookphysio.in" style="color:#0B3B32;">help@bookphysio.in</a>.')}
  `
  return {
    subject: `Appointment Cancelled — ${data.providerName} on ${data.appointmentDate}`,
    html: layout('Appointment Cancelled — BookPhysio.in', body),
  }
}

// ─────────────────────────────────────────────────────────────────────────────

export interface WelcomePatientData {
  patientName: string
}

export function welcomePatientTemplate(data: WelcomePatientData): { subject: string; html: string } {
  const searchUrl = `${APP_URL}/search`
  const howUrl = `${APP_URL}/how-it-works`

  const body = `
    ${heading(`Welcome to BookPhysio.in, ${data.patientName}!`)}
    <br />
    ${para('Your account is ready. You can now search for verified physiotherapists near you and book in-clinic or home-visit sessions in minutes.')}
    ${ctaButton('Find a Physiotherapist', searchUrl)}
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td width="32" valign="top" style="padding-top:2px;"><span style="font-size:20px;">🔍</span></td>
        <td style="padding-left:12px;">
          <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#0B3B32;">Search by specialty or city</p>
          <p style="margin:0;font-size:13px;color:#616B68;">Filter by visit type, availability, and more.</p>
        </td>
      </tr>
      <tr><td colspan="2" style="height:16px;"></td></tr>
      <tr>
        <td width="32" valign="top" style="padding-top:2px;"><span style="font-size:20px;">📅</span></td>
        <td style="padding-left:12px;">
          <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#0B3B32;">Book a slot instantly</p>
          <p style="margin:0;font-size:13px;color:#616B68;">Pick your time, pay securely, done.</p>
        </td>
      </tr>
      <tr><td colspan="2" style="height:16px;"></td></tr>
      <tr>
        <td width="32" valign="top" style="padding-top:2px;"><span style="font-size:20px;">🏥</span></td>
        <td style="padding-left:12px;">
          <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#0B3B32;">In-clinic or home visit</p>
          <p style="margin:0;font-size:13px;color:#616B68;">Attend at the clinic or get treated at home.</p>
        </td>
      </tr>
    </table>
    ${muted(`<a href="${howUrl}" style="color:#0B3B32;">Learn how it works →</a>`)}
    ${divider()}
    ${muted('For any help, write to us at <a href="mailto:help@bookphysio.in" style="color:#0B3B32;">help@bookphysio.in</a> or <a href="mailto:info@bookphysio.in" style="color:#0B3B32;">info@bookphysio.in</a>.')}
  `
  return {
    subject: 'Welcome to BookPhysio.in — your physiotherapy platform',
    html: layout('Welcome to BookPhysio.in', body),
  }
}

// ─────────────────────────────────────────────────────────────────────────────

export interface WelcomeProviderData {
  providerName: string
}

export function welcomeProviderTemplate(data: WelcomeProviderData): { subject: string; html: string } {
  const dashUrl = `${APP_URL}/provider`

  const body = `
    ${heading(`Welcome to BookPhysio.in, ${data.providerName}!`)}
    <br />
    ${para('Thank you for registering as a physiotherapist on BookPhysio.in. Your application is under review.')}
    ${para('Our team will verify your credentials and activate your listing within <strong>1–2 business days</strong>. You\'ll receive a confirmation email once your profile goes live.')}
    ${secondaryButton('View Your Dashboard', dashUrl)}
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td width="32" valign="top" style="padding-top:2px;"><span style="font-size:20px;">✅</span></td>
        <td style="padding-left:12px;">
          <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#0B3B32;">What happens next</p>
          <p style="margin:0;font-size:13px;color:#616B68;">Our team reviews your ICP registration and credentials.</p>
        </td>
      </tr>
      <tr><td colspan="2" style="height:16px;"></td></tr>
      <tr>
        <td width="32" valign="top" style="padding-top:2px;"><span style="font-size:20px;">📣</span></td>
        <td style="padding-left:12px;">
          <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#0B3B32;">Approval email</p>
          <p style="margin:0;font-size:13px;color:#616B68;">Once approved, your profile goes live and patients can book you.</p>
        </td>
      </tr>
      <tr><td colspan="2" style="height:16px;"></td></tr>
      <tr>
        <td width="32" valign="top" style="padding-top:2px;"><span style="font-size:20px;">💰</span></td>
        <td style="padding-left:12px;">
          <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#0B3B32;">Payouts in INR</p>
          <p style="margin:0;font-size:13px;color:#616B68;">Payments collected and settled via Razorpay directly to your bank.</p>
        </td>
      </tr>
    </table>
    ${divider()}
    ${muted('Questions about your application? Write to <a href="mailto:partners@bookphysio.in" style="color:#0B3B32;">partners@bookphysio.in</a> or <a href="mailto:join@bookphysio.in" style="color:#0B3B32;">join@bookphysio.in</a>.')}
  `
  return {
    subject: 'Application received — BookPhysio.in',
    html: layout('Application Received — BookPhysio.in', body),
  }
}

// ─────────────────────────────────────────────────────────────────────────────

export interface ProviderApprovedData {
  providerName: string
}

export function providerApprovedTemplate(data: ProviderApprovedData): { subject: string; html: string } {
  const dashUrl = `${APP_URL}/provider`
  const scheduleUrl = `${APP_URL}/provider/schedule`

  const body = `
    ${heading('Your listing is live!')}
    ${badge('Approved', '#12B3A0')}
    <br /><br />
    ${para(`Congratulations <strong>${data.providerName}</strong>!`)}
    ${para('Your profile has been verified and is now live on BookPhysio.in. Patients in your city can find and book you right now.')}
    ${ctaButton('Go to Your Dashboard', dashUrl)}
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td width="32" valign="top" style="padding-top:2px;"><span style="font-size:20px;">🗓️</span></td>
        <td style="padding-left:12px;">
          <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#0B3B32;">Set your availability</p>
          <p style="margin:0;font-size:13px;color:#616B68;">Add your weekly slots so patients can book you.</p>
        </td>
      </tr>
      <tr><td colspan="2" style="height:16px;"></td></tr>
      <tr>
        <td width="32" valign="top" style="padding-top:2px;"><span style="font-size:20px;">🔔</span></td>
        <td style="padding-left:12px;">
          <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#0B3B32;">Get notified on new bookings</p>
          <p style="margin:0;font-size:13px;color:#616B68;">You'll receive an email each time a patient books a session.</p>
        </td>
      </tr>
      <tr><td colspan="2" style="height:16px;"></td></tr>
      <tr>
        <td width="32" valign="top" style="padding-top:2px;"><span style="font-size:20px;">📋</span></td>
        <td style="padding-left:12px;">
          <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#0B3B32;">Manage appointments</p>
          <p style="margin:0;font-size:13px;color:#616B68;">Add clinical notes, view patient history, and track earnings.</p>
        </td>
      </tr>
    </table>
    ${muted(`<a href="${scheduleUrl}" style="color:#0B3B32;font-weight:600;">Set up your schedule now →</a>`)}
    ${divider()}
    ${muted('Need help getting started? Write to <a href="mailto:partners@bookphysio.in" style="color:#0B3B32;">partners@bookphysio.in</a>.')}
  `
  return {
    subject: 'You\'re live on BookPhysio.in — your profile is approved',
    html: layout('Profile Approved — BookPhysio.in', body),
  }
}
