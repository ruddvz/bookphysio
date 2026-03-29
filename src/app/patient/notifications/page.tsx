export default function PatientNotifications() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#333333', margin: 0 }}>
          Notifications
        </h1>
        <button style={{ backgroundColor: 'transparent', border: 'none', color: '#00766C', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
          Mark all as read
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ backgroundColor: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0', padding: '24px', display: 'flex', gap: '16px' }}>
          <div style={{ color: '#22C55E', fontSize: '24px' }}>✅</div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#333333', margin: '0 0 4px' }}>Account verified successfully</h3>
            <p style={{ fontSize: '14px', color: '#666666', margin: '0 0 8px' }}>Your mobile number has been verified. Welcome to BookPhysio.in!</p>
            <span style={{ fontSize: '12px', color: '#9CA3AF' }}>2 hours ago</span>
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E5E5', padding: '24px', textAlign: 'center', color: '#6B7280', fontSize: '14px' }}>
          You have no other notifications.
        </div>
      </div>
    </div>
  )
}
