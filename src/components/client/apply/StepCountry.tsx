'use client'

import { useEffect, useState } from 'react'
import { Search, Clock, ArrowRight, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { ApplyFormData } from '@/components/client/apply/types'

type Country = {
  id: string
  name_ru: string
  code: string
  flag_emoji: string
  base_price: number
  express_price: number
  processing_time_days: number
  processing_time_express_days: number
}

type VisaType = {
  id: string
  type_code: string
  name_ru: string
  price: number
  express_price: number | null
  processing_days: number
}

export function StepCountry({
  data,
  update,
  onNext,
}: {
  data: ApplyFormData
  update: (p: Partial<ApplyFormData>) => void
  onNext: () => void
}) {
  const [countries, setCountries] = useState<Country[]>([])
  const [visaTypes, setVisaTypes] = useState<VisaType[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('countries')
      .select('id, name_ru, code, flag_emoji, base_price, express_price, processing_time_days, processing_time_express_days')
      .eq('is_active', true)
      .order('popularity_rank')
      .then(({ data }) => {
        setCountries((data ?? []) as Country[])
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (!data.country_id) { setVisaTypes([]); return }
    const supabase = createClient()
    supabase
      .from('visa_types')
      .select('id, type_code, name_ru, price, express_price, processing_days')
      .eq('country_id', data.country_id)
      .eq('is_active', true)
      .then(({ data: vt }) => setVisaTypes((vt ?? []) as VisaType[]))
  }, [data.country_id])

  const filtered = countries.filter(c =>
    c.name_ru.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  )

  const selectCountry = (c: Country) => {
    update({
      country_id: c.id,
      country_code: c.code.toLowerCase(),
      country_name: c.name_ru,
      country_flag: c.flag_emoji,
      visa_type_id: '',
      visa_type_name: '',
      visa_price: c.base_price,
      express_price: c.express_price,
    })
  }

  const selectVisaType = (vt: VisaType) => {
    update({
      visa_type_id: vt.id,
      visa_type_name: vt.name_ru,
      visa_price: data.is_express ? (vt.express_price ?? vt.price) : vt.price,
    })
  }

  const finalPrice = data.is_express ? data.express_price : data.visa_price
  const canNext = data.country_id && data.visa_type_id

  return (
    <div>
      <h2 className="text-xl font-bold mb-1">Куда едете?</h2>
      <p className="text-sm text-muted-foreground mb-6">Выберите страну и тип визы</p>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Поиск страны..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Country grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6 max-h-64 overflow-y-auto pr-1">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
            ))
          : filtered.map(c => (
              <button
                key={c.id}
                onClick={() => selectCountry(c)}
                className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all hover:border-primary/50 ${
                  data.country_id === c.id
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-border hover:bg-muted/30'
                }`}
              >
                <span className="text-2xl mb-1">{c.flag_emoji}</span>
                <span className="text-sm font-medium leading-tight">{c.name_ru}</span>
                <span className="text-xs text-muted-foreground">от {c.base_price.toLocaleString('ru')} ₸</span>
              </button>
            ))}
      </div>

      {/* Visa type */}
      {data.country_id && visaTypes.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-medium mb-3">Тип визы</p>
          <div className="space-y-2">
            {visaTypes.map(vt => (
              <button
                key={vt.id}
                onClick={() => selectVisaType(vt)}
                className={`w-full flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                  data.visa_type_id === vt.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <div>
                  <span className="text-sm font-medium">{vt.name_ru}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <Clock className="h-3 w-3" />
                    {vt.processing_days} дней
                  </span>
                </div>
                <span className="text-sm font-semibold">{vt.price.toLocaleString('ru')} ₸</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Express toggle */}
      {data.visa_type_id && data.express_price > 0 && (
        <div
          className={`mb-6 flex items-center justify-between rounded-xl border p-4 cursor-pointer transition-all ${
            data.is_express ? 'border-accent bg-accent/10' : 'border-border'
          }`}
          onClick={() => update({ is_express: !data.is_express, visa_price: !data.is_express ? data.express_price : data.visa_price })}
        >
          <div className="flex items-center gap-3">
            <Zap className={`h-5 w-5 ${data.is_express ? 'text-amber-500' : 'text-muted-foreground'}`} />
            <div>
              <p className="text-sm font-medium">Срочное оформление</p>
              <p className="text-xs text-muted-foreground">В 2 раза быстрее</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold">{data.express_price.toLocaleString('ru')} ₸</p>
            <div className={`mt-1 h-5 w-10 rounded-full transition-colors ${data.is_express ? 'bg-amber-500' : 'bg-muted'} flex items-center px-0.5`}>
              <div className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${data.is_express ? 'translate-x-5' : ''}`} />
            </div>
          </div>
        </div>
      )}

      {/* Price summary */}
      {data.visa_type_id && (
        <div className="mb-6 flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
          <span className="text-sm text-muted-foreground">Итого</span>
          <span className="text-lg font-bold text-primary">{finalPrice.toLocaleString('ru')} ₸</span>
        </div>
      )}

      <Button
        onClick={onNext}
        disabled={!canNext}
        className="w-full bg-primary text-white hover:bg-primary/90 h-11"
      >
        Далее
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  )
}
