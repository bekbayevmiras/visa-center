import type { MetadataRoute } from 'next'
import { ARTICLES } from './(public)/blog/page'

const BASE_URL = 'https://visa-center-teal.vercel.app'

const countryCodes = [
  'de', 'fr', 'es', 'it', 'cz', 'at', 'nl', 'ch', 'pl', 'fi',
  'no', 'us', 'gb', 'ae', 'cn', 'kr', 'jp', 'ca', 'au', 'tr',
  'th', 'in', 'my', 'id', 'sg', 'vn', 'ge', 'by',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/countries`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/apply`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/register`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  const countryPages: MetadataRoute.Sitemap = countryCodes.map((code) => ({
    url: `${BASE_URL}/countries/${code}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const blogArticlePages: MetadataRoute.Sitemap = ARTICLES.map((article) => ({
    url: `${BASE_URL}/blog/${article.slug}`,
    lastModified: new Date(article.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...countryPages, ...blogArticlePages]
}
