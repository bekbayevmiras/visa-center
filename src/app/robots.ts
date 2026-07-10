import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin/', '/dashboard/', '/api/'] },
    sitemap: 'https://visa-center-teal.vercel.app/sitemap.xml',
  }
}
