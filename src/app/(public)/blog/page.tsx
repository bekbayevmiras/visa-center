import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { BlogIndex } from './BlogIndex'

export const metadata: Metadata = {
  title: 'Блог — советы по визам от экспертов',
  description: '1200+ оформленных виз. Делимся знаниями бесплатно. Советы по шенгену, США, ОАЭ, документам и многому другому.',
  openGraph: {
    title: 'Блог VisaKZ — советы по визам от экспертов',
    description: '1200+ оформленных виз. Делимся знаниями бесплатно.',
    type: 'website',
  },
}

export const ARTICLES = [
  {
    slug: 'kak-poluchit-shengen-bez-otkaza',
    title: 'Как получить шенгенскую визу с первого раза: 7 правил',
    excerpt: 'Разбираем главные ошибки которые приводят к отказу и как их избежать. Опыт 1200+ заявок.',
    category: 'Советы',
    readTime: '5 мин',
    publishedAt: '2026-06-15',
    popular: true,
  },
  {
    slug: 'viza-v-germaniyu-dokumenty-2026',
    title: 'Виза в Германию 2026: полный список документов',
    excerpt: 'Актуальный список на 2026 год. Что изменилось, что добавилось, какие хитрости работают.',
    category: 'Германия',
    readTime: '7 мин',
    publishedAt: '2026-06-20',
    popular: true,
  },
  {
    slug: 'viza-v-oae-bez-otkaza',
    title: 'Виза в ОАЭ за 3 дня: пошаговая инструкция',
    excerpt: 'ОАЭ — самая простая виза для казахстанцев. Одобрение 97%. Всё что нужно знать.',
    category: 'ОАЭ',
    readTime: '4 мин',
    publishedAt: '2026-06-25',
    popular: false,
  },
  {
    slug: 'bankovskaya-vypiska-dlya-vizy',
    title: 'Банковская выписка для визы: сколько нужно денег',
    excerpt: 'Конкретные суммы для каждой страны. Сколько дней, в какой валюте, как оформить.',
    category: 'Документы',
    readTime: '6 мин',
    publishedAt: '2026-07-01',
    popular: true,
  },
  {
    slug: 'pervaya-viza-v-evropu',
    title: 'Первая виза в Европу: с чего начать',
    excerpt: 'Если никогда не были в Европе — читайте это. Какая страна лояльнее всего к новичкам.',
    category: 'Советы',
    readTime: '5 мин',
    publishedAt: '2026-07-03',
    popular: false,
  },
  {
    slug: 'viza-ssha-intervyu',
    title: 'Собеседование в посольстве США: вопросы и ответы',
    excerpt: '50 реальных вопросов с собеседования B1/B2. Как отвечать чтобы одобрили.',
    category: 'США',
    readTime: '10 мин',
    publishedAt: '2026-07-05',
    popular: false,
  },
  {
    slug: 'ekspressnaya-viza-srochno',
    title: 'Срочная виза за 3 дня: когда это возможно',
    excerpt: 'В каких странах реально сделать визу срочно, сколько стоит, что нужно.',
    category: 'Советы',
    readTime: '4 мин',
    publishedAt: '2026-07-07',
    popular: false,
  },
  {
    slug: 'otkaz-v-vize-chto-delat',
    title: 'Отказали в визе: что делать дальше',
    excerpt: 'Не паникуйте. Разбираем причины отказа и план действий для успешной повторной подачи.',
    category: 'Советы',
    readTime: '6 мин',
    publishedAt: '2026-07-09',
    popular: true,
  },
]

export default function BlogPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-16 md:py-24">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-secondary/5 blur-3xl" />
        </div>
        <div className="container relative mx-auto max-w-7xl px-4 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Экспертный блог · VisaKZ
          </div>
          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
            Блог VisaKZ —{' '}
            <span className="text-primary">советы по визам от экспертов</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
            1200+ оформленных виз. Делимся знаниями бесплатно.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            {['Шенген', 'США', 'ОАЭ', 'Документы', 'Советы'].map(tag => (
              <span key={tag} className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-primary" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Blog content with client-side filter */}
      <BlogIndex articles={ARTICLES} />

      {/* CTA */}
      <section className="bg-primary py-16 md:py-20">
        <div className="container mx-auto max-w-7xl px-4 text-center text-white">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Нужна виза? Оформим за вас</h2>
          <p className="mb-8 text-primary-foreground/80 max-w-xl mx-auto">
            Оставьте заявку — наш менеджер свяжется с вами в WhatsApp в течение 15 минут.
          </p>
          <Link
            href="/apply"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 font-semibold text-primary hover:bg-white/90 transition-colors"
          >
            Оформить визу
          </Link>
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-primary-foreground/70">
            {['Бесплатная консультация', '98% одобрений', 'Гарантия возврата'].map(item => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
