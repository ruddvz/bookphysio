'use client'
import { cn } from '@/lib/utils'

export interface Doctor {
  id: string
  name: string
  credentials: string
  specialty: string
  rating: number
  reviewCount: number
  location: string
  distance: string
  nextSlot: string
  visitTypes: string[]
  fee: number
  icpVerified: boolean
}

interface DoctorCardProps {
  doctor: Doctor
  className?: string
}

function getInitials(name: string): string {
  return name
    .replace('Dr. ', '')
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function StarIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="#F59E0B"
      aria-hidden="true"
    >
      <path d="M7 1l1.545 3.13L12 4.635l-2.5 2.435.59 3.44L7 8.885l-3.09 1.625L4.5 7.07 2 4.635l3.455-.505L7 1z" />
    </svg>
  )
}

function IcpBadge() {
  return (
    <span
      className="inline-flex items-center gap-1"
      title="ICP Registered Provider"
      aria-label="ICP Verified"
      style={{
        fontSize: '11px',
        fontWeight: 500,
        color: '#059669',
        backgroundColor: '#D1FAE5',
        padding: '2px 8px',
        borderRadius: '12px',
      }}
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
        <circle cx="5" cy="5" r="5" fill="#059669" />
        <path
          d="M3 5l1.5 1.5L7.5 3.5"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      ICP Verified
    </span>
  )
}

function VisitTypeBadge({ type }: { type: string }) {
  const colorMap: Record<string, { bg: string; color: string }> = {
    'In-clinic': { bg: '#E6F4F3', color: '#005A52' },
    'Home Visit': { bg: '#FFF7ED', color: '#C2410C' },
    Online: { bg: '#EFF6FF', color: '#1D4ED8' },
  }
  const style = colorMap[type] ?? { bg: '#F3F4F6', color: '#374151' }

  return (
    <span
      style={{
        fontSize: '11px',
        fontWeight: 500,
        color: style.color,
        backgroundColor: style.bg,
        padding: '2px 8px',
        borderRadius: '12px',
        whiteSpace: 'nowrap' as const,
      }}
    >
      {type}
    </span>
  )
}

export default function DoctorCard({ doctor, className }: DoctorCardProps) {
  const initials = getInitials(doctor.name)

  return (
    <article
      className={cn('bg-white', className)}
      style={{
        borderRadius: '8px',
        border: '1px solid #E5E5E5',
        padding: '20px 24px',
        display: 'flex',
        gap: '20px',
        alignItems: 'flex-start',
        transition: 'box-shadow 0.15s',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLElement).style.boxShadow =
          '0 4px 16px rgba(0,0,0,0.08)'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
      }}
    >
      {/* Avatar */}
      <div
        aria-hidden="true"
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: '#E6F4F3',
          color: '#00766C',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '22px',
          fontWeight: 700,
          flexShrink: 0,
          userSelect: 'none',
        }}
      >
        {initials}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Name row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap' as const,
          }}
        >
          <div>
            <h3
              style={{
                fontSize: '17px',
                fontWeight: 600,
                color: '#333333',
                margin: 0,
                lineHeight: '24px',
              }}
            >
              {doctor.name}
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 400,
                  color: '#6B6B6B',
                  marginLeft: '6px',
                }}
              >
                {doctor.credentials}
              </span>
            </h3>
            <p
              style={{
                fontSize: '14px',
                color: '#6B6B6B',
                margin: '2px 0 0',
              }}
            >
              {doctor.specialty}
            </p>
          </div>

          {/* Fee */}
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <span
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#333333',
              }}
            >
              ₹{doctor.fee}
            </span>
            <p
              style={{
                fontSize: '12px',
                color: '#6B6B6B',
                margin: '0',
              }}
            >
              per session
            </p>
          </div>
        </div>

        {/* Rating */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginTop: '8px',
          }}
        >
          <StarIcon />
          <span
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#333333',
            }}
          >
            {doctor.rating.toFixed(1)}
          </span>
          <span style={{ fontSize: '13px', color: '#6B6B6B' }}>
            ({doctor.reviewCount} reviews)
          </span>
        </div>

        {/* Location */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginTop: '6px',
          }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 13 13"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M6.5 1C4.567 1 3 2.567 3 4.5c0 2.625 3.5 7 3.5 7S10 7.125 10 4.5C10 2.567 8.433 1 6.5 1zm0 4.875A1.375 1.375 0 1 1 6.5 3.125a1.375 1.375 0 0 1 0 2.75z"
              fill="#6B6B6B"
            />
          </svg>
          <span style={{ fontSize: '13px', color: '#6B6B6B' }}>
            {doctor.location}
            <span style={{ margin: '0 4px' }}>·</span>
            {doctor.distance}
          </span>
        </div>

        {/* Next available */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginTop: '6px',
          }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 13 13"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="6.5" cy="6.5" r="5.5" stroke="#00766C" strokeWidth="1.2" />
            <path
              d="M6.5 3.5v3l2 1.5"
              stroke="#00766C"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
          <span style={{ fontSize: '13px', color: '#00766C', fontWeight: 500 }}>
            Next: {doctor.nextSlot}
          </span>
        </div>

        {/* Badges row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '10px',
            flexWrap: 'wrap' as const,
          }}
        >
          {doctor.visitTypes.map((type) => (
            <VisitTypeBadge key={type} type={type} />
          ))}
          {doctor.icpVerified && <IcpBadge />}
        </div>
      </div>

      {/* CTA */}
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <a
          href={`/doctor/${doctor.id}`}
          style={{
            backgroundColor: '#00766C',
            color: '#FFFFFF',
            fontSize: '15px',
            fontWeight: 600,
            padding: '10px 20px',
            borderRadius: '24px',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'none',
            display: 'inline-block',
            whiteSpace: 'nowrap' as const,
            transition: 'background-color 0.15s',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#005A52'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#00766C'
          }}
          aria-label={`Book session with ${doctor.name}`}
        >
          Book Session
        </a>
      </div>
    </article>
  )
}
