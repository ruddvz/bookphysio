import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main style={{ padding: '80px 0', minHeight: '100vh' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '24px' }}>Privacy Policy</h1>
          <p style={{ color: '#666666', marginBottom: '24px' }}>Last updated: March 2026</p>
          <div style={{ fontSize: '16px', lineHeight: 1.8, color: '#333333' }}>
            <p>At BookPhysio.in, your privacy is our top priority. This Privacy Policy describes how we collect, use, and share your information when you use our platform.</p>
            <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '32px', marginBottom: '16px' }}>What Information We Collect</h2>
            <p>We may collect personal details such as your name, contact information, and medical preferences to provide health-related services.</p>
            <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '32px', marginBottom: '16px' }}>How We Use your Information</h2>
            <p>Your information is used to facilitate appointment bookings with physiotherapists and to improve our platform’s user experience.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
