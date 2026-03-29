export default function AdminListings() {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#333333', margin: 0 }}>
          Provider Approval Queue
        </h1>
        <div style={{ padding: '8px 16px', backgroundColor: '#FFF7ED', color: '#C2410C', fontWeight: 600, borderRadius: '24px', fontSize: '14px' }}>
          342 Pending
        </div>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E5E5', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E5E5' }}>
            <tr>
              <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>Provider Name</th>
              <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>ICP #</th>
              <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>City</th>
              <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>Submitted</th>
              <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>Status</th>
              <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Example row */}
            <tr>
              <td style={{ padding: '16px 24px', fontSize: '15px', fontWeight: 600, color: '#333333', borderBottom: '1px solid #E5E5E5' }}>Dr. Arun K</td>
              <td style={{ padding: '16px 24px', fontSize: '14px', color: '#666666', borderBottom: '1px solid #E5E5E5' }}>ICP-MH-12345</td>
              <td style={{ padding: '16px 24px', fontSize: '14px', color: '#666666', borderBottom: '1px solid #E5E5E5' }}>Mumbai</td>
              <td style={{ padding: '16px 24px', fontSize: '14px', color: '#666666', borderBottom: '1px solid #E5E5E5' }}>2 hours ago</td>
              <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: '#C2410C', borderBottom: '1px solid #E5E5E5' }}>Pending</td>
              <td style={{ padding: '16px 24px', fontSize: '14px', borderBottom: '1px solid #E5E5E5' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{ padding: '6px 12px', border: '1px solid #00766C', backgroundColor: 'transparent', color: '#00766C', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}>View Docs</button>
                  <button style={{ padding: '6px 12px', border: '1px solid #059669', backgroundColor: '#059669', color: '#FFFFFF', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}>Approve</button>
                  <button style={{ padding: '6px 12px', border: '1px solid #DC2626', backgroundColor: '#DC2626', color: '#FFFFFF', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}>Reject</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  )
}
