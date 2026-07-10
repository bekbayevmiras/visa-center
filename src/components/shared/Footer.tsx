import Link from 'next/link'
import { Globe, Phone, Mail, MapPin, MessageCircle } from 'lucide-react'

const COUNTRIES_LINKS = [
  { href: '/countries/de', label: 'Германия' },
  { href: '/countries/fr', label: 'Франция' },
  { href: '/countries/us', label: 'США' },
  { href: '/countries/ae', label: 'ОАЭ' },
  { href: '/countries/tr', label: 'Турция' },
  { href: '/countries/th', label: 'Таиланд' },
]

const SERVICE_LINKS = [
  { href: '/prices', label: 'Прайс-лист' },
  { href: '/countries', label: 'Все страны' },
  { href: '/about', label: 'О нас' },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-3">
              <Globe className="h-5 w-5 text-primary" />
              <span>Visa<span className="text-primary">KZ</span></span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Визовый центр с AI-поддержкой. Оформляем визы в 28 стран из Казахстана под ключ.
            </p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <a href="tel:+77000000000" className="flex items-center gap-2 hover:text-foreground transition-colors">
                <Phone className="h-4 w-4" />
                +7 (700) 000-0000
              </a>
              <a href="https://wa.me/77000000000" className="flex items-center gap-2 hover:text-foreground transition-colors">
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
              <a href="mailto:info@visakz.kz" className="flex items-center gap-2 hover:text-foreground transition-colors">
                <Mail className="h-4 w-4" />
                info@visakz.kz
              </a>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" />
                Алматы, пр. Достык 5, оф. 201
              </span>
            </div>
          </div>

          {/* Popular countries */}
          <div>
            <h4 className="font-semibold mb-4 text-sm">Популярные визы</h4>
            <ul className="space-y-2">
              {COUNTRIES_LINKS.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Виза в {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4 text-sm">Сервис</h4>
            <ul className="space-y-2">
              {SERVICE_LINKS.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/apply" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Подать заявку
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Личный кабинет
                </Link>
              </li>
            </ul>
          </div>

          {/* Working hours */}
          <div>
            <h4 className="font-semibold mb-4 text-sm">Режим работы</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Пн–Пт</span>
                <span>09:00–19:00</span>
              </div>
              <div className="flex justify-between">
                <span>Суббота</span>
                <span>10:00–16:00</span>
              </div>
              <div className="flex justify-between">
                <span>Воскресенье</span>
                <span>Выходной</span>
              </div>
            </div>
            <div className="mt-4 rounded-lg bg-secondary/10 border border-secondary/20 p-3">
              <p className="text-xs text-secondary font-medium">AI-бот работает 24/7</p>
              <p className="text-xs text-muted-foreground mt-1">Отвечает на вопросы в WhatsApp в любое время</p>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} VisaKZ. Все права защищены.
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Политика конфиденциальности</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Условия использования</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
