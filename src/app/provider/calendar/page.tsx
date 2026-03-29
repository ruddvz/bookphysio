export default function ProviderCalendar() {
  return (
    <div style={{ maxWidth: '1040px', margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#333333', margin: 0 }}>
          Calendar
        </h1>
        <button
          style={{
            backgroundColor: '#00766C',
            color: '#FFFFFF',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '24px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Manage Availability
        </button>
      </div>

      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid #E5E5E5',
          height: '600px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Calendar Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid #E5E5E5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button style={{ border: '1px solid #E5E5E5', background: 'transparent', borderRadius: '4px', width: '32px', height: '32px', cursor: 'pointer', fontSize: '18px' }}>&lsaquo;</button>
            <span style={{ fontSize: '18px', fontWeight: 600 }}>March 2026</span>
            <button style={{ border: '1px solid #E5E5E5', background: 'transparent', borderRadius: '4px', width: '32px', height: '32px', cursor: 'pointer', fontSize: '18px' }}>&rsaquo;</button>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ padding: '6px 12px', border: '1px solid #333333', background: '#333333', color: '#FFFFFF', borderRadius: '4px', fontSize: '14px', cursor: 'pointer' }}>Day</button>
            <button style={{ padding: '6px 12px', border: '1px solid #E5E5E5', background: 'transparent', color: '#666666', borderRadius: '4px', fontSize: '14px', cursor: 'pointer' }}>Week</button>
          </div>
        </div>

        {/* Empty Calendar Grid Placeholder */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', color: '#D1D5DB' }}>📅</div>
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#374151', margin: '0 0 8px' }}>No appointments today</p>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>Sync your Google Calendar or add availability to get booked.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
