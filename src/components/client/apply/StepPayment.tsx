'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight, CreditCard, Smartphone, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ApplyFormData } from '@/app/(client)/apply/page'
import { createClient } from '@/lib/supabase/client'

type PaymentMethod = 'kaspi' | 'card'
type KaspiStep = 'idle' | 'qr' | 'confirmed'

const KASPI_PHONE = process.env.NEXT_PUBLIC_KASPI_PHONE || '+7 (727) 000-00-00'

function KaspiQRPlaceholder({ amount, applicationNumber }: { amount: number; applicationNumber: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-4">
      {/* QR code visual */}
      <div
        className="rounded-2xl border-4 border-[#FFD600] p-3 bg-white shadow-md"
        style={{ width: 200, height: 200 }}
        aria-label="Kaspi QR-код"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Finder pattern top-left */}
          <rect x="5" y="5" width="25" height="25" rx="3" fill="#1a1a1a"/>
          <rect x="9" y="9" width="17" height="17" rx="2" fill="white"/>
          <rect x="13" y="13" width="9" height="9" rx="1" fill="#1a1a1a"/>
          {/* Finder pattern top-right */}
          <rect x="70" y="5" width="25" height="25" rx="3" fill="#1a1a1a"/>
          <rect x="74" y="9" width="17" height="17" rx="2" fill="white"/>
          <rect x="78" y="13" width="9" height="9" rx="1" fill="#1a1a1a"/>
          {/* Finder pattern bottom-left */}
          <rect x="5" y="70" width="25" height="25" rx="3" fill="#1a1a1a"/>
          <rect x="9" y="74" width="17" height="17" rx="2" fill="white"/>
          <rect x="13" y="78" width="9" height="9" rx="1" fill="#1a1a1a"/>
          {/* Data modules */}
          <rect x="36" y="5" width="5" height="5" fill="#1a1a1a"/>
          <rect x="44" y="5" width="5" height="5" fill="#1a1a1a"/>
          <rect x="56" y="5" width="5" height="5" fill="#1a1a1a"/>
          <rect x="64" y="5" width="5" height="5" fill="#1a1a1a"/>
          <rect x="36" y="13" width="5" height="5" fill="#1a1a1a"/>
          <rect x="48" y="13" width="5" height="5" fill="#1a1a1a"/>
          <rect x="60" y="13" width="5" height="5" fill="#1a1a1a"/>
          <rect x="36" y="21" width="5" height="5" fill="#1a1a1a"/>
          <rect x="44" y="21" width="5" height="5" fill="#1a1a1a"/>
          <rect x="56" y="21" width="5" height="5" fill="#1a1a1a"/>
          <rect x="64" y="21" width="5" height="5" fill="#1a1a1a"/>
          <rect x="5" y="36" width="5" height="5" fill="#1a1a1a"/>
          <rect x="13" y="36" width="5" height="5" fill="#1a1a1a"/>
          <rect x="21" y="36" width="5" height="5" fill="#1a1a1a"/>
          <rect x="36" y="36" width="5" height="5" fill="#1a1a1a"/>
          <rect x="48" y="36" width="5" height="5" fill="#1a1a1a"/>
          <rect x="60" y="36" width="5" height="5" fill="#1a1a1a"/>
          <rect x="5" y="44" width="5" height="5" fill="#1a1a1a"/>
          <rect x="21" y="44" width="5" height="5" fill="#1a1a1a"/>
          <rect x="44" y="44" width="5" height="5" fill="#1a1a1a"/>
          <rect x="56" y="44" width="5" height="5" fill="#1a1a1a"/>
          <rect x="68" y="44" width="5" height="5" fill="#1a1a1a"/>
          <rect x="76" y="44" width="5" height="5" fill="#1a1a1a"/>
          <rect x="84" y="44" width="5" height="5" fill="#1a1a1a"/>
          <rect x="5" y="52" width="5" height="5" fill="#1a1a1a"/>
          <rect x="13" y="52" width="5" height="5" fill="#1a1a1a"/>
          <rect x="36" y="52" width="5" height="5" fill="#1a1a1a"/>
          <rect x="52" y="52" width="5" height="5" fill="#1a1a1a"/>
          <rect x="64" y="52" width="5" height="5" fill="#1a1a1a"/>
          <rect x="80" y="52" width="5" height="5" fill="#1a1a1a"/>
          <rect x="5" y="60" width="5" height="5" fill="#1a1a1a"/>
          <rect x="21" y="60" width="5" height="5" fill="#1a1a1a"/>
          <rect x="44" y="60" width="5" height="5" fill="#1a1a1a"/>
          <rect x="60" y="60" width="5" height="5" fill="#1a1a1a"/>
          <rect x="76" y="60" width="5" height="5" fill="#1a1a1a"/>
          <rect x="84" y="60" width="5" height="5" fill="#1a1a1a"/>
          <rect x="36" y="68" width="5" height="5" fill="#1a1a1a"/>
          <rect x="48" y="68" width="5" height="5" fill="#1a1a1a"/>
          <rect x="60" y="68" width="5" height="5" fill="#1a1a1a"/>
          <rect x="76" y="68" width="5" height="5" fill="#1a1a1a"/>
          <rect x="36" y="76" width="5" height="5" fill="#1a1a1a"/>
          <rect x="52" y="76" width="5" height="5" fill="#1a1a1a"/>
          <rect x="68" y="76" width="5" height="5" fill="#1a1a1a"/>
          <rect x="84" y="76" width="5" height="5" fill="#1a1a1a"/>
          <rect x="36" y="84" width="5" height="5" fill="#1a1a1a"/>
          <rect x="44" y="84" width="5" height="5" fill="#1a1a1a"/>
          <rect x="56" y="84" width="5" height="5" fill="#1a1a1a"/>
          <rect x="64" y="84" width="5" height="5" fill="#1a1a1a"/>
          <rect x="76" y="84" width="5" height="5" fill="#1a1a1a"/>
          {/* Center KASPI label */}
          <rect x="38" y="38" width="24" height="24" rx="2" fill="#FFD600"/>
          <text x="50" y="47" textAnchor="middle" fontSize="5" fontWeight="bold" fill="#1a1a1a">KASPI</text>
          <text x="50" y="55" textAnchor="middle" fontSize="4" fill="#1a1a1a">PAY</text>
        </svg>
      </div>

      {/* Amount + app number */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-[#FFD600] text-black font-bold text-sm px-4 py-1.5 rounded-full mb-2">
          <Smartphone className="h-4 w-4" />
          Kaspi Pay
        </div>
        <p className="text-lg font-bold text-foreground">{amount.toLocaleString('ru')} ₸</p>
        <p className="text-xs text-muted-foreground mt-0.5">Заявка № {applicationNumber}</p>
      </div>

      {/* Instructions */}
      <div className="w-full rounded-xl bg-muted/50 border border-border p-3 space-y-1.5 text-sm">
        <p className="font-medium text-center text-sm">Отсканируйте QR-код в приложении Kaspi</p>
        <ol className="space-y-1 text-muted-foreground text-xs list-decimal list-inside mt-2">
          <li>Откройте приложение Kaspi.kz</li>
          <li>Нажмите «Оплатить» → «QR-код»</li>
          <li>Отсканируйте QR-код выше</li>
          <li>Подтвердите оплату на сумму <strong className="text-foreground">{amount.toLocaleString('ru')} ₸</strong></li>
        </ol>
        <p className="text-xs text-muted-foreground pt-1.5 border-t border-border mt-2">
          Номер: <span className="font-medium text-foreground">{KASPI_PHONE}</span>
        </p>
      </div>
    </div>
  )
}

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
  const [applicationNumber, setApplicationNumber] = useState<string>('')
  const [kaspiStep, setKaspiStep] = useState<KaspiStep>('idle')
  const [confirmingPayment, setConfirmingPayment] = useState(false)

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
      setApplicationNumber(app.application_number || app.id.slice(0, 8).toUpperCase())
      setAppCreated(true)
      if (method === 'kaspi') {
        setKaspiStep('qr')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setCreating(false)
    }
  }

  const handleIPaid = async () => {
    if (!data.application_id) return
    setConfirmingPayment(true)
    try {
      const res = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: data.application_id,
          amount: finalPrice,
          method: 'kaspi',
        }),
      })
      if (!res.ok) {
        console.error('Payment confirm failed', await res.text())
      }
    } catch (e) {
      console.error(e)
    } finally {
      setConfirmingPayment(false)
      setKaspiStep('confirmed')
    }
  }

  const canContinue = appCreated && (method !== 'kaspi' || kaspiStep === 'confirmed')

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

      {/* Payment method selector — only shown before app is created */}
      {!appCreated && (
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
      )}

      {/* Pre-creation: Kaspi teaser */}
      {method === 'kaspi' && !appCreated && (
        <div className="mb-4 rounded-xl border border-border p-4 text-center">
          <p className="text-xs text-muted-foreground">
            После создания заявки вы получите QR-код для оплаты через Kaspi
          </p>
        </div>
      )}

      {/* Post-creation: Kaspi QR screen */}
      {appCreated && method === 'kaspi' && kaspiStep === 'qr' && (
        <div className="mb-4 rounded-xl border border-[#FFD600]/40 bg-[#FFD600]/5 p-4">
          <KaspiQRPlaceholder amount={finalPrice} applicationNumber={applicationNumber} />
          <Button
            onClick={handleIPaid}
            disabled={confirmingPayment}
            className="w-full mt-3 bg-[#FFD600] hover:bg-[#f5cc00] text-black font-semibold h-11 rounded-xl"
          >
            {confirmingPayment ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Я оплатил'
            )}
          </Button>
        </div>
      )}

      {/* Post-payment confirmation message */}
      {appCreated && method === 'kaspi' && kaspiStep === 'confirmed' && (
        <div className="mb-4 rounded-xl bg-secondary/10 border border-secondary/30 p-4 flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-secondary">Оплата отправлена на проверку</p>
            <p className="text-xs text-muted-foreground mt-1">
              Ожидаем подтверждения — менеджер проверит оплату и свяжется с вами
            </p>
          </div>
        </div>
      )}

      {/* Post-creation: card payment info */}
      {appCreated && method === 'card' && (
        <div className="mb-4 space-y-3">
          <div className="rounded-xl border border-border p-4 flex items-start gap-3">
            <CreditCard className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Оплата картой</p>
              <p className="text-xs text-muted-foreground mt-1">
                Оплата картой доступна в офисе или онлайн через менеджера.
                Менеджер свяжется с вами в WhatsApp для проведения оплаты.
              </p>
            </div>
          </div>
          <div className="rounded-xl bg-secondary/10 border border-secondary/30 p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-secondary shrink-0" />
            <div>
              <p className="text-sm font-medium text-secondary">Заявка создана!</p>
              <p className="text-xs text-muted-foreground">Менеджер свяжется с вами в WhatsApp</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onPrev}
          className="flex-1 h-11 rounded-xl"
          disabled={appCreated}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Назад
        </Button>
        <Button
          onClick={canContinue ? onNext : handleProceed}
          disabled={creating || (appCreated && !canContinue)}
          className="flex-1 bg-primary text-white hover:bg-primary/90 h-11 rounded-xl disabled:opacity-50"
        >
          {creating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : canContinue ? (
            <>Продолжить <ArrowRight className="ml-2 h-4 w-4" /></>
          ) : (
            <>Создать заявку <ArrowRight className="ml-2 h-4 w-4" /></>
          )}
        </Button>
      </div>
    </div>
  )
}
