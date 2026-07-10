import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Clock, CheckCircle, ArrowRight, Zap, Phone } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import type { Metadata } from 'next'

type Props = { params: Promise<{ code: string }> }

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

  return {
    title: `Виза в ${country.name_ru} из Казахстана`,
    description: `Оформление визы в ${country.name_ru} под ключ. AI-проверка документов, личный менеджер, 98% одобрений. Алматы, Астана, онлайн.`,
  }
}

export default async function CountryPage({ params }: Props) {
  const { code } = await params
  const supabase = await createClient()

  type CountryRow = {
    id: string; name_ru: string; code: string; flag_emoji: string
    base_price: number; express_price: number; processing_time_days: number
    processing_time_express_days: number; requirements: string[]; embassy_info: Record<string, string>
  }
  type VisaTypeRow = {
    id: string; name_ru: string; price: number; express_price: number | null
    processing_days: number; validity_days: number | null; max_stay_days: number | null; entries: string
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
  const requirements: string[] = Array.isArray(country.requirements) ? country.requirements : []

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/countries" className="hover:text-foreground">Страны</Link>
        {' / '}
        <span>{country.name_ru}</span>
      </nav>

      {/* Hero */}
      <div className="mb-10 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-4 mb-3">
            <span className="text-6xl">{country.flag_emoji}</span>
            <div>
              <h1 className="text-3xl font-bold">Виза в {country.name_ru}</h1>
              <p className="text-muted-foreground mt-1">из Казахстана · под ключ</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-1.5 bg-muted rounded-full px-3 py-1">
              <Clock className="h-4 w-4 text-primary" />
              Стандарт: {country.processing_time_days} дней
            </span>
            <span className="flex items-center gap-1.5 bg-amber-50 text-amber-700 rounded-full px-3 py-1">
              <Zap className="h-4 w-4" />
              Экспресс: {country.processing_time_express_days} дней
            </span>
          </div>
        </div>
        <div className="shrink-0 flex flex-col gap-3 md:min-w-56">
          <Link href={`/apply?country=${code.toLowerCase()}`}>
            <Button className="w-full bg-primary text-white hover:bg-primary/90 h-11 gap-2">
              Подать заявку <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href="https://wa.me/77000000000" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="w-full h-11 gap-2">
              <Phone className="h-4 w-4" /> Бесплатная консультация
            </Button>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          {/* Visa types */}
          {visaTypes && visaTypes.length > 0 && (
            <section className="rounded-2xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-4">Типы виз</h2>
              <div className="space-y-3">
                {visaTypes.map(vt => (
                  <div key={vt.id} className="flex items-center justify-between rounded-xl bg-muted/30 px-4 py-3">
                    <div>
                      <p className="font-medium text-sm">{vt.name_ru}</p>
                      <p className="text-xs text-muted-foreground">
                        {vt.validity_days && `Действует ${vt.validity_days} дней · `}
                        {vt.max_stay_days && `Пребывание до ${vt.max_stay_days} дней · `}
                        {vt.entries === 'multiple' ? 'Многократная' : vt.entries === 'double' ? 'Двукратная' : 'Однократная'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{vt.price.toLocaleString('ru')} ₸</p>
                      {vt.express_price && (
                        <p className="text-xs text-amber-600">Экспресс: {vt.express_price.toLocaleString('ru')} ₸</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Requirements */}
          {requirements.length > 0 && (
            <section className="rounded-2xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-4">Документы для визы</h2>
              <ul className="space-y-2">
                {requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 rounded-xl bg-primary/5 border border-primary/20 p-3 text-xs text-primary">
                AI автоматически проверит ваши документы на соответствие требованиям за 30 секунд после загрузки.
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
              <Button className="w-full bg-primary text-white hover:bg-primary/90 gap-2">
                Подать заявку <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
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
        </div>
      </div>
    </div>
  )
}
