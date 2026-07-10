'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Globe,
  CheckCircle2,
  MessageCircle,
  ChevronRight,
  ArrowLeft,
  Loader2,
  User,
  Phone,
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const POPULAR_COUNTRY_CODES = ['DE', 'FR', 'AE', 'TR', 'US', 'GB', 'ES', 'IT', 'TH', 'JP']

const PURPOSES = [
  { key: 'tourism', label: '🌴 Туризм' },
  { key: 'business', label: '💼 Бизнес' },
  { key: 'study', label: '🎓 Учёба' },
  { key: 'other', label: '📋 Другое' },
]

const WHEN_OPTIONS = [
  { key: 'soon', label: 'В этом месяце' },
  { key: '1-3m', label: '1–3 месяца' },
  { key: 'later', label: 'Позже' },
]

type Country = { id: string; name_ru: string; code: string; flag_emoji: string }

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '77471234567'

function ApplyFormContent() {
  const searchParams = useSearchParams()

  const [step, setStep] = useState(1)
  const [countries, setCountries] = useState<Country[]>([])
  const [countrySearch, setCountrySearch] = useState('')
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [purpose, setPurpose] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [when, setWhen] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('countries')
      .select('id, name_ru, code, flag_emoji')
      .eq('is_active', true)
      .order('name_ru')
      .then(({ data }) => {
        if (data) {
          const all = data as Country[]
          const popular = POPULAR_COUNTRY_CODES
            .map(code => all.find(c => c.code === code))
            .filter((c): c is Country => !!c)
          const rest = all.filter(c => !POPULAR_COUNTRY_CODES.includes(c.code))
          setCountries([...popular, ...rest])
          const countryParam = searchParams.get('country')?.toUpperCase()
          if (countryParam) {
            const found = (data as Country[]).find(c => c.code === countryParam)
            if (found) setSelectedCountry(found)
          }
        }
      })
  }, [searchParams])

  const filteredCountries = countrySearch
    ? countries.filter(c =>
        c.name_ru.toLowerCase().includes(countrySearch.toLowerCase())
      )
    : countries

  const handleSubmit = async () => {
    setError('')
    if (!name.trim()) { setError('Введите ваше имя'); return }
    if (!phone.trim()) { setError('Введите номер WhatsApp'); return }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          country: selectedCountry
            ? `${selectedCountry.flag_emoji} ${selectedCountry.name_ru}`
            : undefined,
          purpose: purpose || undefined,
          when_traveling: when || undefined,
          source: 'apply_form',
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Ошибка отправки')
      }
      setStep(3)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка отправки')
    } finally {
      setIsSubmitting(false)
    }
  }

  const waText = selectedCountry
    ? `Привет! Хочу оформить визу в ${selectedCountry.name_ru}. Меня зовут ${name || '...'}`
    : `Привет! Хочу оформить визу. Меня зовут ${name || '...'}`
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`

  /* ── Step 3: Success ─────────────────────────────────────────── */
  if (step === 3) {
    return (
      <div className="text-center py-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Заявка принята!</h2>
        <p className="text-muted-foreground mb-8 max-w-xs mx-auto leading-relaxed">
          Менеджер свяжется с вами в WhatsApp в течение{' '}
          <strong>15 минут</strong>. Или напишите сами — ответим сразу.
        </p>

        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-[#25D366] text-white px-8 py-4 rounded-2xl text-base font-semibold hover:bg-[#20ba57] transition-colors shadow-lg shadow-green-500/20 mb-4"
        >
          <MessageCircle className="h-5 w-5" />
          Написать в WhatsApp
        </a>

        <p className="text-sm text-muted-foreground mb-8">
          Или подождите — мы напишем первыми 📱
        </p>

        <div className="border-t border-border pt-6 space-y-3">
          <p className="text-sm text-muted-foreground">
            Хотите отслеживать статус заявки онлайн?
          </p>
          <div className="flex flex-col gap-2 items-center">
            <Link
              href="/register"
              className="text-sm font-medium text-primary hover:underline"
            >
              Создать аккаунт (необязательно)
            </Link>
            <Link
              href="/"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              На главную
            </Link>
          </div>
        </div>
      </div>
    )
  }

  /* ── Steps 1 & 2 ─────────────────────────────────────────────── */
  return (
    <div>
      {/* Progress bar */}
      <div className="flex gap-2 mb-4">
        {[1, 2].map(s => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              s <= step ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Trust strip */}
      <div className="flex items-center justify-center gap-4 mb-6 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          98% одобрений
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          🛡️ Гарантия возврата
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          Ответ за 15 мин
        </span>
      </div>

      {/* ── Step 1: Country + Purpose ────────────────────────────── */}
      {step === 1 && (
        <div>
          <h2 className="text-xl font-bold mb-1">Куда едете?</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Выберите страну и цель поездки
          </p>

          {/* Country */}
          <div className="mb-5">
            <label className="block text-sm font-medium mb-2">Страна</label>
            {selectedCountry ? (
              <div className="flex items-center justify-between rounded-xl border border-primary/50 bg-primary/5 px-4 py-3">
                <span className="font-medium">
                  {selectedCountry.flag_emoji} {selectedCountry.name_ru}
                </span>
                <button
                  onClick={() => {
                    setSelectedCountry(null)
                    setCountrySearch('')
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Изменить
                </button>
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  placeholder="Поиск страны..."
                  value={countrySearch}
                  onChange={e => setCountrySearch(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all mb-2"
                />
                {(countrySearch || countries.length > 0) && (
                  <div className="max-h-48 overflow-y-auto rounded-xl border border-border bg-background divide-y divide-border">
                    {filteredCountries.slice(0, 20).map(c => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setSelectedCountry(c)
                          setCountrySearch('')
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors flex items-center gap-3"
                      >
                        <span className="text-lg leading-none">{c.flag_emoji}</span>
                        <span>{c.name_ru}</span>
                      </button>
                    ))}
                    {filteredCountries.length === 0 && (
                      <p className="px-4 py-3 text-sm text-muted-foreground">
                        Страна не найдена
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Purpose */}
          <div className="mb-8">
            <label className="block text-sm font-medium mb-2">Цель визы</label>
            <div className="grid grid-cols-2 gap-2">
              {PURPOSES.map(p => (
                <button
                  key={p.key}
                  onClick={() => setPurpose(p.key)}
                  className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                    purpose === p.key
                      ? 'border-primary bg-primary text-white'
                      : 'border-border bg-background hover:bg-muted'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!selectedCountry || !purpose}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white rounded-xl py-3.5 font-semibold disabled:opacity-40 hover:bg-primary/90 transition-colors"
          >
            Далее
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Step 2: Contacts ─────────────────────────────────────── */}
      {step === 2 && (
        <div>
          <button
            onClick={() => setStep(1)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Назад
          </button>

          <h2 className="text-xl font-bold mb-1">Ваши контакты</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Менеджер напишет в WhatsApp в течение{' '}
            <span className="text-foreground font-medium">15 минут</span>
          </p>

          <div className="space-y-4 mb-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Имя</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Ваше имя"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoComplete="name"
                  className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Номер WhatsApp
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="tel"
                  placeholder="+7 (777) 123-45-67"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  autoComplete="tel"
                  className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Когда планируете поездку?
              </label>
              <div className="flex gap-2 flex-wrap">
                {WHEN_OPTIONS.map(w => (
                  <button
                    key={w.key}
                    onClick={() => setWhen(w.key)}
                    className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
                      when === w.key
                        ? 'border-primary bg-primary text-white'
                        : 'border-border bg-background hover:bg-muted'
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !name.trim() || !phone.trim()}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white rounded-xl py-3.5 font-semibold disabled:opacity-40 hover:bg-primary/90 transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Отправляем...
              </>
            ) : (
              <>
                Отправить заявку
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>

          <p className="text-xs text-muted-foreground text-center mt-4">
            Нажимая кнопку, вы соглашаетесь с{' '}
            <Link href="/privacy" className="hover:underline">
              политикой конфиденциальности
            </Link>
          </p>
        </div>
      )}
    </div>
  )
}

export default function ApplyPage() {
  return (
    <div className="min-h-screen bg-muted/20 flex items-start justify-center p-4 pt-12 pb-16">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold mb-5">
            <Globe className="h-6 w-6 text-primary" />
            <span>
              Visa<span className="text-primary">KZ</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold">Оформить визу</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Ответим в WhatsApp за 15 минут
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
          <Suspense>
            <ApplyFormContent />
          </Suspense>
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-5 mt-6 text-xs text-muted-foreground">
          <span>✓ 1 200+ виз выдано</span>
          <span>✓ 98% одобрений</span>
          <span>✓ 28 стран</span>
        </div>
      </div>
    </div>
  )
}
