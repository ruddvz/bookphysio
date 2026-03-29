import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
        {/* Hero Section */}
        <section style={{ backgroundColor: '#00766C', color: '#FFFFFF', padding: '80px 0' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '48px', fontWeight: 700, margin: '0 0 24px' }}>Our Mission</h1>
            <p style={{ fontSize: '20px', lineHeight: 1.6, opacity: 0.9 }}>
              Making high-quality physiotherapy accessible and convenient across India.
              We're bridging the gap between expert care and those who need it.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section style={{ padding: '80px 0' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
            <div style={{ marginBottom: '60px' }}>
              <h2 style={{ fontSize: '32px', fontWeight: 600, color: '#333333', marginBottom: '24px' }}>Who We Are</h2>
              <p style={{ fontSize: '18px', lineHeight: 1.8, color: '#555555' }}>
                BookPhysio is India&apos;s leading platform dedicated exclusively to physiotherapy.
                We understand that recovering from an injury or managing chronic pain requires
                specialised attention and consistent care.
              </p>
              <p style={{ fontSize: '18px', lineHeight: 1.8, color: '#555555', marginTop: '16px' }}>
                Our platform connects patients with verified, ICP-registered physiotherapists
                for in-clinic, home-visit, and online sessions, ensuring you get the care
                you need, wherever you are.
              </p>
            </div>

            <div style={{ marginBottom: '60px' }}>
              <h2 style={{ fontSize: '32px', fontWeight: 600, color: '#333333', marginBottom: '24px' }}>Why BookPhysio?</h2>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {[
                  { title: 'Verified Experts', text: 'Every therapist on our platform is verified for credentials and clinical experience.' },
                  { title: 'Convenience First', text: 'Choose between visiting a clinic, having a therapist come to your home, or connecting online.' },
                  { title: 'Transparent Pricing', text: 'Known exactly what you pay before you book. No hidden charges or registration fees.' },
                  { title: 'Seamless Booking', text: 'Book your session in under a minute with our intuitive interface.' },
                ].map((item, idx) => (
                  <li key={idx} style={{ marginBottom: '24px', display: 'flex', gap: '16px' }}>
                    <div style={{ fontSize: '24px', flexShrink: 0 }}>✅</div>
                    <div>
                      <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#333333', marginBottom: '4px' }}>{item.title}</h3>
                      <p style={{ fontSize: '16px', lineHeight: 1.6, color: '#666666' }}>{item.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
