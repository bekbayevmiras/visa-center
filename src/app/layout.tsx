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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
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
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#1B4FD8',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
