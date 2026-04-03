import { z } from 'zod'

const phoneSchema = z.string().regex(/^\+91[6-9]\d{9}$/, 'Enter a valid Indian mobile number (+91XXXXXXXXXX)')
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters')

export const signupPatientSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Enter a valid email address'),
  phone: phoneSchema,
  password: passwordSchema,
})

export const signupProviderSchema = z.object({
  full_name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: phoneSchema,
  password: passwordSchema,
  title: z.enum(['Dr.', 'PT', 'BPT', 'MPT']),
  registration_type: z.enum(['IAP', 'STATE']).default('IAP'),
  iap_number: z.string().optional(),
  state_registration_number: z.string().optional(),
  state_name: z.string().optional(),
  icp_registration_no: z.string().min(1, 'Registration number is required'),
  specialty_ids: z.array(z.string().uuid()).min(1, 'Select at least one specialty'),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
})

export const otpSendSchema = z.object({
  phone: phoneSchema,
  flow: z.enum(['login', 'signup', 'provider_signup']),
})

export const otpVerifySchema = z.object({
  phone: phoneSchema,
  otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d{6}$/),
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
})

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirm_password: passwordSchema,
}).refine(data => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})

export type SignupPatientInput = z.infer<typeof signupPatientSchema>
export type SignupProviderInput = z.infer<typeof signupProviderSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>
