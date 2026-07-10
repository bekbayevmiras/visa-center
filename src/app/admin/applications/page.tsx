import { createAdminClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import Link from 'next/link'

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

const PAYMENT_LABELS: Record<string, string> = {
  pending: 'Не оплачено',
  partial: 'Частично',
  paid: 'Оплачено',
  refunded: 'Возврат',
}

const PAYMENT_COLORS: Record<string, string> = {
  pending: 'text-red-600',
  partial: 'text-yellow-600',
  paid: 'text-green-600',
  refunded: 'text-gray-500',
}

const PAGE_SIZE = 20

interface SearchParams {
  status?: string
  country?: string
  search?: string
  page?: string
}

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const status = params.status || ''
  const country = params.country || ''
  const search = params.search || ''
  const page = Math.max(1, parseInt(params.page || '1', 10))
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = createAdminClient()

  // Build query
  let query = (supabase as any)
    .from('applications')
    .select(`
      *,
      country:countries(id, name_ru, flag_emoji),
      user:users(id, full_name, email),
      visa_type:visa_types(id, name_ru)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (status) query = query.eq('status', status)
  if (country) query = query.eq('country_id', country)
  if (search) {
    query = query.or(`application_number.ilike.%${search}%`)
  }

  const { data: appsRaw, count } = await query

  const apps = (appsRaw ?? []) as unknown as {
    id: string
    application_number: string
    status: string
    payment_status: string
    final_price: number
    is_express: boolean
    created_at: string
    country: { id: string; name_ru: string; flag_emoji: string | null } | null
    user: { id: string; full_name: string; email: string | null } | null
    visa_type: { id: string; name_ru: string } | null
  }[]

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  // Fetch countries for filter dropdown
  const { data: countriesRaw } = await (supabase as any)
    .from('countries')
    .select('id, name_ru, flag_emoji')
    .eq('is_active', true)
    .order('name_ru')

  const countries = (countriesRaw ?? []) as { id: string; name_ru: string; flag_emoji: string | null }[]

  const buildUrl = (overrides: Partial<SearchParams>) => {
    const p = { status, country, search, page: String(page), ...overrides }
    const qs = new URLSearchParams()
    if (p.status) qs.set('status', p.status)
    if (p.country) qs.set('country', p.country)
    if (p.search) qs.set('search', p.search)
    if (p.page && p.page !== '1') qs.set('page', p.page)
    const str = qs.toString()
    return `/admin/applications${str ? '?' + str : ''}`
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Заявки</h1>
        <p className="text-muted-foreground mt-1">Все заявки клиентов ({count ?? 0})</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center bg-card border border-border rounded-2xl p-4">
        <form method="GET" action="/admin/applications" className="flex flex-wrap gap-3 w-full">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Поиск по номеру заявки..."
            className="text-sm border border-border rounded-xl px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 min-w-[200px]"
          />
          <select
            name="status"
            defaultValue={status}
            className="text-sm border border-border rounded-xl px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="">Все статусы</option>
            {Object.entries(STATUS_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          <select
            name="country"
            defaultValue={country}
            className="text-sm border border-border rounded-xl px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="">Все страны</option>
            {countries.map(c => (
              <option key={c.id} value={c.id}>{c.flag_emoji} {c.name_ru}</option>
            ))}
          </select>
          <button
            type="submit"
            className="text-sm bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors"
          >
            Применить
          </button>
          {(status || country || search) && (
            <Link
              href="/admin/applications"
              className="text-sm text-muted-foreground underline self-center"
            >
              Сбросить
            </Link>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left py-3 px-4 font-medium">№</th>
              <th className="text-left py-3 px-4 font-medium">Клиент</th>
              <th className="text-left py-3 px-4 font-medium">Страна</th>
              <th className="text-left py-3 px-4 font-medium">Тип визы</th>
              <th className="text-left py-3 px-4 font-medium">Статус</th>
              <th className="text-left py-3 px-4 font-medium">Сумма</th>
              <th className="text-left py-3 px-4 font-medium">Оплата</th>
              <th className="text-left py-3 px-4 font-medium">Дата</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {apps.map(app => (
              <tr key={app.id} className="hover:bg-muted/30 transition-colors">
                <td className="py-3 px-4 font-mono text-xs text-muted-foreground">
                  {app.application_number}
                  {app.is_express && (
                    <span className="ml-1 text-amber-600 font-bold">⚡</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="font-medium">{app.user?.full_name ?? '—'}</div>
                  <div className="text-xs text-muted-foreground">{app.user?.email ?? ''}</div>
                </td>
                <td className="py-3 px-4">
                  {app.country ? `${app.country.flag_emoji ?? ''} ${app.country.name_ru}` : '—'}
                </td>
                <td className="py-3 px-4 text-muted-foreground">
                  {app.visa_type?.name_ru ?? '—'}
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[app.status] ?? 'bg-gray-100 text-gray-700'}`}>
                    {STATUS_LABELS[app.status] ?? app.status}
                  </span>
                </td>
                <td className="py-3 px-4 font-medium">
                  {app.final_price ? `${app.final_price.toLocaleString('ru-RU')} ₸` : '—'}
                </td>
                <td className={`py-3 px-4 font-medium ${PAYMENT_COLORS[app.payment_status] ?? ''}`}>
                  {PAYMENT_LABELS[app.payment_status] ?? app.payment_status}
                </td>
                <td className="py-3 px-4 text-muted-foreground text-xs">
                  {format(new Date(app.created_at), 'd MMM yyyy', { locale: ru })}
                </td>
              </tr>
            ))}
            {apps.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center text-muted-foreground">
                  Заявок не найдено
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={buildUrl({ page: String(page - 1) })}
              className="px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
            >
              ← Назад
            </Link>
          )}
          <span className="text-sm text-muted-foreground">
            Страница {page} из {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={buildUrl({ page: String(page + 1) })}
              className="px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
            >
              Вперёд →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
