import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import TopSpecialties from '@/components/TopSpecialties'
import HowItWorks from '@/components/HowItWorks'
import HealthSystems from '@/components/HealthSystems'
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
        <HealthSystems />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
    </>
  )
}
