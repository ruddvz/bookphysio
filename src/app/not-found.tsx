'use client'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '0 24px' }}>
        <h1 style={{ fontSize: '72px', color: '#00766C', margin: '0' }}>404</h1>
        <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#333333', marginBottom: '16px' }}>Page Not Found</h2>
        <p style={{ color: '#666666', marginBottom: '32px', textAlign: 'center' }}>
          We couldn&apos;t find the page you&apos;re looking for. Let&apos;s get you back to health!
        </p>
        <Link 
          href="/" 
          style={{ 
            backgroundColor: '#00766C', 
            color: '#FFFFFF', 
            padding: '12px 24px', 
            borderRadius: '24px', 
            textDecoration: 'none', 
            fontWeight: 600,
            transition: 'opacity 0.2s'
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = '0.9')}
          onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
        >
          Go Back Home
        </Link>
      </main>
      <Footer />
    </>
  )
}
