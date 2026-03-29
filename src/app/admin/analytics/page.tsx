export default function AdminAnalytics() {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#333333', margin: 0 }}>
          Platform Analytics
        </h1>
        <select style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #E5E5E5', fontSize: '14px', backgroundColor: '#FFFFFF' }}>
          <option>Last 30 Days</option>
          <option>This Quarter</option>
          <option>Year to Date</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '8px', border: '1px solid #E5E5E5', height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#333333', marginBottom: '24px' }}>Revenue Trends (₹ Lakhs)</h2>
          <div style={{ flex: 1, backgroundColor: '#F9FAFB', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999999' }}>
            [Line Chart Visualization]
          </div>
        </div>
        
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '8px', border: '1px solid #E5E5E5', height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#333333', marginBottom: '24px' }}>Patient Acquisition</h2>
          <div style={{ flex: 1, backgroundColor: '#F9FAFB', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999999' }}>
            [Bar Chart Visualization]
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '8px', border: '1px solid #E5E5E5', height: '300px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#333333', marginBottom: '24px' }}>Top Performing Cities (by Bookings)</h2>
        <div style={{ flex: 1, backgroundColor: '#F9FAFB', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999999' }}>
          [Geographical Map / Data Table]
        </div>
      </div>
    </>
  )
}
