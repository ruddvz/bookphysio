import Link from 'next/link'
import Footer from '@/components/Footer'
import { ReactNode } from 'react'

export default function PatientLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ backgroundColor: '#F7F8F9', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Authenticated Navbar for Patient */}
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
            maxWidth: '1142px',
            margin: '0 auto',
            padding: '0 24px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <span style={{ fontSize: '20px', fontWeight: 700, color: '#333333' }}>BookPhysio</span>
          </Link>

          {/* Navigation */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <Link href="/patient/dashboard" style={{ fontSize: '15px', fontWeight: 500, color: '#333333', textDecoration: 'none' }}>
              Home
            </Link>
            <Link href="/patient/appointments" style={{ fontSize: '15px', fontWeight: 500, color: '#666666', textDecoration: 'none' }}>
              Appointments
            </Link>
            <Link href="/patient/messages" style={{ fontSize: '15px', fontWeight: 500, color: '#666666', textDecoration: 'none' }}>
              Messages
            </Link>
            
            {/* User Dropdown Profile Placeholder */}
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#00766C',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              JD
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1 }}>
        {children}
      </main>

      <Footer />
    </div>
  )
}
