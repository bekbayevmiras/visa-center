'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Globe, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'

const NAV_LINKS = [
  { href: '/countries', label: 'Страны' },
  { href: '/prices', label: 'Цены' },
  { href: '/guarantee', label: '🛡️ Гарантия' },
  { href: '/blog', label: 'Блог' },
  { href: '/about', label: 'О нас' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Globe className="h-6 w-6 text-primary" />
          <span className="text-foreground">Visa<span className="text-primary">KZ</span></span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="tel:+77000000000"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Phone className="h-4 w-4" />
            +7 (700) 000-0000
          </a>
          <Link href="/login">
            <Button variant="ghost" size="sm">Войти</Button>
          </Link>
          <Link href="/apply">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white">
              Подать заявку
            </Button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-muted transition-colors"
          onClick={() => setOpen(o => !o)}
          aria-label="Меню"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 flex flex-col gap-4">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium py-2"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-border">
            <a href="tel:+77000000000" className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              +7 (700) 000-0000
            </a>
            <Link href="/login" onClick={() => setOpen(false)}>
              <Button variant="outline" className="w-full">Войти</Button>
            </Link>
            <Link href="/apply" onClick={() => setOpen(false)}>
              <Button className="w-full bg-primary text-white">Подать заявку</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
