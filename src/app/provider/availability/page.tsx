export default function ProviderAvailability() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#333333', marginBottom: '32px' }}>
        Availability Settings
      </h1>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E5E5', padding: '32px' }}>
        
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#333333', marginBottom: '16px' }}>
          Weekly Schedule
        </h2>
        <p style={{ fontSize: '14px', color: '#666666', marginBottom: '24px' }}>
          Set your recurring weekly working hours.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
          {/* Days */}
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
            <div key={day} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', color: '#333333', fontWeight: 500, width: '120px' }}>
                <input type="checkbox" defaultChecked={day !== 'Sunday'} style={{ accentColor: '#00766C' }} />
                {day}
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input type="time" defaultValue="09:00" style={{ padding: '8px', border: '1px solid #E5E5E5', borderRadius: '4px', color: day === 'Sunday' ? '#9CA3AF' : '#333333' }} disabled={day === 'Sunday'} />
                <span style={{ color: '#666666' }}>to</span>
                <input type="time" defaultValue="18:00" style={{ padding: '8px', border: '1px solid #E5E5E5', borderRadius: '4px', color: day === 'Sunday' ? '#9CA3AF' : '#333333' }} disabled={day === 'Sunday'} />
              </div>
            </div>
          ))}
        </div>

        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#333333', marginBottom: '16px', borderTop: '1px solid #E5E5E5', paddingTop: '24px' }}>
          Slot Duration
        </h2>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#333333' }}>
            <input type="radio" name="duration" value="30" defaultChecked style={{ accentColor: '#00766C' }} />
            30 mins
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#333333' }}>
            <input type="radio" name="duration" value="45" style={{ accentColor: '#00766C' }} />
            45 mins
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#333333' }}>
            <input type="radio" name="duration" value="60" style={{ accentColor: '#00766C' }} />
            60 mins
          </label>
        </div>

        <button style={{ backgroundColor: '#00766C', color: '#FFFFFF', padding: '12px 24px', borderRadius: '24px', fontSize: '15px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
          Save Availability
        </button>
      </div>
    </div>
  )
}
