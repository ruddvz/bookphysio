const MSG91_BASE = 'https://api.msg91.com/api/v5'

export async function sendOtp(phone: string): Promise<{ success: boolean; error?: string }> {
  const mobile = phone.replace('+', '')
  const res = await fetch(`${MSG91_BASE}/otp?template_id=${process.env.MSG91_TEMPLATE_ID}&mobile=${mobile}&authkey=${process.env.MSG91_AUTH_KEY}`, {
    method: 'POST',
  })
  const data = await res.json() as { type: string; message: string }
  return { success: data.type === 'success', error: data.type !== 'success' ? data.message : undefined }
}

export async function verifyOtp(phone: string, otp: string): Promise<{ success: boolean; error?: string }> {
  const mobile = phone.replace('+', '')
  const res = await fetch(`${MSG91_BASE}/otp/verify?mobile=${mobile}&otp=${otp}&authkey=${process.env.MSG91_AUTH_KEY}`, {
    method: 'GET',
  })
  const data = await res.json() as { type: string; message: string }
  return { success: data.type === 'success', error: data.type !== 'success' ? data.message : undefined }
}

export async function sendSms(phone: string, message: string): Promise<void> {
  const mobile = phone.replace('+', '')
  await fetch(`${MSG91_BASE}/flow/`, {
    method: 'POST',
    headers: { authkey: process.env.MSG91_AUTH_KEY!, 'content-type': 'application/json' },
    body: JSON.stringify({ template_id: process.env.MSG91_TEMPLATE_ID, mobile, message }),
  })
}
