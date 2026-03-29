import Link from 'next/link'
import { ReactNode } from 'react'
import Footer from '@/components/Footer'

export default function ProviderLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ backgroundColor: '#F7F8F9', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Provider Portal Navbar */}
      <header
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E5E5E5',
          height: '72px',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 24px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo */}
          <Link href="/provider/dashboard" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <span style={{ fontSize: '20px', fontWeight: 700, color: '#333333' }}>BookPhysio</span>
          </Link>

          {/* Navigation */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <Link href="/provider/dashboard" style={{ fontSize: '15px', fontWeight: 500, color: '#333333', textDecoration: 'none' }}>
              Home
            </Link>
            <Link href="/provider/calendar" style={{ fontSize: '15px', fontWeight: 500, color: '#666666', textDecoration: 'none' }}>
              Calendar
            </Link>
            <Link href="/provider/inbox" style={{ fontSize: '15px', fontWeight: 500, color: '#666666', textDecoration: 'none' }}>
              Inbox
            </Link>
            <Link href="/provider/performance" style={{ fontSize: '15px', fontWeight: 500, color: '#666666', textDecoration: 'none' }}>
              Performance
            </Link>
            <Link href="/provider/providers-list" style={{ fontSize: '15px', fontWeight: 500, color: '#666666', textDecoration: 'none' }}>
              Providers
            </Link>
            <Link href="/provider/sponsored" style={{ fontSize: '15px', fontWeight: 500, color: '#666666', textDecoration: 'none' }}>
              Sponsored
            </Link>

            {/* Provider Settings Dropdown Trigger */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                border: '1px solid #E5E5E5',
                borderRadius: '24px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              lokistr
              <span aria-hidden="true" style={{ fontSize: '10px' }}>▼</span>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main style={{ flex: 1 }}>
        {children}
      </main>

      <Footer />
    </div>
  )
}
