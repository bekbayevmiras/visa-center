import { Hero } from '@/components/landing/Hero'
import { SocialProof } from '@/components/landing/SocialProof'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { Testimonials } from '@/components/landing/Testimonials'
import { ComparisonTable } from '@/components/landing/ComparisonTable'
import { CountryGrid } from '@/components/landing/CountryGrid'
import { FAQ } from '@/components/landing/FAQ'
import { CTASection } from '@/components/landing/CTASection'
import { LiveActivity } from '@/components/landing/LiveActivity'
import { ExitIntentModal } from '@/components/landing/ExitIntentModal'

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Сколько стоит оформление визы?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Стоимость зависит от страны. От 10 000 тенге (Грузия) до 80 000 тенге (США).',
      },
    },
    {
      '@type': 'Question',
      name: 'Как долго оформляется виза?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'От 1 дня (ОАЭ, Турция) до 60 дней (США). В среднем 7-10 дней для Шенгена.',
      },
    },
    {
      '@type': 'Question',
      name: 'Гарантируете ли вы получение визы?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Мы гарантируем возврат средств при отказе. Наш показатель одобрений — 98%.',
      },
    },
  ],
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Hero />
      <SocialProof />
      <HowItWorks />
      <ComparisonTable />
      <Testimonials />
      <CountryGrid />
      <FAQ />
      <CTASection />
      <LiveActivity />
      <ExitIntentModal />
    </>
  )
}
