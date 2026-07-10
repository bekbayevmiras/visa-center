import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'VisaKZ — Визовый центр Казахстана',
    template: '%s | VisaKZ',
  },
  description: 'Визы под ключ из Казахстана. 28 направлений, AI-проверка документов, 98% одобрений. Алматы, Астана, онлайн.',
  keywords: ['виза', 'визовый центр', 'Казахстан', 'Шенген', 'США', 'ОАЭ', 'визовое сопровождение'],
  authors: [{ name: 'VisaKZ' }],
  creator: 'VisaKZ',
  metadataBase: new URL('https://visa-center-teal.vercel.app'),
  alternates: {
    canonical: 'https://visa-center-teal.vercel.app',
  },
  verification: {
    google: '',
  },
  openGraph: {
    type: 'website',
    locale: 'ru_KZ',
    url: '/',
    siteName: 'VisaKZ',
    title: 'VisaKZ — Визовый центр Казахстана',
    description: 'Визы под ключ из Казахстана. 28 направлений, AI-проверка документов, 98% одобрений.',
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

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'VisaKZ',
  description: 'Визовый центр Казахстана. Оформление виз в 28 стран под ключ.',
  url: 'https://visa-center-teal.vercel.app',
  telephone: '+77000000000',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Алматы',
    addressCountry: 'KZ',
  },
  openingHours: 'Mo-Fr 09:00-19:00, Sa 10:00-16:00',
  priceRange: '₸₸',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
