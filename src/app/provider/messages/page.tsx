export default function ProviderMessages() {
  return (
    <div style={{ maxWidth: '1040px', margin: '0 auto', padding: '48px 24px', height: 'calc(100vh - 72px)', display: 'flex', flexDirection: 'column' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#333333', marginBottom: '32px' }}>
        Messages
      </h1>

      <div style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E5E5', display: 'flex', overflow: 'hidden' }}>
        
        {/* Left pane: Contacts */}
        <div style={{ width: '300px', borderRight: '1px solid #E5E5E5', display: 'flex', flexDirection: 'column', backgroundColor: '#F9FAFB' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #E5E5E5' }}>
            <input 
              type="search" 
              placeholder="Search patients..." 
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E5E5', borderRadius: '24px', fontSize: '14px' }}
            />
          </div>
          <div style={{ flex: 1, padding: '24px', textAlign: 'center', color: '#6B7280', fontSize: '14px' }}>
            No patient conversations yet.
          </div>
        </div>

        {/* Right pane: Chat Area */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', color: '#D1D5DB' }}>💬</div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#333333', margin: '0 0 8px' }}>Select a conversation</h2>
            <p style={{ fontSize: '14px', color: '#666666', margin: 0 }}>Message your patients regarding appointments or ongoing treatment.</p>
          </div>
        </div>

      </div>
    </div>
  )
}
