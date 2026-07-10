import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Users, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { StatusTracker } from '@/components/client/StatusTracker'
import { Button } from '@/components/ui/button'
import { ApplicationStatus } from '@/lib/supabase/types'

type Props = { params: Promise<{ id: string }> }

const STATUS_LABELS: Record<string, string> = {
  new: 'Новая',
  consultation: 'Консультация',
  docs_collection: 'Сбор документов',
  docs_review: 'Проверка документов',
  docs_ready: 'Документы готовы',
  submitted: 'Подано в посольство',
  in_progress: 'В обработке',
  approved: 'Виза одобрена',
  rejected: 'Отказ',
  closed: 'Закрыта',
}

export default async function ApplicationDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rawApp } = await supabase
    .from('applications')
    .select(`*, country:countries(*), visa_type:visa_types(*)`)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!rawApp) notFound()

  const app = rawApp as unknown as Record<string, unknown> & {
    status: ApplicationStatus
    application_number: string
    travel_date_from: string | null
    travel_date_to: string | null
    is_express: boolean
    final_price: number
    payment_amount: number
    payment_status: string
  }

  const { data: docsRaw } = await supabase
    .from('documents')
    .select('*')
    .eq('application_id', id)
    .order('created_at')

  const docs = (docsRaw ?? []) as Array<{ id: string; doc_name: string; status: string }>

  const { data: historyRaw } = await supabase
    .from('application_history')
    .select('*')
    .eq('application_id', id)
    .order('created_at', { ascending: false })

  const history = (historyRaw ?? []) as Array<{ id: string; new_status: string | null; comment: string | null; created_at: string }>

  const country = app.country as Record<string, unknown> | null
  const visaType = app.visa_type as Record<string, unknown> | null

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back */}
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Мои заявки
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{String(country?.flag_emoji ?? '🌍')}</span>
          <div>
            <h1 className="text-xl font-bold">{String(country?.name_ru ?? '')}</h1>
            <p className="text-sm text-muted-foreground">{String(visaType?.name_ru ?? '')}</p>
            <p className="text-xs font-mono text-muted-foreground mt-0.5">{app.application_number}</p>
          </div>
        </div>
        <span className="text-sm px-3 py-1 rounded-full bg-muted font-medium">
          {STATUS_LABELS[app.status] ?? app.status}
        </span>
      </div>

      {/* Status tracker */}
      <div className="rounded-2xl border border-border bg-card p-6 mb-4">
        <h2 className="text-sm font-semibold mb-4 text-muted-foreground">Статус заявки</h2>
        <StatusTracker status={app.status as ApplicationStatus} />
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* Travel info */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" /> Поездка
          </h3>
          <div className="space-y-2 text-sm">
            {app.travel_date_from && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Вылет</span>
                <span>{new Date(app.travel_date_from).toLocaleDateString('ru', { day: 'numeric', month: 'long' })}</span>
              </div>
            )}
            {app.travel_date_to && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Возврат</span>
                <span>{new Date(app.travel_date_to).toLocaleDateString('ru', { day: 'numeric', month: 'long' })}</span>
              </div>
            )}
            {app.is_express && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Тип</span>
                <span className="text-amber-600 font-medium">Срочное</span>
              </div>
            )}
          </div>
        </div>

        {/* Payment */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" /> Оплата
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Сумма</span>
              <span className="font-semibold">{app.final_price.toLocaleString('ru')} ₸</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Оплачено</span>
              <span>{app.payment_amount.toLocaleString('ru')} ₸</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Статус</span>
              <span className={app.payment_status === 'paid' ? 'text-secondary font-medium' : 'text-amber-600'}>
                {app.payment_status === 'paid' ? 'Оплачено' : app.payment_status === 'partial' ? 'Частично' : 'Ожидает оплаты'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Documents */}
      {docs && docs.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 mb-4">
          <h3 className="text-sm font-semibold mb-4">Документы ({docs.length})</h3>
          <div className="space-y-2">
            {docs.map(doc => (
              <div key={doc.id} className="flex items-center justify-between rounded-xl bg-muted/30 px-4 py-2.5">
                <span className="text-sm">{doc.doc_name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  doc.status === 'verified' ? 'bg-secondary/10 text-secondary' :
                  doc.status === 'rejected' ? 'bg-red-100 text-red-600' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {doc.status === 'verified' ? 'Проверен' : doc.status === 'rejected' ? 'Отклонён' : 'На проверке'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      {history && history.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 mb-6">
          <h3 className="text-sm font-semibold mb-4">История изменений</h3>
          <div className="space-y-3">
            {history.map(h => (
              <div key={h.id} className="flex items-start gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div>
                  <span className="font-medium">{STATUS_LABELS[h.new_status ?? ''] ?? h.new_status}</span>
                  {h.comment && <p className="text-muted-foreground text-xs mt-0.5">{h.comment}</p>}
                  <p className="text-xs text-muted-foreground">
                    {new Date(h.created_at).toLocaleDateString('ru', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="flex gap-3">
        <Link href="/chat" className="flex-1">
          <Button variant="outline" className="w-full gap-2">
            <MessageCircle className="h-4 w-4" /> Написать менеджеру
          </Button>
        </Link>
        <Link href="/apply" className="flex-1">
          <Button className="w-full bg-primary text-white hover:bg-primary/90">
            Новая заявка
          </Button>
        </Link>
      </div>
    </div>
  )
}
