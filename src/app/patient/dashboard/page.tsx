import Link from 'next/link'

export default function PatientDashboardHome() {
  return (
    <div style={{ maxWidth: '1142px', margin: '0 auto', padding: '48px 24px' }}>
      
      {/* Greeting */}
      <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#333333', marginBottom: '32px' }}>
        Good morning, John
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '32px', alignItems: 'start' }}>
        {/* Left Column: Well Guide / Updates */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <section
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #E5E5E5',
              padding: '24px',
            }}
          >
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#333333', marginBottom: '16px' }}>
              Your Care Home
            </h2>
            <div
              style={{
                backgroundColor: '#E6F4F3',
                padding: '20px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div style={{ fontSize: '32px' }}>💪</div>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 600, color: '#005A52' }}>
                  Keep moving forward
                </p>
                <p style={{ margin: 0, fontSize: '14px', color: '#005A52' }}>
                  Book your next physiotherapy session to stay on track with your recovery goals.
                </p>
              </div>
            </div>
          </section>

          {/* Past Providers Section */}
          <section
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #E5E5E5',
              padding: '24px',
            }}
          >
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#333333', marginBottom: '16px' }}>
              Your Care Team
            </h2>
            <p style={{ fontSize: '14px', color: '#666666' }}>
              You don&apos;t have any past providers yet. Once you book a session, they will appear here for easy re-booking.
            </p>
            <Link
              href="/search"
              style={{
                display: 'inline-block',
                marginTop: '16px',
                padding: '10px 20px',
                backgroundColor: '#00766C',
                color: '#FFFFFF',
                borderRadius: '24px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '14px',
              }}
            >
              Find a Physiotherapist
            </Link>
          </section>
        </div>

        {/* Right Column: Upcoming Appointments */}
        <aside
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #E5E5E5',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#333333', margin: 0 }}>
              Upcoming appointments
            </h2>
          </div>

          {/* Empty State */}
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#333333', margin: '0 0 8px' }}>
              No upcoming appointments
            </p>
            <p style={{ fontSize: '14px', color: '#666666', margin: 0 }}>
              Need to see a physio?
            </p>
            <Link
              href="/search"
              style={{
                display: 'inline-block',
                marginTop: '16px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#00766C',
                textDecoration: 'none',
              }}
            >
              Book a session
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
