import Link from 'next/link'
import { Globe, CheckCircle, MapPin, Clock, Phone, Mail, Users, Star, Zap, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'О нас',
  description: 'VisaKZ — визовый центр нового поколения в Алматы. Основан в 2023 году. Более 1200 виз оформлено, 98% одобрений.',
}

const STATS = [
  { value: '1200+', label: 'виз оформлено', color: 'text-primary' },
  { value: '98%', label: 'одобрений', color: 'text-secondary' },
  { value: '28', label: 'направлений', color: 'text-accent' },
  { value: '4.9★', label: 'рейтинг', color: 'text-yellow-500' },
]

const TEAM = [
  {
    name: 'Айгерим Нурланова',
    role: 'Руководитель',
    bio: '8 лет в визовом бизнесе. Специалист по консульским отношениям, прошла стажировку в европейских посольствах. Основала VisaKZ с целью сделать путешествия доступными каждому казахстанцу.',
    initials: 'АН',
    color: 'bg-violet-500',
    badge: '8 лет опыта',
  },
  {
    name: 'Данияр Сейтов',
    role: 'Главный менеджер',
    bio: 'Специалист по Шенгенской зоне, США и Великобритании. Лично оформил более 600 виз. Знает требования каждого консульства наизусть и помогает клиентам с самыми сложными случаями.',
    initials: 'ДС',
    color: 'bg-emerald-500',
    badge: 'Эксперт по Шенгену',
  },
  {
    name: 'Аида — AI-ассистент',
    role: 'Виртуальный ассистент',
    bio: 'Работает 24/7. Отвечает на вопросы в WhatsApp, проверяет документы за 30 секунд, отправляет уведомления о статусе заявки и никогда не уходит в отпуск.',
    initials: 'AI',
    color: 'bg-primary',
    badge: 'Работает 24/7',
  },
]

const ADVANTAGES = [
  {
    icon: Zap,
    title: 'AI-проверка за 30 секунд',
    desc: 'Загружаете документы — наш искусственный интеллект мгновенно проверяет их на полноту, корректность и соответствие требованиям консульства. Никаких сюрпризов при подаче.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: Users,
    title: 'Персональный менеджер',
    desc: 'С вами работает один менеджер от первой консультации до получения визы. Вы всегда знаете, к кому обратиться, и не повторяете свою историю по пять раз.',
    color: 'text-secondary',
    bg: 'bg-secondary/10',
  },
  {
    icon: Globe,
    title: 'Работаем с 28 странами',
    desc: 'Шенген, США, ОАЭ, Азия, Великобритания и другие направления. Для каждой страны — проверенные чек-листы и актуальные требования.',
    color: 'text-accent',
    bg: 'bg-accent/10',
  },
  {
    icon: Shield,
    title: 'Гарантия возврата при отказе',
    desc: 'Если консульство отказывает — мы возвращаем стоимость наших услуг. Это стимулирует нас подавать только идеально подготовленные пакеты документов.',
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
  },
]

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-16 md:py-24">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-secondary/5 blur-3xl" />
        </div>
        <div className="container relative mx-auto max-w-7xl px-4 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Основан в 2023 году · Алматы
          </div>
          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
            VisaKZ — визовый центр{' '}
            <span className="text-primary">нового поколения</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
            Мы объединяем опытных менеджеров и искусственный интеллект, чтобы каждый казахстанец мог путешествовать без стресса
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card py-12">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {STATS.map(stat => (
              <div key={stat.label} className="flex flex-col items-center">
                <span className={`text-4xl font-bold md:text-5xl ${stat.color}`}>{stat.value}</span>
                <span className="mt-1 text-sm text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="mb-6 text-3xl font-bold">Наша история</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  VisaKZ появился в 2023 году, когда Айгерим Нурланова, проработав восемь лет в традиционных визовых агентствах, поняла: индустрия застряла в 2005-м. Бумажные анкеты, непонятные отказы, менеджеры, которые не берут трубку — и это в эпоху смартфонов.
                </p>
                <p>
                  Идея была простой: взять лучшее из двух миров. Живой менеджер, который знает ваше имя и историю. И AI, который не устаёт, не ошибается и проверяет документы быстрее любого человека.
                </p>
                <p>
                  За полтора года мы оформили более 1200 виз, открыли офис в центре Алматы и собрали команду специалистов, каждый из которых прошёл через сотни реальных дел. Наш показатель одобрений — 98%, и мы работаем над тем, чтобы сделать его ещё выше.
                </p>
                <p>
                  Мы верим: получить визу не должно быть стрессом. Это просто бюрократия — а бюрократию мы умеем решать.
                </p>
              </div>
            </div>
            {/* Photo placeholder */}
            <div className="flex items-center justify-center">
              <div className="flex h-80 w-full max-w-sm items-center justify-center rounded-2xl bg-muted">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <Globe className="h-16 w-16 opacity-30" />
                  <span className="text-sm">Офис VisaKZ, Алматы</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="border-t border-border bg-card py-16 md:py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold">Наша команда</h2>
            <p className="mt-3 text-muted-foreground">Люди и технологии, которые работают для вас</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {TEAM.map(member => (
              <div
                key={member.name}
                className="rounded-2xl border border-border bg-background p-6 flex flex-col gap-4"
              >
                <div className="flex items-start justify-between">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${member.color} text-white text-xl font-bold`}>
                    {member.initials}
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {member.badge}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{member.name}</h3>
                  <p className="text-sm text-primary">{member.role}</p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold">Почему выбирают нас</h2>
            <p className="mt-3 text-muted-foreground">Четыре причины, которые нам важны</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ADVANTAGES.map(adv => {
              const Icon = adv.icon
              return (
                <div
                  key={adv.title}
                  className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-4"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${adv.bg}`}>
                    <Icon className={`h-6 w-6 ${adv.color}`} />
                  </div>
                  <h3 className="font-semibold">{adv.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{adv.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Office */}
      <section className="border-t border-border bg-card py-16 md:py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold">Наш офис</h2>
            <p className="mt-3 text-muted-foreground">Приходите лично или обращайтесь онлайн — как вам удобнее</p>
          </div>
          <div className="mx-auto max-w-xl rounded-2xl border border-border bg-background p-8">
            <div className="flex flex-col gap-5">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Адрес</p>
                  <p className="text-muted-foreground text-sm mt-0.5">
                    г. Алматы, ул. Абая 150,<br />
                    БЦ «Алматы Тауэр», офис 15
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/10">
                  <Clock className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="font-semibold">Режим работы</p>
                  <p className="text-muted-foreground text-sm mt-0.5">
                    Пн–Пт: 9:00–18:00<br />
                    Сб: 10:00–14:00<br />
                    Вс: выходной
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                  <Phone className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold">Телефон</p>
                  <a
                    href="tel:+77271234567"
                    className="text-sm text-primary hover:underline mt-0.5 block"
                  >
                    +7 (727) 123-45-67
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Email</p>
                  <a
                    href="mailto:info@visakz.kz"
                    className="text-sm text-primary hover:underline mt-0.5 block"
                  >
                    info@visakz.kz
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16 md:py-20">
        <div className="container mx-auto max-w-7xl px-4 text-center text-white">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Готовы к путешествию?</h2>
          <p className="mb-8 text-primary-foreground/80 max-w-xl mx-auto">
            Оставьте заявку — наш менеджер свяжется с вами в WhatsApp в течение 15 минут и расскажет всё о вашей визе.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/apply">
              <Button className="bg-white text-primary hover:bg-white/90 font-semibold px-8 py-3 h-auto rounded-xl">
                Оформить визу
              </Button>
            </Link>
            <a
              href="https://wa.me/77271234567"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                className="border-white/40 text-white hover:bg-white/10 font-semibold px-8 py-3 h-auto rounded-xl bg-transparent"
              >
                Связаться в WhatsApp
              </Button>
            </a>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-primary-foreground/70">
            {['Бесплатная консультация', '98% одобрений', 'Гарантия возврата'].map(item => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
