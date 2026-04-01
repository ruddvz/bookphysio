import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import TopSpecialties from '@/components/TopSpecialties'
import HowItWorks from '@/components/HowItWorks'
import AppSection from '@/components/AppSection'
import ProviderCTA from '@/components/ProviderCTA'
import HealthSystems from '@/components/HealthSystems'
import CityLinks from '@/components/CityLinks'
import JobsCTA from '@/components/JobsCTA'
import CommonReasons from '@/components/CommonReasons'
import Testimonials from '@/components/Testimonials'
import FAQ from '@/components/FAQ'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <TopSpecialties />
        <HowItWorks />
        <AppSection />
        <ProviderCTA />
        <HealthSystems />
        <Testimonials />
        <FAQ />
        <CommonReasons />
      </main>
      <Footer />
    </>
  )
}
