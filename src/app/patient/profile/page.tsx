export default function PatientProfile() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#333333', marginBottom: '32px' }}>
        Profile & Settings
      </h1>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E5E5', padding: '32px' }}>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#333333', marginBottom: '8px' }}>First Name</label>
              <input type="text" defaultValue="Rahul" style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E5E5', borderRadius: '6px', fontSize: '15px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#333333', marginBottom: '8px' }}>Last Name</label>
              <input type="text" defaultValue="Verma" style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E5E5', borderRadius: '6px', fontSize: '15px' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#333333', marginBottom: '8px' }}>Mobile Number</label>
              <input type="text" defaultValue="+91 98765 00000" disabled style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E5E5', backgroundColor: '#F9FAFB', borderRadius: '6px', fontSize: '15px', color: '#6B7280' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#333333', marginBottom: '8px' }}>Email</label>
              <input type="email" defaultValue="rahul@example.com" style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E5E5', borderRadius: '6px', fontSize: '15px' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#333333', marginBottom: '8px' }}>City</label>
            <input type="text" defaultValue="Mumbai" style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E5E5', borderRadius: '6px', fontSize: '15px' }} />
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #E5E5E5', margin: '16px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" style={{ padding: '12px 32px', backgroundColor: '#00766C', color: '#FFFFFF', border: 'none', borderRadius: '24px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>
              Save Changes
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
