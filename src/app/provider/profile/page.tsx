export default function ProviderProfile() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#333333', marginBottom: '32px' }}>
        Practice Profile
      </h1>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E5E5', padding: '32px' }}>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#333333', marginBottom: '8px' }}>
              Display Name
            </label>
            <input 
              type="text" 
              defaultValue="lokistr"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E5E5', borderRadius: '6px', fontSize: '15px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#333333', marginBottom: '8px' }}>
              Professional Bio
            </label>
            <textarea 
              rows={4}
              placeholder="Tell patients about your specific experience and approach to physiotherapy..."
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E5E5', borderRadius: '6px', fontSize: '15px', resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#333333', marginBottom: '8px' }}>
              Specializations
            </label>
            <input 
              type="text" 
              placeholder="e.g. Sports Injuries, Post-Surgery Rehab"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E5E5', borderRadius: '6px', fontSize: '15px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#333333', marginBottom: '8px' }}>
                ICP Registration Number
              </label>
              <input 
                type="text" 
                placeholder="ICP-MH-XXXX-XXXXX"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E5E5', borderRadius: '6px', fontSize: '15px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#333333', marginBottom: '8px' }}>
                Languages Spoken
              </label>
              <input 
                type="text" 
                placeholder="English, Hindi, Marathi"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E5E5', borderRadius: '6px', fontSize: '15px' }}
              />
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #E5E5E5', margin: '16px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
            <button type="button" style={{ padding: '12px 24px', backgroundColor: 'transparent', border: '1px solid #E5E5E5', borderRadius: '24px', fontSize: '15px', fontWeight: 600, color: '#666666', cursor: 'pointer' }}>
              Discard
            </button>
            <button type="submit" style={{ padding: '12px 24px', backgroundColor: '#00766C', border: 'none', borderRadius: '24px', fontSize: '15px', fontWeight: 600, color: '#FFFFFF', cursor: 'pointer' }}>
              Save Profile
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
