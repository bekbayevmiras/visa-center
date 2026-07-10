import { createAdminClient } from '@/lib/supabase/server'
import { ApplicationWithDetails } from '@/lib/supabase/types'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

const STATUS_LABELS: Record<string, string> = {
  new: 'Новая',
  consultation: 'Консультация',
  docs_collection: 'Сбор документов',
  docs_review: 'Проверка',
  docs_ready: 'Документы готовы',
  submitted: 'Подано',
  in_progress: 'В процессе',
  approved: 'Одобрено',
  rejected: 'Отклонено',
  closed: 'Закрыто',
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  consultation: 'bg-purple-100 text-purple-700',
  docs_collection: 'bg-yellow-100 text-yellow-700',
  docs_review: 'bg-orange-100 text-orange-700',
  docs_ready: 'bg-teal-100 text-teal-700',
  submitted: 'bg-indigo-100 text-indigo-700',
  in_progress: 'bg-sky-100 text-sky-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  closed: 'bg-gray-100 text-gray-700',
}

const LEAD_STATUS_LABELS: Record<string, string> = {
  new: 'Новый',
  contacted: 'Связались',
  qualified: 'Квалифицирован',
  converted: 'Конвертирован',
  lost: 'Потерян',
}

const LEAD_STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  qualified: 'bg-purple-100 text-purple-700',
  converted: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
}

export default async function AdminDashboardPage() {
  const supabase = createAdminClient()

  // Total applications
  const { count: totalApps } = await (supabase as any)
    .from('applications')
    .select('id', { count: 'exact', head: true })

  // Active applications (not approved/rejected/closed)
  const { count: activeApps } = await (supabase as any)
    .from('applications')
    .select('id', { count: 'exact', head: true })
    .in('status', ['new', 'consultation', 'docs_collection', 'docs_review', 'docs_ready', 'submitted', 'in_progress'])

  // Approved this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count: approvedThisMonth } = await (supabase as any)
    .from('applications')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'approved')
    .gte('updated_at', startOfMonth.toISOString())

  // Revenue this month
  const { data: revenueData } = await (supabase as any)
    .from('applications')
    .select('final_price')
    .eq('payment_status', 'paid')
    .gte('created_at', startOfMonth.toISOString())

  const revenueThisMonth = (revenueData as { final_price: number }[] ?? []).reduce(
    (sum, a) => sum + (a.final_price || 0), 0
  )

  // Last 5 applications
  const { data: lastAppsRaw } = await (supabase as any)
    .from('applications')
    .select(`*, country:countries(name_ru, flag_emoji), user:users(full_name)`)
    .order('created_at', { ascending: false })
    .limit(5)

  const lastApps = (lastAppsRaw ?? []) as unknown as ApplicationWithDetails[]

  // Last 5 leads
  const { data: lastLeadsRaw } = await (supabase as any)
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  const lastLeads = lastLeadsRaw as { id: string; name: string | null; phone: string | null; source: string; status: string; created_at: string }[] ?? []

  const metrics = [
    { label: 'Всего заявок', value: totalApps ?? 0, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Активных', value: activeApps ?? 0, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Одобрено (месяц)', value: approvedThisMonth ?? 0, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Выручка (месяц)', value: `${revenueThisMonth.toLocaleString('ru-RU')} ₸`, color: 'text-purple-600', bg: 'bg-purple-50' },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Панель управления</h1>
        <p className="text-muted-foreground mt-1">Обзор активности VisaKZ</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(m => (
          <div key={m.label} className={`rounded-2xl border border-border bg-card p-5`}>
            <p className="text-sm text-muted-foreground mb-1">{m.label}</p>
            <p className={`text-3xl font-bold ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Last applications */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-semibold mb-4">Последние заявки</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="text-left py-2 pr-3 font-medium">№</th>
                  <th className="text-left py-2 pr-3 font-medium">Клиент</th>
                  <th className="text-left py-2 pr-3 font-medium">Страна</th>
                  <th className="text-left py-2 pr-3 font-medium">Статус</th>
                  <th className="text-left py-2 font-medium">Дата</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {lastApps.map(app => (
                  <tr key={app.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 pr-3 font-mono text-xs text-muted-foreground">
                      {app.application_number}
                    </td>
                    <td className="py-2.5 pr-3 font-medium truncate max-w-[120px]">
                      {app.user?.full_name ?? '—'}
                    </td>
                    <td className="py-2.5 pr-3">
                      {app.country?.flag_emoji} {app.country?.name_ru ?? '—'}
                    </td>
                    <td className="py-2.5 pr-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[app.status] ?? 'bg-gray-100 text-gray-700'}`}>
                        {STATUS_LABELS[app.status] ?? app.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-muted-foreground text-xs">
                      {format(new Date(app.created_at), 'd MMM', { locale: ru })}
                    </td>
                  </tr>
                ))}
                {lastApps.length === 0 && (
                  <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">Заявок пока нет</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Last leads */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-semibold mb-4">Последние лиды</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="text-left py-2 pr-3 font-medium">Имя</th>
                  <th className="text-left py-2 pr-3 font-medium">Телефон</th>
                  <th className="text-left py-2 pr-3 font-medium">Источник</th>
                  <th className="text-left py-2 pr-3 font-medium">Статус</th>
                  <th className="text-left py-2 font-medium">Дата</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {lastLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 pr-3 font-medium">{lead.name ?? '—'}</td>
                    <td className="py-2.5 pr-3 text-muted-foreground">{lead.phone ?? '—'}</td>
                    <td className="py-2.5 pr-3 text-muted-foreground">{lead.source}</td>
                    <td className="py-2.5 pr-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${LEAD_STATUS_COLORS[lead.status] ?? 'bg-gray-100 text-gray-700'}`}>
                        {LEAD_STATUS_LABELS[lead.status] ?? lead.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-muted-foreground text-xs">
                      {format(new Date(lead.created_at), 'd MMM', { locale: ru })}
                    </td>
                  </tr>
                ))}
                {lastLeads.length === 0 && (
                  <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">Лидов пока нет</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
