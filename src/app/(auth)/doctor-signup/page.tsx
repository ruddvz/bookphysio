'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { ArrowLeft, ArrowRight, Camera, Check, CheckCircle2, Eye, EyeOff, Mail, RefreshCw } from 'lucide-react'
import BpLogo from '@/components/BpLogo'
import { CityCombobox } from '@/components/CityCombobox'
import { formatIndianPhone, stripPhoneFormat } from '@/lib/format-phone'
import { INDIA_STATES } from '@/lib/india-locations'
import { createClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Step1Data {
  name: string
  phone: string
  email: string
  password: string
}

interface Step2Data {
  registrationType: 'NCAHP' | 'IAP' | 'STATE'
  ncahpNumber: string
  iapNumber: string
  stateRegistrationNumber: string
  stateName: string
  degree: 'BPT' | 'MPT' | 'PhD' | 'DPT' | ''
  experienceYears: string
  specialties: string[]
  certifications: string[]
}

interface Step3Data {
  visitTypes: string[]
  clinicName: string
  address: string
  city: string
  state: string
  pincode: string
  modalities: string[]
}

interface DayTimeRange {
  startTime: string
  endTime: string
}

interface DayAvailability {
  enabled: boolean
  slots: DayTimeRange[]
}

interface Step4Data {
  fees: {
    in_clinic: string
    home_visit: string
  }
  slotDuration: '30' | '45' | '60' | ''
  availability: Record<string, DayAvailability>
}

type StepNumber = 1 | 2 | 3 | 4 | 5

// ─── Constants ────────────────────────────────────────────────────────────────

const STEP_LABELS = ['Personal', 'Professional', 'Practice', 'Pricing', 'Confirm']
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const SPECIALTIES = [
  'Sports Physio',
  'Ortho Physio',
  'Neuro Physio',
  'Paediatric Physio',
  "Women's Health",
  'Geriatric Physio',
  'Cardiopulmonary',
  'Oncology Physio',
  'Community Physio',
  'Industrial Physio',
  'Vestibular Physio',
]

const CERTIFICATIONS = [
  'MIAP (Member, Indian Association of Physiotherapists)',
  'McKenzie (MDT) Practitioner',
  'Mulligan Concept Practitioner',
  'Maitland Manual Therapist',
  'COMT (Certified Orthopaedic Manual Therapist)',
  'CDNT (Certified Dry Needling Therapist)',
  'CKTT (Certified Kinesio Taping Technician)',
]

const MODALITIES = [
  'Laser Therapy (Class IV/LLLT)',
  'Shockwave Therapy (ESWT)',
  'PEMF (Pulsed Electromagnetic Field)',
  'Shortwave Diathermy (SWD)',
  'Traction Unit (Cervical/Lumbar)',
  'CPM (Continuous Passive Motion)',
  'Hydrotherapy',
  'Cryotherapy',
]

const VISIT_LABELS: Record<string, string> = {
  in_clinic: 'In-clinic',
  home_visit: 'Home Visit',
}
const FEE_LABELS: Record<string, string> = {
  in_clinic: 'In-clinic consultation fee',
  home_visit: 'Home visit fee',
}
const SHORT_DAY_TO_FULL_DAY = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
  Sun: 'Sunday',
} as const

// ─── Schemas ──────────────────────────────────────────────────────────────────

const step1Schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const step2Schema = z.object({
  registrationType: z.enum(['NCAHP', 'IAP', 'STATE']),
  ncahpNumber: z.string().optional(),
  iapNumber: z.string().optional(),
  stateRegistrationNumber: z.string().optional(),
  stateName: z.string().optional(),
  degree: z.enum(['BPT', 'MPT', 'PhD', 'DPT'], { error: 'Select a degree' }),
  experienceYears: z
    .string()
    .regex(/^\d+$/, 'Enter a number')
    .refine((v) => parseInt(v) >= 0 && parseInt(v) <= 50, 'Enter valid years (0–50)'),
  specialties: z.array(z.string()).min(1, 'Select at least one specialty'),
  certifications: z.array(z.string()),
}).refine(data => {
  if (data.registrationType === 'NCAHP') {
    return !!data.ncahpNumber && data.ncahpNumber.length >= 3
  }
  if (data.registrationType === 'IAP') {
    return !!data.iapNumber && data.iapNumber.length >= 3
  }
  return !!data.stateRegistrationNumber && !!data.stateName
}, {
  message: 'Registration details are required',
  path: ['registrationType']
})

const step3Schema = z.object({
  visitTypes: z.array(z.string()).min(1, 'Select at least one visit type'),
  clinicName: z.string().optional(),
  address: z.string().optional(),
  city: z.string().min(1, 'Select a city'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, 'Enter valid 6-digit pincode').optional().or(z.literal('')),
  modalities: z.array(z.string()),
}).superRefine((data, ctx) => {
  const isClinic = data.visitTypes.includes('in_clinic')
  if (!isClinic) return

  if (!data.clinicName?.trim() || data.clinicName.trim().length < 2) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['clinicName'], message: 'Enter your clinic name' })
  }
  if (!data.address?.trim() || data.address.trim().length < 5) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['address'], message: 'Enter your clinic address' })
  }
  if (!data.pincode?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['pincode'], message: 'Enter your clinic pincode' })
  }
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateTimeOptions(): string[] {
  const times: string[] = []
  for (let h = 6; h <= 22; h++) {
    times.push(`${String(h).padStart(2, '0')}:00`)
    if (h < 22) times.push(`${String(h).padStart(2, '0')}:30`)
  }
  return times
}

const TIME_OPTIONS = generateTimeOptions()

function buildInitialAvailability(): Record<string, DayAvailability> {
  const result: Record<string, DayAvailability> = {}
  for (const day of DAYS) {
    result[day] = {
      enabled: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(day),
      slots: [{ startTime: '09:00', endTime: '18:00' }],
    }
  }
  return result
}

function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number)
  return (hours ?? 0) * 60 + (minutes ?? 0)
}

/** Convert 24h time string to 12h AM/PM display label */
function format24hTo12h(time: string): string {
  const [hStr, mStr] = time.split(':')
  const h = parseInt(hStr ?? '0', 10)
  const m = mStr ?? '00'
  const period = h < 12 ? 'AM' : 'PM'
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hour12}:${m} ${period}`
}

function validateStep4(data: Step4Data, visitTypes: string[]): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const vt of visitTypes) {
    const fee = data.fees[vt as keyof typeof data.fees]
    if (!fee || !/^\d+$/.test(fee) || parseInt(fee) <= 0) {
      errors[`fee_${vt}`] = 'Enter a valid fee (positive number)'
    }
  }
  if (!data.slotDuration) errors.slotDuration = 'Select a session duration'
  const anyEnabled = Object.values(data.availability).some((d) => d.enabled)
  if (!anyEnabled) errors.availability = 'Enable at least one day'
  for (const [day, av] of Object.entries(data.availability)) {
    if (!av.enabled) {
      continue
    }

    if (av.slots.length === 0) {
      errors[`time_${day}`] = 'Add at least one time range'
      continue
    }

    av.slots.forEach((slot, index) => {
      if (timeToMinutes(slot.endTime) <= timeToMinutes(slot.startTime)) {
        errors[`time_${day}_${index}`] = 'End time must be after start time'
      }
    })

    const sortedSlots = [...av.slots].sort(
      (left, right) => timeToMinutes(left.startTime) - timeToMinutes(right.startTime)
    )

    for (let index = 1; index < sortedSlots.length; index += 1) {
      const slot = sortedSlots[index]
      const previousSlot = sortedSlots[index - 1]

      if (previousSlot && timeToMinutes(slot.startTime) < timeToMinutes(previousSlot.endTime)) {
        errors[`time_${day}`] = 'Time ranges must not overlap'
        break
      }
    }
  }
  return errors
}

function getNextSlotRange(previousSlot?: DayTimeRange): DayTimeRange {
  if (!previousSlot) {
    return { startTime: '09:00', endTime: '18:00' }
  }

  const startMinutes = timeToMinutes(previousSlot.endTime)
  const endMinutes = Math.min(startMinutes + 60, 23 * 60 + 30)
  return {
    startTime: previousSlot.endTime,
    endTime: `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`,
  }
}

// ─── Shared UI helpers ────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: '44px',
  border: '1px solid var(--color-bp-border)',
  borderRadius: '8px',
  padding: '0 12px',
  fontSize: '15px',
  color: 'var(--color-bp-primary)',
  backgroundColor: '#FFFFFF',
  outline: 'none',
  boxSizing: 'border-box',
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p style={{ color: '#DC2626', fontSize: '12px', marginTop: '4px' }}>{msg}</p>
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--color-bp-primary)', marginBottom: '6px' }}>
      {children}
    </label>
  )
}

function PrimaryButton({ children, onClick, disabled }: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full h-11 text-white border-none rounded-lg text-[14px] font-semibold mt-2 flex items-center justify-center gap-2 transition-colors outline-none ${
        disabled ? 'bg-bp-primary/40 cursor-not-allowed' : 'bg-bp-primary hover:bg-bp-primary-dark cursor-pointer'
      }`}
    >
      {children}
    </button>
  )
}

function BackLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-gray-600 text-[14px] bg-transparent border-none cursor-pointer pt-3 mx-auto hover:text-bp-primary transition-colors outline-none"
    >
      <ArrowLeft className="w-4 h-4" />
      Back
    </button>
  )
}

function FocusableInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  style: extraStyle,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  style?: React.CSSProperties
}) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ ...inputStyle, ...extraStyle, borderColor: focused ? 'var(--color-bp-primary)' : 'var(--color-bp-border)' }}
    />
  )
}

// ─── Progress Indicator ───────────────────────────────────────────────────────

function ProgressIndicator({ current }: { current: StepNumber }) {
  return (
    <div className="my-6" aria-label="Signup progress">
      <div className="flex items-center justify-between">
        {STEP_LABELS.map((label, i) => {
          const step = (i + 1) as StepNumber
          const done = step < current
          const active = step === current

          return (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              {/* Circle + label */}
              <div className="flex flex-col items-center gap-1">
                <div
                  aria-current={active ? 'step' : undefined}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold transition-colors ${
                    done
                      ? 'bg-bp-primary text-white'
                      : active
                      ? 'border-2 border-bp-primary bg-white text-bp-primary'
                      : 'border-2 border-gray-200 bg-white text-gray-400'
                  }`}
                >
                  {done ? <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> : step}
                </div>
                <span
                  className={`text-[10px] whitespace-nowrap hidden sm:block ${
                    active ? 'text-bp-primary font-semibold' : done ? 'text-bp-primary' : 'text-gray-400'
                  }`}
                >
                  {label}
                </span>
              </div>

              {/* Connector line */}
              {i < STEP_LABELS.length - 1 && (
                <div className="mx-1 mb-4 h-[2px] flex-1">
                  <div
                    className={`h-full transition-colors ${step < current ? 'bg-bp-primary' : 'bg-gray-200'}`}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Step 1 ───────────────────────────────────────────────────────────────────

interface Step1Props {
  data: Step1Data
  onChange: (d: Step1Data) => void
  onNext: () => void
  avatarPreview: string | null
  onAvatarChange: (dataUrl: string, mimeType: string, fileName: string) => void
}

function Step1({ data, onChange, onNext, avatarPreview, onAvatarChange }: Step1Props) {
  const [errors, setErrors] = useState<Partial<Record<keyof Step1Data, string>>>({})
  const [phoneFocused, setPhoneFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  function handleAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => onAvatarChange(reader.result as string, file.type, file.name)
    reader.readAsDataURL(file)
  }

  function handleNext() {
    const result = step1Schema.safeParse(data)
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors
      setErrors({
        name: flat.name?.[0],
        phone: flat.phone?.[0],
        email: flat.email?.[0],
        password: flat.password?.[0],
      })
      return
    }
    setErrors({})
    onNext()
  }

  return (
    <div>
      <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-bp-primary)', marginBottom: '6px' }}>
        Personal Details
      </h2>
      <p style={{ fontSize: '14px', color: '#555B6E', marginBottom: '24px' }}>
        Let&apos;s start with your basic information
      </p>

      {/* Professional photo */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <button
          type="button"
          onClick={() => avatarInputRef.current?.click()}
          style={{
            position: 'relative',
            width: '88px',
            height: '88px',
            borderRadius: '50%',
            border: '2px dashed var(--color-bp-border)',
            background: 'var(--color-bp-surface)',
            overflow: 'hidden',
            cursor: 'pointer',
            padding: 0,
            flexShrink: 0,
          }}
          aria-label="Upload professional photo"
        >
          {avatarPreview ? (
            <Image src={avatarPreview} alt="Profile preview" fill style={{ objectFit: 'cover' }} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '4px' }}>
              <Camera style={{ width: '24px', height: '24px', color: 'var(--color-bp-primary)' }} />
            </div>
          )}
        </button>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-bp-primary)', marginBottom: '2px' }}>
            {avatarPreview ? 'Change photo' : 'Add professional photo'}
          </p>
          <p style={{ fontSize: '11px', color: '#555B6E', opacity: 0.6 }}>
            Use a clear headshot in professional attire
          </p>
        </div>
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={handleAvatarFile}
          aria-hidden="true"
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <Label>Your Name</Label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
          <div style={{
            height: '44px', padding: '0 12px',
            backgroundColor: 'var(--color-bp-surface)', border: '1px solid var(--color-bp-border)',
            borderRight: 'none', borderRadius: '8px 0 0 8px',
            display: 'flex', alignItems: 'center',
            fontSize: '14px', fontWeight: 700, color: 'var(--color-bp-primary)', flexShrink: 0,
          }}>
            Dr.
          </div>
          <FocusableInput
            value={data.name}
            onChange={(v) => onChange({ ...data, name: v })}
            placeholder="Priya Sharma"
            style={{ borderRadius: '0', borderLeft: 'none', borderRight: 'none' }}
          />
          <div style={{
            height: '44px', padding: '0 12px',
            backgroundColor: 'var(--color-bp-surface)', border: '1px solid var(--color-bp-border)',
            borderLeft: 'none', borderRadius: '0 8px 8px 0',
            display: 'flex', alignItems: 'center',
            fontSize: '14px', fontWeight: 700, color: 'var(--color-bp-primary)', flexShrink: 0,
          }}>
            , PT
          </div>
        </div>
        {data.name && (
          <p style={{ fontSize: '12px', color: '#555B6E', marginTop: '5px' }}>
            Your profile will appear as: <strong style={{ color: 'var(--color-bp-primary)' }}>Dr. {data.name}, PT</strong>
          </p>
        )}
        <FieldError msg={errors.name} />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <Label>Mobile Number</Label>
        <div style={{ display: 'flex', gap: '0' }}>
          <div
            style={{
              height: '44px',
              padding: '0 12px',
              backgroundColor: 'var(--color-bp-surface)',
              border: '1px solid var(--color-bp-border)',
              borderRight: 'none',
              borderRadius: '8px 0 0 8px',
              display: 'flex',
              alignItems: 'center',
              fontSize: '15px',
              color: '#555B6E',
              flexShrink: 0,
            }}
          >
            +91
          </div>
          <input
            type="tel"
            value={formatIndianPhone(data.phone)}
            maxLength={11}
            onChange={(e) => onChange({ ...data, phone: stripPhoneFormat(e.target.value) })}
            placeholder="98765 43210"
            onFocus={() => setPhoneFocused(true)}
            onBlur={() => setPhoneFocused(false)}
            style={{
              ...inputStyle,
              borderRadius: '0 8px 8px 0',
              borderColor: phoneFocused ? 'var(--color-bp-primary)' : 'var(--color-bp-border)',
            }}
          />
        </div>
        <FieldError msg={errors.phone} />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <Label>Email address</Label>
        <FocusableInput
          value={data.email}
          onChange={(v) => onChange({ ...data, email: v })}
          placeholder="priya@clinic.com"
          type="email"
        />
        <FieldError msg={errors.email} />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <Label>Password</Label>
        <div style={{ position: 'relative' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            value={data.password}
            onChange={(e) => onChange({ ...data, password: e.target.value })}
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            style={{ ...inputStyle, paddingRight: '44px' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              color: '#555B6E',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {showPassword ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
          </button>
        </div>
        <FieldError msg={errors.password} />
      </div>

      <PrimaryButton onClick={handleNext}>
        Next: Professional Details
        <ArrowRight className="w-4 h-4" />
      </PrimaryButton>
    </div>
  )
}

// ─── Step 2 ───────────────────────────────────────────────────────────────────

interface Step2Props {
  data: Step2Data
  onChange: (d: Step2Data) => void
  onNext: () => void
  onBack: () => void
}

function Step2({ data, onChange, onNext, onBack }: Step2Props) {
  const [errors, setErrors] = useState<Partial<Record<keyof Step2Data | 'degree', string>>>({})

  function handleNext() {
    const result = step2Schema.safeParse(data)
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors
      setErrors({
        ncahpNumber: flat.ncahpNumber?.[0],
        iapNumber: flat.iapNumber?.[0],
        stateRegistrationNumber: flat.stateRegistrationNumber?.[0],
        stateName: flat.stateName?.[0],
        registrationType: flat.registrationType?.[0],
        degree: flat.degree?.[0],
        experienceYears: flat.experienceYears?.[0],
        specialties: flat.specialties?.[0],
      })
      return
    }
    setErrors({})
    onNext()
  }

  function toggleSpecialty(s: string) {
    const next = data.specialties.includes(s)
      ? data.specialties.filter((x) => x !== s)
      : [...data.specialties, s]
    onChange({ ...data, specialties: next })
  }

  return (
    <div>
      <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-bp-primary)', marginBottom: '6px' }}>
        Professional Details
      </h2>
      <p style={{ fontSize: '14px', color: '#555B6E', marginBottom: '24px' }}>
        Your credentials and expertise
      </p>

      {/* Registration Type Switcher */}
      <div style={{ marginBottom: '24px' }}>
        <Label>Registration Type</Label>
        <div style={{ display: 'flex', padding: '4px', borderRadius: '12px', gap: '4px', backgroundColor: 'var(--color-bp-surface)' }}>
          {(['NCAHP', 'IAP', 'STATE'] as const).map((type) => {
            const labels: Record<string, string> = {
              NCAHP: 'NCAHP',
              IAP: 'IAP',
              STATE: 'State Council',
            }
            return (
              <button
                key={type}
                onClick={() => onChange({ ...data, registrationType: type })}
                style={{
                  flex: 1,
                  padding: '8px 4px',
                  fontSize: '13px',
                  fontWeight: 700,
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: data.registrationType === type ? '#FFFFFF' : 'transparent',
                  color: data.registrationType === type ? 'var(--color-bp-primary)' : '#555B6E',
                  boxShadow: data.registrationType === type ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {labels[type]}
              </button>
            )
          })}
        </div>
        <p style={{ fontSize: '11px', color: '#888', marginTop: '5px' }}>
          {data.registrationType === 'NCAHP'
            ? 'National Commission for Allied and Healthcare Professions — highest trust level'
            : data.registrationType === 'IAP'
            ? 'Indian Association of Physiotherapists membership number'
            : 'State Allied and Healthcare Council registration'}
        </p>
        <FieldError msg={errors.registrationType} />
      </div>

      {data.registrationType === 'NCAHP' && (
        <div style={{ marginBottom: '16px' }}>
          <Label>NCAHP Registration Number</Label>
          <FocusableInput
            value={data.ncahpNumber}
            onChange={(v) => onChange({ ...data, ncahpNumber: v })}
            placeholder="e.g. NCAHP/PT/2024/12345"
          />
          <FieldError msg={errors.ncahpNumber} />
        </div>
      )}

      {data.registrationType === 'IAP' && (
        <div style={{ marginBottom: '16px' }}>
          <Label>IAP Membership Number</Label>
          <FocusableInput
            value={data.iapNumber}
            onChange={(v) => onChange({ ...data, iapNumber: v })}
            placeholder="e.g. L-12345"
          />
          <FieldError msg={errors.iapNumber} />
        </div>
      )}

      {data.registrationType === 'STATE' && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1 }}>
            <Label>State Council</Label>
            <select
              value={data.stateName}
              onChange={(e) => onChange({ ...data, stateName: e.target.value })}
              style={{ ...inputStyle }}
            >
              <option value="">Select state</option>
              {INDIA_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <FieldError msg={errors.stateName} />
          </div>
          <div style={{ flex: 1 }}>
            <Label>Registration Number</Label>
            <FocusableInput
              value={data.stateRegistrationNumber}
              onChange={(v) => onChange({ ...data, stateRegistrationNumber: v })}
              placeholder="e.g. 2024/02/123"
            />
            <FieldError msg={errors.stateRegistrationNumber} />
          </div>
        </div>
      )}

      <div style={{ marginBottom: '16px' }}>
        <Label>Degree</Label>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {(['BPT', 'MPT', 'PhD', 'DPT'] as const).map((deg) => (
            <label key={deg} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '15px', color: 'var(--color-bp-primary)' }}>
              <input
                type="radio"
                name="degree"
                value={deg}
                checked={data.degree === deg}
                onChange={() => onChange({ ...data, degree: deg })}
                style={{ accentColor: 'var(--color-bp-primary)' }}
              />
              {deg}
            </label>
          ))}
        </div>
        <FieldError msg={errors.degree} />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <Label>Years of Experience</Label>
        <FocusableInput
          value={data.experienceYears}
          onChange={(v) => onChange({ ...data, experienceYears: v.replace(/\D/g, '') })}
          placeholder="5"
          type="number"
          style={{ width: '120px' }}
        />
        <FieldError msg={errors.experienceYears} />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <Label>Specialties</Label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {SPECIALTIES.map((s) => (
            <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '15px', color: 'var(--color-bp-primary)' }}>
              <input
                type="checkbox"
                checked={data.specialties.includes(s)}
                onChange={() => toggleSpecialty(s)}
                style={{ accentColor: 'var(--color-bp-primary)', width: '16px', height: '16px' }}
              />
              {s}
            </label>
          ))}
        </div>
        <FieldError msg={errors.specialties} />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <Label>Clinical Certifications <span style={{ fontWeight: 400, color: '#888', fontSize: '12px' }}>(optional)</span></Label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {CERTIFICATIONS.map((cert) => (
            <label key={cert} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '14px', color: 'var(--color-bp-primary)' }}>
              <input
                type="checkbox"
                checked={data.certifications.includes(cert)}
                onChange={() => {
                  const next = data.certifications.includes(cert)
                    ? data.certifications.filter((c) => c !== cert)
                    : [...data.certifications, cert]
                  onChange({ ...data, certifications: next })
                }}
                style={{ accentColor: 'var(--color-bp-primary)', width: '16px', height: '16px', marginTop: '2px', flexShrink: 0 }}
              />
              {cert}
            </label>
          ))}
        </div>
      </div>

      <PrimaryButton onClick={handleNext}>
        Next: Practice Details
        <ArrowRight className="w-4 h-4" />
      </PrimaryButton>
      <div className="flex justify-center">
        <BackLink onClick={onBack} />
      </div>
    </div>
  )
}

// ─── Step 3 ───────────────────────────────────────────────────────────────────

interface Step3Props {
  data: Step3Data
  onChange: (d: Step3Data) => void
  onNext: () => void
  onBack: () => void
}

function Step3({ data, onChange, onNext, onBack }: Step3Props) {
  const [errors, setErrors] = useState<Partial<Record<keyof Step3Data | 'form', string>>>({})
  const [areaFocused, setAreaFocused] = useState(false)

  const isClinic = data.visitTypes.includes('in_clinic')

  function handleNext() {
    const result = step3Schema.safeParse(data)
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors
      setErrors({
        clinicName: flat.clinicName?.[0],
        address: flat.address?.[0],
        city: flat.city?.[0],
        state: flat.state?.[0],
        pincode: flat.pincode?.[0],
        visitTypes: flat.visitTypes?.[0],
      })
      return
    }
    setErrors({})
    onNext()
  }

  function toggleVisitType(vt: string) {
    const next = data.visitTypes.includes(vt)
      ? data.visitTypes.filter((x) => x !== vt)
      : [...data.visitTypes, vt]
    onChange({ ...data, visitTypes: next })
  }

  return (
    <div>
      <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-bp-primary)', marginBottom: '6px' }}>
        Practice Details
      </h2>
      <p style={{ fontSize: '14px', color: '#555B6E', marginBottom: '24px' }}>
        Where you see patients
      </p>

      {/* Visit Types — at the top so the form adapts */}
      <div style={{ marginBottom: '20px' }}>
        <Label>How do you see patients?</Label>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {Object.entries(VISIT_LABELS).map(([vt, label]) => {
            const active = data.visitTypes.includes(vt)
            return (
              <button
                key={vt}
                type="button"
                onClick={() => toggleVisitType(vt)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '24px',
                  border: `2px solid ${active ? 'var(--color-bp-primary)' : 'var(--color-bp-border)'}`,
                  backgroundColor: active ? 'var(--color-bp-primary)' : '#fff',
                  color: active ? '#fff' : 'var(--color-bp-primary)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
        <FieldError msg={errors.visitTypes} />
      </div>

      {/* Clinic fields — only shown if in-clinic visits selected */}
      {isClinic && (
        <>
          <div style={{ marginBottom: '16px' }}>
            <Label>Clinic / Practice Name</Label>
            <FocusableInput
              value={data.clinicName}
              onChange={(v) => onChange({ ...data, clinicName: v })}
              placeholder="Sharma Physiotherapy Centre"
            />
            <FieldError msg={errors.clinicName} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <Label>Clinic Address</Label>
            <textarea
              rows={2}
              value={data.address}
              onChange={(e) => onChange({ ...data, address: e.target.value })}
              placeholder="Shop 12, Green Park Main Road"
              onFocus={() => setAreaFocused(true)}
              onBlur={() => setAreaFocused(false)}
              style={{
                ...inputStyle,
                height: 'auto',
                padding: '10px 12px',
                resize: 'vertical',
                borderColor: areaFocused ? 'var(--color-bp-primary)' : 'var(--color-bp-border)',
              }}
            />
            <FieldError msg={errors.address} />
          </div>
        </>
      )}

      <div style={{ marginBottom: '16px' }}>
        <Label>{isClinic ? 'City' : 'Your service city'}</Label>
        <CityCombobox
          value={data.city ? `${data.city}${data.state ? `, ${data.state}` : ''}` : ''}
          onChange={(city, state) => onChange({ ...data, city, state: state ?? data.state })}
          placeholder="Search city… (e.g. Surat)"
          cityOnly={false}
          inputStyle={{ ...inputStyle }}
        />
        <FieldError msg={errors.city} />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <Label>State</Label>
        <select
          value={data.state}
          onChange={(e) => onChange({ ...data, state: e.target.value })}
          style={{ ...inputStyle }}
        >
          <option value="">Select state</option>
          {INDIA_STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <FieldError msg={errors.state} />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <Label>{isClinic ? 'Clinic Pincode' : 'Base Pincode'}</Label>
        <FocusableInput
          value={data.pincode}
          onChange={(v) => onChange({ ...data, pincode: v.replace(/\D/g, '').slice(0, 6) })}
          placeholder="110001"
          style={{ width: '140px' }}
        />
        <FieldError msg={errors.pincode} />
      </div>

      {/* Modalities — shown only for clinic providers */}
      {isClinic && (
        <div style={{ marginBottom: '24px' }}>
          <Label>Equipment Available <span style={{ fontWeight: 400, color: '#888', fontSize: '12px' }}>(optional)</span></Label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {MODALITIES.map((mod) => (
              <label key={mod} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--color-bp-primary)' }}>
                <input
                  type="checkbox"
                  checked={data.modalities.includes(mod)}
                  onChange={() => {
                    const next = data.modalities.includes(mod)
                      ? data.modalities.filter((m) => m !== mod)
                      : [...data.modalities, mod]
                    onChange({ ...data, modalities: next })
                  }}
                  style={{ accentColor: 'var(--color-bp-primary)', width: '15px', height: '15px', marginTop: '2px', flexShrink: 0 }}
                />
                {mod}
              </label>
            ))}
          </div>
        </div>
      )}

      <PrimaryButton onClick={handleNext}>
        Next: Pricing &amp; Availability
        <ArrowRight className="w-4 h-4" />
      </PrimaryButton>
      <div className="flex justify-center">
        <BackLink onClick={onBack} />
      </div>
    </div>
  )
}

// ─── Step 4 ───────────────────────────────────────────────────────────────────

interface Step4Props {
  data: Step4Data
  visitTypes: string[]
  onChange: (d: Step4Data) => void
  onNext: () => void
  onBack: () => void
  submitError?: string
  submitLoading?: boolean
}

function Step4({ data, visitTypes, onChange, onNext, onBack, submitError, submitLoading }: Step4Props) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [focusedFee, setFocusedFee] = useState<string | null>(null)
  const [focusedTimes, setFocusedTimes] = useState<string | null>(null)

  function handleNext() {
    const errs = validateStep4(data, visitTypes)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    onNext()
  }

  function setFee(vt: string, val: string) {
    onChange({ ...data, fees: { ...data.fees, [vt]: val.replace(/\D/g, '') } })
  }

  function setDayEnabled(day: string, enabled: boolean) {
    const current = data.availability[day]
    onChange({
      ...data,
      availability: {
        ...data.availability,
        [day]: {
          ...current,
          enabled,
          slots: enabled && current.slots.length === 0 ? [{ startTime: '09:00', endTime: '18:00' }] : current.slots,
        },
      },
    })
  }

  function setDaySlot(day: string, slotIndex: number, field: keyof DayTimeRange, value: string) {
    onChange({
      ...data,
      availability: {
        ...data.availability,
        [day]: {
          ...data.availability[day],
          slots: data.availability[day].slots.map((slot, index) =>
            index === slotIndex ? { ...slot, [field]: value } : slot
          ),
        },
      },
    })
  }

  function addDaySlot(day: string) {
    const current = data.availability[day]
    const nextSlot = getNextSlotRange(current.slots[current.slots.length - 1])
    onChange({
      ...data,
      availability: {
        ...data.availability,
        [day]: {
          ...current,
          enabled: true,
          slots: [...current.slots, nextSlot],
        },
      },
    })
  }

  function removeDaySlot(day: string, slotIndex: number) {
    const current = data.availability[day]
    onChange({
      ...data,
      availability: {
        ...data.availability,
        [day]: {
          ...current,
          slots: current.slots.filter((_, index) => index !== slotIndex),
        },
      },
    })
  }

  const allVisitTypes = ['in_clinic', 'home_visit']

  return (
    <div>
      <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-bp-primary)', marginBottom: '6px' }}>
        Pricing &amp; Availability
      </h2>
      <p style={{ fontSize: '14px', color: '#555B6E', marginBottom: '24px' }}>
        Set your fees and working hours
      </p>

      {/* Section A: Fees */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-bp-primary)', marginBottom: '12px' }}>
          Consultation Fees
        </p>
        {allVisitTypes.map((vt) => {
          const active = visitTypes.includes(vt)
          return (
            <div key={vt} style={{ marginBottom: '12px', opacity: active ? 1 : 0.4 }}>
              <Label>{FEE_LABELS[vt]}</Label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                <div style={{
                  height: '44px', padding: '0 12px',
                  backgroundColor: 'var(--color-bp-surface)', border: '1px solid var(--color-bp-border)',
                  borderRight: 'none', borderRadius: '8px 0 0 8px',
                  display: 'flex', alignItems: 'center',
                  fontSize: '15px', color: '#555B6E', flexShrink: 0,
                }}>₹</div>
                <input
                  type="text"
                  disabled={!active}
                  value={data.fees[vt as keyof typeof data.fees]}
                  onChange={(e) => setFee(vt, e.target.value)}
                  placeholder="500"
                  onFocus={() => setFocusedFee(vt)}
                  onBlur={() => setFocusedFee(null)}
                  style={{
                    ...inputStyle,
                    borderRadius: '0 8px 8px 0',
                    borderColor: focusedFee === vt ? 'var(--color-bp-primary)' : 'var(--color-bp-border)',
                    cursor: active ? 'text' : 'not-allowed',
                  }}
                />
              </div>
              {active && <FieldError msg={errors[`fee_${vt}`]} />}
            </div>
          )
        })}
      </div>

      {/* Section B: Slot Duration */}
      <div style={{ marginBottom: '20px' }}>
        <Label>Session duration (applies to all slots)</Label>
        <div style={{ display: 'flex', gap: '16px' }}>
          {(['30', '45', '60'] as const).map((d) => (
            <label key={d} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '15px', color: 'var(--color-bp-primary)' }}>
              <input
                type="radio"
                name="slotDuration"
                value={d}
                checked={data.slotDuration === d}
                onChange={() => onChange({ ...data, slotDuration: d })}
                style={{ accentColor: 'var(--color-bp-primary)' }}
              />
              {d} min
            </label>
          ))}
        </div>
        <FieldError msg={errors.slotDuration} />
      </div>

      {/* Section C: Weekly Availability */}
      <div style={{ marginBottom: '24px' }}>
        <Label>Weekly Availability</Label>
        <FieldError msg={errors.availability} />

        {/* Quick presets */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '8px 0 12px' }}>
          {[
            { label: 'Mon–Fri 9am–6pm', days: ['Mon','Tue','Wed','Thu','Fri'], start: '09:00', end: '18:00' },
            { label: 'Mon–Sat 9am–5pm', days: ['Mon','Tue','Wed','Thu','Fri','Sat'], start: '09:00', end: '17:00' },
            { label: 'Mon–Fri 8am–8pm', days: ['Mon','Tue','Wed','Thu','Fri'], start: '08:00', end: '20:00' },
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                const next = { ...data.availability }
                DAYS.forEach((d) => {
                  if (preset.days.includes(d)) {
                    next[d] = { enabled: true, slots: [{ startTime: preset.start, endTime: preset.end }] }
                  } else {
                    next[d] = { ...next[d], enabled: false }
                  }
                })
                const nextErrors = Object.fromEntries(
                  Object.entries(data.errors ?? {}).filter(([k]) => k !== 'availability' && !k.startsWith('time_'))
                )
                onChange({ ...data, availability: next, errors: nextErrors })
              }}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '20px',
                border: '1px solid var(--color-bp-border)',
                backgroundColor: '#fff',
                color: 'var(--color-bp-primary)',
                cursor: 'pointer',
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {DAYS.map((day) => {
            const av = data.availability[day]
            const dim = !av.enabled
            const timeKey = `time_${day}`

            return (
              <div
                key={day}
                style={{
                  border: '1px solid var(--color-bp-border)',
                  borderRadius: '12px',
                  padding: '12px',
                  opacity: dim ? 0.72 : 1,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: av.enabled ? '12px' : '0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', color: 'var(--color-bp-primary)', fontWeight: 600, width: '32px' }}>{day}</span>
                    {av.enabled && ['Mon','Tue','Wed','Thu','Fri'].includes(day) && (
                      <button
                        type="button"
                        onClick={() => {
                          const slots = av.slots
                          const next = { ...data.availability }
                          const weekdays = ['Mon','Tue','Wed','Thu','Fri']
                          weekdays.forEach((d) => {
                            if (d !== day) next[d] = { enabled: true, slots: slots.map((s) => ({ ...s })) }
                          })
                          const nextErrors = Object.fromEntries(
                            Object.entries(data.errors ?? {}).filter(([k]) => k !== 'availability' && !k.startsWith('time_'))
                          )
                          onChange({ ...data, availability: next, errors: nextErrors })
                        }}
                        style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-bp-primary)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--color-bp-surface)' }}
                      >
                        Copy to weekdays
                      </button>
                    )}
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-bp-primary)' }}>
                    <input
                      type="checkbox"
                      aria-label={`Enable ${day}`}
                      checked={av.enabled}
                      onChange={(e) => setDayEnabled(day, e.target.checked)}
                      style={{ accentColor: 'var(--color-bp-primary)', width: '16px', height: '16px' }}
                    />
                    Available
                  </label>
                </div>

                {av.enabled ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {av.slots.map((slot, slotIndex) => (
                      <div key={`${day}-${slotIndex}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <select
                          aria-label={`${day} slot ${slotIndex + 1} start time`}
                          value={slot.startTime}
                          onChange={(e) => setDaySlot(day, slotIndex, 'startTime', e.target.value)}
                          onFocus={() => setFocusedTimes(`${day}-${slotIndex}-start`)}
                          onBlur={() => setFocusedTimes(null)}
                          style={{
                            ...inputStyle,
                            width: '120px',
                            minWidth: '100px',
                            flex: '1 1 100px',
                            maxWidth: '140px',
                            height: '36px',
                            fontSize: '13px',
                            padding: '0 8px',
                            borderColor: focusedTimes === `${day}-${slotIndex}-start` ? 'var(--color-bp-primary)' : 'var(--color-bp-border)',
                          }}
                        >
                          {TIME_OPTIONS.map((t) => <option key={t} value={t}>{format24hTo12h(t)}</option>)}
                        </select>
                        <span style={{ fontSize: '13px', color: '#555B6E' }}>to</span>
                        <select
                          aria-label={`${day} slot ${slotIndex + 1} end time`}
                          value={slot.endTime}
                          onChange={(e) => setDaySlot(day, slotIndex, 'endTime', e.target.value)}
                          onFocus={() => setFocusedTimes(`${day}-${slotIndex}-end`)}
                          onBlur={() => setFocusedTimes(null)}
                          style={{
                            ...inputStyle,
                            width: '120px',
                            minWidth: '100px',
                            flex: '1 1 100px',
                            maxWidth: '140px',
                            height: '36px',
                            fontSize: '13px',
                            padding: '0 8px',
                            borderColor: focusedTimes === `${day}-${slotIndex}-end` ? 'var(--color-bp-primary)' : 'var(--color-bp-border)',
                          }}
                        >
                          {TIME_OPTIONS.map((t) => <option key={t} value={t}>{format24hTo12h(t)}</option>)}
                        </select>
                        {av.slots.length > 1 ? (
                          <button
                            type="button"
                            onClick={() => removeDaySlot(day, slotIndex)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: '#DC2626',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            Remove
                          </button>
                        ) : null}
                        <FieldError msg={errors[`time_${day}_${slotIndex}`]} />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addDaySlot(day)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--color-bp-primary)',
                        fontSize: '13px',
                        fontWeight: 600,
                        padding: 0,
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      + Add another time range
                    </button>
                  </div>
                ) : null}
                {errors[timeKey] && <FieldError msg={errors[timeKey]} />}
              </div>
            )
          })}
        </div>
      </div>

      <PrimaryButton onClick={handleNext} disabled={submitLoading}>
        {submitLoading ? 'Submitting…' : (
          <>
            Complete Registration
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </PrimaryButton>
      {submitError ? <FieldError msg={submitError} /> : null}
      <div className="flex justify-center">
        <BackLink onClick={onBack} />
      </div>
    </div>
  )
}

// ─── Step 5 ───────────────────────────────────────────────────────────────────

const RESEND_COOLDOWN_SECONDS = 60

type ResendStatus = 'idle' | 'loading' | 'sent' | 'error'

function useResendConfirmation(email: string) {
  // Initialize to 'loading' immediately when email is present so the resend
  // button is disabled before the first useEffect fires (avoids synchronous
  // setState inside the effect, which triggers react-hooks/set-state-in-effect).
  const [resendStatus, setResendStatus] = useState<ResendStatus>(() => email ? 'loading' : 'idle')
  const [resendError, setResendError] = useState('')
  const [countdown, setCountdown] = useState(0)

  // Countdown ticker
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  // Auto-send on mount: admin.createUser() does not send confirmation emails,
  // so we trigger one here immediately when Step 5 renders.
  // resendStatus is already 'loading' from the lazy initializer above,
  // preventing concurrent manual resends while the request is in-flight.
  useEffect(() => {
    if (!email) return
    let cancelled = false
    const supabase = createClient()
    void (async () => {
      const { error } = await supabase.auth.resend({ type: 'signup', email })
      if (cancelled) return
      if (error) {
        setResendError('Unable to send the confirmation email automatically. Please use the resend button below.')
        setResendStatus('error')
        return
      }
      setResendStatus('sent')
      setCountdown(RESEND_COOLDOWN_SECONDS)
    })().catch(() => {
      if (!cancelled) {
        setResendError('Network error. Please use the resend button below.')
        setResendStatus('error')
      }
    })
    return () => { cancelled = true }
  }, [email])

  async function handleResend() {
    if (!email || resendStatus === 'loading' || countdown > 0) return
    setResendStatus('loading')
    setResendError('')
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resend({ type: 'signup', email })
      if (error) {
        setResendError('Unable to resend the email right now. Please try again.')
        setResendStatus('error')
        return
      }
      setResendStatus('sent')
      setCountdown(RESEND_COOLDOWN_SECONDS)
    } catch {
      setResendError('Network error. Please try again.')
      setResendStatus('error')
    }
  }

  return { resendStatus, resendError, countdown, handleResend }
}

interface Step5Props {
  email: string
  onBack: () => void
}

function Step5({ email, onBack }: Step5Props) {
  const { resendStatus, resendError, countdown, handleResend } = useResendConfirmation(email)

  const maskedEmail = email.replace(
    /^(.)(.*)(@.*)$/,
    (_match, firstChar, localPart, domainPart) =>
      `${firstChar}${'•'.repeat(Math.min(Math.max(localPart.length, 1), 6))}${domainPart}`,
  )

  return (
    <div className="text-center">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-bp-primary/10 flex items-center justify-center">
          <Mail className="w-8 h-8 text-bp-primary" />
        </div>
      </div>
      <h2 className="text-[22px] font-bold text-bp-primary mb-2">Check your email!</h2>
      <p className="text-[14px] text-gray-600 mb-1">
        We&apos;ve sent a confirmation link to
      </p>
      <p className="text-[14px] font-semibold text-bp-primary mb-6">{maskedEmail}</p>
      <p className="text-[13px] text-gray-500 mb-6 leading-relaxed">
        Click the link in the email to activate your account. Once our team approves your credentials, you&apos;ll get access to the provider dashboard.
        Check your spam folder if you don&apos;t see it within a few minutes.
      </p>

      {/* Resend section */}
      <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-4 text-center space-y-3 mb-6">
        <p className="text-sm text-gray-500">
          Didn&apos;t receive it? Check your spam folder or resend below.
        </p>

        {resendStatus === 'sent' && countdown > 0 ? (
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>Email resent!</span>
            <span className="text-gray-400 font-normal">
              (resend again in {countdown}s)
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={resendStatus === 'loading' || countdown > 0}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {resendStatus === 'loading' ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Resending…
              </>
            ) : countdown > 0 ? (
              <>
                <RefreshCw className="h-4 w-4" />
                Resend in {countdown}s
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Resend confirmation email
              </>
            )}
          </button>
        )}

        {resendStatus === 'error' && resendError && (
          <p className="text-xs font-medium text-red-500">{resendError}</p>
        )}
      </div>

      <div className="flex justify-center">
        <BackLink onClick={onBack} />
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DoctorSignupPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<StepNumber>(1)
  const [submitError, setSubmitError] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const pendingAvatarRef = useRef<{ dataUrl: string; mimeType: string; fileName: string } | null>(null)

  function handleAvatarChange(dataUrl: string, mimeType: string, fileName: string) {
    setAvatarPreview(dataUrl)
    pendingAvatarRef.current = { dataUrl, mimeType, fileName }
  }

  const [step1, setStep1] = useState<Step1Data>({ name: '', phone: '', email: '', password: '' })
  const [step2, setStep2] = useState<Step2Data>({
    registrationType: 'NCAHP',
    ncahpNumber: '',
    iapNumber: '',
    stateRegistrationNumber: '',
    stateName: '',
    degree: '',
    experienceYears: '',
    specialties: [],
    certifications: [],
  })
  const [step3, setStep3] = useState<Step3Data>({
    visitTypes: [],
    clinicName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    modalities: [],
  })
  const [step4, setStep4] = useState<Step4Data>({
    fees: { in_clinic: '', home_visit: '' },
    slotDuration: '',
    availability: buildInitialAvailability(),
  })

  async function goNext() {
    if (currentStep === 4) {
      // Submit everything to the onboard-signup API (creates user + runs onboarding)
      setSubmitError('')
      setSubmitLoading(true)

      try {
        const rawPhone = step1.phone.replace(/\D/g, '')
        const cleanPhone = rawPhone.length === 10
          ? `+91${rawPhone}`
          : (rawPhone.startsWith('91') && rawPhone.length === 12 ? `+${rawPhone}` : `+91${rawPhone}`)

        const availability = Object.fromEntries(
          Object.entries(step4.availability).map(([day, config]) => [
            SHORT_DAY_TO_FULL_DAY[day as keyof typeof SHORT_DAY_TO_FULL_DAY],
            {
              enabled: config.enabled,
              slots: config.slots.map((slot) => ({
                start: slot.startTime,
                end: slot.endTime,
              })),
            },
          ]),
        )

        const res = await fetch('/api/providers/onboard-signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: step1.email,
            password: step1.password,
            step1: { name: step1.name, phone: cleanPhone, email: step1.email },
            step2,
            step3,
            step4: { ...step4, availability },
          }),
        })

        if (!res.ok) {
          const payload = await res.json().catch(() => ({})) as { error?: string }
          setSubmitError(payload.error ?? 'Registration failed. Please try again.')
          return
        }

        // Avatar upload is skipped here — provider has no session yet (email not confirmed).
        // Provider can add their photo from the dashboard after confirming their email.

        // Advance to the confirmation screen
        setCurrentStep(5)
      } catch {
        setSubmitError('Network error. Please check your connection and try again.')
      } finally {
        setSubmitLoading(false)
      }
      return
    }

    setCurrentStep((s) => Math.min(s + 1, 5) as StepNumber)
  }

  function goBack() {
    setCurrentStep((s) => Math.max(s - 1, 1) as StepNumber)
  }

  // Redirect to login from Step 5 (user must confirm email first)
  function handleLoginRedirect() {
    router.push('/login')
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 pb-10 sm:p-10 sm:pb-12 max-w-[560px] w-full shadow-sm animate-in fade-in duration-500">
      <div className="flex justify-center mb-6">
        <BpLogo href="/" size="auth" linkClassName="mx-auto" />
      </div>
      <ProgressIndicator current={currentStep} />

      {currentStep === 1 && (
        <Step1 data={step1} onChange={setStep1} onNext={goNext} avatarPreview={avatarPreview} onAvatarChange={handleAvatarChange} />
      )}
      {currentStep === 2 && (
        <Step2 data={step2} onChange={setStep2} onNext={goNext} onBack={goBack} />
      )}
      {currentStep === 3 && (
        <Step3 data={step3} onChange={setStep3} onNext={goNext} onBack={goBack} />
      )}
      {currentStep === 4 && (
        <Step4
          data={step4}
          visitTypes={step3.visitTypes}
          onChange={setStep4}
          onNext={goNext}
          onBack={goBack}
          submitError={submitError}
          submitLoading={submitLoading}
        />
      )}
      {currentStep === 5 && (
        <Step5
          email={step1.email}
          onBack={() => router.push('/login')}
        />
      )}

      {/* Show login redirect hint in Step 5 */}
      {currentStep === 5 && (
        <p className="text-center text-sm text-gray-500 mt-4">
          Already confirmed?{' '}
          <button
            type="button"
            onClick={handleLoginRedirect}
            className="font-semibold text-bp-primary hover:text-bp-primary-dark transition-colors bg-transparent border-none cursor-pointer p-0"
          >
            Sign in
          </button>
        </p>
      )}
    </div>
  )
}
