const MSG91_BASE = 'https://api.msg91.com/api/v5'

export async function sendOtp(phone: string): Promise<{ success: boolean; error?: string }> {
  // Mock during development if keys are missing
  if (!process.env.MSG91_AUTH_KEY || !process.env.MSG91_TEMPLATE_ID) {
    if (process.env.NODE_ENV === 'development') {
      console.log('--- MSG91 MOCK ---')
      console.log(`Sending OTP to ${phone}`)
      console.log('OTP: 123456')
      console.log('------------------')
      return { success: true }
    }
    return { success: false, error: 'OTP delivery failed' }
  }

  const mobile = phone.replace('+', '')
  const res = await fetch(`${MSG91_BASE}/otp?template_id=${process.env.MSG91_TEMPLATE_ID}&mobile=${mobile}&authkey=${process.env.MSG91_AUTH_KEY}`, {
    method: 'POST',
  })
  const data = await res.json() as { type: string; message: string }
  return { success: data.type === 'success', error: data.type !== 'success' ? 'OTP delivery failed' : undefined }
}

export async function verifyOtp(phone: string, otp: string): Promise<{ success: boolean; error?: string }> {
  // Mock during development if keys are missing
  if (!process.env.MSG91_AUTH_KEY) {
    if (process.env.NODE_ENV === 'development') {
      const isSuccess = otp === '123456'
      return { success: isSuccess, error: isSuccess ? undefined : 'Invalid mock OTP' }
    }
    return { success: false, error: 'OTP verification failed' }
  }

  const mobile = phone.replace('+', '')
  const res = await fetch(`${MSG91_BASE}/otp/verify?mobile=${mobile}&otp=${otp}&authkey=${process.env.MSG91_AUTH_KEY}`, {
    method: 'GET',
  })
  const data = await res.json() as { type: string; message: string }
  return { success: data.type === 'success', error: data.type !== 'success' ? 'OTP verification failed' : undefined }
}

export async function sendSms(phone: string, message: string): Promise<void> {
  if (!process.env.MSG91_AUTH_KEY) return

  const mobile = phone.replace('+', '')
  await fetch(`${MSG91_BASE}/flow/`, {
    method: 'POST',
    headers: { authkey: process.env.MSG91_AUTH_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({ template_id: process.env.MSG91_TEMPLATE_ID, mobile, message }),
  })
}
