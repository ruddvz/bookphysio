'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type VisitType = 'in_clinic' | 'home_visit' | 'online'

interface FeeMap {
  in_clinic: number
  home_visit: number
  online: number
}

interface BookingCardProps {
  doctorId: string
  fee: FeeMap
  visitTypes: readonly VisitType[]
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TIME_SLOTS = {
  morning: ['9:00', '9:30', '10:00', '11:00', '11:30'],
  afternoon: ['2:00', '2:30', '3:00', '3:30', '4:00'],
  evening: ['5:30', '6:00', '6:30', '7:00'],
}

const VISIT_TYPE_LABELS: Record<VisitType, string> = {
  in_clinic: 'In-clinic',
  home_visit: 'Home Visit',
  online: 'Online',
}

// ---------------------------------------------------------------------------
// Helper: generate 7 days starting from today
// ---------------------------------------------------------------------------

interface DayEntry {
  label: string   // e.g. "Mon"
  dayNum: number  // e.g. 28
  iso: string     // e.g. "2026-03-28"
}

function getNext7Days(): DayEntry[] {
  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const today = new Date()
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const iso = d.toISOString().split('T')[0]
    return {
      label: DAY_NAMES[d.getDay()],
      dayNum: d.getDate(),
      iso,
    }
  })
}

// ---------------------------------------------------------------------------
// Sub-component: TimeSlotGroup
// ---------------------------------------------------------------------------

interface TimeSlotGroupProps {
  heading: string
  slots: string[]
  selectedTime: string | null
  onSelect: (time: string) => void
}

function TimeSlotGroup({ heading, slots, selectedTime, onSelect }: TimeSlotGroupProps) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <p
        style={{
          fontSize: '12px',
          fontWeight: 600,
          color: '#666666',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '8px',
        }}
      >
        {heading}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {slots.map((slot) => {
          const isSelected = selectedTime === slot
          return (
            <button
              key={slot}
              onClick={() => onSelect(slot)}
              style={{
                padding: '6px 14px',
                borderRadius: '24px',
                border: isSelected ? '1px solid #00766C' : '1px solid #E5E5E5',
                backgroundColor: isSelected ? '#00766C' : '#F5F5F5',
                color: isSelected ? '#FFFFFF' : '#333333',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {slot}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function BookingCard({ doctorId, fee, visitTypes }: BookingCardProps) {
  const router = useRouter()
  const days = useMemo(() => getNext7Days(), [])

  const [visitType, setVisitType] = useState<VisitType>('in_clinic')
  const [selectedDate, setSelectedDate] = useState<string>(days[0].iso)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  const selectedFee = fee[visitType]

  function handleBook() {
    if (!selectedDate || !selectedTime) return
    const params = new URLSearchParams({
      date: selectedDate,
      time: selectedTime,
      type: visitType,
    })
    router.push(`/book/${doctorId}?${params.toString()}`)
  }

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        border: '1px solid #E5E5E5',
        padding: '24px',
        position: 'sticky',
        top: '96px',
      }}
    >
      {/* Fee */}
      <div style={{ marginBottom: '20px' }}>
        <span
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#333333',
          }}
        >
          ₹{selectedFee}
        </span>
        <span
          style={{
            fontSize: '14px',
            color: '#666666',
            marginLeft: '4px',
          }}
        >
          / session
        </span>
      </div>

      {/* Visit type tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid #E5E5E5',
          marginBottom: '20px',
        }}
      >
        {visitTypes.map((type) => {
          const isActive = visitType === type
          return (
            <button
              key={type}
              onClick={() => setVisitType(type)}
              style={{
                flex: 1,
                padding: '10px 4px',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#00766C' : '#666666',
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid #00766C' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s',
                marginBottom: '-1px',
                whiteSpace: 'nowrap',
              }}
            >
              {VISIT_TYPE_LABELS[type]}
            </button>
          )
        })}
      </div>

      {/* Date selector */}
      <p
        style={{
          fontSize: '13px',
          fontWeight: 600,
          color: '#333333',
          marginBottom: '10px',
        }}
      >
        Select Date
      </p>
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          marginBottom: '20px',
          paddingBottom: '4px',
        }}
      >
        {days.map((day) => {
          const isSelected = selectedDate === day.iso
          return (
            <button
              key={day.iso}
              onClick={() => {
                setSelectedDate(day.iso)
                setSelectedTime(null)
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: '8px',
                border: isSelected ? '1px solid #00766C' : '1px solid #E5E5E5',
                backgroundColor: isSelected ? '#00766C' : '#F5F5F5',
                color: isSelected ? '#FFFFFF' : '#333333',
                cursor: 'pointer',
                transition: 'all 0.15s',
                minWidth: '52px',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 500 }}>{day.label}</span>
              <span style={{ fontSize: '16px', fontWeight: 700 }}>{day.dayNum}</span>
            </button>
          )
        })}
      </div>

      {/* Time slots */}
      <p
        style={{
          fontSize: '13px',
          fontWeight: 600,
          color: '#333333',
          marginBottom: '12px',
        }}
      >
        Select Time
      </p>
      <TimeSlotGroup
        heading="Morning"
        slots={TIME_SLOTS.morning}
        selectedTime={selectedTime}
        onSelect={setSelectedTime}
      />
      <TimeSlotGroup
        heading="Afternoon"
        slots={TIME_SLOTS.afternoon}
        selectedTime={selectedTime}
        onSelect={setSelectedTime}
      />
      <TimeSlotGroup
        heading="Evening"
        slots={TIME_SLOTS.evening}
        selectedTime={selectedTime}
        onSelect={setSelectedTime}
      />

      {/* CTA button */}
      <button
        onClick={handleBook}
        disabled={!selectedDate || !selectedTime}
        style={{
          width: '100%',
          padding: '14px',
          backgroundColor: !selectedDate || !selectedTime ? '#A0CEC9' : '#00766C',
          color: '#FFFFFF',
          fontSize: '16px',
          fontWeight: 600,
          borderRadius: '24px',
          border: 'none',
          cursor: !selectedDate || !selectedTime ? 'not-allowed' : 'pointer',
          marginTop: '8px',
          marginBottom: '8px',
          transition: 'background-color 0.15s',
        }}
        onMouseEnter={(e) => {
          if (selectedDate && selectedTime) {
            ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = '#005A52'
          }
        }}
        onMouseLeave={(e) => {
          if (selectedDate && selectedTime) {
            ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = '#00766C'
          }
        }}
      >
        Book Session →
      </button>

      {/* No hidden charges */}
      <p
        style={{
          fontSize: '12px',
          color: '#666666',
          textAlign: 'center',
          margin: 0,
        }}
      >
        No hidden charges
      </p>
    </div>
  )
}
