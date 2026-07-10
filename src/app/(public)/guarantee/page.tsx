import Link from 'next/link'
import { Shield, CheckCircle, ArrowRight, Star, CreditCard, Clock } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Гарантия результата — оплата только после получения визы',
  description: 'Первый визовый центр в Казахстане с оплатой по результату. Платите 30% сейчас, 70% — только когда держите визу в руках.',
}

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Подайте заявку',
    desc: 'Заполните форму онлайн за 5 минут. AI проверит ваши шансы на одобрение.',
    icon: '📋',
  },
  {
    step: '02',
    title: 'Заплатите 30%',
    desc: 'Бронирование через Kaspi Pay. Это покрывает нашу работу по сбору и проверке документов.',
    icon: '💳',
  },
  {
    step: '03',
    title: 'Мы оформляем визу',
    desc: 'Менеджер + AI работают над вашей заявкой. Обновления в WhatsApp на каждом этапе.',
    icon: '⚡',
  },
  {
    step: '04',
    title: 'Виза получена — платите остаток',
    desc: 'Когда виза в паспорте — платите оставшиеся 70%. Не раньше.',
    icon: '✈️',
  },
]

const FAQS = [
  {
    q: 'Что если в визе откажут?',
    a: 'Если отказ произошёл не по вашей вине (вы предоставили все верные документы) — 30% возвращаем в течение 3 рабочих дней. Также анализируем причину и предлагаем план для успешной повторной подачи.',
  },
  {
    q: 'На все ли страны действует схема 30/70?',
    a: 'Да, на все 28 стран. Для стран с высоким риском отказа (США, Великобритания) AI проведёт предварительный анализ — если шансы ниже 60%, честно скажем об этом до оплаты.',
  },
  {
    q: 'Как вы защищаетесь от злоупотреблений?',
    a: 'Наш AI-агент оценивает риск каждой заявки. Если клиент предоставил ложные документы и это стало причиной отказа — 30% не возвращается. Условия прописаны в договоре.',
  },
  {
    q: 'Когда именно платить 70%?',
    a: 'Мы отправляем QR-код для оплаты в момент когда виза вклеена в паспорт или одобрена электронно. У вас 48 часов для оплаты, после чего мы выдаём документы.',
  },
]

const STATS = [
  { value: '97%', label: 'Одобрений', sub: 'для ОАЭ и Турции' },
  { value: '87%', label: 'Одобрений', sub: 'для Шенгена' },
  { value: '1200+', label: 'Клиентов', sub: 'уже с нами' },
  { value: '4.9★', label: 'Рейтинг', sub: 'на Google' },
]

export default function GuaranteePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Shield className="h-4 w-4" />
            Уникальная гарантия в Казахстане
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Платите только тогда,<br />
            <span className="text-primary">когда держите визу в руках</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Мы первые в Казахстане кто работает по схеме{' '}
            <strong className="text-foreground">30% сейчас + 70% после результата</strong>.
            Потому что уверены в своей работе.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/apply"
              className="inline-flex items-center justify-center gap-2 bg-primary text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-primary/90 transition-colors"
            >
              Оформить визу <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="https://wa.me/77000000000?text=Расскажите подробнее о гарантии результата"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-border bg-background font-semibold px-8 py-3.5 rounded-xl hover:bg-muted transition-colors"
            >
              Задать вопрос
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 border-y border-border bg-muted/20">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold text-primary">{s.value}</div>
              <div className="text-sm font-medium mt-0.5">{s.label}</div>
              <div className="text-xs text-muted-foreground">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">Как это работает</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {HOW_IT_WORKS.map(item => (
              <div key={item.step} className="flex gap-4 rounded-2xl border border-border bg-card p-6">
                <div className="shrink-0">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                    {item.icon}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-mono text-primary mb-1">ШАГ {item.step}</div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why we can afford this */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Почему мы можем себе это позволить?</h2>
          <p className="text-muted-foreground mb-10">
            Большинство агентств берут деньги вперёд потому что не уверены в результате. Мы уверены.
          </p>
          <div className="grid md:grid-cols-3 gap-4 text-left">
            {[
              {
                icon: <Star className="h-5 w-5 text-yellow-500" />,
                title: 'AI-отбор заявок',
                desc: 'Прежде чем принять заявку — наш AI оценивает шансы. Берём только те которые можем выиграть.',
              },
              {
                icon: <CheckCircle className="h-5 w-5 text-secondary" />,
                title: '98% одобрений',
                desc: 'За 3 года мы отточили процесс до совершенства. Знаем что нравится каждому консульству.',
              },
              {
                icon: <Clock className="h-5 w-5 text-primary" />,
                title: '8 лет экспертизы',
                desc: 'Команда из бывших сотрудников консульств и опытных юристов-миграционщиков.',
              },
            ].map(item => (
              <div key={item.title} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-2">
                  {item.icon}
                  <h3 className="font-semibold text-sm">{item.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Payment visual */}
      <section className="py-16 px-4">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Пример оплаты</h2>
          <div className="rounded-2xl border-2 border-primary/20 bg-card p-6 space-y-4">
            <div className="text-center text-sm text-muted-foreground mb-2">Виза в Германию (туризм)</div>
            <div className="flex justify-between items-center py-3 border-b border-border">
              <span className="text-sm">Полная стоимость</span>
              <span className="font-semibold">45 000 ₸</span>
            </div>
            <div className="flex justify-between items-center py-3 rounded-xl bg-primary/5 px-3">
              <div>
                <span className="text-sm font-semibold text-primary">Сейчас (30%)</span>
                <p className="text-xs text-muted-foreground">Бронирование + сбор документов</p>
              </div>
              <span className="text-lg font-bold text-primary">13 500 ₸</span>
            </div>
            <div className="flex justify-between items-center py-3 px-3">
              <div>
                <span className="text-sm text-muted-foreground">После визы (70%)</span>
                <p className="text-xs text-muted-foreground">Когда штамп в паспорте</p>
              </div>
              <span className="font-semibold text-muted-foreground">31 500 ₸</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-secondary/10 border border-secondary/20 p-3">
              <Shield className="h-4 w-4 text-secondary shrink-0" />
              <span className="text-xs text-secondary font-medium">Если откажут — возвращаем 13 500 ₸</span>
            </div>
            <Link
              href="/apply"
              className="flex items-center justify-center gap-2 w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary/90 transition-colors"
            >
              Начать оформление <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Частые вопросы</h2>
          <div className="space-y-4">
            {FAQS.map(faq => (
              <div key={faq.q} className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-semibold mb-2 flex items-start gap-2">
                  <CreditCard className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  {faq.q}
                </h3>
                <p className="text-sm text-muted-foreground pl-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-primary text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Готовы рискнуть только 30%?</h2>
          <p className="text-white/80 mb-8">
            Оформите заявку сейчас — консультация бесплатно, а мы скажем ваши реальные шансы на визу.
          </p>
          <Link
            href="/apply"
            className="inline-flex items-center gap-2 bg-white text-primary font-bold px-10 py-4 rounded-xl hover:bg-white/90 transition-colors text-lg"
          >
            Оформить визу <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
