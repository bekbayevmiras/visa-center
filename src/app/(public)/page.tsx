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
        text: 'Стоимость зависит от страны. От 10 000 тенге (Грузия, Беларусь) до 80 000 тенге (США, Канада). Точные цены смотрите на странице /prices.',
      },
    },
    {
      '@type': 'Question',
      name: 'Как долго оформляется виза?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'От 1 дня (ОАЭ, Турция) до 60 дней (США). В среднем 7–10 рабочих дней для Шенгена. При срочном оформлении — от 3 дней.',
      },
    },
    {
      '@type': 'Question',
      name: 'Гарантируете ли вы получение визы?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Мы гарантируем возврат 30% аванса при отказе консульства. Работаем по схеме: 30% при подаче документов, 70% — только после получения визы.',
      },
    },
    {
      '@type': 'Question',
      name: 'Нужно ли ехать в посольство лично?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Нет. Мы берём на себя сбор и подачу документов. В большинстве случаев ваше личное присутствие не требуется. Менеджер уточнит детали для вашей страны.',
      },
    },
    {
      '@type': 'Question',
      name: 'В каких городах Казахстана вы работаете?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Офис находится в Алматы (ул. Абая 150). Онлайн-заявки принимаем из любого города Казахстана — Астана, Шымкент, Актобе и других.',
      },
    },
    {
      '@type': 'Question',
      name: 'Какие документы нужны для визы?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Базовый пакет: загранпаспорт (актуальный), фото, анкета, банковская выписка, страховка (для Шенгена). Полный список зависит от страны и цели поездки — наш AI-ассистент подготовит персональный чек-лист.',
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
