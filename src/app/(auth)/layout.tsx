import Link from 'next/link'
import { Globe } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 px-4 py-12">
      <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-8">
        <Globe className="h-6 w-6 text-primary" />
        <span>Visa<span className="text-primary">KZ</span></span>
      </Link>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
