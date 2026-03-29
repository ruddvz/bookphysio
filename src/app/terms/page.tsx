import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main style={{ padding: '80px 0', minHeight: '100vh' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '24px' }}>Terms of Service</h1>
          <p style={{ color: '#666666', marginBottom: '24px' }}>Last updated: March 2026</p>
          <div style={{ fontSize: '16px', lineHeight: 1.8, color: '#333333' }}>
            <p>Welcome to BookPhysio.in. By using our website, you agree to comply with and be bound by the following terms.</p>
            <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '32px', marginBottom: '16px' }}>Service Description</h2>
            <p>BookPhysio provides a booking platform connecting patients with physiotherapists. We do not provide medical advice or services directly.</p>
            <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '32px', marginBottom: '16px' }}>User Responsibilities</h2>
            <p>Users are responsible for providing accurate personal and medical info when booking a session.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
