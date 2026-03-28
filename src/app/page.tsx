import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import InsurancePlans from '@/components/InsurancePlans'
import TopSpecialties from '@/components/TopSpecialties'
import HowItWorks from '@/components/HowItWorks'
import AppSection from '@/components/AppSection'
import ProviderCTA from '@/components/ProviderCTA'
import HealthSystems from '@/components/HealthSystems'
import CityLinks from '@/components/CityLinks'
import JobsCTA from '@/components/JobsCTA'
import CommonReasons from '@/components/CommonReasons'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <InsurancePlans />
        <TopSpecialties />
        <HowItWorks />
        <AppSection />
        <ProviderCTA />
        <HealthSystems />
        <CityLinks />
        <JobsCTA />
        <CommonReasons />
      </main>
      <Footer />
    </>
  )
}
