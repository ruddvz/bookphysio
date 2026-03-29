'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Step1Data {
  name: string
  phone: string
  email: string
}

interface Step2Data {
  icpNumber: string
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
    online: string
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
  online: 'Online',
}
const FEE_LABELS: Record<string, string> = {
  in_clinic: 'In-clinic consultation fee',
  home_visit: 'Home visit fee',
  online: 'Online consultation fee',
}

// ─── Schemas ──────────────────────────────────────────────────────────────────

const step1Schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  email: z.string().email('Enter a valid email').or(z.literal('')),
})

const step2Schema = z.object({
  icpNumber: z.string().min(5, 'Enter your ICP registration number'),
  degree: z.enum(['BPT', 'MPT', 'PhD'], { error: 'Select a degree' }),
  experienceYears: z
    .string()
    .regex(/^\d+$/, 'Enter a number')
    .refine((v) => parseInt(v) >= 0 && parseInt(v) <= 50, 'Enter valid years (0–50)'),
  specialties: z.array(z.string()).min(1, 'Select at least one specialty'),
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
  border: '1px solid #E5E5E5',
  borderRadius: '8px',
  padding: '0 12px',
  fontSize: '15px',
  color: '#333333',
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
    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#333333', marginBottom: '6px' }}>
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
      style={{
        width: '100%',
        height: '48px',
        backgroundColor: disabled ? '#A0C4C1' : '#00766C',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '24px',
        fontSize: '15px',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        marginTop: '8px',
      }}
    >
      {children}
    </button>
  )
}

function BackLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        color: '#666666',
        fontSize: '14px',
        cursor: 'pointer',
        padding: '8px 0 0',
        display: 'block',
        margin: '0 auto',
      }}
    >
      ← Back
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
      style={{ ...inputStyle, ...extraStyle, borderColor: focused ? '#00766C' : '#E5E5E5' }}
    />
  )
}

// ─── Progress Indicator ───────────────────────────────────────────────────────

function ProgressIndicator({ current }: { current: StepNumber }) {
  return (
    <div style={{ marginBottom: '28px' }}>
      <p style={{ fontSize: '13px', color: '#666666', marginBottom: '10px', textAlign: 'center' }}>
        Step {current} of 5
      </p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0' }}>
        {STEP_LABELS.map((label, i) => {
          const step = (i + 1) as StepNumber
          const filled = step <= current
          return (
            <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: filled ? '#00766C' : 'transparent',
                    border: `2px solid ${filled ? '#00766C' : '#CCCCCC'}`,
                  }}
                />
                <span style={{ fontSize: '11px', color: filled ? '#00766C' : '#999999', whiteSpace: 'nowrap' }}>
                  {label}
                </span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div
                  style={{
                    width: '36px',
                    height: '2px',
                    backgroundColor: step < current ? '#00766C' : '#E5E5E5',
                    marginBottom: '16px',
                    flexShrink: 0,
                  }}
                />
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
      <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#333333', marginBottom: '6px' }}>
        Personal Details
      </h2>
      <p style={{ fontSize: '14px', color: '#666666', marginBottom: '24px' }}>
        Let's start with your basic information
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
              backgroundColor: '#F5F5F5',
              border: '1px solid #E5E5E5',
              borderRight: 'none',
              borderRadius: '8px 0 0 8px',
              display: 'flex',
              alignItems: 'center',
              fontSize: '15px',
              color: '#666666',
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
              borderColor: phoneFocused ? '#00766C' : '#E5E5E5',
            }}
          />
        </div>
        <FieldError msg={errors.phone} />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <Label>Email <span style={{ fontWeight: 400, color: '#999999' }}>(optional)</span></Label>
        <FocusableInput
          value={data.email}
          onChange={(v) => onChange({ ...data, email: v })}
          placeholder="priya@clinic.com"
          type="email"
        />
        <FieldError msg={errors.email} />
      </div>

      <PrimaryButton onClick={handleNext}>Next: Professional Details →</PrimaryButton>
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
        icpNumber: flat.icpNumber?.[0],
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
      <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#333333', marginBottom: '6px' }}>
        Professional Details
      </h2>
      <p style={{ fontSize: '14px', color: '#666666', marginBottom: '24px' }}>
        Your credentials and expertise
      </p>

      <div style={{ marginBottom: '16px' }}>
        <Label>ICP Registration Number</Label>
        <FocusableInput
          value={data.icpNumber}
          onChange={(v) => onChange({ ...data, icpNumber: v })}
          placeholder="ICP-MH-YYYY-XXXXX"
        />
        <FieldError msg={errors.icpNumber} />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <Label>Degree</Label>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {(['BPT', 'MPT', 'PhD'] as const).map((deg) => (
            <label key={deg} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '15px', color: '#333333' }}>
              <input
                type="radio"
                name="degree"
                value={deg}
                checked={data.degree === deg}
                onChange={() => onChange({ ...data, degree: deg })}
                style={{ accentColor: '#00766C' }}
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
            <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '15px', color: '#333333' }}>
              <input
                type="checkbox"
                checked={data.specialties.includes(s)}
                onChange={() => toggleSpecialty(s)}
                style={{ accentColor: '#00766C', width: '16px', height: '16px' }}
              />
              {s}
            </label>
          ))}
        </div>
        <FieldError msg={errors.specialties} />
      </div>

      <PrimaryButton onClick={handleNext}>Next: Practice Details →</PrimaryButton>
      <BackLink onClick={onBack} />
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
      <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#333333', marginBottom: '6px' }}>
        Practice Details
      </h2>
      <p style={{ fontSize: '14px', color: '#666666', marginBottom: '24px' }}>
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
            borderColor: areaFocused ? '#00766C' : '#E5E5E5',
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
          style={{ ...inputStyle, borderColor: cityFocused ? '#00766C' : '#E5E5E5' }}
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
            <label key={vt} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '15px', color: '#333333' }}>
              <input
                type="checkbox"
                checked={data.visitTypes.includes(vt)}
                onChange={() => toggleVisitType(vt)}
                style={{ accentColor: '#00766C', width: '16px', height: '16px' }}
              />
              {label}
            </label>
          ))}
        </div>
        <FieldError msg={errors.visitTypes} />
      </div>

      <PrimaryButton onClick={handleNext}>Next: Pricing & Availability →</PrimaryButton>
      <BackLink onClick={onBack} />
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

  const allVisitTypes = ['in_clinic', 'home_visit', 'online']

  return (
    <div>
      <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#333333', marginBottom: '6px' }}>
        Pricing & Availability
      </h2>
      <p style={{ fontSize: '14px', color: '#666666', marginBottom: '24px' }}>
        Set your fees and working hours
      </p>

      {/* Section A: Fees */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '15px', fontWeight: 600, color: '#333333', marginBottom: '12px' }}>
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
                  backgroundColor: '#F5F5F5', border: '1px solid #E5E5E5',
                  borderRight: 'none', borderRadius: '8px 0 0 8px',
                  display: 'flex', alignItems: 'center',
                  fontSize: '15px', color: '#666666', flexShrink: 0,
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
            <label key={d} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '15px', color: '#333333' }}>
              <input
                type="radio"
                name="slotDuration"
                value={d}
                checked={data.slotDuration === d}
                onChange={() => onChange({ ...data, slotDuration: d })}
                style={{ accentColor: '#00766C' }}
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
          <span style={{ fontSize: '12px', color: '#666666', fontWeight: 600 }}>Day</span>
          <span style={{ fontSize: '12px', color: '#666666', fontWeight: 600 }}>On?</span>
          <span style={{ fontSize: '12px', color: '#666666', fontWeight: 600 }}>From</span>
          <span style={{ fontSize: '12px', color: '#666666', fontWeight: 600 }}>To</span>
          {DAYS.map((day) => {
            const av = data.availability[day]
            const dim = !av.enabled
            const timeKey = `time_${day}`
            return (
              <>
                <span key={`${day}-label`} style={{ fontSize: '14px', color: '#333333', fontWeight: 500 }}>{day}</span>
                <input
                  key={`${day}-check`}
                  type="checkbox"
                  checked={av.enabled}
                  onChange={(e) => setDayField(day, 'enabled', e.target.checked)}
                  style={{ accentColor: '#00766C', width: '16px', height: '16px' }}
                />
                <select
                  key={`${day}-start`}
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
                </select>
                <div key={`${day}-end-wrap`}>
                  <select
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
                </div>
              </>
            )
          })}
        </div>
      </div>

      <PrimaryButton onClick={handleNext}>Next: Verify Phone →</PrimaryButton>
      <BackLink onClick={onBack} />
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
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

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
    onChange({ otp: ['', '', '', '', '', ''] })
    inputRefs.current[0]?.focus()
  }

  function handleDigit(index: number, val: string) {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next = data.otp.map((v, i) => (i === index ? digit : v))
    onChange({ otp: next })
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !data.otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handleSubmit() {
    if (data.otp.some((d) => !d)) {
      setError('Enter all 6 digits')
      return
    }
    setError('')
    onSubmit()
  }

  const setRef = useCallback((el: HTMLInputElement | null, i: number) => {
    inputRefs.current[i] = el
  }, [])

  return (
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#333333', marginBottom: '8px' }}>
        Almost there!
      </h2>
      <p style={{ fontSize: '15px', color: '#333333', marginBottom: '4px' }}>
        Verify your mobile number
      </p>
      <p style={{ fontSize: '14px', color: '#666666', marginBottom: '28px' }}>
        Code sent to +91 {phone}
      </p>

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '16px' }}>
        {data.otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => setRef(el, i)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleDigit(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            style={{
              width: '48px',
              height: '56px',
              textAlign: 'center',
              fontSize: '22px',
              fontWeight: 700,
              border: `2px solid ${digit ? '#00766C' : '#E5E5E5'}`,
              borderRadius: '8px',
              outline: 'none',
              color: '#333333',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#00766C')}
            onBlur={(e) => (e.target.style.borderColor = digit ? '#00766C' : '#E5E5E5')}
          />
        ))}
      </div>

      {error && <FieldError msg={error} />}

      <p style={{ fontSize: '14px', color: '#666666', marginBottom: '20px' }}>
        {canResend ? (
          <button
            onClick={handleResend}
            style={{ background: 'none', border: 'none', color: '#00766C', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
          >
            Resend code
          </button>
        ) : (
          <>Resend in <strong>{countdown}s</strong></>
        )}
      </p>

      <PrimaryButton onClick={handleSubmit}>Complete Registration →</PrimaryButton>
      <BackLink onClick={onBack} />
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DoctorSignupPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<StepNumber>(1)

  const [step1, setStep1] = useState<Step1Data>({ name: '', phone: '', email: '' })
  const [step2, setStep2] = useState<Step2Data>({
    icpNumber: '', degree: '', experienceYears: '', specialties: [],
  })
  const [step3, setStep3] = useState<Step3Data>({
    clinicName: '', address: '', city: '', pincode: '', visitTypes: [],
  })
  const [step4, setStep4] = useState<Step4Data>({
    fees: { in_clinic: '', home_visit: '', online: '' },
    slotDuration: '',
    availability: buildInitialAvailability(),
  })
  const [step5, setStep5] = useState<Step5Data>({ otp: ['', '', '', '', '', ''] })

  function goNext() {
    setCurrentStep((s) => Math.min(s + 1, 5) as StepNumber)
  }
  function goBack() {
    setCurrentStep((s) => Math.max(s - 1, 1) as StepNumber)
  }
  function handleSubmit() {
    router.push('/')
  }

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        padding: '40px',
        maxWidth: '560px',
        width: '100%',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      }}
    >
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
