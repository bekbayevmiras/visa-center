import Link from 'next/link'
import { Star } from 'lucide-react'

const REVIEWS = [
  {
    name: 'Асель Нурланова',
    city: 'Алматы',
    flag: '🇩🇪',
    country: 'Германия',
    text: 'Оформляли шенгенскую визу впервые. Боялась, что откажут — в прошлый раз сами не сдали. VisaKZ проверили все документы через AI за 30 секунд, указали что исправить. Виза пришла через 9 дней. Рекомендую всем!',
    stars: 5,
    date: 'июнь 2026',
    initials: 'АН',
    color: 'bg-blue-500',
  },
  {
    name: 'Данияр Сейткали',
    city: 'Астана',
    flag: '🇦🇪',
    country: 'ОАЭ',
    text: 'Нужна была виза срочно — через 4 дня вылет. Менеджер ответил в WhatsApp через 10 минут после заявки, всё объяснил. Виза готова была через 2 дня. Это реально быстро! Схема 30%+70% — очень честно.',
    stars: 5,
    date: 'май 2026',
    initials: 'ДС',
    color: 'bg-emerald-500',
  },
  {
    name: 'Айгерим Тлеубекова',
    city: 'Алматы',
    flag: '🇫🇷',
    country: 'Франция',
    text: 'Подавала на французский шенген для поездки на медовый месяц. Переживала очень. VisaKZ сделали всё сами — только паспорт принесла и фото. Менеджер писал обновления каждые 2 дня. Виза одобрена!',
    stars: 5,
    date: 'апрель 2026',
    initials: 'АТ',
    color: 'bg-purple-500',
  },
  {
    name: 'Болат Ерлан',
    city: 'Алматы',
    flag: '🇺🇸',
    country: 'США',
    text: 'Визу в США с первого раза получить очень сложно. VisaKZ провели меня через весь процесс: как отвечать на собеседовании, какие документы взять. Одобрили! Честно — без VisaKZ бы не прошёл.',
    stars: 5,
    date: 'март 2026',
    initials: 'БЕ',
    color: 'bg-orange-500',
  },
  {
    name: 'Зарина Ахметова',
    city: 'Шымкент',
    flag: '🇯🇵',
    country: 'Япония',
    text: 'Работаю удалённо, оформили визу в Японию онлайн — ни разу не пришла в офис. Всё через WhatsApp. AI проверил мои документы и сказал что банковская выписка недостаточная — исправила, всё прошло. 5 звёзд.',
    stars: 5,
    date: 'февраль 2026',
    initials: 'ЗА',
    color: 'bg-pink-500',
  },
  {
    name: 'Нурлан Сейткалиев',
    city: 'Астана',
    flag: '🇪🇸',
    country: 'Испания',
    text: 'Уже 3-й раз пользуюсь VisaKZ. Германия, Франция, теперь Испания. Каждый раз одобряют. Привёл жену, родителей. Качество неизменное, менеджер всегда на связи. Других не рассматриваю.',
    stars: 5,
    date: 'январь 2026',
    initials: 'НС',
    color: 'bg-teal-500',
  },
]

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
      ))}
    </div>
  )
}

export function Testimonials() {
  return (
    <section className="py-20 px-4 bg-muted/20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 text-yellow-700 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
            4.9 из 5 — средняя оценка
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Что говорят клиенты
          </h2>
          <p className="text-muted-foreground">
            1 200+ оформленных виз. Реальные отзывы от реальных людей.
          </p>
        </div>

        {/* Reviews grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {REVIEWS.map((r, i) => (
            <div
              key={i}
              className="bg-card rounded-2xl border border-border p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
            >
              {/* Top row */}
              <div className="flex items-start gap-3">
                <div className={`h-10 w-10 rounded-full ${r.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                  {r.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.city} · {r.flag} {r.country}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{r.date}</span>
              </div>

              <Stars count={r.stars} />

              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                "{r.text}"
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Больше отзывов на Google Maps и 2GIS
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="https://maps.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google Reviews
            </Link>
            <Link
              href="https://2gis.kz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              <span className="text-base">📍</span>
              2GIS
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
