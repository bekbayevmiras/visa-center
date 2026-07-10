import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CheckCircle, XCircle, Clock, ArrowRight, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Цены на визы — VisaKZ',
  description: 'Прозрачные цены на оформление виз в 28 стран. Стандарт и срочное оформление. Без скрытых комиссий.',
}

type CountryRow = {
  id: string
  name_ru: string
  code: string
  flag_emoji: string | null
  base_price: number
  express_price: number
  processing_time_days: number
  processing_time_express_days: number
}

const SCHENGEN = ['DE', 'FR', 'ES', 'IT', 'CZ', 'AT', 'NL', 'CH', 'PL', 'FI', 'NO']
const ASIA = ['AE', 'TR', 'TH', 'CN', 'IN', 'VN', 'KR']
const POPULAR = ['DE', 'FR', 'AE']

const INCLUDED = [
  'Консультация (бесплатно)',
  'AI-проверка документов на полноту и корректность',
  'Перевод и нотариальное заверение (при необходимости)',
  'Подача в консульство / посольство',
  'Отслеживание статуса заявки',
  'Уведомления на WhatsApp и email',
]

const NOT_INCLUDED = [
  'Консульский сбор (оплачивается отдельно в посольство)',
  'Медицинская страховка для путешествий',
  'Авиабилеты и бронирование отелей',
]

const FAQ = [
  {
    q: 'Что входит в стоимость?',
    a: 'В стоимость наших услуг входит полное сопровождение: консультация, AI-проверка и комплектация документов, при необходимости — перевод и нотариальное заверение, подача в консульство и отслеживание статуса.',
  },
  {
    q: 'Чем срочное оформление отличается от стандартного?',
    a: 'При срочном оформлении мы приоритизируем вашу заявку: менеджер занимается ею в первую очередь, документы проверяются и подаются в тот же день. Скорость итогового решения зависит от консульства, но мы минимизируем время с нашей стороны.',
  },
  {
    q: 'Почему цены разные для разных стран?',
    a: 'Стоимость зависит от сложности оформления: количества требуемых документов, необходимости перевода, наличия собеседования в консульстве и других факторов.',
  },
  {
    q: 'Что происходит при отказе?',
    a: 'Мы возвращаем стоимость наших услуг при отказе консульства. Консульский сбор, уплаченный напрямую в посольство, не возвращается — это политика самого посольства.',
  },
]

function getGroup(code: string): string {
  if (SCHENGEN.includes(code)) return 'Шенген'
  if (ASIA.includes(code)) return 'Азия'
  return 'Другие страны'
}

export default async function PricesPage() {
  const supabase = await createClient()

  const { data: rawCountries } = await supabase
    .from('countries')
    .select('id, name_ru, code, flag_emoji, base_price, express_price, processing_time_days, processing_time_express_days, is_active')
    .eq('is_active', true)
    .order('base_price')

  const countries = (rawCountries ?? []) as CountryRow[]

  const groups: Record<string, CountryRow[]> = {
    'Шенген': [],
    'Азия': [],
    'Другие страны': [],
  }

  for (const c of countries) {
    const group = getGroup(c.code)
    groups[group].push(c)
  }

  // Sort each group by price ascending
  for (const key of Object.keys(groups)) {
    groups[key].sort((a, b) => a.base_price - b.base_price)
  }

  return (
    <div>
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-16 md:py-20">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-secondary/5 blur-3xl" />
        </div>
        <div className="container relative mx-auto max-w-7xl px-4 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Без скрытых комиссий
          </div>
          <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            Прозрачные цены
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Цена включает: сборку пакета документов, проверку AI, подачу в консульство, уведомления о статусе
          </p>
        </div>
      </section>

      {/* Price tables */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-4">

          {/* Hint about toggle — implemented as a static table with both columns shown */}
          <div className="mb-8 flex items-center justify-center gap-3">
            <span className="text-sm text-muted-foreground">
              Таблица показывает <span className="font-semibold text-foreground">стандартные</span> и <span className="font-semibold text-foreground">срочные</span> цены одновременно
            </span>
          </div>

          {Object.entries(groups).map(([group, list]) => {
            if (list.length === 0) return null
            return (
              <div key={group} className="mb-12">
                <h2 className="mb-4 text-xl font-semibold flex items-center gap-2">
                  {group}
                  <span className="text-sm font-normal text-muted-foreground">({list.length})</span>
                </h2>
                <div className="overflow-x-auto rounded-2xl border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Страна</th>
                        <th className="px-4 py-3 text-center font-medium text-muted-foreground">Срок (стандарт)</th>
                        <th className="px-4 py-3 text-center font-medium text-muted-foreground">Срок (срочно)</th>
                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">Стандарт</th>
                        <th className="px-4 py-3 text-right font-medium text-primary">Срочно</th>
                        <th className="px-4 py-3 text-right font-medium text-muted-foreground"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.map((country, idx) => {
                        const isPopular = POPULAR.includes(country.code)
                        return (
                          <tr
                            key={country.id}
                            className={`border-b border-border last:border-0 transition-colors hover:bg-muted/30 ${
                              isPopular ? 'bg-primary/3' : idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                            }`}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{country.flag_emoji ?? '🌍'}</span>
                                <div>
                                  <span className="font-medium">{country.name_ru}</span>
                                  {isPopular && (
                                    <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                                      Популярное
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center text-muted-foreground">
                              <span className="flex items-center justify-center gap-1">
                                <Clock className="h-3 w-3" />
                                {country.processing_time_days} дн.
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center text-muted-foreground">
                              <span className="flex items-center justify-center gap-1">
                                <Clock className="h-3 w-3 text-primary" />
                                {country.processing_time_express_days} дн.
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-medium">
                              {country.base_price.toLocaleString('ru-KZ')} ₸
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-primary">
                              {country.express_price.toLocaleString('ru-KZ')} ₸
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Link
                                href={`/apply?country=${country.code.toLowerCase()}`}
                                className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                              >
                                Оформить
                                <ArrowRight className="h-3 w-3" />
                              </Link>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* What's included / not included */}
      <section className="border-t border-border bg-card py-16">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Included */}
            <div className="rounded-2xl border border-border bg-background p-6">
              <h3 className="mb-5 text-lg font-semibold flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-secondary" />
                Что входит в стоимость
              </h3>
              <ul className="space-y-3">
                {INCLUDED.map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Not included */}
            <div className="rounded-2xl border border-border bg-background p-6">
              <h3 className="mb-5 text-lg font-semibold flex items-center gap-2">
                <XCircle className="h-5 w-5 text-destructive" />
                Что не входит
              </h3>
              <ul className="space-y-3">
                {NOT_INCLUDED.map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs text-muted-foreground border-t border-border pt-4">
                Консульский сбор зависит от страны и оплачивается напрямую в посольство. Мы заранее сообщаем точную сумму.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="container mx-auto max-w-3xl px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold">Вопросы о ценах</h2>
          </div>
          <div className="space-y-4">
            {FAQ.map(item => (
              <div key={item.q} className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-2">{item.q}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16 md:py-20">
        <div className="container mx-auto max-w-7xl px-4 text-center text-white">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Начните оформление бесплатно</h2>
          <p className="mb-8 text-primary-foreground/80 max-w-xl mx-auto">
            Заполните заявку — менеджер свяжется в WhatsApp, ответит на вопросы и подберёт оптимальный вариант.
          </p>
          <Link href="/apply">
            <Button className="bg-white text-primary hover:bg-white/90 font-semibold px-10 py-3 h-auto rounded-xl text-base">
              Начать оформление бесплатно
            </Button>
          </Link>
          <p className="mt-4 text-sm text-primary-foreground/60">Без предоплаты · Ответ в течение 15 минут</p>
        </div>
      </section>
    </div>
  )
}
