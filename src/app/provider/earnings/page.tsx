export default function ProviderEarnings() {
  return (
    <div style={{ maxWidth: '1040px', margin: '0 auto', padding: '48px 24px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#333333', marginBottom: '32px' }}>
        Earnings & Payouts
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E5E5', padding: '24px' }}>
          <p style={{ fontSize: '14px', color: '#666666', margin: '0 0 8px' }}>This Month</p>
          <p style={{ fontSize: '32px', fontWeight: 700, color: '#333333', margin: 0 }}>₹0</p>
        </div>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E5E5', padding: '24px' }}>
          <p style={{ fontSize: '14px', color: '#666666', margin: '0 0 8px' }}>GST Collected</p>
          <p style={{ fontSize: '32px', fontWeight: 700, color: '#333333', margin: 0 }}>₹0</p>
        </div>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E5E5', padding: '24px' }}>
          <p style={{ fontSize: '14px', color: '#666666', margin: '0 0 8px' }}>Available for Payout</p>
          <p style={{ fontSize: '32px', fontWeight: 700, color: '#333333', margin: 0 }}>₹0</p>
        </div>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E5E5', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E5E5' }}>
            <tr>
              <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>Date</th>
              <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>Patient</th>
              <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>Amount (₹)</th>
              <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>GST (₹)</th>
              <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>Net (₹)</th>
              <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} style={{ padding: '48px 24px', textAlign: 'center', color: '#6B7280', fontSize: '14px' }}>
                No recent transactions.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
