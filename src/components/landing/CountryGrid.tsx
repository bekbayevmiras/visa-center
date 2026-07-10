import Link from 'next/link'
import { ArrowRight, Clock } from 'lucide-react'

const COUNTRIES = [
  { code: 'de', flag: '🇩🇪', name: 'Германия', price: 35000, days: 10 },
  { code: 'fr', flag: '🇫🇷', name: 'Франция', price: 35000, days: 10 },
  { code: 'es', flag: '🇪🇸', name: 'Испания', price: 35000, days: 10 },
  { code: 'it', flag: '🇮🇹', name: 'Италия', price: 35000, days: 10 },
  { code: 'us', flag: '🇺🇸', name: 'США', price: 80000, days: 60 },
  { code: 'gb', flag: '🇬🇧', name: 'Великобритания', price: 60000, days: 15 },
  { code: 'ae', flag: '🇦🇪', name: 'ОАЭ', price: 20000, days: 3 },
  { code: 'jp', flag: '🇯🇵', name: 'Япония', price: 30000, days: 5 },
  { code: 'kr', flag: '🇰🇷', name: 'Южная Корея', price: 25000, days: 5 },
  { code: 'cn', flag: '🇨🇳', name: 'Китай', price: 30000, days: 7 },
  { code: 'tr', flag: '🇹🇷', name: 'Турция', price: 15000, days: 1 },
  { code: 'th', flag: '🇹🇭', name: 'Таиланд', price: 15000, days: 3 },
  { code: 'id', flag: '🇮🇩', name: 'Бали', price: 15000, days: 1 },
  { code: 'sg', flag: '🇸🇬', name: 'Сингапур', price: 30000, days: 5 },
  { code: 'vn', flag: '🇻🇳', name: 'Вьетнам', price: 15000, days: 3 },
  { code: 'in', flag: '🇮🇳', name: 'Индия', price: 20000, days: 3 },
]

export function CountryGrid() {
  return (
    <section className="bg-muted/30 py-16 md:py-24">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold md:text-4xl">Направления</h2>
            <p className="mt-3 text-muted-foreground">28 стран — выбирайте</p>
          </div>
          <Link
            href="/countries"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Все страны
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
          {COUNTRIES.map(country => (
            <Link
              key={country.code}
              href={`/countries/${country.code}`}
              className="group flex flex-col rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md"
            >
              <span className="mb-2 text-3xl">{country.flag}</span>
              <span className="font-semibold text-sm group-hover:text-primary transition-colors">
                {country.name}
              </span>
              <span className="mt-1 text-xs text-muted-foreground">
                от {country.price.toLocaleString('ru')} ₸
              </span>
              <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {country.days} {country.days === 1 ? 'день' : country.days < 5 ? 'дня' : 'дней'}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
