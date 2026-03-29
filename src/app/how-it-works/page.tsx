import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const STEPS = [
  {
    icon: '🔍',
    title: 'Search',
    text: 'Enter your condition or a physiotherapist name and select your location.',
  },
  {
    icon: '👨‍⚕️',
    title: 'Choose Provider',
    text: 'Compare expert physiotherapists by specialty, rating, fees, and distance.',
  },
  {
    icon: '📅',
    title: 'Pick a Slot',
    text: 'Select your preferred date and time from the live availability of the provider.',
  },
  {
    icon: '✨',
    title: 'Book Instantly',
    text: 'Confirm your booking with a quick session request and get expert care.',
  },
]

export default function HowItWorksPage() {
  return (
    <>
      <Navbar />

      <main style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', padding: '80px 0' }}>
        <div style={{ maxWidth: '1142px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h1 style={{ fontSize: '48px', fontWeight: 700, color: '#333333', marginBottom: '24px' }}>
              How BookPhysio Works
            </h1>
            <p style={{ fontSize: '20px', color: '#666666', maxWidth: '600px', margin: '0 auto' }}>
              Booking expert physiotherapy has never been easier. Follow our simple four-tap process.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '48px' }}>
            {STEPS.map((step, idx) => (
              <div key={idx} style={{ textAlign: 'center', padding: '32px 24px', backgroundColor: '#F9FBFB', borderRadius: '16px', border: '1px solid #E6F4F3' }}>
                <div style={{ fontSize: '48px', marginBottom: '24px' }}>{step.icon}</div>
                <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#00766C', marginBottom: '16px' }}>{step.title}</h3>
                <p style={{ fontSize: '16px', lineHeight: 1.6, color: '#555555' }}>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
