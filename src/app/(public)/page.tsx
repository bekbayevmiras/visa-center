import { Hero } from '@/components/landing/Hero'
import { SocialProof } from '@/components/landing/SocialProof'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { CountryGrid } from '@/components/landing/CountryGrid'
import { FAQ } from '@/components/landing/FAQ'
import { CTASection } from '@/components/landing/CTASection'

export default function HomePage() {
  return (
    <>
      <Hero />
      <SocialProof />
      <HowItWorks />
      <CountryGrid />
      <FAQ />
      <CTASection />
    </>
  )
}
