export default function ProviderNotifications() {
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
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E5E5', padding: '24px', textAlign: 'center', color: '#6B7280', fontSize: '14px' }}>
          You have no new notifications.
        </div>
      </div>
    </div>
  )
}
