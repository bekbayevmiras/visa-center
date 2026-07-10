import { CheckCircle, XCircle, MinusCircle } from 'lucide-react'
import Link from 'next/link'

const ROWS = [
  {
    feature: 'Цена за оформление',
    us: 'от 8 000 ₸',
    agency: 'от 15 000 ₸',
    self: 'бесплатно*',
    usNote: '— на 20–40% дешевле рынка',
    selfNote: '* ошибки стоят дорого',
  },
  {
    feature: 'Гарантия возврата при отказе',
    us: true,
    agency: false,
    self: false,
  },
  {
    feature: 'Оплата 30%/70% (до/после)',
    us: true,
    agency: false,
    self: null,
  },
  {
    feature: 'AI-проверка документов',
    us: true,
    agency: false,
    self: false,
  },
  {
    feature: 'Ответ в WhatsApp за 15 мин',
    us: true,
    agency: null,
    self: false,
  },
  {
    feature: 'Работа 24/7',
    us: true,
    agency: false,
    self: null,
  },
  {
    feature: 'Онлайн без визита в офис',
    us: true,
    agency: false,
    self: null,
  },
  {
    feature: 'Отслеживание статуса заявки',
    us: true,
    agency: null,
    self: false,
  },
]

type CellValue = boolean | null | string

function Cell({ value, note }: { value: CellValue; note?: string }) {
  if (typeof value === 'string') {
    return (
      <td className="py-3 px-4 text-sm text-center">
        <span className="font-semibold text-foreground">{value}</span>
        {note && <span className="block text-xs text-muted-foreground mt-0.5">{note}</span>}
      </td>
    )
  }
  if (value === true) {
    return (
      <td className="py-3 px-4 text-center">
        <CheckCircle className="h-5 w-5 text-emerald-500 mx-auto" />
      </td>
    )
  }
  if (value === false) {
    return (
      <td className="py-3 px-4 text-center">
        <XCircle className="h-5 w-5 text-red-400 mx-auto" />
      </td>
    )
  }
  return (
    <td className="py-3 px-4 text-center">
      <MinusCircle className="h-5 w-5 text-muted-foreground/40 mx-auto" />
    </td>
  )
}

export function ComparisonTable() {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-4">
            Почему VisaKZ?
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Мы vs Конкуренты
          </h2>
          <p className="text-muted-foreground">
            Сравниваем честно — включая самостоятельную подачу
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="py-4 px-4 text-left font-medium text-muted-foreground w-[40%]">
                  Что сравниваем
                </th>
                <th className="py-4 px-4 text-center font-bold text-primary w-[20%]">
                  <div className="flex flex-col items-center gap-1">
                    <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">Мы</span>
                    VisaKZ
                  </div>
                </th>
                <th className="py-4 px-4 text-center font-medium text-muted-foreground w-[20%]">
                  Обычное агентство
                </th>
                <th className="py-4 px-4 text-center font-medium text-muted-foreground w-[20%]">
                  Сам подаю
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <tr
                  key={i}
                  className={`border-b border-border last:border-0 ${i % 2 === 0 ? 'bg-background' : 'bg-muted/10'}`}
                >
                  <td className="py-3 px-4 font-medium text-sm">{row.feature}</td>
                  <Cell value={row.us} note={row.usNote} />
                  <Cell value={row.agency} />
                  <Cell value={row.self} note={row.selfNote} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/apply"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-white font-semibold hover:bg-primary/90 transition-colors"
          >
            Попробовать бесплатно
          </Link>
          <p className="mt-3 text-xs text-muted-foreground">
            Бесплатная консультация · Без обязательств · Ответим за 15 минут
          </p>
        </div>
      </div>
    </section>
  )
}
