export default function PatientPayments() {
  return (
    <div style={{ maxWidth: '1040px', margin: '0 auto', padding: '48px 24px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#333333', marginBottom: '32px' }}>
        Payment History
      </h1>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E5E5', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E5E5' }}>
            <tr>
              <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>Date</th>
              <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>Doctor</th>
              <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>Amount (₹)</th>
              <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>GST (₹)</th>
              <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>Total (₹)</th>
              <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>Status</th>
              <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>Receipt</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={7} style={{ padding: '48px 24px', textAlign: 'center', color: '#6B7280', fontSize: '14px' }}>
                You have no payment history available.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
