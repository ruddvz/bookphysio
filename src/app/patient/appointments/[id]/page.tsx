export default function PatientAppointmentDetail({ params }: { params: { id: string } }) {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#333333', marginBottom: '8px' }}>
        Appointment Detail
      </h1>
      <p style={{ fontSize: '15px', color: '#666666', marginBottom: '32px' }}>
        Ref: BP-2026-{params.id || '0042'}
      </p>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E5E5', padding: '32px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '40px', backgroundColor: '#E6F4F3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>👨‍⚕️</div>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#333333', margin: '0 0 4px' }}>Dr. Priya Sharma</h2>
            <p style={{ fontSize: '15px', color: '#666666', margin: '0 0 16px' }}>Sports Physiotherapist</p>
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#00766C', margin: 0 }}>📅 Mon, 28 Mar 2026 · 2:30 PM</p>
            <p style={{ fontSize: '15px', color: '#333333', margin: '8px 0 0' }}>🏥 In-clinic · Andheri West, Mumbai</p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #E5E5E5', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '14px', color: '#666666', margin: '0 0 4px' }}>Total Paid (UPI)</p>
            <p style={{ fontSize: '20px', fontWeight: 700, color: '#333333', margin: 0 }}>₹826</p>
          </div>
          <button style={{ padding: '10px 20px', backgroundColor: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: '4px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', color: '#333333' }}>
            Download Receipt
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px' }}>
        <button style={{ padding: '12px 24px', backgroundColor: '#00766C', color: '#FFFFFF', border: 'none', borderRadius: '24px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>
          Reschedule
        </button>
        <button style={{ padding: '12px 24px', backgroundColor: 'transparent', color: '#DC2626', border: '1px solid #DC2626', borderRadius: '24px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>
          Cancel Appointment
        </button>
      </div>
    </div>
  )
}
