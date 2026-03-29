export default function ProviderAppointmentDetail({ params }: { params: { id: string } }) {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#333333', margin: 0 }}>
          Appointment Details
        </h1>
        <span style={{ fontSize: '14px', color: '#666666' }}>Ref: BP-2026-{params.id || '9982'}</span>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E5E5', padding: '32px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#333333', marginBottom: '16px' }}>
          Patient Info
        </h2>
        <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid #E5E5E5', paddingBottom: '24px', marginBottom: '24px' }}>
          <div>
            <p style={{ fontSize: '13px', color: '#666666', margin: '0 0 4px', textTransform: 'uppercase' }}>Name</p>
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#333333', margin: 0 }}>Rahul Verma</p>
          </div>
          <div>
            <p style={{ fontSize: '13px', color: '#666666', margin: '0 0 4px', textTransform: 'uppercase' }}>Phone</p>
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#333333', margin: 0 }}>+91 98765 00000</p>
          </div>
          <div>
            <p style={{ fontSize: '13px', color: '#666666', margin: '0 0 4px', textTransform: 'uppercase' }}>Visit Type</p>
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#333333', margin: 0 }}>In-clinic</p>
          </div>
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#333333', marginBottom: '16px' }}>
          Session Notes
        </h2>
        <textarea 
          rows={6} 
          placeholder="Log clinical observations, treatment provided, and next steps..."
          style={{ width: '100%', padding: '16px', border: '1px solid #E5E5E5', borderRadius: '6px', fontSize: '15px', resize: 'vertical' }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button style={{ padding: '10px 24px', backgroundColor: '#00766C', color: '#FFFFFF', border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            Save Notes
          </button>
        </div>
      </div>
    </div>
  )
}
