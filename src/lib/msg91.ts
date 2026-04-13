/**
 * MSG91 SMS & WhatsApp Client
 *
 * Sends transactional SMS and WhatsApp messages via MSG91 API.
 * Used for appointment reminders, booking confirmations, and reschedule notifications.
 *
 * Required env vars:
 *   MSG91_AUTH_KEY        — MSG91 account auth key
 *   MSG91_SMS_SENDER_ID   — 6-char registered sender ID (e.g. "BKPHYS")
 *   MSG91_SMS_TEMPLATE_REMINDER — DLT-approved template ID for appointment reminders
 *   MSG91_SMS_TEMPLATE_CONFIRM  — DLT-approved template ID for booking confirmations
 *   MSG91_SMS_TEMPLATE_RESCHEDULE — DLT-approved template ID for reschedule confirmations
 *   MSG91_WHATSAPP_INTEGRATED_NUMBER — WhatsApp Business number (optional)
 *
 * India DLT compliance: All templates must be pre-registered on DLT portal and MSG91.
 */

const MSG91_BASE_URL = 'https://control.msg91.com/api/v5'

function getAuthKey(): string {
  const key = process.env.MSG91_AUTH_KEY
  if (!key) {
    throw new Error('MSG91_AUTH_KEY environment variable is not set')
  }
  return key
}

/**
 * Normalize phone to 91XXXXXXXXXX format (no + prefix) required by MSG91.
 */
function toMsg91Phone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) return `91${digits}`
  if (digits.length === 12 && digits.startsWith('91')) return digits
  if (digits.length === 13 && digits.startsWith('091')) return digits.slice(1)
  return digits
}

// ---------------------------------------------------------------------------
// SMS via MSG91 Flow API
// ---------------------------------------------------------------------------

interface SendSmsOptions {
  phone: string
  templateId: string
  variables: Record<string, string>
}

/**
 * Send a transactional SMS via MSG91 Flow API.
 * Uses DLT-approved template with variable substitution.
 */
export async function sendSms({ phone, templateId, variables }: SendSmsOptions): Promise<{ success: boolean; requestId?: string }> {
  const authKey = getAuthKey()
  const senderId = process.env.MSG91_SMS_SENDER_ID ?? 'BKPHYS'

  const payload = {
    template_id: templateId,
    sender: senderId,
    short_url: '0',
    mobiles: toMsg91Phone(phone),
    ...variables,
  }

  const response = await fetch(`${MSG91_BASE_URL}/flow/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authkey: authKey,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => 'Unknown error')
    console.error('[msg91] SMS send failed:', response.status, text)
    return { success: false }
  }

  const data = await response.json().catch(() => ({})) as Record<string, unknown>
  return { success: true, requestId: typeof data.request_id === 'string' ? data.request_id : undefined }
}

// ---------------------------------------------------------------------------
// WhatsApp via MSG91
// ---------------------------------------------------------------------------

interface SendWhatsAppOptions {
  phone: string
  templateName: string
  variables: string[]
}

/**
 * Send a WhatsApp template message via MSG91 WhatsApp API.
 * Requires pre-approved WhatsApp Business template.
 */
export async function sendWhatsApp({ phone, templateName, variables }: SendWhatsAppOptions): Promise<{ success: boolean }> {
  const authKey = getAuthKey()
  const integratedNumber = process.env.MSG91_WHATSAPP_INTEGRATED_NUMBER

  if (!integratedNumber) {
    if (process.env.NODE_ENV !== 'production') {
      console.info('[msg91] WhatsApp not configured — skipping message')
      return { success: false }
    }
    console.warn('[msg91] MSG91_WHATSAPP_INTEGRATED_NUMBER not set')
    return { success: false }
  }

  const payload = {
    integrated_number: integratedNumber,
    content_type: 'template',
    payload: {
      to: toMsg91Phone(phone),
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'en', policy: 'deterministic' },
        components: variables.length > 0
          ? [{
              type: 'body',
              parameters: variables.map((v) => ({ type: 'text', text: v })),
            }]
          : [],
      },
    },
  }

  const response = await fetch(`${MSG91_BASE_URL}/whatsapp/whatsapp/outbound/send/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authkey: authKey,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => 'Unknown error')
    console.error('[msg91] WhatsApp send failed:', response.status, text)
    return { success: false }
  }

  return { success: true }
}

// ---------------------------------------------------------------------------
// Convenience helpers for common notification types
// ---------------------------------------------------------------------------

/**
 * Send appointment reminder via SMS and WhatsApp (best-effort).
 */
export async function sendAppointmentReminderSms({
  phone,
  patientName,
  providerName,
  appointmentDate,
  appointmentTime,
}: {
  phone: string
  patientName: string
  providerName: string
  appointmentDate: string
  appointmentTime: string
}): Promise<{ sms: boolean; whatsapp: boolean }> {
  const smsTemplateId = process.env.MSG91_SMS_TEMPLATE_REMINDER
  const results = { sms: false, whatsapp: false }

  if (smsTemplateId) {
    try {
      const smsResult = await sendSms({
        phone,
        templateId: smsTemplateId,
        variables: {
          VAR1: patientName,
          VAR2: providerName,
          VAR3: appointmentDate,
          VAR4: appointmentTime,
        },
      })
      results.sms = smsResult.success
    } catch (err) {
      console.error('[msg91] Reminder SMS error:', err)
    }
  }

  try {
    const whatsappResult = await sendWhatsApp({
      phone,
      templateName: 'appointment_reminder',
      variables: [patientName, providerName, appointmentDate, appointmentTime],
    })
    results.whatsapp = whatsappResult.success
  } catch (err) {
    console.error('[msg91] Reminder WhatsApp error:', err)
  }

  return results
}

/**
 * Send booking confirmation via SMS and WhatsApp (best-effort).
 */
export async function sendBookingConfirmationSms({
  phone,
  patientName,
  providerName,
  appointmentDate,
  appointmentTime,
  feeInr,
}: {
  phone: string
  patientName: string
  providerName: string
  appointmentDate: string
  appointmentTime: string
  feeInr: number
}): Promise<{ sms: boolean; whatsapp: boolean }> {
  const smsTemplateId = process.env.MSG91_SMS_TEMPLATE_CONFIRM
  const results = { sms: false, whatsapp: false }

  if (smsTemplateId) {
    try {
      const smsResult = await sendSms({
        phone,
        templateId: smsTemplateId,
        variables: {
          VAR1: patientName,
          VAR2: providerName,
          VAR3: appointmentDate,
          VAR4: appointmentTime,
          VAR5: `${feeInr}`,
        },
      })
      results.sms = smsResult.success
    } catch (err) {
      console.error('[msg91] Confirmation SMS error:', err)
    }
  }

  try {
    const whatsappResult = await sendWhatsApp({
      phone,
      templateName: 'booking_confirmation',
      variables: [patientName, providerName, appointmentDate, appointmentTime, `₹${feeInr}`],
    })
    results.whatsapp = whatsappResult.success
  } catch (err) {
    console.error('[msg91] Confirmation WhatsApp error:', err)
  }

  return results
}

/**
 * Send reschedule confirmation via SMS and WhatsApp (best-effort).
 */
export async function sendRescheduleConfirmationSms({
  phone,
  patientName,
  providerName,
  newDate,
  newTime,
}: {
  phone: string
  patientName: string
  providerName: string
  newDate: string
  newTime: string
}): Promise<{ sms: boolean; whatsapp: boolean }> {
  const smsTemplateId = process.env.MSG91_SMS_TEMPLATE_RESCHEDULE
  const results = { sms: false, whatsapp: false }

  if (smsTemplateId) {
    try {
      const smsResult = await sendSms({
        phone,
        templateId: smsTemplateId,
        variables: {
          VAR1: patientName,
          VAR2: providerName,
          VAR3: newDate,
          VAR4: newTime,
        },
      })
      results.sms = smsResult.success
    } catch (err) {
      console.error('[msg91] Reschedule SMS error:', err)
    }
  }

  try {
    const whatsappResult = await sendWhatsApp({
      phone,
      templateName: 'appointment_rescheduled',
      variables: [patientName, providerName, newDate, newTime],
    })
    results.whatsapp = whatsappResult.success
  } catch (err) {
    console.error('[msg91] Reschedule WhatsApp error:', err)
  }

  return results
}
