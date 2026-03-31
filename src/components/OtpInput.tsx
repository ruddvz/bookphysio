'use client'

import React, { useRef, useEffect, useCallback, useState } from 'react'

interface OtpInputProps {
  length?: number
  value: string[]
  onChange: (value: string[]) => void
  onComplete?: (code: string) => void
  disabled?: boolean
  error?: boolean
}

export default function OtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  error = false,
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)

  // Focus specific input
  const focusInput = useCallback((index: number) => {
    const nextIndex = Math.max(0, Math.min(index, length - 1))
    inputRefs.current[nextIndex]?.focus()
  }, [length])

  // Initial focus
  useEffect(() => {
    if (!disabled) {
      focusInput(0)
    }
  }, [disabled, focusInput])

  // Handle digit input
  const handleInput = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return

    const val = e.target.value
    // We only care about the last character typed (if any)
    const digit = val.replace(/\D/g, '').slice(-1)

    const nextValue = [...value]
    nextValue[index] = digit
    onChange(nextValue)

    // Auto-advance
    if (digit && index < length - 1) {
      focusInput(index + 1)
    }

    // Check if complete
    const code = nextValue.join('')
    if (code.length === length && onComplete) {
      onComplete(code)
    }
  }

  // Handle backspace and navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return

    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        // Clear previous box and focus it
        const nextValue = [...value]
        nextValue[index - 1] = ''
        onChange(nextValue)
        focusInput(index - 1)
      } else {
        // Clear current box
        const nextValue = [...value]
        nextValue[index] = ''
        onChange(nextValue)
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      focusInput(index - 1)
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      focusInput(index + 1)
    }
  }

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    if (disabled) return
    e.preventDefault()
    
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!pastedData) return

    const nextValue = Array(length).fill('')
    for (let i = 0; i < pastedData.length; i++) {
      nextValue[i] = pastedData[i]
    }
    onChange(nextValue)

    // Focus last filled or first empty
    const focusIdx = Math.min(pastedData.length, length - 1)
    focusInput(focusIdx)

    // Check if complete
    if (pastedData.length === length && onComplete) {
      onComplete(pastedData)
    }
  }

  return (
    <div className="flex gap-2.5 justify-center">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el }}
          type="tel"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleInput(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={() => setFocusedIndex(i)}
          onBlur={() => setFocusedIndex(null)}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          className={`
            w-12 h-14 sm:w-14 sm:h-16 text-center text-[24px] font-bold 
            rounded-[8px] border-2 transition-all outline-none
            ${disabled ? 'bg-[#F9FAFB] text-[#9CA3AF] border-[#E5E5E5] cursor-not-allowed' : 'bg-white text-[#333333]'}
            ${focusedIndex === i ? 'border-[#00766C] ring-4 ring-[#00766C]/10' : 'border-[#E5E5E5]'}
            ${value[i] && focusedIndex !== i ? 'border-[#00766C]/50' : ''}
            ${error ? 'border-[#DC2626] ring-[#DC2626]/10' : ''}
            focus:border-[#00766C]
          `}
        />
      ))}
    </div>
  )
}
