// BookPhysio.in — Transactional email HTML templates
// From: noreply@mail.bookphysio.in
// All amounts in ₹ (integer rupees). All dates in en-IN locale.
//
// Design tokens (April 2026 refresh — matches live site):
//   bp-primary  #0B3B32  Deep Pine   — headings, sidebar
//   bp-accent   #12B3A0  Active Teal — icons, interactive states
//   bp-surface  #FBF9F4  Parchment   — page bg, muted sections
//   bp-border   #EBE1D2  Golden Sand — card borders, dividers
//   bp-body     #616B68  Warm Smoke  — secondary text
//   cta-orange  #FF6B35              — primary CTA buttons only
//
// Logo: /logo.png — dark wordmark on transparent bg.
// Served via absolute URL (works in all email clients without CSS filter hacks).

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://bookphysio.in'
const LOGO_URL = `${APP_URL}/logo.png`

// ─── Shared layout ───────────────────────────────────────────────────────────
// Structure:
//   4px teal accent bar (top)
//   White header with actual logo image
//   White body card
//   Parchment footer

function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background:#F7F8F9;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F7F8F9;padding:24px 16px 40px;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

      <!-- Teal accent bar -->
      <tr>
        <td style="background:#12B3A0;height:4px;border-radius:8px 8px 0 0;font-size:0;line-height:0;">&nbsp;</td>
      </tr>

      <!-- Header: white bg, actual logo -->
      <tr>
        <td style="background:#ffffff;padding:20px 32px 16px;border-left:1px solid #EBE1D2;border-right:1px solid #EBE1D2;border-bottom:1px solid #EBE1D2;">
          <a href="${APP_URL}" style="text-decoration:none;display:inline-block;">
            <img src="${LOGO_URL}" alt="BookPhysio.in" width="180" height="44" style="display:block;max-width:180px;height:auto;border:0;" />
          </a>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="background:#ffffff;padding:32px 32px 24px;border-left:1px solid #EBE1D2;border-right:1px solid #EBE1D2;">
          ${body}
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#FBF9F4;border:1px solid #EBE1D2;border-top:none;border-radius:0 0 8px 8px;padding:20px 32px;">
          <p style="margin:0 0 6px;font-size:12px;color:#616B68;line-height:1.7;">
            Need help? Contact us at
            <a href="mailto:help@bookphysio.in" style="color:#0B3B32;text-decoration:underline;">help@bookphysio.in</a>
          </p>
          <p style="margin:0 0 12px;font-size:12px;color:#616B68;line-height:1.7;">
            This email was sent from <strong>noreply@mail.bookphysio.in</strong>. Please do not reply directly to this address.
          </p>
          <p style="margin:0;font-size:12px;color:#616B68;line-height:1.7;">
            <a href="${APP_URL}" style="color:#616B68;text-decoration:underline;">bookphysio.in</a>
            &nbsp;&middot;&nbsp;
            <a href="${APP_URL}/privacy" style="color:#616B68;text-decoration:underline;">Privacy Policy</a>
            &nbsp;&middot;&nbsp;
            <a href="${APP_URL}/terms" style="color:#616B68;text-decoration:underline;">Terms of Service</a>
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`
}

// ─── Building blocks ─────────────────────────────────────────────────────────

function heading(text: string): string {
  return `<h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#0B3B32;line-height:1.3;">${text}</h1>`
}

function subheading(text: string): string {
  return `<h2 style="margin:0 0 16px;font-size:17px;font-weight:600;color:#0B3B32;line-height:1.4;">${text}</h2>`
}

function para(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;color:#333333;line-height:1.7;">${text}</p>`
}

function muted(text: string): string {
  return `<p style="margin:0 0 12px;font-size:13px;color:#616B68;line-height:1.7;">${text}</p>`
}

function ctaButton(label: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0 24px;">
    <tr>
      <td style="background:#FF6B35;border-radius:24px;mso-padding-alt:0;">
        <!--[if mso]><i style="letter-spacing:28px;mso-font-width:-100%;mso-text-raise:30pt;">&nbsp;</i><![endif]-->
        <a href="${href}" target="_blank" style="display:inline-block;padding:13px 30px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:24px;font-family:Arial,Helvetica,sans-serif;">${label}</a>
        <!--[if mso]><i style="letter-spacing:28px;mso-font-width:-100%;">&nbsp;</i><![endif]-->
      </td>
    </tr>
  </table>`
}

function secondaryButton(label: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0 24px;">
    <tr>
      <td style="background:#0B3B32;border-radius:24px;mso-padding-alt:0;">
        <!--[if mso]><i style="letter-spacing:28px;mso-font-width:-100%;mso-text-raise:30pt;">&nbsp;</i><![endif]-->
        <a href="${href}" target="_blank" style="display:inline-block;padding:13px 30px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:24px;font-family:Arial,Helvetica,sans-serif;">${label}</a>
        <!--[if mso]><i style="letter-spacing:28px;mso-font-width:-100%;">&nbsp;</i><![endif]-->
      </td>
    </tr>
  </table>`
}

function detailCard(rows: Array<[string, string]>): string {
  const rowsHtml = rows.map(([label, value], i) => {
    const borderBottom = i < rows.length - 1 ? 'border-bottom:1px solid #EBE1D2;' : ''
    return `<tr>
      <td style="padding:11px 16px;font-size:13px;color:#616B68;white-space:nowrap;${borderBottom}width:40%;">${label}</td>
      <td style="padding:11px 16px;font-size:14px;color:#0B3B32;font-weight:600;${borderBottom}">${value}</td>
    </tr>`
  }).join('')

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #EBE1D2;border-radius:8px;margin:0 0 24px;overflow:hidden;background:#FBF9F4;">
    ${rowsHtml}
  </table>`
}

function badge(text: string, color: string, bgColor: string): string {
  return `<span style="display:inline-block;background:${bgColor};color:${color};border-radius:20px;padding:4px 14px;font-size:12px;font-weight:700;font-family:Arial,Helvetica,sans-serif;letter-spacing:0.3px;">${text}</span>`
}

function divider(): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;">
    <tr><td style="border-top:1px solid #EBE1D2;font-size:0;line-height:0;">&nbsp;</td></tr>
  </table>`
}

function featureRow(emoji: string, title: string, desc: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;">
    <tr>
      <td width="36" valign="top" style="font-size:20px;padding-top:1px;">${emoji}</td>
      <td style="padding-left:10px;">
        <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#0B3B32;">${title}</p>
        <p style="margin:0;font-size:13px;color:#616B68;line-height:1.6;">${desc}</p>
      </td>
    </tr>
  </table>`
}

// ─── 1. Booking Confirmation (Patient) ───────────────────────────────────────

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
    <p style="margin:6px 0 20px;">${badge('Confirmed', '#0B3B32', '#E6F7F5')}</p>
    ${para(`Hi <strong>${data.patientName}</strong>,`)}
    ${para(`Your session with <strong>${data.providerName}</strong> is booked and confirmed. See you there!`)}
    ${detailCard([
      ['Physiotherapist', data.providerName],
      ['Date', data.appointmentDate],
      ['Time', data.appointmentTime],
      ['Visit Type', visitLabel],
      ['Amount Paid', `&#8377;${data.amountInr}`],
    ])}
    ${ctaButton('View My Appointment', manageUrl)}
    ${divider()}
    ${subheading('What to expect')}
    ${featureRow('📋', 'Bring a valid ID', 'For in-clinic visits, please arrive 5 minutes early.')}
    ${featureRow('📍', 'Address in your dashboard', 'Clinic location and directions are in your appointment detail page.')}
    ${featureRow('❌', 'Need to cancel?', 'You can cancel up to 2 hours before your appointment from your dashboard.')}
    ${divider()}
    ${muted('For changes or questions, write to <a href="mailto:book@bookphysio.in" style="color:#0B3B32;">book@bookphysio.in</a> or <a href="mailto:help@bookphysio.in" style="color:#0B3B32;">help@bookphysio.in</a>.')}
  `
  return {
    subject: `Appointment Confirmed \u2014 ${data.providerName} on ${data.appointmentDate}`,
    html: layout('Appointment Confirmed \u2014 BookPhysio.in', body),
  }
}

// ─── 2. Provider New Booking Notification ────────────────────────────────────

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
    ${heading('You have a new booking')}
    <p style="margin:6px 0 20px;">${badge('New Booking', '#0B3B32', '#E6F7F5')}</p>
    ${para(`Hi <strong>${data.providerName}</strong>,`)}
    ${para('A patient has booked a session with you. Here are the details:')}
    ${detailCard([
      ['Patient', data.patientName],
      ['Date', data.appointmentDate],
      ['Time', data.appointmentTime],
      ['Visit Type', visitLabel],
      ['Fee', `&#8377;${data.amountInr}`],
    ])}
    ${secondaryButton('View in Dashboard', dashUrl)}
    ${divider()}
    ${muted('Log in to your provider dashboard to view patient details, add clinical notes, and manage your schedule.')}
    ${muted('Questions? Write to <a href="mailto:support@bookphysio.in" style="color:#0B3B32;">support@bookphysio.in</a>')}
  `
  return {
    subject: `New Booking \u2014 ${data.patientName} on ${data.appointmentDate}`,
    html: layout('New Appointment \u2014 BookPhysio.in', body),
  }
}

// ─── 3. Appointment Cancellation (Patient) ───────────────────────────────────

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
    ${heading('Your appointment has been cancelled')}
    <p style="margin:6px 0 20px;">${badge('Cancelled', '#616B68', '#F5F5F5')}</p>
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
    ${muted('If you did not request this cancellation, or if you need help with a refund, please contact us immediately at <a href="mailto:help@bookphysio.in" style="color:#0B3B32;">help@bookphysio.in</a>.')}
  `
  return {
    subject: `Appointment Cancelled \u2014 ${data.providerName} on ${data.appointmentDate}`,
    html: layout('Appointment Cancelled \u2014 BookPhysio.in', body),
  }
}

// ─── 4. Welcome — Patient ────────────────────────────────────────────────────

export interface WelcomePatientData {
  patientName: string
}

export function welcomePatientTemplate(data: WelcomePatientData): { subject: string; html: string } {
  const searchUrl = `${APP_URL}/search`
  const howUrl = `${APP_URL}/how-it-works`

  const body = `
    ${heading(`Welcome to BookPhysio.in\u2019s`)}
    ${subheading(`Hi ${data.patientName}, your account is ready`)}
    ${para('You can now search for verified physiotherapists near you and book in-clinic or home-visit sessions in minutes.')}
    ${ctaButton('Find a Physiotherapist', searchUrl)}
    ${divider()}
    ${featureRow('🔍', 'Search by specialty or city', 'Filter by visit type, availability, and more.')}
    ${featureRow('📅', 'Book a slot instantly', 'Pick your time, pay securely via UPI or card, and you\'re confirmed.')}
    ${featureRow('🏥', 'In-clinic or home visit', 'Attend at the clinic or get treated at home \u2014 your choice.')}
    ${featureRow('⭐', 'Leave a review', 'After your session, share your experience to help others.')}
    ${divider()}
    ${muted(`<a href="${howUrl}" style="color:#0B3B32;font-weight:600;">See how BookPhysio.in works \u2192</a>`)}
    ${muted('For any help, write to <a href="mailto:help@bookphysio.in" style="color:#0B3B32;">help@bookphysio.in</a> or <a href="mailto:info@bookphysio.in" style="color:#0B3B32;">info@bookphysio.in</a>.')}
  `
  return {
    subject: `Welcome to BookPhysio.in \u2014 find your physiotherapist`,
    html: layout('Welcome to BookPhysio.in', body),
  }
}

// ─── 5. Welcome — Provider / Partner ─────────────────────────────────────────

export interface WelcomeProviderData {
  providerName: string
}

export function welcomeProviderTemplate(data: WelcomeProviderData): { subject: string; html: string } {
  const dashUrl = `${APP_URL}/provider`

  const body = `
    ${heading('Application received')}
    ${subheading(`Hi ${data.providerName}, thanks for joining BookPhysio.in`)}
    ${para('Your registration is under review. Our team will verify your credentials and ICP registration and activate your listing within <strong>1\u20132 business days</strong>.')}
    ${para('You\'ll receive a confirmation email as soon as your profile is live.')}
    ${secondaryButton('View Your Dashboard', dashUrl)}
    ${divider()}
    ${featureRow('✅', 'Credential verification', 'Our team reviews your ICP registration and supporting documents.')}
    ${featureRow('📣', 'Profile goes live', 'Once approved, patients in your city can find and book you.')}
    ${featureRow('💰', 'Payouts in INR', 'Payments are settled via Razorpay directly to your bank account.')}
    ${featureRow('📊', 'Full dashboard access', 'Manage your schedule, view patient records, and track earnings.')}
    ${divider()}
    ${muted('Questions about your application? Write to <a href="mailto:partners@bookphysio.in" style="color:#0B3B32;">partners@bookphysio.in</a> or <a href="mailto:join@bookphysio.in" style="color:#0B3B32;">join@bookphysio.in</a>.')}
  `
  return {
    subject: `Application received \u2014 BookPhysio.in`,
    html: layout('Application Received \u2014 BookPhysio.in', body),
  }
}

// ─── 6. Provider Approved ─────────────────────────────────────────────────────

export interface ProviderApprovedData {
  providerName: string
}

export function providerApprovedTemplate(data: ProviderApprovedData): { subject: string; html: string } {
  const dashUrl = `${APP_URL}/provider`
  const scheduleUrl = `${APP_URL}/provider/schedule`

  const body = `
    ${heading('Your listing is live!')}
    <p style="margin:6px 0 20px;">${badge('Approved', '#0B5C4E', '#D0F0EB')}</p>
    ${para(`Congratulations, <strong>${data.providerName}</strong>!`)}
    ${para('Your profile has been verified and is now live on BookPhysio.in. Patients in your city can find and book you right now.')}
    ${ctaButton('Go to My Dashboard', dashUrl)}
    ${divider()}
    ${subheading('Get started in 3 steps')}
    ${featureRow('1\uFE0F\u20E3', 'Set your availability', `Open your <a href="${scheduleUrl}" style="color:#0B3B32;font-weight:600;">schedule</a> and add your weekly slots so patients can book you.`)}
    ${featureRow('2\uFE0F\u20E3', 'Wait for your first booking', 'You\'ll get an email notification every time a patient books a session.')}
    ${featureRow('3\uFE0F\u20E3', 'Deliver a great session', 'Add clinical notes, track progress, and collect a 5-star review.')}
    ${divider()}
    ${muted('Need help getting started? Write to <a href="mailto:partners@bookphysio.in" style="color:#0B3B32;">partners@bookphysio.in</a>.')}
  `
  return {
    subject: `You\u2019re live on BookPhysio.in \u2014 your profile is approved`,
    html: layout('Profile Approved \u2014 BookPhysio.in', body),
  }
}
