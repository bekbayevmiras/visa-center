'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Clock, Calendar, ArrowRight } from 'lucide-react'

type Article = {
  slug: string
  title: string
  excerpt: string
  category: string
  readTime: string
  publishedAt: string
  popular: boolean
}

const CATEGORIES = ['Все', 'Советы', 'Документы', 'Германия', 'ОАЭ', 'США']

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

function ArticleCard({ article, large = false }: { article: Article; large?: boolean }) {
  const colorClass = CATEGORY_COLORS[article.category] ?? 'bg-muted text-muted-foreground'

  if (large) {
    return (
      <Link
        href={`/blog/${article.slug}`}
        className="group flex flex-col rounded-2xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-lg transition-all duration-200"
      >
        <div className="mb-4 flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${colorClass}`}>
            {article.category}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {article.readTime}
          </span>
        </div>
        <h2 className="mb-3 text-xl font-bold leading-snug text-foreground group-hover:text-primary transition-colors">
          {article.title}
        </h2>
        <p className="mb-4 flex-1 text-sm text-muted-foreground leading-relaxed">
          {article.excerpt}
        </p>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(article.publishedAt)}
          </span>
          <span className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Читать <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group flex flex-col rounded-2xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-md transition-all duration-200"
    >
      <div className="mb-3 flex items-center gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}>
          {article.category}
        </span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {article.readTime}
        </span>
      </div>
      <h3 className="mb-2 text-base font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
        {article.title}
      </h3>
      <p className="mb-3 flex-1 text-sm text-muted-foreground leading-relaxed line-clamp-2">
        {article.excerpt}
      </p>
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Calendar className="h-3 w-3" />
        {formatDate(article.publishedAt)}
      </span>
    </Link>
  )
}

export function BlogIndex({ articles }: { articles: Article[] }) {
  const [activeCategory, setActiveCategory] = useState('Все')

  const popularArticles = articles.filter(a => a.popular)

  const filteredArticles =
    activeCategory === 'Все'
      ? articles.filter(a => !a.popular)
      : articles.filter(a => a.category === activeCategory)

  return (
    <section className="py-16">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Popular section */}
        {activeCategory === 'Все' && (
          <div className="mb-16">
            <h2 className="mb-8 text-2xl font-bold">Популярное</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {popularArticles.map(article => (
                <ArticleCard key={article.slug} article={article} large />
              ))}
            </div>
          </div>
        )}

        {/* Category filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-primary text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* All articles grid */}
        <div>
          <h2 className="mb-6 text-2xl font-bold">
            {activeCategory === 'Все' ? 'Все статьи' : activeCategory}
          </h2>
          {filteredArticles.length === 0 ? (
            <p className="text-muted-foreground">Статьи по данной теме скоро появятся.</p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredArticles.map(article => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
