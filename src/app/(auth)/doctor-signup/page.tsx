'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import BpLogo from '@/components/BpLogo'
import OtpInput from '@/components/OtpInput'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Step1Data {
  name: string
  phone: string
  email: string
}

interface Step2Data {
  registrationType: 'IAP' | 'STATE'
  iapNumber: string
  stateRegistrationNumber: string
  stateName: string
  degree: 'BPT' | 'MPT' | 'PhD' | ''
  experienceYears: string
  specialties: string[]
}

interface Step3Data {
  clinicName: string
  address: string
  city: string
  pincode: string
  visitTypes: string[]
}

interface DayAvailability {
  enabled: boolean
  startTime: string
  endTime: string
}

interface Step4Data {
  fees: {
    in_clinic: string
    home_visit: string
  }
  slotDuration: '30' | '45' | '60' | ''
  availability: Record<string, DayAvailability>
}

interface Step5Data {
  otp: string[]
}

type StepNumber = 1 | 2 | 3 | 4 | 5

// ─── Constants ────────────────────────────────────────────────────────────────

const STEP_LABELS = ['Personal', 'Professional', 'Practice', 'Pricing', 'Verify']
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const SPECIALTIES = [
  'Sports Physio',
  'Ortho Physio',
  'Neuro Physio',
  'Paediatric Physio',
  "Women's Health",
  'Geriatric Physio',
  'Cardiopulmonary',
]
const CITIES = [
  'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad',
  'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Surat',
]
const VISIT_LABELS: Record<string, string> = {
  in_clinic: 'In-clinic',
  home_visit: 'Home Visit',
}
const FEE_LABELS: Record<string, string> = {
  in_clinic: 'In-clinic consultation fee',
  home_visit: 'Home visit fee',
}
const OTP_LENGTH = 6

// ─── Schemas ──────────────────────────────────────────────────────────────────

const step1Schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  email: z.string().email('Enter a valid email').or(z.literal('')),
})

const step2Schema = z.object({
  registrationType: z.enum(['IAP', 'STATE']),
  iapNumber: z.string().optional(),
  stateRegistrationNumber: z.string().optional(),
  stateName: z.string().optional(),
  degree: z.enum(['BPT', 'MPT', 'PhD'], { error: 'Select a degree' }),
  experienceYears: z
    .string()
    .regex(/^\d+$/, 'Enter a number')
    .refine((v) => parseInt(v) >= 0 && parseInt(v) <= 50, 'Enter valid years (0–50)'),
  specialties: z.array(z.string()).min(1, 'Select at least one specialty'),
}).refine(data => {
  if (data.registrationType === 'IAP') {
    return !!data.iapNumber && data.iapNumber.length >= 3
  }
  return !!data.stateRegistrationNumber && !!data.stateName
}, {
  message: 'Registration details are required',
  path: ['registrationType']
})

const step3Schema = z.object({
  clinicName: z.string().min(2, 'Enter clinic name'),
  address: z.string().min(5, 'Enter full address'),
  city: z.string().min(1, 'Select a city'),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, 'Enter valid 6-digit pincode'),
  visitTypes: z.array(z.string()).min(1, 'Select at least one visit type'),
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
      startTime: '09:00',
      endTime: '18:00',
    }
  }
  return result
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
    if (av.enabled && av.endTime <= av.startTime) {
      errors[`time_${day}`] = `End time must be after start time`
    }
  }
  return errors
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
      className={`w-full h-12 text-white border-none rounded-full text-[15px] font-semibold mt-2 flex items-center justify-center gap-2 transition-colors outline-none ${
        disabled ? 'bg-[#a0cdc9] cursor-not-allowed' : 'bg-bp-accent hover:bg-bp-primary cursor-pointer'
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
      className="flex items-center gap-1.5 text-bp-body text-[14px] bg-transparent border-none cursor-pointer pt-3 mx-auto hover:text-bp-primary transition-colors outline-none"
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
      style={{ ...inputStyle, ...extraStyle, borderColor: focused ? 'var(--color-bp-accent)' : 'var(--color-bp-border)' }}
    />
  )
}

// ─── Progress Indicator ───────────────────────────────────────────────────────

function ProgressIndicator({ current }: { current: StepNumber }) {
  return (
    <div className="mb-8" aria-label="Signup progress">
      <div className="flex items-center justify-between">
        {STEP_LABELS.map((label, i) => {
          const step = (i + 1) as StepNumber
          const done = step < current
          const active = step === current

          return (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              {/* Circle + label */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  aria-current={active ? 'step' : undefined}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold transition-colors ${
                    done
                      ? 'bg-bp-accent text-white'
                      : active
                      ? 'border-2 border-bp-accent bg-white text-bp-accent ring-2 ring-bp-accent/20'
                      : 'border-2 border-[#BBBBBB] bg-white text-bp-body/60'
                  }`}
                >
                  {done ? <Check className="w-4 h-4" strokeWidth={2.5} /> : step}
                </div>
                <span
                  className={`text-[11px] whitespace-nowrap hidden sm:block ${
                    active ? 'text-bp-accent font-semibold' : done ? 'text-bp-accent' : 'text-bp-body/60'
                  }`}
                >
                  {label}
                </span>
              </div>

              {/* Connector line */}
              {i < STEP_LABELS.length - 1 && (
                <div className="mx-1.5 mb-4 h-[2px] flex-1">
                  <div
                    className={`h-full transition-colors ${step < current ? 'bg-bp-accent' : 'bg-bp-body/30'}`}
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
}

function Step1({ data, onChange, onNext }: Step1Props) {
  const [errors, setErrors] = useState<Partial<Record<keyof Step1Data, string>>>({})
  const [phoneFocused, setPhoneFocused] = useState(false)

  function handleNext() {
    const result = step1Schema.safeParse(data)
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors
      setErrors({
        name: flat.name?.[0],
        phone: flat.phone?.[0],
        email: flat.email?.[0],
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
      <p style={{ fontSize: '14px', color: 'var(--color-bp-body)', marginBottom: '24px' }}>
        Let&apos;s start with your basic information
      </p>

      <div style={{ marginBottom: '16px' }}>
        <Label>Full Name</Label>
        <FocusableInput
          value={data.name}
          onChange={(v) => onChange({ ...data, name: v })}
          placeholder="Dr. Priya Sharma"
        />
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
              color: 'var(--color-bp-body)',
              flexShrink: 0,
            }}
          >
            +91
          </div>
          <input
            type="tel"
            value={data.phone}
            maxLength={10}
            onChange={(e) => onChange({ ...data, phone: e.target.value.replace(/\D/g, '') })}
            placeholder="98765 43210"
            onFocus={() => setPhoneFocused(true)}
            onBlur={() => setPhoneFocused(false)}
            style={{
              ...inputStyle,
              borderRadius: '0 8px 8px 0',
              borderColor: phoneFocused ? 'var(--color-bp-accent)' : 'var(--color-bp-border)',
            }}
          />
        </div>
        <FieldError msg={errors.phone} />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <Label>Email <span style={{ fontWeight: 400, color: 'var(--color-bp-body)' }}>(optional)</span></Label>
        <FocusableInput
          value={data.email}
          onChange={(v) => onChange({ ...data, email: v })}
          placeholder="priya@clinic.com"
          type="email"
        />
        <FieldError msg={errors.email} />
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
      <p style={{ fontSize: '14px', color: 'var(--color-bp-body)', marginBottom: '24px' }}>
        Your credentials and expertise
      </p>

      {/* Registration Type Switcher */}
      <div style={{ marginBottom: '24px' }}>
        <Label>Registration Type</Label>
        <div style={{ display: 'flex', padding: '4px', borderRadius: '12px', gap: '4px', backgroundColor: 'var(--color-bp-surface)' }}>
          <button
            onClick={() => onChange({ ...data, registrationType: 'IAP' })}
            style={{
              flex: 1,
              padding: '8px',
              fontSize: '13px',
              fontWeight: 700,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: data.registrationType === 'IAP' ? '#FFFFFF' : 'transparent',
              color: data.registrationType === 'IAP' ? '#00766C' : '#999999',
              boxShadow: data.registrationType === 'IAP' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            IAP Number (Recommended)
          </button>
          <button
            onClick={() => onChange({ ...data, registrationType: 'STATE' })}
            style={{
              flex: 1,
              padding: '8px',
              fontSize: '13px',
              fontWeight: 700,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: data.registrationType === 'STATE' ? '#FFFFFF' : 'transparent',
              color: data.registrationType === 'STATE' ? '#00766C' : '#999999',
              boxShadow: data.registrationType === 'STATE' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            State Council Number
          </button>
        </div>
        <FieldError msg={errors.registrationType} />
      </div>

      {data.registrationType === 'IAP' ? (
        <div style={{ marginBottom: '16px' }}>
          <Label>IAP Registration Number</Label>
          <FocusableInput
            value={data.iapNumber}
            onChange={(v) => onChange({ ...data, iapNumber: v })}
            placeholder="e.g. L-12345"
          />
          <FieldError msg={errors.iapNumber} />
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1 }}>
            <Label>Council/State Name</Label>
            <FocusableInput
              value={data.stateName}
              onChange={(v) => onChange({ ...data, stateName: v })}
              placeholder="e.g. Maharashtra"
            />
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
          {(['BPT', 'MPT', 'PhD'] as const).map((deg) => (
            <label key={deg} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '15px', color: 'var(--color-bp-primary)' }}>
              <input
                type="radio"
                name="degree"
                value={deg}
                checked={data.degree === deg}
                onChange={() => onChange({ ...data, degree: deg })}
                style={{ accentcolor: 'var(--color-bp-accent)' }}
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
                style={{ accentcolor: 'var(--color-bp-accent)', width: '16px', height: '16px' }}
              />
              {s}
            </label>
          ))}
        </div>
        <FieldError msg={errors.specialties} />
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
  const [errors, setErrors] = useState<Partial<Record<keyof Step3Data, string>>>({})
  const [areaFocused, setAreaFocused] = useState(false)
  const [cityFocused, setCityFocused] = useState(false)

  function handleNext() {
    const result = step3Schema.safeParse(data)
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors
      setErrors({
        clinicName: flat.clinicName?.[0],
        address: flat.address?.[0],
        city: flat.city?.[0],
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
      <p style={{ fontSize: '14px', color: 'var(--color-bp-body)', marginBottom: '24px' }}>
        Where you see patients
      </p>

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
        <Label>Address</Label>
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
            borderColor: areaFocused ? 'var(--color-bp-accent)' : 'var(--color-bp-border)',
          }}
        />
        <FieldError msg={errors.address} />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <Label>City</Label>
        <select
          value={data.city}
          onChange={(e) => onChange({ ...data, city: e.target.value })}
          onFocus={() => setCityFocused(true)}
          onBlur={() => setCityFocused(false)}
          style={{ ...inputStyle, borderColor: cityFocused ? 'var(--color-bp-accent)' : 'var(--color-bp-border)' }}
        >
          <option value="">Select city</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <FieldError msg={errors.city} />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <Label>Pincode</Label>
        <FocusableInput
          value={data.pincode}
          onChange={(v) => onChange({ ...data, pincode: v.replace(/\D/g, '').slice(0, 6) })}
          placeholder="110001"
          style={{ width: '140px' }}
        />
        <FieldError msg={errors.pincode} />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <Label>Visit Types Offered</Label>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {Object.entries(VISIT_LABELS).map(([vt, label]) => (
            <label key={vt} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '15px', color: 'var(--color-bp-primary)' }}>
              <input
                type="checkbox"
                checked={data.visitTypes.includes(vt)}
                onChange={() => toggleVisitType(vt)}
                style={{ accentcolor: 'var(--color-bp-accent)', width: '16px', height: '16px' }}
              />
              {label}
            </label>
          ))}
        </div>
        <FieldError msg={errors.visitTypes} />
      </div>

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
}

function Step4({ data, visitTypes, onChange, onNext, onBack }: Step4Props) {
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

  function setDayField(day: string, field: keyof DayAvailability, val: string | boolean) {
    onChange({
      ...data,
      availability: {
        ...data.availability,
        [day]: { ...data.availability[day], [field]: val },
      },
    })
  }

  const allVisitTypes = ['in_clinic', 'home_visit']

  return (
    <div>
      <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-bp-primary)', marginBottom: '6px' }}>
        Pricing &amp; Availability
      </h2>
      <p style={{ fontSize: '14px', color: 'var(--color-bp-body)', marginBottom: '24px' }}>
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
                  fontSize: '15px', color: 'var(--color-bp-body)', flexShrink: 0,
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
                    borderColor: focusedFee === vt ? '#00766C' : '#E5E5E5',
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
                style={{ accentcolor: 'var(--color-bp-accent)' }}
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
        <div style={{ display: 'grid', gridTemplateColumns: '56px 1fr 1fr 1fr', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-bp-body)', fontWeight: 600 }}>Day</span>
          <span style={{ fontSize: '12px', color: 'var(--color-bp-body)', fontWeight: 600 }}>On?</span>
          <span style={{ fontSize: '12px', color: 'var(--color-bp-body)', fontWeight: 600 }}>From</span>
          <span style={{ fontSize: '12px', color: 'var(--color-bp-body)', fontWeight: 600 }}>To</span>
          {DAYS.map((day) => {
            const av = data.availability[day]
            const dim = !av.enabled
            const timeKey = `time_${day}`
            return [
              <span key={`${day}-label`} style={{ fontSize: '14px', color: 'var(--color-bp-primary)', fontWeight: 500 }}>{day}</span>,
              <input
                key={`${day}-check`}
                type="checkbox"
                aria-label={`Enable ${day}`}
                checked={av.enabled}
                onChange={(e) => setDayField(day, 'enabled', e.target.checked)}
                style={{ accentcolor: 'var(--color-bp-accent)', width: '16px', height: '16px' }}
              />,
              <select
                key={`${day}-start`}
                aria-label={`${day} start time`}
                value={av.startTime}
                disabled={dim}
                onChange={(e) => setDayField(day, 'startTime', e.target.value)}
                onFocus={() => setFocusedTimes(`${day}-start`)}
                onBlur={() => setFocusedTimes(null)}
                style={{
                  ...inputStyle,
                  height: '36px',
                  fontSize: '13px',
                  padding: '0 8px',
                  opacity: dim ? 0.4 : 1,
                  pointerEvents: dim ? 'none' : 'auto',
                  borderColor: focusedTimes === `${day}-start` ? '#00766C' : '#E5E5E5',
                }}
              >
                {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>,
              <div key={`${day}-end-wrap`}>
                <select
                  aria-label={`${day} end time`}
                  value={av.endTime}
                  disabled={dim}
                  onChange={(e) => setDayField(day, 'endTime', e.target.value)}
                  onFocus={() => setFocusedTimes(`${day}-end`)}
                  onBlur={() => setFocusedTimes(null)}
                  style={{
                    ...inputStyle,
                    height: '36px',
                    fontSize: '13px',
                    padding: '0 8px',
                    opacity: dim ? 0.4 : 1,
                    pointerEvents: dim ? 'none' : 'auto',
                    borderColor: focusedTimes === `${day}-end` ? '#00766C' : '#E5E5E5',
                  }}
                >
                  {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors[timeKey] && <FieldError msg={errors[timeKey]} />}
              </div>,
            ]
          })}
        </div>
      </div>

      <PrimaryButton onClick={handleNext}>
        Next: Verify Phone
        <ArrowRight className="w-4 h-4" />
      </PrimaryButton>
      <div className="flex justify-center">
        <BackLink onClick={onBack} />
      </div>
    </div>
  )
}

// ─── Step 5 ───────────────────────────────────────────────────────────────────

interface Step5Props {
  data: Step5Data
  phone: string
  onChange: (d: Step5Data) => void
  onSubmit: () => void
  onBack: () => void
}

function Step5({ data, phone, onChange, onSubmit, onBack }: Step5Props) {
  const [countdown, setCountdown] = useState(45)
  const [canResend, setCanResend] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true)
      return
    }
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(id)
  }, [countdown])

  function handleResend() {
    setCountdown(45)
    setCanResend(false)
    onChange({ otp: Array(OTP_LENGTH).fill('') })
    fetch('/api/auth/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '+91' + phone, flow: 'provider_signup' }),
    })
  }

  async function handleSubmitOtp() {
    if (data.otp.some((d) => !d)) {
      setError('Enter all 6 digits')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: '+91' + phone, 
          otp: data.otp.join('') 
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error || 'Invalid OTP')
        return
      }
      onSubmit()
    } catch {
      setError('Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const displayPhone = phone
    ? `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`
    : ''

  return (
    <div className="text-center">
      <h2 className="text-[22px] font-bold text-bp-primary mb-2">Almost there!</h2>
      <p className="text-[15px] text-bp-primary mb-1">Verify your mobile number</p>
      <p className="text-[14px] text-bp-body mb-7">
        Code sent to <span className="font-semibold text-bp-primary">{displayPhone}</span>
      </p>

      <div className="mb-4">
        <OtpInput
          value={data.otp}
          onChange={(otp) => onChange({ otp })}
          onComplete={handleSubmitOtp}
          disabled={loading}
          error={!!error}
        />
      </div>

      {error && (
        <p className="text-[12px] text-[#DC2626] mb-3">{error}</p>
      )}

      <p className="text-[14px] text-bp-body mb-5">
        {canResend ? (
          <button
            onClick={handleResend}
            className="bg-transparent border-none text-bp-accent cursor-pointer text-[14px] font-semibold hover:text-bp-primary transition-colors outline-none"
          >
            Resend code
          </button>
        ) : (
          <>Resend in <strong>{countdown}s</strong></>
        )}
      </p>

      <PrimaryButton onClick={() => handleSubmitOtp()} disabled={loading}>
        {loading ? 'Submitting…' : (
          <>
            Complete Registration
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </PrimaryButton>
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

  const [step1, setStep1] = useState<Step1Data>({ name: '', phone: '', email: '' })
  const [step2, setStep2] = useState<Step2Data>({
    registrationType: 'IAP',
    iapNumber: '',
    stateRegistrationNumber: '',
    stateName: '',
    degree: '',
    experienceYears: '',
    specialties: [],
  })
  const [step3, setStep3] = useState<Step3Data>({
    clinicName: '', address: '', city: '', pincode: '', visitTypes: [],
  })
  const [step4, setStep4] = useState<Step4Data>({
    fees: { in_clinic: '', home_visit: '' },
    slotDuration: '',
    availability: buildInitialAvailability(),
  })
  const [step5, setStep5] = useState<Step5Data>({ otp: Array(OTP_LENGTH).fill('') })

  function goNext() {
    if (currentStep === 4) {
      // Robust phone formatting: strip all non-digits, then add +91
      const rawPhone = step1.phone.replace(/\D/g, '')
      const cleanPhone = rawPhone.length === 10 ? `+91${rawPhone}` : (rawPhone.startsWith('91') && rawPhone.length === 12 ? `+${rawPhone}` : `+91${rawPhone}`)
      
      // Send OTP when moving TO step 5
      fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, flow: 'provider_signup' }),
      })
    }
    setCurrentStep((s) => Math.min(s + 1, 5) as StepNumber)
  }
  function goBack() {
    setCurrentStep((s) => Math.max(s - 1, 1) as StepNumber)
  }
  async function handleSubmit() {
    // Send all data to onboarding API
    try {
      const step4Payload = {
        ...step4,
        fees: {
          in_clinic: parseInt(step4.fees.in_clinic, 10) || 0,
          home_visit: parseInt(step4.fees.home_visit, 10) || 0,
        },
      }
      const res = await fetch('/api/providers/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step1, step2, step3, step4: step4Payload
        })
      })
      if (res.ok) {
        router.push('/provider/dashboard')
      } else {
        alert('Onboarding failed. Please contact support.')
      }
    } catch {
      alert('Network error')
    }
  }

  return (
    <div className="bg-white rounded-[24px] border border-bp-border p-8 pb-10 sm:p-10 sm:pb-12 max-w-[560px] w-full shadow-xl shadow-bp-primary/5 animate-in fade-in duration-500">
      <BpLogo href="/" />
      <ProgressIndicator current={currentStep} />

      {currentStep === 1 && (
        <Step1 data={step1} onChange={setStep1} onNext={goNext} />
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
        />
      )}
      {currentStep === 5 && (
        <Step5
          data={step5}
          phone={step1.phone}
          onChange={setStep5}
          onSubmit={handleSubmit}
          onBack={goBack}
        />
      )}
    </div>
  )
}
