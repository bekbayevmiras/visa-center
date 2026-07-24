import { Suspense } from 'react'
import { Navbar } from '@/components/shared/Navbar'
import { Footer } from '@/components/shared/Footer'
import { WhatsAppWidget } from '@/components/shared/WhatsAppWidget'
import { UTMCapture } from '@/components/shared/UTMCapture'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <UTMCapture />
      </Suspense>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppWidget />
    </>
  )
}
