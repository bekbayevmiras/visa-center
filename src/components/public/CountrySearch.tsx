'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Clock, Search, ArrowRight } from 'lucide-react'

interface CountryItem {
  id: string
  name_ru: string
  code: string
  flag_emoji: string
  base_price: number
  processing_time_days: number
  popularity_rank: number
}

interface CountryGroup {
  [group: string]: CountryItem[]
}

interface CountrySearchProps {
  countries: CountryItem[]
  groups: CountryGroup
  popular: CountryItem[]
}

export function CountrySearch({ countries, groups, popular }: CountrySearchProps) {
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? countries.filter(c =>
        c.name_ru.toLowerCase().includes(query.toLowerCase())
      )
    : null

  return (
    <div>
      {/* Search input */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Поиск страны..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Search results */}
      {filtered !== null ? (
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            {filtered.length > 0
              ? `Найдено ${filtered.length} стран`
              : 'Ничего не найдено'}
          </p>
          {filtered.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filtered.map(country => (
                <CountryCard key={country.code} country={country} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Popular section */}
          {popular.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-semibold mb-4">Самые популярные</h2>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {popular.map(country => (
                  <Link
                    key={country.code}
                    href={`/countries/${country.code.toLowerCase()}`}
                    className="group flex-shrink-0 flex flex-col items-center rounded-2xl border border-border bg-card px-5 py-4 hover:border-primary/40 hover:shadow-md transition-all min-w-[110px]"
                  >
                    <span className="text-4xl mb-2">{country.flag_emoji}</span>
                    <span className="font-semibold text-sm text-center group-hover:text-primary transition-colors">
                      {country.name_ru}
                    </span>
                    <span className="mt-1 text-xs text-muted-foreground">
                      от {country.base_price.toLocaleString('ru')} ₸
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Grouped grid */}
          {Object.entries(groups).map(([group, list]) => (
            <div key={group} className="mb-12">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                {group}
                <span className="text-sm font-normal text-muted-foreground">({list.length})</span>
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {list.map(country => (
                  <CountryCard key={country.code} country={country} />
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

function CountryCard({ country }: { country: CountryItem }) {
  return (
    <Link
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
  )
}
