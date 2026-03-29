export default function ProviderAppointments() {
  return (
    <div style={{ maxWidth: '1040px', margin: '0 auto', padding: '48px 24px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#333333', marginBottom: '32px' }}>
        Appointments List
      </h1>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E5E5', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E5E5' }}>
            <tr>
              <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>Patient</th>
              <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>Date</th>
              <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>Time</th>
              <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>Type</th>
              <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>Status</th>
              <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} style={{ padding: '48px 24px', textAlign: 'center', color: '#6B7280', fontSize: '14px' }}>
                No past or upcoming appointments found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
