import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import TopSpecialties from '@/components/TopSpecialties'
import InsurancePlans from '@/components/InsurancePlans'
import HowItWorks from '@/components/HowItWorks'
import AppSection from '@/components/AppSection'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <TopSpecialties />
        <InsurancePlans />
        <HowItWorks />
        <AppSection />
      </main>
      <Footer />
    </>
  )
}
