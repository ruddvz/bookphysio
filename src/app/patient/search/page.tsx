import Link from 'next/link'

export default function PatientSearch() {
  return (
    <div style={{ maxWidth: '1040px', margin: '0 auto', padding: '48px 24px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#333333', marginBottom: '16px' }}>
        Find a Physiotherapist
      </h1>
      <p style={{ fontSize: '15px', color: '#666666', marginBottom: '32px' }}>
        Search for experts by condition, specialty, or clinic name down below.
      </p>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E5E5', padding: '32px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#333333', marginBottom: '24px' }}>
          Ready to book your next session?
        </h2>
        
        <Link 
          href="/search"
          style={{ display: 'inline-block', padding: '12px 32px', backgroundColor: '#00766C', color: '#FFFFFF', borderRadius: '24px', fontSize: '16px', fontWeight: 600, textDecoration: 'none' }}
        >
          Go to global search →
        </Link>
      </div>
    </div>
  )
}
