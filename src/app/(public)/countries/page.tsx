import { createClient } from '@/lib/supabase/server'
import { CountrySearch } from '@/components/public/CountrySearch'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Визы во все страны',
  description: 'Оформление виз в 28 стран из Казахстана. Шенген, США, ОАЭ, Азия — под ключ с AI-проверкой документов.',
}

export default async function CountriesPage() {
  const supabase = await createClient()

  type CountryItem = {
    id: string
    name_ru: string
    code: string
    flag_emoji: string
    base_price: number
    processing_time_days: number
    popularity_rank: number
  }

  const { data: rawCountries } = await supabase
    .from('countries')
    .select('id, name_ru, code, flag_emoji, base_price, processing_time_days, popularity_rank, is_active')
    .eq('is_active', true)
    .order('popularity_rank')

  const countries = (rawCountries ?? []) as CountryItem[]

  const schengen = ['DE', 'FR', 'ES', 'IT', 'CZ', 'AT', 'NL', 'CH', 'PL', 'FI', 'NO']
  const groups: Record<string, CountryItem[]> = {
    'Шенген': countries.filter(c => schengen.includes(c.code)),
    'Другие страны': countries.filter(c => !schengen.includes(c.code)),
  }

  // Top 6 by popularity_rank
  const popular = countries.slice(0, 6)

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold md:text-4xl">Визы из Казахстана</h1>
        <p className="mt-3 text-muted-foreground text-lg">
          {countries.length} направлений · AI-проверка документов · Менеджер на весь процесс
        </p>
      </div>

      <CountrySearch countries={countries} groups={groups} popular={popular} />
    </div>
  )
}
