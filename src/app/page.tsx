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
  description: 'India\'s first physiotherapy-only booking platform connecting patients with ICP-verified physiotherapists for in-clinic and home visit sessions.',
  foundingDate: '2024',
  areaServed: {
    '@type': 'Country',
    name: 'India',
  },
  medicalSpecialty: 'PhysicalTherapy',
  sameAs: [],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
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
      <main>
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
