'use client'

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type KeyboardEvent,
} from 'react'

export const DEFAULT_OTP_LENGTH = 6

export type OtpDigitsHandle = {
  focusFirst: () => void
}

export type OtpDigitsProps = {
  /** Number of digit boxes (default 6). */
  length?: number
  value: string[]
  onChange: (next: string[]) => void
  /** When true, inputs show error border styling. */
  hasError?: boolean
}

/**
 * Six-digit (or custom length) OTP input grid with paste, auto-advance, and backspace-to-previous.
 */
export const OtpDigits = forwardRef<OtpDigitsHandle, OtpDigitsProps>(function OtpDigits(
  { length = DEFAULT_OTP_LENGTH, value, onChange, hasError = false },
  ref,
) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  useImperativeHandle(ref, () => ({
    focusFirst: () => {
      inputRefs.current[0]?.focus()
    },
  }))

  function handleDigitChange(index: number, raw: string) {
    if (raw.length > 1) {
      const clean = raw.replace(/\D/g, '').slice(0, length)
      const next = Array.from({ length }, (_, i) => clean[i] ?? '')
      onChange(next)
      inputRefs.current[Math.min(clean.length, length - 1)]?.focus()
      return
    }
    const digit = raw.replace(/\D/g, '').slice(-1)
    const next = [...value]
    next[index] = digit
    onChange(next)
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  return (
    <div className="flex justify-center gap-2 mb-4">
      {Array.from({ length }, (_, i) => {
        const d = value[i] ?? ''
        return (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el
            }}
            type="text"
            inputMode="numeric"
            maxLength={length}
            value={d}
            onChange={(e) => handleDigitChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onFocus={(e) => e.target.select()}
            style={{
              width: '44px',
              height: '52px',
              textAlign: 'center',
              fontSize: '22px',
              fontWeight: 700,
              border: `2px solid ${hasError ? '#FCA5A5' : d ? 'var(--color-bp-primary)' : 'var(--color-bp-border)'}`,
              borderRadius: '10px',
              color: 'var(--color-bp-primary)',
              outline: 'none',
              background: d ? 'var(--color-bp-light)' : '#fff',
              transition: 'border-color 0.15s, background 0.15s',
            }}
          />
        )
      })}
    </div>
  )
})

OtpDigits.displayName = 'OtpDigits'
