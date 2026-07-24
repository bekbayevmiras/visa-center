import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Analytics } from '@/components/shared/Analytics'

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://visa-center-teal.vercel.app'

export const metadata: Metadata = {
  title: {
    default: 'VisaKZ — Визовый центр Казахстана',
    template: '%s | VisaKZ',
  },
  description: 'Визы под ключ из Казахстана. 28 направлений, AI-проверка документов, гарантия возврата при отказе. Алматы, Астана, онлайн.',
  keywords: ['виза', 'визовый центр', 'Казахстан', 'Шенген', 'США', 'ОАЭ', 'визовое сопровождение', 'оформление визы Алматы'],
  authors: [{ name: 'VisaKZ' }],
  creator: 'VisaKZ',
  applicationName: 'VisaKZ',
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'ru_KZ',
    url: SITE_URL,
    siteName: 'VisaKZ',
    title: 'VisaKZ — Визовый центр Казахстана',
    description: 'Визы под ключ из Казахстана. 28 направлений, AI-проверка документов, гарантия возврата при отказе.',
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: 'VisaKZ — Визовый центр Казахстана' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VisaKZ — Визовый центр Казахстана',
    description: 'Визы под ключ из Казахстана. 28 направлений, гарантия возврата при отказе.',
    images: [`${SITE_URL}/og-image.png`],
  },
  robots: { index: true, follow: true },
  manifest: '/manifest.json',
  icons: {
    apple: '/icons/icon-192.svg',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#1B4FD8',
  colorScheme: 'light',
}

const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'VisaKZ',
  description: 'Визовый центр Казахстана. Оформление виз в 28 стран под ключ.',
  url: SITE_URL,
  telephone: '+77271234567',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'ул. Абая 150',
    addressLocality: 'Алматы',
    addressRegion: 'Алматы',
    addressCountry: 'KZ',
  },
  openingHours: ['Mo-Fr 09:00-18:00', 'Sa 10:00-14:00'],
  priceRange: '₸₸',
  areaServed: { '@type': 'Country', name: 'Kazakhstan' },
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'VisaKZ',
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/countries?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-background font-sans antialiased">
        <Analytics />
        {children}
      </body>
    </html>
  )
}
