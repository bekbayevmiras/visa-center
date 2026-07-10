import Link from 'next/link'
import { Calendar, ArrowRight } from 'lucide-react'
import { ApplicationWithDetails } from '@/lib/supabase/types'
import { StatusTracker } from './StatusTracker'

const STATUS_LABELS: Record<string, string> = {
  new: 'Новая',
  consultation: 'Консультация',
  docs_collection: 'Сбор документов',
  docs_review: 'Проверка документов',
  docs_ready: 'Документы готовы',
  submitted: 'Подано в посольство',
  in_progress: 'В обработке',
  approved: 'Одобрена',
  rejected: 'Отказ',
  closed: 'Закрыта',
}

const PAYMENT_LABELS: Record<string, string> = {
  pending: 'Ожидает оплаты',
  partial: 'Частично оплачено',
  paid: 'Оплачено',
  refunded: 'Возврат',
}

export function ApplicationCard({ app }: { app: ApplicationWithDetails }) {
  const formatPrice = (n: number) => n.toLocaleString('ru') + ' ₸'

  return (
    <div className="rounded-2xl border border-border bg-card p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{app.country?.flag_emoji ?? '🌍'}</span>
          <div>
            <h3 className="font-semibold">{app.country?.name_ru ?? 'Неизвестно'}</h3>
            <p className="text-sm text-muted-foreground">{app.visa_type?.name_ru}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono text-muted-foreground">{app.application_number}</span>
          <p className="text-sm font-semibold mt-0.5">{formatPrice(app.final_price)}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            app.payment_status === 'paid'
              ? 'bg-secondary/10 text-secondary'
              : 'bg-accent/20 text-amber-700'
          }`}>
            {PAYMENT_LABELS[app.payment_status]}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <StatusTracker status={app.status} />
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {app.travel_date_from && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(app.travel_date_from).toLocaleDateString('ru', { day: 'numeric', month: 'short' })}
              {app.travel_date_to && ` — ${new Date(app.travel_date_to).toLocaleDateString('ru', { day: 'numeric', month: 'short' })}`}
            </span>
          )}
          <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            {STATUS_LABELS[app.status]}
          </span>
        </div>
        <Link
          href={`/applications/${app.id}`}
          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          Подробнее <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  )
}
