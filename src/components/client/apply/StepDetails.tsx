'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowRight, ArrowLeft, Minus, Plus, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ApplyFormData } from '@/components/client/apply/types'

const detailsSchema = z.object({
  travel_date_from: z.string().min(1, 'Укажите дату вылета'),
  travel_date_to: z.string().min(1, 'Укажите дату возврата'),
  travel_purpose: z.string(),
  full_name: z.string().min(2, 'Введите полное имя как в паспорте'),
  phone: z.string().min(10, 'Введите номер телефона'),
  email: z.string().email('Введите корректный email'),
  passport_number: z.string().min(5, 'Введите номер паспорта'),
  passport_expiry: z.string().min(1, 'Укажите срок действия паспорта'),
})

type DetailsForm = z.infer<typeof detailsSchema>

const PURPOSES = [
  { value: 'tourist', label: 'Туризм' },
  { value: 'business', label: 'Бизнес' },
  { value: 'student', label: 'Учёба' },
  { value: 'medical', label: 'Лечение' },
  { value: 'family', label: 'Семья' },
]

const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-sm font-medium mb-1.5">{label}</label>
    {children}
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
)

const inputClass = 'w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all'

export function StepDetails({
  data,
  update,
  onNext,
  onPrev,
}: {
  data: ApplyFormData
  update: (p: Partial<ApplyFormData>) => void
  onNext: () => void
  onPrev: () => void
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<DetailsForm>({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      travel_date_from: data.travel_date_from,
      travel_date_to: data.travel_date_to,
      travel_purpose: data.travel_purpose,
      full_name: data.full_name,
      phone: data.phone,
      email: data.email,
      passport_number: data.passport_number,
      passport_expiry: data.passport_expiry,
    },
  })

  const onSubmit = (values: DetailsForm) => {
    update(values)
    onNext()
  }

  const standardPrice = data.visa_price
  const expressPrice = data.express_price

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2 className="text-xl font-bold mb-1">Детали поездки</h2>
      <p className="text-sm text-muted-foreground mb-6">Заполните данные как в паспорте</p>

      <div className="space-y-4">
        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Дата вылета" error={errors.travel_date_from?.message}>
            <input type="date" {...register('travel_date_from')} className={inputClass} min={new Date().toISOString().split('T')[0]} />
          </Field>
          <Field label="Дата возврата" error={errors.travel_date_to?.message}>
            <input type="date" {...register('travel_date_to')} className={inputClass} min={new Date().toISOString().split('T')[0]} />
          </Field>
        </div>

        {/* Express toggle */}
        {expressPrice > 0 && (
          <div
            className={`flex items-center justify-between rounded-xl border p-4 cursor-pointer transition-all ${
              data.is_express ? 'border-accent bg-accent/10' : 'border-border hover:border-primary/40'
            }`}
            onClick={() => update({ is_express: !data.is_express })}
          >
            <div className="flex items-center gap-3">
              <Zap className={`h-5 w-5 ${data.is_express ? 'text-amber-500' : 'text-muted-foreground'}`} />
              <div>
                <p className="text-sm font-medium">Срочное оформление (+50% к стоимости)</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Стандарт: {standardPrice.toLocaleString('ru')} ₸ → Срочно: {expressPrice.toLocaleString('ru')} ₸
                </p>
              </div>
            </div>
            <div className={`ml-4 h-5 w-10 rounded-full transition-colors shrink-0 ${data.is_express ? 'bg-amber-500' : 'bg-muted'} flex items-center px-0.5`}>
              <div className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${data.is_express ? 'translate-x-5' : ''}`} />
            </div>
          </div>
        )}

        {/* Purpose */}
        <Field label="Цель поездки">
          <div className="flex flex-wrap gap-2">
            {PURPOSES.map(p => (
              <label key={p.value} className="cursor-pointer">
                <input type="radio" {...register('travel_purpose')} value={p.value} className="sr-only" />
                <span className={`inline-block px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                  data.travel_purpose === p.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/40'
                }`}
                  onClick={() => update({ travel_purpose: p.value })}
                >
                  {p.label}
                </span>
              </label>
            ))}
          </div>
        </Field>

        {/* Travellers */}
        <div>
          <label className="block text-sm font-medium mb-3">Количество путешественников</label>
          <div className="flex gap-4">
            {[
              { key: 'adults_count' as const, label: 'Взрослые' },
              { key: 'children_count' as const, label: 'Дети (до 18)' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-28">{label}</span>
                <button
                  type="button"
                  onClick={() => update({ [key]: Math.max(key === 'adults_count' ? 1 : 0, data[key] - 1) })}
                  className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-6 text-center font-semibold">{data[key]}</span>
                <button
                  type="button"
                  onClick={() => update({ [key]: data[key] + 1 })}
                  className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <p className="text-sm font-medium mb-4">Личные данные</p>
          <div className="space-y-4">
            <Field label="ФИО (как в паспорте, на латинице)" error={errors.full_name?.message}>
              <input type="text" {...register('full_name')} placeholder="IVANOV IVAN IVANOVICH" className={inputClass} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Телефон / WhatsApp" error={errors.phone?.message}>
                <input type="tel" {...register('phone')} placeholder="+7 (700) 000-0000" className={inputClass} />
              </Field>
              <Field label="Email" error={errors.email?.message}>
                <input type="email" {...register('email')} placeholder="you@example.com" className={inputClass} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Номер паспорта" error={errors.passport_number?.message}>
                <input type="text" {...register('passport_number')} placeholder="N12345678" className={inputClass} />
              </Field>
              <Field label="Срок действия паспорта" error={errors.passport_expiry?.message}>
                <input type="date" {...register('passport_expiry')} className={inputClass} />
              </Field>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button type="button" variant="outline" onClick={onPrev} className="flex-1 h-11 rounded-xl">
          <ArrowLeft className="mr-2 h-4 w-4" /> Назад
        </Button>
        <Button type="submit" className="flex-1 bg-primary text-white hover:bg-primary/90 h-11 rounded-xl">
          Далее <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}
