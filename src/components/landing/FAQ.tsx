'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const FAQS = [
  {
    q: 'Сколько стоит оформление визы?',
    a: 'Стоимость зависит от страны и типа визы — от 10 000 тенге (Грузия, ОАЭ) до 80 000 тенге (США, Великобритания). Консультация и первичный анализ документов — бесплатно.',
  },
  {
    q: 'Как долго ждать визу?',
    a: 'Зависит от страны: ОАЭ — 1-3 дня, Шенген — 10-15 дней, США — 60+ дней. Есть экспресс-оформление с наценкой 50% — быстрее в 2 раза.',
  },
  {
    q: 'Что делать, если в визе откажут?',
    a: 'При отказе мы анализируем причины бесплатно и предлагаем план действий. Большинство наших клиентов получают визу со второй попытки. Деньги за сервис возвращаем согласно договору.',
  },
  {
    q: 'Нужно ли приезжать в офис?',
    a: 'Нет, всё можно сделать онлайн — загрузить документы через личный кабинет или WhatsApp. В офис нужно приехать только для биометрии (США, Великобритания, Канада).',
  },
  {
    q: 'Безопасно ли отправлять паспорт?',
    a: 'Вы не отправляете оригинал — только фотографию или скан. Все данные хранятся в зашифрованном виде. Мы не передаём информацию третьим лицам.',
  },
  {
    q: 'Можно ли подать на визу, если раньше отказывали?',
    a: 'Да, мы специализируемся на сложных случаях. Сначала проводим бесплатный анализ вашего досье и оцениваем шансы. Если шансы низкие — скажем честно.',
  },
  {
    q: 'Работаете ли вы с гражданами других стран?',
    a: 'Наш основной рынок — граждане Казахстана. Но мы также работаем с гражданами России, Узбекистана и других стран СНГ, если они находятся в КЗ.',
  },
  {
    q: 'Как оплатить услуги?',
    a: 'Принимаем оплату через Kaspi Pay (QR-код), банковские карты Visa/Mastercard, наличные в офисе и банковский перевод.',
  },
]

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto max-w-3xl px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Частые вопросы</h2>
          <p className="mt-3 text-muted-foreground">Ответы на то, что спрашивают чаще всего</p>
        </div>

        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div key={i} className="rounded-xl border border-border overflow-hidden">
              <button
                className="flex w-full items-center justify-between px-5 py-4 text-left font-medium hover:bg-muted/30 transition-colors"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span className="pr-4">{faq.q}</span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${open === i ? 'rotate-180' : ''}`}
                />
              </button>
              {open === i && (
                <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
