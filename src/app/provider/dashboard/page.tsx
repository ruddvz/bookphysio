export default function ProviderDashboardHome() {
  return (
    <div style={{ maxWidth: '1040px', margin: '0 auto', padding: '48px 24px' }}>
      
      {/* Greeting */}
      <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#333333', marginBottom: '32px' }}>
        Hello, lokistr
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '32px', alignItems: 'start' }}>
        
        {/* Left Column: Setup Checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#333333', marginBottom: '8px' }}>
            Your setup checklist
          </h2>
          
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #E5E5E5',
              overflow: 'hidden',
            }}
          >
            {/* Expanded section */}
            <div style={{ padding: '24px', borderBottom: '1px solid #E5E5E5' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '20px' }}>👤</span>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#333333', margin: 0 }}>Create your profile</h3>
                </div>
                <span aria-hidden="true" style={{ fontSize: '12px' }}>▲</span>
              </div>
              
              <div style={{ paddingLeft: '32px', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#333333', margin: '0 0 4px' }}>Add your providers</h4>
                    <p style={{ fontSize: '14px', color: '#666666', margin: 0 }}>Create provider profiles using ICPs, then add qualifications to attract patients.</p>
                  </div>
                  <button style={{ padding: '8px 16px', border: '1px solid #E5E5E5', borderRadius: '4px', backgroundColor: '#FFFFFF', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
                    Get started
                  </button>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#333333', margin: '0 0 4px' }}>Verify your identity</h4>
                    <p style={{ fontSize: '14px', color: '#666666', margin: 0 }}>Upload a government-issued photo ID to verify your practice.</p>
                  </div>
                  <button style={{ padding: '8px 16px', border: '1px solid #E5E5E5', borderRadius: '4px', backgroundColor: '#FFFFFF', fontSize: '14px', fontWeight: 500, opacity: 0.5, cursor: 'not-allowed' }}>
                    Get started
                  </button>
                </div>
              </div>
            </div>
            
            {/* Collapsed section */}
            <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>⚙️</span>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#333333', margin: 0 }}>Customize your settings</h3>
              </div>
              <span aria-hidden="true" style={{ fontSize: '12px' }}>▼</span>
            </div>
          </div>
        </div>

        {/* Right Column: Performance Overview */}
        <aside
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #E5E5E5',
            padding: '24px',
          }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#333333', marginBottom: '24px', marginTop: 0 }}>
            Performance overview
          </h2>

          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '48px', fontWeight: 300, color: '#333333', lineHeight: 1 }}>
              0
            </div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#333333', margin: '8px 0 4px' }}>
              No bookings yet
            </p>
            <p style={{ fontSize: '13px', color: '#666666', margin: '0 0 16px' }}>
              Compared to 0 bookings this time last month
            </p>
            <button style={{ width: '100%', padding: '10px 0', border: '1px solid #333333', borderRadius: '4px', backgroundColor: '#FFFFFF', color: '#333333', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
              View more performance details
            </button>
          </div>

          <div style={{ borderTop: '1px solid #E5E5E5', paddingTop: '24px' }}>
            <div style={{ fontSize: '48px', fontWeight: 300, color: '#333333', lineHeight: 1 }}>
              0
            </div>
            <p style={{ fontSize: '15px', color: '#666666', margin: '8px 0 0' }}>
              No reviews yet
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
