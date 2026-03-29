export default function PatientAppointments() {
  return (
    <div style={{ maxWidth: '1142px', margin: '0 auto', padding: '48px 24px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#333333', marginBottom: '32px' }}>
        Appointments
      </h1>

      <div style={{ marginBottom: '24px', borderBottom: '1px solid #E5E5E5' }}>
        <nav style={{ display: 'flex', gap: '32px' }} aria-label="Tabs">
          <button
            style={{
              padding: '12px 0',
              border: 'none',
              background: 'transparent',
              borderBottom: '2px solid #00766C',
              color: '#00766C',
              fontWeight: 600,
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            Upcoming
          </button>
          <button
            style={{
              padding: '12px 0',
              border: 'none',
              background: 'transparent',
              color: '#666666',
              fontWeight: 500,
              fontSize: '16px',
              cursor: 'pointer',
              borderBottom: '2px solid transparent',
            }}
          >
            Past
          </button>
        </nav>
      </div>

      <div
        style={{
          border: '1px solid #E5E5E5',
          borderRadius: '8px',
          padding: '48px',
          textAlign: 'center',
          backgroundColor: '#FFFFFF',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#333333', marginBottom: '8px' }}>
          No upcoming appointments
        </h2>
        <p style={{ fontSize: '15px', color: '#666666' }}>
          When you book an appointment, it will show up here.
        </p>
      </div>
    </div>
  )
}
