import { createAdminClient } from '@/lib/supabase/server'
import { TrendingUp } from 'lucide-react'

interface CountryStat {
  name_ru: string
  flag_emoji: string | null
  total: number
  approved: number
  total_revenue: number
}

export default async function AnalyticsPage() {
  const supabase = createAdminClient()

  // Total leads & converted leads for conversion rate
  const { count: totalLeads } = await (supabase as any)
    .from('leads')
    .select('id', { count: 'exact', head: true })

  const { count: convertedLeads } = await (supabase as any)
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'converted')

  const conversionRate = totalLeads
    ? ((convertedLeads ?? 0) / totalLeads * 100).toFixed(1)
    : '0'

  // Average check (average final_price among paid applications)
  const { data: paidAppsRaw } = await (supabase as any)
    .from('applications')
    .select('final_price')
    .eq('payment_status', 'paid')

  const paidApps = (paidAppsRaw ?? []) as { final_price: number }[]
  const avgCheck = paidApps.length
    ? Math.round(paidApps.reduce((s, a) => s + (a.final_price || 0), 0) / paidApps.length)
    : 0

  // Approval rate
  const { count: totalFinished } = await (supabase as any)
    .from('applications')
    .select('id', { count: 'exact', head: true })
    .in('status', ['approved', 'rejected'])

  const { count: approvedCount } = await (supabase as any)
    .from('applications')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'approved')

  const approvalRate = totalFinished
    ? ((approvedCount ?? 0) / totalFinished * 100).toFixed(1)
    : '0'

  // Average processing time (days from created_at to updated_at for approved/rejected)
  const { data: finishedAppsRaw } = await (supabase as any)
    .from('applications')
    .select('created_at, updated_at')
    .in('status', ['approved', 'rejected'])

  const finishedApps = (finishedAppsRaw ?? []) as { created_at: string; updated_at: string }[]
  const avgProcessingDays = finishedApps.length
    ? (
        finishedApps.reduce((sum, a) => {
          const diff = new Date(a.updated_at).getTime() - new Date(a.created_at).getTime()
          return sum + diff / (1000 * 60 * 60 * 24)
        }, 0) / finishedApps.length
      ).toFixed(1)
    : '0'

  // Applications by country
  const { data: allAppsRaw } = await (supabase as any)
    .from('applications')
    .select('status, final_price, payment_status, country:countries(name_ru, flag_emoji)')

  type AppRow = {
    status: string
    final_price: number
    payment_status: string
    country: { name_ru: string; flag_emoji: string | null } | null
  }

  const allApps = (allAppsRaw ?? []) as AppRow[]

  // Aggregate by country
  const countryMap = new Map<string, CountryStat>()
  for (const app of allApps) {
    const name = app.country?.name_ru ?? 'Не указано'
    const flag = app.country?.flag_emoji ?? null
    if (!countryMap.has(name)) {
      countryMap.set(name, { name_ru: name, flag_emoji: flag, total: 0, approved: 0, total_revenue: 0 })
    }
    const stat = countryMap.get(name)!
    stat.total++
    if (app.status === 'approved') stat.approved++
    if (app.payment_status === 'paid') stat.total_revenue += app.final_price || 0
  }

  const countryStats = Array.from(countryMap.values())
    .sort((a, b) => b.total - a.total)

  // ── Content / UTM metrics ─────────────────────────────────────────────────
  type LeadRow = { utm_source: string | null; utm_medium: string | null; utm_campaign: string | null; status: string }
  const { data: utmLeadsRaw } = await (supabase as any)
    .from('leads')
    .select('utm_source, utm_medium, utm_campaign, status')

  const utmLeads = (utmLeadsRaw ?? []) as LeadRow[]
  const totalLeadsAll = utmLeads.length
  const totalWithUTM = utmLeads.filter(l => l.utm_source).length

  const sourceMap = new Map<string, { leads: number; converted: number }>()
  for (const l of utmLeads) {
    const key = l.utm_source ?? 'organic'
    if (!sourceMap.has(key)) sourceMap.set(key, { leads: 0, converted: 0 })
    const s = sourceMap.get(key)!
    s.leads++
    if (l.status === 'converted') s.converted++
  }
  const sourceStats = Array.from(sourceMap.entries())
    .map(([source, v]) => ({ source, ...v, cr: v.leads ? +(v.converted / v.leads * 100).toFixed(1) : 0 }))
    .sort((a, b) => b.leads - a.leads)

  const campaignMap = new Map<string, { leads: number; converted: number; source: string }>()
  for (const l of utmLeads) {
    if (!l.utm_campaign) continue
    const key = l.utm_campaign
    if (!campaignMap.has(key)) campaignMap.set(key, { leads: 0, converted: 0, source: l.utm_source ?? 'unknown' })
    const c = campaignMap.get(key)!
    c.leads++
    if (l.status === 'converted') c.converted++
  }
  const campaignStats = Array.from(campaignMap.entries())
    .map(([campaign, v]) => ({ campaign, ...v, cr: v.leads ? +(v.converted / v.leads * 100).toFixed(1) : 0 }))
    .sort((a, b) => b.leads - a.leads)
    .slice(0, 10)

  const summaryCards = [
    {
      label: 'Конверсия лидов',
      value: `${conversionRate}%`,
      sub: `${convertedLeads ?? 0} из ${totalLeads ?? 0}`,
      color: 'text-blue-600',
    },
    {
      label: 'Средний чек',
      value: `${avgCheck.toLocaleString('ru-RU')} ₸`,
      sub: `${paidApps.length} оплаченных заявок`,
      color: 'text-purple-600',
    },
    {
      label: 'Процент одобрений',
      value: `${approvalRate}%`,
      sub: `${approvedCount ?? 0} из ${totalFinished ?? 0} завершённых`,
      color: 'text-green-600',
    },
    {
      label: 'Среднее время обработки',
      value: `${avgProcessingDays} дн.`,
      sub: `на основе ${finishedApps.length} заявок`,
      color: 'text-orange-600',
    },
  ]

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Аналитика</h1>
        <p className="text-muted-foreground mt-1">Ключевые метрики и показатели</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map(card => (
          <div key={card.label} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground mb-1">{card.label}</p>
            <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Content / UTM metrics */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">Источники трафика</h2>
          <span className="ml-auto text-xs text-muted-foreground">
            {totalWithUTM} из {totalLeadsAll} лидов с UTM-метками
          </span>
        </div>
        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
          {/* By source */}
          <div>
            <p className="px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">По источнику</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="text-left py-2 px-5 font-medium">Источник</th>
                  <th className="text-right py-2 px-5 font-medium">Лидов</th>
                  <th className="text-right py-2 px-5 font-medium">CR%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sourceStats.length === 0 ? (
                  <tr><td colSpan={3} className="py-8 text-center text-muted-foreground text-xs">UTM-данных пока нет</td></tr>
                ) : sourceStats.map(s => (
                  <tr key={s.source} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-5 font-medium">{s.source}</td>
                    <td className="py-2.5 px-5 text-right">{s.leads}</td>
                    <td className="py-2.5 px-5 text-right">
                      <span className={s.cr >= 10 ? 'text-green-600 font-semibold' : s.cr >= 3 ? 'text-yellow-600' : 'text-muted-foreground'}>
                        {s.cr}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* By campaign */}
          <div>
            <p className="px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">По кампании</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="text-left py-2 px-5 font-medium">Кампания</th>
                  <th className="text-right py-2 px-5 font-medium">Лидов</th>
                  <th className="text-right py-2 px-5 font-medium">CR%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {campaignStats.length === 0 ? (
                  <tr><td colSpan={3} className="py-8 text-center text-muted-foreground text-xs">Кампаний пока нет</td></tr>
                ) : campaignStats.map(c => (
                  <tr key={c.campaign} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-5 font-medium truncate max-w-[160px]">{c.campaign}</td>
                    <td className="py-2.5 px-5 text-right">{c.leads}</td>
                    <td className="py-2.5 px-5 text-right">
                      <span className={c.cr >= 10 ? 'text-green-600 font-semibold' : c.cr >= 3 ? 'text-yellow-600' : 'text-muted-foreground'}>
                        {c.cr}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Country stats table */}
      <div className="rounded-2xl border border-border bg-card overflow-x-auto">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold">Заявки по странам</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left py-3 px-5 font-medium">Страна</th>
              <th className="text-right py-3 px-5 font-medium">Заявок</th>
              <th className="text-right py-3 px-5 font-medium">Выручка</th>
              <th className="text-right py-3 px-5 font-medium">% одобрений</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {countryStats.map(c => (
              <tr key={c.name_ru} className="hover:bg-muted/30 transition-colors">
                <td className="py-3 px-5 font-medium">
                  {c.flag_emoji} {c.name_ru}
                </td>
                <td className="py-3 px-5 text-right">{c.total}</td>
                <td className="py-3 px-5 text-right font-medium">
                  {c.total_revenue ? `${c.total_revenue.toLocaleString('ru-RU')} ₸` : '—'}
                </td>
                <td className="py-3 px-5 text-right">
                  <span className={`font-medium ${
                    c.total > 0 && (c.approved / c.total) >= 0.7
                      ? 'text-green-600'
                      : c.total > 0 && (c.approved / c.total) >= 0.4
                      ? 'text-yellow-600'
                      : 'text-muted-foreground'
                  }`}>
                    {c.total > 0 ? `${(c.approved / c.total * 100).toFixed(0)}%` : '—'}
                  </span>
                </td>
              </tr>
            ))}
            {countryStats.length === 0 && (
              <tr>
                <td colSpan={4} className="py-12 text-center text-muted-foreground">
                  Нет данных
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
