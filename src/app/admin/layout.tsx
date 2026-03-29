import Link from 'next/link'
import { ReactNode } from 'react'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ backgroundColor: '#F7F8F9', minHeight: '100vh', display: 'flex' }}>
      
      {/* Sidebar Navigation */}
      <aside
        style={{
          width: '260px',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #E5E5E5',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
        }}
      >
        <div style={{ padding: '24px', borderBottom: '1px solid #E5E5E5' }}>
          <Link href="/admin" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <span style={{ fontSize: '20px', fontWeight: 700, color: '#333333' }}>BookPhysio <span style={{ color: '#00766C' }}>Admin</span></span>
          </Link>
        </div>

        <nav style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ fontSize: '12px', fontWeight: 600, color: '#999999', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', paddingLeft: '8px' }}>Platform</p>
          
          <Link
            href="/admin"
            style={{
              display: 'block',
              padding: '10px 16px',
              borderRadius: '8px',
              backgroundColor: '#E6F4F3',
              color: '#00766C',
              fontSize: '15px',
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            Dashboard
          </Link>
          <Link
            href="/admin/listings"
            style={{
              display: 'block',
              padding: '10px 16px',
              borderRadius: '8px',
              color: '#666666',
              fontSize: '15px',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'background-color 0.15s'
            }}
          >
            Provider Approvals
          </Link>
          <Link
            href="/admin/users"
            style={{
              display: 'block',
              padding: '10px 16px',
              borderRadius: '8px',
              color: '#666666',
              fontSize: '15px',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'background-color 0.15s'
            }}
          >
            User Management
          </Link>
          <Link
            href="#"
            style={{
              display: 'block',
              padding: '10px 16px',
              borderRadius: '8px',
              color: '#666666',
              fontSize: '15px',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'background-color 0.15s'
            }}
          >
            Analytics
          </Link>
        </nav>

        <div style={{ padding: '24px', borderTop: '1px solid #E5E5E5' }}>
          <button style={{ width: '100%', padding: '10px', backgroundColor: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: '8px', color: '#333333', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '48px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {children}
        </div>
      </main>

    </div>
  )
}
