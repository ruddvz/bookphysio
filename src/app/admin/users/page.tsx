export default function AdminUsers() {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#333333', margin: 0 }}>
          User Management
        </h1>
        <input 
          type="search" 
          placeholder="Search phone number or name..." 
          style={{ padding: '10px 16px', borderRadius: '24px', border: '1px solid #E5E5E5', fontSize: '14px', width: '320px' }}
        />
      </div>

      <div style={{ marginBottom: '24px', borderBottom: '1px solid #E5E5E5' }}>
        <nav style={{ display: 'flex', gap: '32px' }}>
          <button style={{ padding: '12px 0', border: 'none', background: 'transparent', borderBottom: '2px solid #00766C', color: '#00766C', fontWeight: 600, fontSize: '16px', cursor: 'pointer' }}>
            Patients
          </button>
          <button style={{ padding: '12px 0', border: 'none', background: 'transparent', borderBottom: '2px solid transparent', color: '#666666', fontWeight: 500, fontSize: '16px', cursor: 'pointer' }}>
            Providers
          </button>
        </nav>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E5E5', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E5E5' }}>
            <tr>
              <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>Name</th>
              <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>Phone</th>
              <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>Role</th>
              <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>Last Login</th>
              <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '16px 24px', fontSize: '15px', fontWeight: 600, color: '#333333', borderBottom: '1px solid #E5E5E5' }}>Rahul Verma</td>
              <td style={{ padding: '16px 24px', fontSize: '14px', color: '#666666', borderBottom: '1px solid #E5E5E5' }}>+91 98765 00000</td>
              <td style={{ padding: '16px 24px', fontSize: '14px', borderBottom: '1px solid #E5E5E5' }}>
                <span style={{ backgroundColor: '# EFF6FF', color: '#1D4ED8', padding: '4px 8px', borderRadius: '12px', fontWeight: 600, fontSize: '12px' }}>
                  Patient
                </span>
              </td>
              <td style={{ padding: '16px 24px', fontSize: '14px', color: '#666666', borderBottom: '1px solid #E5E5E5' }}>10 mins ago</td>
              <td style={{ padding: '16px 24px', fontSize: '14px', borderBottom: '1px solid #E5E5E5' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{ padding: '6px 12px', border: '1px solid #E5E5E5', backgroundColor: '#FFFFFF', color: '#333333', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}>View</button>
                  <button style={{ padding: '6px 12px', border: '1px solid #E5E5E5', backgroundColor: '#FFFFFF', color: '#DC2626', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}>Suspend</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  )
}
