export default function ProviderPatientDetail({ params }: { params: { id: string } }) {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#333333', marginBottom: '8px' }}>
        Patient Record
      </h1>
      <p style={{ fontSize: '15px', color: '#666666', marginBottom: '32px' }}>
        ID: PTR-{params.id || '4421'}
      </p>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E5E5', padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
             <div style={{ width: '64px', height: '64px', borderRadius: '32px', backgroundColor: '#E6F4F3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: '#00766C', fontWeight: 700 }}>RV</div>
             <div>
               <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#333333', margin: '0 0 4px' }}>Rahul Verma</h2>
               <p style={{ fontSize: '15px', color: '#666666', margin: 0 }}>+91 98765 00000</p>
             </div>
          </div>
          <button style={{ padding: '8px 16px', border: '1px solid #E5E5E5', backgroundColor: '#FFFFFF', borderRadius: '4px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            Message Patient
          </button>
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#333333', marginBottom: '16px', borderTop: '1px solid #E5E5E5', paddingTop: '24px' }}>
          Visit History
        </h3>
        
        <div style={{ border: '1px solid #E5E5E5', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #E5E5E5', backgroundColor: '#F9FAFB', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 600, fontSize: '15px' }}>Mon, 28 Mar 2026</div>
            <div style={{ color: '#00766C', fontWeight: 600, fontSize: '14px' }}>Completed</div>
          </div>
          <div style={{ padding: '16px', fontSize: '14px', color: '#555555' }}>
            <strong>Notes:</strong> Patient reported mild lower back pain (4/10). Administered deep tissue massage and assigned core strengthening exercises. Follow-up in 2 weeks.
          </div>
        </div>

      </div>
    </div>
  )
}
