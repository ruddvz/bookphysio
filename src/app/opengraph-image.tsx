import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'BookPhysio — Book Physiotherapists Online in India'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#18312D',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Accent circle */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -120,
            width: 480,
            height: 480,
            borderRadius: '50%',
            background: 'rgba(18,179,160,0.15)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -80,
            left: -80,
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: 'rgba(18,179,160,0.10)',
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(18,179,160,0.2)',
            border: '1px solid rgba(18,179,160,0.4)',
            borderRadius: 100,
            padding: '8px 20px',
            marginBottom: 32,
          }}
        >
          <span style={{ color: '#12B3A0', fontSize: 13, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            India's Physio-Only Platform
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            color: '#FFFFFF',
            fontSize: 64,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            maxWidth: 760,
            marginBottom: 24,
          }}
        >
          Book Verified Physiotherapists in India
        </div>

        {/* Subtext */}
        <div
          style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: 24,
            fontWeight: 400,
            lineHeight: 1.5,
            maxWidth: 620,
            marginBottom: 48,
          }}
        >
          ICP-verified providers · Home visits · Same-day slots · 18 cities
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 48 }}>
          {[
            { value: '5,000+', label: 'Verified Providers' },
            { value: '18',     label: 'Cities Covered'    },
            { value: '4.9/5',  label: 'Average Rating'    },
          ].map((stat) => (
            <div key={stat.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ color: '#12B3A0', fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em' }}>
                {stat.value}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Domain */}
        <div
          style={{
            position: 'absolute',
            bottom: 48,
            right: 80,
            color: 'rgba(255,255,255,0.4)',
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: '0.05em',
          }}
        >
          bookphysio.in
        </div>
      </div>
    ),
    { ...size }
  )
}
