export default function AdminDashboardHome() {
  return (
    <>
      <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#333333', marginBottom: '8px' }}>
        Platform Overview
      </h1>
      <p style={{ fontSize: '15px', color: '#666666', marginBottom: '32px' }}>
        High-level metrics for BookPhysio.in platform performance.
      </p>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '48px' }}>
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '8px', border: '1px solid #E5E5E5' }}>
          <p style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 600, color: '#666666', textTransform: 'uppercase' }}>Active Providers</p>
          <p style={{ margin: 0, fontSize: '36px', fontWeight: 700, color: '#333333' }}>1,204</p>
        </div>
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '8px', border: '1px solid #E5E5E5' }}>
          <p style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 600, color: '#FF6B35', textTransform: 'uppercase' }}>Pending Approvals</p>
          <p style={{ margin: 0, fontSize: '36px', fontWeight: 700, color: '#333333' }}>342</p>
        </div>
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '8px', border: '1px solid #E5E5E5' }}>
          <p style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 600, color: '#666666', textTransform: 'uppercase' }}>Total Patients</p>
          <p style={{ margin: 0, fontSize: '36px', fontWeight: 700, color: '#333333' }}>8,921</p>
        </div>
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '8px', border: '1px solid #E5E5E5' }}>
          <p style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 600, color: '#00766C', textTransform: 'uppercase' }}>GMV (MTD)</p>
          <p style={{ margin: 0, fontSize: '36px', fontWeight: 700, color: '#333333' }}>₹12.4L</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        {/* Placeholder Charts */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '8px', border: '1px solid #E5E5E5', height: '360px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#333333', marginBottom: '24px' }}>Bookings Growth</h2>
          <div style={{ flex: 1, backgroundColor: '#F9FAFB', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999999' }}>
            [Chart Component]
          </div>
        </div>
        
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '8px', border: '1px solid #E5E5E5', height: '360px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#333333', marginBottom: '24px' }}>Top Specialties</h2>
          <div style={{ flex: 1, backgroundColor: '#F9FAFB', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999999' }}>
            [Donut Chart]
          </div>
        </div>
      </div>
    </>
  )
}
