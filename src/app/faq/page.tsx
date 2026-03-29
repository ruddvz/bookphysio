import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const FAQS = [
  {
    question: 'How do I book an appointment?',
    answer: 'Simply search for your condition or a physiotherapist, choose a provider, select your preferred date and time, and click "Book Session".',
  },
  {
    question: 'What is ICP Verified?',
    answer: 'ICP (Indian Council of Physiotherapy) verification means we have manually checked the credentials and professional registration of the physiotherapist.',
  },
  {
    question: 'Are home visits available?',
    answer: 'Yes, many of our therapists offer home visit services. You can filter your search results to see providers who offer the "Home Visit" option.',
  },
  {
    question: 'How do I pay for my session?',
    answer: 'You can pay online via UPI, Credit/Debit Cards, Net Banking, or choose to pay at the clinic in some cases.',
  },
]

export default function FAQPage() {
  return (
    <>
      <Navbar />

      <main style={{ backgroundColor: '#F7F8F9', minHeight: '100vh', padding: '80px 0' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
          <h1 style={{ fontSize: '40px', fontWeight: 700, textAlign: 'center', marginBottom: '48px', color: '#333333' }}>
            Frequently Asked Questions
          </h1>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E5E5E5',
                  padding: '24px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                }}
              >
                <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#333333', marginBottom: '12px' }}>
                  {faq.question}
                </h3>
                <p style={{ fontSize: '16px', lineHeight: 1.6, color: '#555555' }}>
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
