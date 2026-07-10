'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight, CreditCard, Smartphone, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ApplyFormData } from '@/app/(client)/apply/page'
import { createClient } from '@/lib/supabase/client'

type PaymentMethod = 'kaspi' | 'card'

export function StepPayment({
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
  const [method, setMethod] = useState<PaymentMethod>('kaspi')
  const [creating, setCreating] = useState(false)
  const [appCreated, setAppCreated] = useState(false)

  const finalPrice = data.is_express ? data.express_price : data.visa_price

  const handleProceed = async () => {
    setCreating(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: app, error } = await (supabase as any)
        .from('applications')
        .insert({
          user_id: user.id,
          country_id: data.country_id,
          visa_type_id: data.visa_type_id,
          travel_purpose: data.travel_purpose,
          travel_date_from: data.travel_date_from || null,
          travel_date_to: data.travel_date_to || null,
          adults_count: data.adults_count,
          children_count: data.children_count,
          is_express: data.is_express,
          price: data.visa_price,
          final_price: finalPrice,
          payment_status: 'pending',
          status: 'new',
        })
        .select()
        .single()

      if (error) throw error
      update({ application_id: app.id })
      setAppCreated(true)
    } catch (e) {
      console.error(e)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-1">Оплата</h2>
      <p className="text-sm text-muted-foreground mb-6">Выберите удобный способ оплаты</p>

      {/* Summary */}
      <div className="mb-6 rounded-xl bg-muted/50 p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Страна</span>
          <span className="font-medium">{data.country_flag} {data.country_name}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Тип визы</span>
          <span className="font-medium">{data.visa_type_name}</span>
        </div>
        {data.is_express && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Срочное оформление</span>
            <span className="font-medium text-amber-600">+50%</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Путешественников</span>
          <span className="font-medium">{data.adults_count + data.children_count}</span>
        </div>
        <div className="border-t border-border pt-2 flex justify-between">
          <span className="font-semibold">Итого</span>
          <span className="text-lg font-bold text-primary">{finalPrice.toLocaleString('ru')} ₸</span>
        </div>
      </div>

      {/* Payment methods */}
      <div className="space-y-3 mb-6">
        {[
          {
            id: 'kaspi' as const,
            icon: Smartphone,
            label: 'Kaspi Pay',
            desc: 'QR-код в приложении Kaspi',
            badge: 'Популярно',
          },
          {
            id: 'card' as const,
            icon: CreditCard,
            label: 'Банковская карта',
            desc: 'Visa, Mastercard',
          },
        ].map(m => {
          const Icon = m.icon
          return (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={`w-full flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                method === m.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
              }`}
            >
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                method === m.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium flex items-center gap-2">
                  {m.label}
                  {m.badge && (
                    <span className="text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">{m.badge}</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">{m.desc}</p>
              </div>
              <div className={`h-4 w-4 rounded-full border-2 transition-all ${
                method === m.id ? 'border-primary bg-primary' : 'border-border'
              }`} />
            </button>
          )
        })}
      </div>

      {/* Kaspi QR placeholder */}
      {method === 'kaspi' && !appCreated && (
        <div className="mb-4 rounded-xl border border-border p-4 text-center">
          <p className="text-xs text-muted-foreground mb-2">
            После создания заявки вы получите QR-код для оплаты через Kaspi
          </p>
        </div>
      )}

      {appCreated && (
        <div className="mb-4 rounded-xl bg-secondary/10 border border-secondary/30 p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-secondary shrink-0" />
          <div>
            <p className="text-sm font-medium text-secondary">Заявка создана!</p>
            <p className="text-xs text-muted-foreground">Менеджер свяжется с вами в WhatsApp для оплаты</p>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onPrev} className="flex-1 h-11 rounded-xl" disabled={appCreated}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Назад
        </Button>
        <Button
          onClick={appCreated ? onNext : handleProceed}
          disabled={creating}
          className="flex-1 bg-primary text-white hover:bg-primary/90 h-11 rounded-xl"
        >
          {creating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : appCreated ? (
            <>Продолжить <ArrowRight className="ml-2 h-4 w-4" /></>
          ) : (
            <>Создать заявку <ArrowRight className="ml-2 h-4 w-4" /></>
          )}
        </Button>
      </div>
    </div>
  )
}
