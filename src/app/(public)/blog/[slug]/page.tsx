import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Clock, Calendar, ArrowRight, CheckCircle } from 'lucide-react'
import type { Metadata } from 'next'
import { ARTICLES } from '../page'
import { ARTICLE_CONTENT } from './content'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return ARTICLES.map(article => ({ slug: article.slug }))
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://visa-center-teal.vercel.app'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = ARTICLES.find(a => a.slug === slug)
  if (!article) return { title: 'Статья не найдена' }
  const title = `${article.title} — VisaKZ`
  return {
    title,
    description: article.excerpt,
    alternates: { canonical: `${SITE_URL}/blog/${slug}` },
    openGraph: {
      title,
      description: article.excerpt,
      type: 'article',
      publishedTime: article.publishedAt,
      authors: ['VisaKZ'],
      images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: article.excerpt,
      images: [`${SITE_URL}/og-image.png`],
    },
  }
}

const CATEGORY_COLORS: Record<string, string> = {
  Советы: 'bg-primary/10 text-primary',
  Документы: 'bg-secondary/10 text-secondary',
  Германия: 'bg-blue-500/10 text-blue-600',
  ОАЭ: 'bg-amber-500/10 text-amber-600',
  США: 'bg-red-500/10 text-red-600',
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const article = ARTICLES.find(a => a.slug === slug)
  if (!article) notFound()

  const content = ARTICLE_CONTENT[slug]
  if (!content) notFound()

  const relatedArticles = ARTICLES.filter(
    a => a.slug !== slug && a.category === article.category,
  ).slice(0, 3)

  const colorClass = CATEGORY_COLORS[article.category] ?? 'bg-muted text-muted-foreground'

  const headings = content.sections
    .filter(s => s.heading)
    .map(s => s.heading as string)

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: { '@type': 'Organization', name: 'VisaKZ', url: SITE_URL },
    publisher: { '@type': 'Organization', name: 'VisaKZ', url: SITE_URL },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${slug}` },
    url: `${SITE_URL}/blog/${slug}`,
    articleSection: article.category,
    inLanguage: 'ru-KZ',
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Главная', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Блог', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: article.title, item: `${SITE_URL}/blog/${slug}` },
    ],
  }

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {/* Breadcrumb */}
      <div className="border-b border-border bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Главная</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/blog" className="hover:text-foreground transition-colors">Блог</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground line-clamp-1">{article.title}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12 md:py-16">
        <div className="container relative mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-3xl">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${colorClass}`}>
                {article.category}
              </span>
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {article.readTime}
              </span>
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {formatDate(article.publishedAt)}
              </span>
            </div>
            <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl">
              {article.title}
            </h1>
            <p className="text-lg text-muted-foreground">{article.excerpt}</p>
          </div>
        </div>
      </section>

      {/* Content + sidebar */}
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="flex gap-12 lg:items-start">
          {/* Table of contents (desktop sidebar) */}
          {headings.length > 0 && (
            <aside className="hidden lg:block w-64 shrink-0 sticky top-24">
              <div className="rounded-2xl border border-border bg-card p-5">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Содержание
                </h2>
                <ul className="space-y-2">
                  {headings.map((h, i) => (
                    <li key={i}>
                      <a
                        href={`#h-${i}`}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors leading-snug block"
                      >
                        {h}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          )}

          {/* Article body */}
          <article className="flex-1 min-w-0">
            <div className="prose prose-zinc dark:prose-invert max-w-none">
              {content.sections.map((section, i) => {
                let headingIndex = -1
                if (section.heading) {
                  headingIndex = headings.indexOf(section.heading)
                }

                return (
                  <div key={i}>
                    {section.heading && (
                      <h2
                        id={headingIndex >= 0 ? `h-${headingIndex}` : undefined}
                        className="mt-10 mb-4 text-xl font-bold text-foreground scroll-mt-24"
                      >
                        {section.heading}
                      </h2>
                    )}

                    {section.text && (
                      <p className="mb-4 text-base text-muted-foreground leading-relaxed">
                        {section.text}
                      </p>
                    )}

                    {section.list && (
                      <ul className="mb-6 space-y-2">
                        {section.list.map((item, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {section.tip && (
                      <div className="my-8 rounded-2xl border border-primary/20 bg-primary/5 p-5">
                        <p className="text-sm font-medium text-primary">{section.tip}</p>
                      </div>
                    )}

                    {/* CTA in the middle of article — after 4th section */}
                    {i === 3 && (
                      <div className="my-10 rounded-2xl bg-primary p-6 text-white">
                        <h3 className="mb-2 text-lg font-bold">Нужна виза? Оформим за вас</h3>
                        <p className="mb-4 text-sm text-primary-foreground/80">
                          Персональный менеджер, AI-проверка документов, гарантия возврата при отказе.
                        </p>
                        <Link
                          href="/apply"
                          className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-primary hover:bg-white/90 transition-colors"
                        >
                          Оформить визу <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Author box */}
            <div className="mt-12 rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-2xl">
                  🌐
                </div>
                <div>
                  <p className="font-semibold text-foreground">Команда VisaKZ</p>
                  <p className="text-sm text-muted-foreground">1200+ виз оформлено · гарантия возврата при отказе</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Профессиональные визовые консультанты с опытом работы в посольствах.
                  </p>
                </div>
              </div>
            </div>
          </article>
        </div>

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-16 border-t border-border pt-12">
            <h2 className="mb-6 text-2xl font-bold">Похожие статьи</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relatedArticles.map(related => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="group flex flex-col rounded-2xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-md transition-all duration-200"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${CATEGORY_COLORS[related.category] ?? 'bg-muted text-muted-foreground'}`}>
                      {related.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {related.readTime}
                    </span>
                  </div>
                  <h3 className="mb-2 text-base font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
                    {related.title}
                  </h3>
                  <p className="flex-1 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {related.excerpt}
                  </p>
                  <span className="mt-3 flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Читать <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <section className="bg-primary py-16">
        <div className="container mx-auto max-w-7xl px-4 text-center text-white">
          <h2 className="mb-4 text-3xl font-bold">Оформим визу за вас</h2>
          <p className="mb-8 text-primary-foreground/80 max-w-xl mx-auto">
            Менеджер свяжется в WhatsApp в течение 15 минут. Бесплатная консультация.
          </p>
          <Link
            href="/apply"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 font-semibold text-primary hover:bg-white/90 transition-colors"
          >
            Подать заявку <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
