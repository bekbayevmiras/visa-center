'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ArrowRight, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

function getUrgencyText(): string {
  const month = new Date().getMonth() // 0-11
  if (month === 2 || month === 3) return '🔥 Апрель — пиковый сезон. Запись ограничена.'
  if (month === 4 || month === 5) return '☀️ Летний сезон начался. Подайте заявку заранее.'
  if (month === 6 || month === 7) return '✈️ Август — высокий сезон. Осталось мест: 8.'
  if (month === 8 || month === 9) return '🍂 Октябрь — деловой сезон. Записывайтесь сейчас.'
  if (month === 10 || month === 11) return '🎄 Новогодние туры. Оформите визу до 20 декабря.'
  return '❄️ Зимний сезон. Начните оформление заранее.'
}

const POPULAR_COUNTRIES = [
  { code: 'de', name: 'Германия', flag: '🇩🇪', price: 35000, days: 10 },
  { code: 'fr', name: 'Франция', flag: '🇫🇷', price: 35000, days: 10 },
  { code: 'us', name: 'США', flag: '🇺🇸', price: 80000, days: 60 },
  { code: 'ae', name: 'ОАЭ', flag: '🇦🇪', price: 20000, days: 3 },
  { code: 'tr', name: 'Турция', flag: '🇹🇷', price: 15000, days: 1 },
  { code: 'th', name: 'Таиланд', flag: '🇹🇭', price: 15000, days: 3 },
  { code: 'jp', name: 'Япония', flag: '🇯🇵', price: 30000, days: 5 },
  { code: 'kr', name: 'Корея', flag: '🇰🇷', price: 25000, days: 5 },
]

const TRUST_ITEMS = [
  'Бесплатная консультация',
  '🛡️ Платите 30% вперёд, 70% после визы',
  'Возврат при отказе',
]

// Slowly drifting counter — starts at 12, ±1 every ~8s
function useSocialCounter(initial = 12) {
  const [count, setCount] = useState(initial)

  useEffect(() => {
    const tick = () => {
      setCount(c => {
        const delta = Math.random() < 0.5 ? -1 : 1
        const next = c + delta
        return Math.max(8, Math.min(18, next))
      })
    }
    const interval = setInterval(tick, 8000)
    return () => clearInterval(interval)
  }, [])

  return count
}

export function Hero() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const socialCount = useSocialCounter(12)

  const handleSelect = (code: string) => {
    setSelected(code)
    setQuery('')
  }

  const handleApply = () => {
    const country = selected ?? query.trim().toLowerCase().replace(/\s+/g, '-')
    if (country) router.push(`/apply?country=${encodeURIComponent(country)}`)
    else router.push('/apply')
  }

  return (
    <>
      {/* Urgency banner — dynamic by season */}
      <div className="w-full bg-amber-500/10 border-b border-amber-500/20 py-2 text-center text-sm font-medium text-amber-700">
        {getUrgencyText()}
      </div>

      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-16 md:py-24">
        {/* Background decorations */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-secondary/5 blur-3xl" />
        </div>

        <div className="container relative mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Работаем 24/7 · Бот отвечает мгновенно
            </div>

            {/* Headline */}
            <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Виза под ключ{' '}
              <span className="text-primary">из Казахстана</span>
            </h1>

            <p className="mb-2 text-lg text-muted-foreground md:text-xl">
              AI-проверка документов за 30 секунд. Личный менеджер. Цены от <strong className="text-foreground">8 000 ₸</strong>.
            </p>
            <p className="mb-4 text-base text-emerald-700 font-medium">
              🛡️ Платите 30% вперёд — остальное только после получения визы
            </p>

            {/* Trust badges */}
            <div className="mb-10 flex flex-wrap justify-center gap-x-6 gap-y-2">
              {TRUST_ITEMS.map(item => (
                <span key={item} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-secondary" />
                  {item}
                </span>
              ))}
            </div>

            {/* Country picker */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-lg text-left">
              <p className="mb-4 text-sm font-medium text-muted-foreground">Куда хотите поехать?</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {POPULAR_COUNTRIES.map(country => (
                  <button
                    key={country.code}
                    onClick={() => handleSelect(country.code)}
                    className={`flex flex-col items-start rounded-xl border p-3 transition-all hover:border-primary/50 hover:bg-primary/5 ${
                      selected === country.code
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/30'
                        : 'border-border bg-background'
                    }`}
                  >
                    <span className="text-2xl mb-1">{country.flag}</span>
                    <span className="text-sm font-medium">{country.name}</span>
                    <span className="text-xs text-muted-foreground">от {country.price.toLocaleString('ru')} ₸</span>
                    <span className="text-xs text-muted-foreground">{country.days} дн.</span>
                  </button>
                ))}
              </div>

              <form
                className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center"
                onSubmit={e => { e.preventDefault(); handleApply() }}
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Или введите страну..."
                    value={query}
                    onChange={e => { setQuery(e.target.value); setSelected(null) }}
                    className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-primary text-white hover:bg-primary/90 h-10 px-6 shrink-0"
                >
                  Получить консультацию бесплатно
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </div>

            {/* Social counter */}
            <p className="mt-5 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
                Сегодня оформляют визу:{' '}
                <span className="font-semibold text-foreground tabular-nums">{socialCount}</span>{' '}
                человек
              </span>
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
