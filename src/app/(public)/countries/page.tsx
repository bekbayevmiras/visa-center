import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Clock, ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Визы во все страны',
  description: 'Оформление виз в 28 стран из Казахстана. Шенген, США, ОАЭ, Азия — под ключ с AI-проверкой документов.',
}

export default async function CountriesPage() {
  const supabase = await createClient()
  type CountryItem = { id: string; name_ru: string; code: string; flag_emoji: string; base_price: number; processing_time_days: number }

  const { data: rawCountries } = await supabase
    .from('countries')
    .select('id, name_ru, code, flag_emoji, base_price, processing_time_days, is_active')
    .eq('is_active', true)
    .order('popularity_rank')

  const countries = (rawCountries ?? []) as CountryItem[]

  const schengen = ['DE', 'FR', 'ES', 'IT', 'CZ', 'AT', 'NL', 'CH', 'PL', 'FI', 'NO']
  const groups = {
    'Шенген': countries.filter(c => schengen.includes(c.code)),
    'Другие страны': countries.filter(c => !schengen.includes(c.code)),
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold md:text-4xl">Визы из Казахстана</h1>
        <p className="mt-3 text-muted-foreground text-lg">28 направлений · AI-проверка документов · Менеджер на весь процесс</p>
      </div>

      {Object.entries(groups).map(([group, list]) => (
        <div key={group} className="mb-12">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            {group}
            <span className="text-sm font-normal text-muted-foreground">({list.length})</span>
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {list.map(country => (
              <Link
                key={country.code}
                href={`/countries/${country.code.toLowerCase()}`}
                className="group flex flex-col rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:shadow-md transition-all"
              >
                <span className="text-3xl mb-2">{country.flag_emoji}</span>
                <span className="font-semibold text-sm group-hover:text-primary transition-colors">
                  {country.name_ru}
                </span>
                <span className="mt-1 text-xs text-muted-foreground">
                  от {country.base_price.toLocaleString('ru')} ₸
                </span>
                <span className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {country.processing_time_days} дн.
                </span>
                <span className="mt-2 flex items-center gap-0.5 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Подробнее <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
