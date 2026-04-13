import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import ProofSection from '@/components/ProofSection'
import TopSpecialties from '@/components/TopSpecialties'
import HowItWorks from '@/components/HowItWorks'
import HealthSystems from '@/components/HealthSystems'
import ProviderCTA from '@/components/ProviderCTA'
import Testimonials from '@/components/Testimonials'
import FAQ from '@/components/FAQ'
import CityLinks from '@/components/CityLinks'
import Footer from '@/components/Footer'

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'MedicalOrganization',
  '@id': 'https://bookphysio.in/#organization',
  name: 'BookPhysio',
  url: 'https://bookphysio.in',
  logo: 'https://bookphysio.in/logo.png',
  description: 'India\'s first physiotherapy-only booking platform connecting patients with IAP-verified physiotherapists for in-clinic and home visit sessions.',
  foundingDate: '2024-01-01',
  areaServed: {
    '@type': 'Country',
    name: 'India',
  },
  medicalSpecialty: 'PhysicalTherapy',
  sameAs: [
    'https://www.linkedin.com/company/bookphysio',
    'https://twitter.com/bookphysio',
    'https://www.instagram.com/bookphysio.in',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: 'support@bookphysio.in',
    telephone: '+91-8000000000',
    availableLanguage: ['English', 'Hindi'],
  },
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://bookphysio.in/#website',
  url: 'https://bookphysio.in',
  name: 'BookPhysio',
  description: 'Find and book physiotherapists near you. In-clinic and home visits available across India.',
  publisher: { '@id': 'https://bookphysio.in/#organization' },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://bookphysio.in/search?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <Navbar />
      <main id="main-content">
        <HeroSection />
        <ProofSection />
        <TopSpecialties />
        <HowItWorks />
        <HealthSystems />
        <ProviderCTA />
        <Testimonials />
        <FAQ />
        <CityLinks />
      </main>
      <Footer />
    </>
  )
}
