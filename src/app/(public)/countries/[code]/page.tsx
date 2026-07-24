import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Clock, CheckCircle, ArrowRight, Zap, Phone, ChevronRight, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { RequirementsChecklist } from '@/components/public/RequirementsChecklist'
import { toAccusative } from '@/lib/country-cases'
import type { Metadata } from 'next'

type Props = { params: Promise<{ code: string }> }

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://visa-center-teal.vercel.app'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('countries')
    .select('name_ru, flag_emoji')
    .eq('code', code.toUpperCase())
    .single()

  const country = data as { name_ru: string; flag_emoji: string } | null
  if (!country) return { title: 'Страна не найдена' }

  const accusative = toAccusative(code, country.name_ru)
  const title = `Виза в ${accusative} из Казахстана`
  const description = `Оформление визы в ${accusative} под ключ. AI-проверка документов, личный менеджер, гарантия возврата при отказе. Алматы, Астана, онлайн.`
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/countries/${code.toLowerCase()}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/countries/${code.toLowerCase()}`,
      images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: title }],
    },
  }
}

// Region groupings for related countries
const SCHENGEN = ['DE', 'FR', 'ES', 'IT', 'CZ', 'AT', 'NL', 'CH', 'PL', 'FI', 'NO', 'BE', 'SE', 'DK', 'PT']
const ASIA = ['JP', 'CN', 'TH', 'VN', 'KR', 'ID', 'MY', 'SG', 'IN', 'AE', 'TR']
const AMERICA = ['US', 'CA', 'MX', 'BR']

function getRegionCodes(code: string): string[] {
  if (SCHENGEN.includes(code)) return SCHENGEN
  if (ASIA.includes(code)) return ASIA
  if (AMERICA.includes(code)) return AMERICA
  return []
}

function getRegionLabel(code: string): string {
  if (SCHENGEN.includes(code)) return 'Шенген'
  if (ASIA.includes(code)) return 'Азия'
  if (AMERICA.includes(code)) return 'Америка'
  return 'Другие страны'
}

function buildWhatsAppLink(countryName: string) {
  const text = encodeURIComponent(`Здравствуйте! Меня интересует виза в ${countryName}`)
  return `https://wa.me/77000000000?text=${text}`
}

export default async function CountryPage({ params }: Props) {
  const { code } = await params
  const supabase = await createClient()

  type CountryRow = {
    id: string; name_ru: string; code: string; flag_emoji: string
    base_price: number; express_price: number; processing_time_days: number
    processing_time_express_days: number; requirements: unknown; embassy_info: Record<string, string>
  }
  type VisaTypeRow = {
    id: string; name_ru: string; price: number; express_price: number | null
    processing_days: number; validity_days: number | null; max_stay_days: number | null; entries: string
  }
  type RelatedCountryRow = {
    code: string; name_ru: string; flag_emoji: string; base_price: number; processing_time_days: number
  }

  const { data: rawCountry } = await supabase
    .from('countries')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single()

  const country = rawCountry as CountryRow | null
  if (!country) notFound()

  const { data: rawVisaTypes } = await supabase
    .from('visa_types')
    .select('*')
    .eq('country_id', country.id)
    .eq('is_active', true)

  const visaTypes = (rawVisaTypes ?? []) as VisaTypeRow[]

  // Parse requirements — can be string[] or { required: string[], recommended: string[] }
  let requiredDocs: string[] = []
  let recommendedDocs: string[] = []
  const req = country.requirements
  if (Array.isArray(req)) {
    requiredDocs = req as string[]
  } else if (req && typeof req === 'object' && !Array.isArray(req)) {
    const reqObj = req as Record<string, unknown>
    if (Array.isArray(reqObj.required)) requiredDocs = reqObj.required as string[]
    if (Array.isArray(reqObj.recommended)) recommendedDocs = reqObj.recommended as string[]
  }

  // Related countries in same region
  const regionCodes = getRegionCodes(country.code)
  let relatedCountries: RelatedCountryRow[] = []
  if (regionCodes.length > 0) {
    const { data: rawRelated } = await supabase
      .from('countries')
      .select('code, name_ru, flag_emoji, base_price, processing_time_days')
      .in('code', regionCodes)
      .eq('is_active', true)
      .neq('code', country.code)
      .order('popularity_rank')
      .limit(4)
    relatedCountries = (rawRelated ?? []) as RelatedCountryRow[]
  }

  const whatsappLink = buildWhatsAppLink(country.name_ru)
  const accusative = toAccusative(country.code, country.name_ru)

  // Build FAQ content from country data
  const docsBrief = requiredDocs.slice(0, 3).join(', ') || 'паспорт, фото, анкета'
  const faqs = [
    {
      q: `Сколько стоит виза в ${accusative}?`,
      a: `Стоимость оформления визы в ${accusative} начинается от ${country.base_price.toLocaleString('ru')} ₸. Экспресс-оформление — от ${country.express_price.toLocaleString('ru')} ₸.`,
    },
    {
      q: `Как долго ждать визу в ${accusative}?`,
      a: `Стандартный срок рассмотрения — ${country.processing_time_days} рабочих дней. При экспресс-оформлении — ${country.processing_time_express_days} рабочих дней.`,
    },
    {
      q: 'Какие документы нужны?',
      a: `Основной пакет включает: ${docsBrief}${requiredDocs.length > 3 ? ` и ещё ${requiredDocs.length - 3} документа` : ''}. Полный список зависит от типа визы и цели поездки.`,
    },
    {
      q: 'Нужно ли ехать в посольство?',
      a: 'Нет, мы всё оформим за вас. Вы можете подать документы онлайн и получить визу без личного визита в посольство.',
    },
  ]

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Главная', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Страны', item: `${SITE_URL}/countries` },
      { '@type': 'ListItem', position: 3, name: country.name_ru, item: `${SITE_URL}/countries/${code.toLowerCase()}` },
    ],
  }

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `Оформление визы в ${accusative}`,
    description: `Визовое сопровождение из Казахстана в ${country.name_ru} под ключ. AI-проверка документов, личный менеджер.`,
    provider: {
      '@type': 'LocalBusiness',
      name: 'VisaKZ',
      url: SITE_URL,
    },
    areaServed: { '@type': 'Country', name: 'Kazakhstan' },
    offers: {
      '@type': 'Offer',
      price: country.base_price.toString(),
      priceCurrency: 'KZT',
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/countries/${code.toLowerCase()}`,
    },
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 pb-28 md:pb-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">Главная</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/countries" className="hover:text-foreground transition-colors">Страны</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{country.name_ru}</span>
      </nav>

      {/* Hero section */}
      <div className="mb-10 rounded-2xl border border-border bg-card p-6 md:p-8">
        <div className="flex flex-col gap-5">
          {/* Flag + title */}
          <div className="flex items-center gap-4">
            <span className="text-6xl">{country.flag_emoji}</span>
            <div>
              <h1 className="text-3xl font-bold">Виза в {accusative}</h1>
              <p className="text-muted-foreground mt-1">из Казахстана · под ключ</p>
            </div>
          </div>

          {/* Processing time badges */}
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5 bg-muted rounded-full px-3 py-1.5 text-sm">
              <Clock className="h-4 w-4 text-primary" />
              {country.processing_time_days}–{country.processing_time_days + 5} дней
            </span>
            <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 rounded-full px-3 py-1.5 text-sm">
              <Zap className="h-4 w-4" />
              Экспресс: {country.processing_time_express_days} дней
            </span>
          </div>

          {/* Price */}
          <div>
            <p className="text-sm text-muted-foreground">от</p>
            <p className="text-4xl font-bold text-primary">
              {country.base_price.toLocaleString('ru')} ₸
            </p>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href={`/apply?country=${code.toLowerCase()}`}>
              <Button className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-6 gap-2">
                Оформить визу <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="w-full sm:w-auto h-11 px-6 gap-2">
                <MessageCircle className="h-4 w-4 text-green-600" />
                Получить консультацию
              </Button>
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          {/* Visa types */}
          {visaTypes.length > 0 && (
            <section className="rounded-2xl border border-border p-6">
              <h2 className="text-xl font-semibold mb-5">Типы виз</h2>
              <div className="space-y-3">
                {visaTypes.map(vt => (
                  <div key={vt.id} className="rounded-xl border border-border bg-muted/20 p-4 hover:border-primary/30 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-sm mb-1">{vt.name_ru}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />{vt.processing_days} дн.
                          </span>
                          {vt.max_stay_days && (
                            <span>Пребывание: до {vt.max_stay_days} дн.</span>
                          )}
                          {vt.validity_days && (
                            <span>Действует: {vt.validity_days} дн.</span>
                          )}
                          <span>
                            {vt.entries === 'multiple' ? 'Многократная' : vt.entries === 'double' ? 'Двукратная' : 'Однократная'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-sm">{vt.price.toLocaleString('ru')} ₸</p>
                        {vt.express_price && (
                          <p className="text-xs text-amber-600 mt-0.5">Экспресс: {vt.express_price.toLocaleString('ru')} ₸</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-3">
                      <Link href={`/apply?country=${code.toLowerCase()}&visa=${vt.id}`}>
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                          Выбрать <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Requirements checklist */}
          {(requiredDocs.length > 0 || recommendedDocs.length > 0) && (
            <section className="rounded-2xl border border-border p-6">
              <h2 className="text-xl font-semibold mb-5">Документы для визы</h2>
              <RequirementsChecklist required={requiredDocs} recommended={recommendedDocs} />
              <div className="mt-5 rounded-xl bg-primary/5 border border-primary/20 p-3 text-xs text-primary">
                AI автоматически проверит ваши документы на соответствие требованиям за 30 секунд после загрузки.
              </div>
            </section>
          )}

          {/* FAQ */}
          <section className="rounded-2xl border border-border p-6">
            <h2 className="text-xl font-semibold mb-5">Часто задаваемые вопросы</h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <details key={i} className="group rounded-xl border border-border overflow-hidden">
                  <summary className="flex items-center justify-between gap-3 cursor-pointer px-4 py-3 text-sm font-medium hover:bg-muted/40 transition-colors list-none">
                    <span>{faq.q}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="px-4 pb-4 pt-2 text-sm text-muted-foreground border-t border-border">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* Related countries */}
          {relatedCountries.length > 0 && (
            <section className="rounded-2xl border border-border p-6">
              <h2 className="text-xl font-semibold mb-5">
                Другие страны — {getRegionLabel(country.code)}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {relatedCountries.map(rel => (
                  <Link
                    key={rel.code}
                    href={`/countries/${rel.code.toLowerCase()}`}
                    className="group flex flex-col rounded-xl border border-border bg-card p-3 hover:border-primary/40 hover:shadow-md transition-all"
                  >
                    <span className="text-2xl mb-1">{rel.flag_emoji}</span>
                    <span className="font-semibold text-xs group-hover:text-primary transition-colors leading-tight">
                      {rel.name_ru}
                    </span>
                    <span className="text-xs text-muted-foreground mt-0.5">
                      от {rel.base_price.toLocaleString('ru')} ₸
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Price card */}
          <div className="rounded-2xl border border-border bg-card p-5 sticky top-20">
            <p className="text-sm text-muted-foreground mb-1">Стоимость оформления</p>
            <p className="text-3xl font-bold text-primary mb-1">
              {country.base_price.toLocaleString('ru')} ₸
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Экспресс: {country.express_price.toLocaleString('ru')} ₸
            </p>

            <div className="space-y-2 text-sm mb-5">
              {['Подготовка документов', 'AI-проверка', 'Личный менеджер', 'Трекинг статуса'].map(f => (
                <div key={f} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-secondary shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>

            <Link href={`/apply?country=${code.toLowerCase()}`}>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                Подать заявку <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            {/* Guarantee block */}
            <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-4">
              <p className="text-sm font-semibold text-emerald-800 mb-2">🛡️ Гарантия VisaKZ</p>
              <div className="space-y-1.5 text-xs text-emerald-700">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>30% — при подаче, 70% — после получения визы</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>Полный возврат 30% при отказе посольства</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>Высокий процент одобрений по нашим клиентам</span>
                </div>
              </div>
            </div>
          </div>

          {/* Embassy info */}
          {country.embassy_info && Object.keys(country.embassy_info).length > 0 && (
            <div className="rounded-2xl border border-border p-5 text-sm space-y-2">
              <h3 className="font-semibold">Посольство / ВЦ</h3>
              {Object.entries(country.embassy_info).map(([k, v]) => (
                <div key={k}>
                  <span className="text-muted-foreground capitalize">{k}:</span> {String(v)}
                </div>
              ))}
            </div>
          )}

          {/* WhatsApp consult card */}
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="block">
            <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm hover:bg-green-100 transition-colors cursor-pointer">
              <div className="flex items-center gap-2 mb-1 font-semibold text-green-800">
                <Phone className="h-4 w-4" />
                Бесплатная консультация
              </div>
              <p className="text-green-700 text-xs">Ответим в WhatsApp в течение 15 минут</p>
            </div>
          </a>
        </div>
      </div>

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-background/95 backdrop-blur-sm px-4 py-3 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">Стоимость оформления</p>
          <p className="font-bold text-primary truncate">{country.base_price.toLocaleString('ru')} ₸</p>
        </div>
        <Link href={`/apply?country=${code.toLowerCase()}`} className="shrink-0">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-10 px-5">
            Оформить <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
