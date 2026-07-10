import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient } from '@/lib/supabase/server'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CFOReport {
  date: string
  revenue: {
    today: number
    week: number
    month: number
    pending: number    // awaiting payment
    at_risk: number   // overdue payments (pending > 48h)
  }
  applications: {
    new_today: number
    total_active: number
    by_status: Record<string, number>
    by_country: Array<{ country: string; count: number; revenue: number }>
  }
  leads: {
    new_today: number
    hot_count: number
    conversion_rate: number   // leads → applications this week (%)
  }
  alerts: string[]
  recommendations: string[]
  top_opportunity: string
}

// ---------------------------------------------------------------------------
// Anthropic client
// ---------------------------------------------------------------------------

const client = new Anthropic()

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function startOfDay(date: Date): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

function hoursAgo(n: number): string {
  const d = new Date()
  d.setHours(d.getHours() - n)
  return d.toISOString()
}

// ---------------------------------------------------------------------------
// generateCFOReport
// ---------------------------------------------------------------------------

export async function generateCFOReport(): Promise<CFOReport> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any

  const now = new Date()
  const todayStart = startOfDay(now)
  const weekStart = daysAgo(7)
  const monthStart = daysAgo(30)

  // ── Revenue ─────────────────────────────────────────────────────────────

  const { data: paymentsAll } = await supabase
    .from('payments')
    .select('amount, status, created_at, completed_at')

  type PaymentRow = { amount: number; status: string; created_at: string; completed_at: string | null }
  const payments = (paymentsAll as PaymentRow[]) ?? []

  const completedPayments = payments.filter(p => p.status === 'completed' || p.status === 'paid')
  const pendingPayments = payments.filter(p => p.status === 'pending' || p.status === 'partial')

  const revenueToday = completedPayments
    .filter(p => p.completed_at && p.completed_at >= todayStart)
    .reduce((s, p) => s + p.amount, 0)

  const revenueWeek = completedPayments
    .filter(p => p.completed_at && p.completed_at >= weekStart)
    .reduce((s, p) => s + p.amount, 0)

  const revenueMonth = completedPayments
    .filter(p => p.completed_at && p.completed_at >= monthStart)
    .reduce((s, p) => s + p.amount, 0)

  const revenuePending = pendingPayments.reduce((s, p) => s + p.amount, 0)

  // At-risk = pending payments created more than 48h ago
  const cutoff48h = hoursAgo(48)
  const revenueAtRisk = pendingPayments
    .filter(p => p.created_at < cutoff48h)
    .reduce((s, p) => s + p.amount, 0)

  // ── Applications ─────────────────────────────────────────────────────────

  const { data: appsAll } = await supabase
    .from('applications')
    .select('id, status, created_at, final_price, country:countries(name_ru)')

  type AppRow = {
    id: string
    status: string
    created_at: string
    final_price: number
    country: { name_ru: string } | null
  }
  const apps = (appsAll as AppRow[]) ?? []

  const activeStatuses = ['new', 'consultation', 'docs_collection', 'docs_review', 'docs_ready', 'submitted', 'in_progress']

  const newToday = apps.filter(a => a.created_at >= todayStart).length
  const totalActive = apps.filter(a => activeStatuses.includes(a.status)).length

  const byStatus: Record<string, number> = {}
  for (const app of apps) {
    byStatus[app.status] = (byStatus[app.status] ?? 0) + 1
  }

  // Group by country
  const countryMap: Record<string, { count: number; revenue: number }> = {}
  for (const app of apps) {
    const countryName = app.country?.name_ru ?? 'Неизвестно'
    if (!countryMap[countryName]) countryMap[countryName] = { count: 0, revenue: 0 }
    countryMap[countryName].count += 1
    countryMap[countryName].revenue += app.final_price ?? 0
  }

  const byCountry = Object.entries(countryMap)
    .map(([country, v]) => ({ country, count: v.count, revenue: v.revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)

  // ── Leads ────────────────────────────────────────────────────────────────

  const { data: leadsAll } = await supabase
    .from('leads')
    .select('id, status, created_at')

  type LeadRow = { id: string; status: string; created_at: string }
  const leads = (leadsAll as LeadRow[]) ?? []

  const newLeadsToday = leads.filter(l => l.created_at >= todayStart).length
  const hotLeads = leads.filter(l => l.status === 'qualified').length

  // Conversion rate: leads created this week that became applications
  const leadsThisWeek = leads.filter(l => l.created_at >= weekStart)
  const convertedThisWeek = leads.filter(l => l.status === 'converted' && l.created_at >= weekStart)
  const conversionRate = leadsThisWeek.length > 0
    ? Math.round((convertedThisWeek.length / leadsThisWeek.length) * 100)
    : 0

  // ── AI analysis (alerts + recommendations) ───────────────────────────────

  const metricsContext = `
Дата отчёта: ${now.toLocaleDateString('ru-KZ', { day: '2-digit', month: 'long', year: 'numeric' })}

ВЫРУЧКА:
- Сегодня: ${revenueToday.toLocaleString('ru-KZ')} ₸
- За 7 дней: ${revenueWeek.toLocaleString('ru-KZ')} ₸
- За 30 дней: ${revenueMonth.toLocaleString('ru-KZ')} ₸
- Ожидает оплаты: ${revenuePending.toLocaleString('ru-KZ')} ₸
- Под риском (просрочка >48ч): ${revenueAtRisk.toLocaleString('ru-KZ')} ₸

ЗАЯВКИ:
- Новых сегодня: ${newToday}
- Активных всего: ${totalActive}
- По статусам: ${JSON.stringify(byStatus)}
- Топ стран: ${byCountry.slice(0, 5).map(c => `${c.country} (${c.count} шт., ${c.revenue.toLocaleString('ru-KZ')} ₸)`).join(', ')}

ЛИДЫ:
- Новых сегодня: ${newLeadsToday}
- Горячих (qualified): ${hotLeads}
- Конверсия за неделю: ${conversionRate}%
`.trim()

  const aiResponse = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: `Ты — CFO-аналитик казахстанского визового центра VisaKZ.
Анализируй метрики и возвращай ТОЛЬКО JSON без дополнительного текста:
{
  "alerts": ["строка 1", "строка 2"],
  "recommendations": ["строка 1", "строка 2", "строка 3"],
  "top_opportunity": "одна самая важная возможность на сегодня"
}
Используй эмодзи: ⚠️ для предупреждений, ✅ для позитивного, 💡 для рекомендаций.
Пиши кратко, конкретно, по делу. Язык: русский.`,
    messages: [{ role: 'user', content: metricsContext }],
  })

  const aiRaw = aiResponse.content[0].type === 'text' ? aiResponse.content[0].text : '{}'
  const aiText = aiRaw.replace(/```(?:json)?\n?/g, '').trim()

  interface AiAnalysis {
    alerts?: string[]
    recommendations?: string[]
    top_opportunity?: string
  }

  let analysis: AiAnalysis = {}
  try {
    analysis = JSON.parse(aiText) as AiAnalysis
  } catch {
    const match = aiText.match(/\{[\s\S]*\}/)
    if (match) {
      try { analysis = JSON.parse(match[0]) as AiAnalysis } catch { /* ignore */ }
    }
  }

  // Append hard-coded alert for at-risk revenue if significant
  const alerts: string[] = analysis.alerts ?? []
  if (revenueAtRisk > 0) {
    const atRiskCount = pendingPayments.filter(p => p.created_at < cutoff48h).length
    alerts.unshift(`⚠️ ${atRiskCount} заявк${atRiskCount === 1 ? 'а' : 'и'} без оплаты более 48ч — ${revenueAtRisk.toLocaleString('ru-KZ')} ₸ под риском`)
  }

  return {
    date: now.toISOString(),
    revenue: {
      today: revenueToday,
      week: revenueWeek,
      month: revenueMonth,
      pending: revenuePending,
      at_risk: revenueAtRisk,
    },
    applications: {
      new_today: newToday,
      total_active: totalActive,
      by_status: byStatus,
      by_country: byCountry,
    },
    leads: {
      new_today: newLeadsToday,
      hot_count: hotLeads,
      conversion_rate: conversionRate,
    },
    alerts,
    recommendations: analysis.recommendations ?? [],
    top_opportunity: analysis.top_opportunity ?? '',
  }
}

// ---------------------------------------------------------------------------
// sendCFOReport
// ---------------------------------------------------------------------------

export async function sendCFOReport(email: string): Promise<void> {
  const report = await generateCFOReport()
  const html = buildReportHtml(report)

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[cfo-agent] RESEND_API_KEY не задан — письмо не отправлено')
    return
  }

  const dateLabel = new Date(report.date).toLocaleDateString('ru-KZ', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: 'VisaKZ CFO <noreply@visakz.kz>',
      to: [email],
      subject: `📊 CFO Отчёт VisaKZ — ${dateLabel}`,
      html,
    }),
  })

  const body = await response.json() as { id?: string; message?: string }

  if (!response.ok) {
    console.error('[cfo-agent] Resend error:', body.message ?? `HTTP ${response.status}`)
  } else {
    console.log('[cfo-agent] Отчёт отправлен:', body.id)
  }
}

// ---------------------------------------------------------------------------
// HTML email builder
// ---------------------------------------------------------------------------

function fmt(n: number): string {
  return n.toLocaleString('ru-KZ') + ' ₸'
}

function buildReportHtml(r: CFOReport): string {
  const dateLabel = new Date(r.date).toLocaleDateString('ru-KZ', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const alertsHtml = r.alerts.length
    ? r.alerts.map(a => `<li style="margin-bottom:8px;color:#B91C1C;">${a}</li>`).join('')
    : '<li style="color:#6B7280;">Нет активных предупреждений</li>'

  const recsHtml = r.recommendations.length
    ? r.recommendations.map(rec => `<li style="margin-bottom:8px;color:#374151;">${rec}</li>`).join('')
    : '<li style="color:#6B7280;">Рекомендации не сформированы</li>'

  const statusRows = Object.entries(r.applications.by_status)
    .sort((a, b) => b[1] - a[1])
    .map(([status, count]) =>
      `<tr>
        <td style="padding:6px 12px;font-size:13px;color:#374151;border-bottom:1px solid #F3F4F6;">${status}</td>
        <td style="padding:6px 12px;font-size:13px;font-weight:600;color:#111827;border-bottom:1px solid #F3F4F6;text-align:right;">${count}</td>
      </tr>`
    ).join('')

  const countryRows = r.applications.by_country.slice(0, 8)
    .map(c =>
      `<tr>
        <td style="padding:6px 12px;font-size:13px;color:#374151;border-bottom:1px solid #F3F4F6;">${c.country}</td>
        <td style="padding:6px 12px;font-size:13px;color:#374151;border-bottom:1px solid #F3F4F6;text-align:center;">${c.count}</td>
        <td style="padding:6px 12px;font-size:13px;font-weight:600;color:#059669;border-bottom:1px solid #F3F4F6;text-align:right;">${fmt(c.revenue)}</td>
      </tr>`
    ).join('')

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>CFO Report — VisaKZ</title>
</head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F1F5F9;padding:32px 0;">
    <tr><td align="center">
      <table width="640" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.10);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1E3A5F 0%,#2563EB 100%);padding:28px 40px;">
            <div style="font-size:22px;font-weight:700;color:#FFFFFF;">📊 CFO Ежедневный Отчёт</div>
            <div style="font-size:14px;color:#BFDBFE;margin-top:6px;">VisaKZ · ${dateLabel}</div>
          </td>
        </tr>

        <!-- Top Opportunity -->
        ${r.top_opportunity ? `
        <tr>
          <td style="padding:20px 40px 0;">
            <div style="background:#ECFDF5;border-left:4px solid #10B981;padding:14px 18px;border-radius:6px;">
              <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#065F46;margin-bottom:4px;">💡 Главная возможность сегодня</div>
              <div style="font-size:14px;color:#065F46;font-weight:600;">${r.top_opportunity}</div>
            </div>
          </td>
        </tr>` : ''}

        <!-- Revenue Grid -->
        <tr>
          <td style="padding:24px 40px 0;">
            <div style="font-size:16px;font-weight:700;color:#111827;margin-bottom:16px;border-bottom:2px solid #E5E7EB;padding-bottom:8px;">💰 Выручка</div>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="25%" style="padding:0 6px 0 0;">
                  <div style="background:#EFF6FF;border-radius:8px;padding:16px;text-align:center;">
                    <div style="font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;">Сегодня</div>
                    <div style="font-size:20px;font-weight:700;color:#1D4ED8;margin-top:6px;">${fmt(r.revenue.today)}</div>
                  </div>
                </td>
                <td width="25%" style="padding:0 6px;">
                  <div style="background:#F0FDF4;border-radius:8px;padding:16px;text-align:center;">
                    <div style="font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;">За 7 дней</div>
                    <div style="font-size:20px;font-weight:700;color:#059669;margin-top:6px;">${fmt(r.revenue.week)}</div>
                  </div>
                </td>
                <td width="25%" style="padding:0 6px;">
                  <div style="background:#FFF7ED;border-radius:8px;padding:16px;text-align:center;">
                    <div style="font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;">За 30 дней</div>
                    <div style="font-size:20px;font-weight:700;color:#EA580C;margin-top:6px;">${fmt(r.revenue.month)}</div>
                  </div>
                </td>
                <td width="25%" style="padding:0 0 0 6px;">
                  <div style="background:#FEF2F2;border-radius:8px;padding:16px;text-align:center;">
                    <div style="font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;">Под риском</div>
                    <div style="font-size:20px;font-weight:700;color:#DC2626;margin-top:6px;">${fmt(r.revenue.at_risk)}</div>
                  </div>
                </td>
              </tr>
            </table>
            ${r.revenue.pending > 0 ? `
            <div style="margin-top:12px;background:#FFFBEB;border:1px solid #FDE68A;border-radius:6px;padding:10px 14px;font-size:13px;color:#92400E;">
              ⏳ Ожидает оплаты: <strong>${fmt(r.revenue.pending)}</strong>
            </div>` : ''}
          </td>
        </tr>

        <!-- Alerts -->
        <tr>
          <td style="padding:24px 40px 0;">
            <div style="font-size:16px;font-weight:700;color:#111827;margin-bottom:12px;border-bottom:2px solid #E5E7EB;padding-bottom:8px;">🚨 Предупреждения</div>
            <ul style="margin:0;padding-left:20px;">
              ${alertsHtml}
            </ul>
          </td>
        </tr>

        <!-- Applications -->
        <tr>
          <td style="padding:24px 40px 0;">
            <div style="font-size:16px;font-weight:700;color:#111827;margin-bottom:12px;border-bottom:2px solid #E5E7EB;padding-bottom:8px;">📋 Заявки</div>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="50%" style="padding-right:12px;vertical-align:top;">
                  <div style="background:#F9FAFB;border-radius:8px;overflow:hidden;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr style="background:#F3F4F6;">
                        <th style="padding:8px 12px;font-size:12px;color:#6B7280;text-align:left;font-weight:600;">Статус</th>
                        <th style="padding:8px 12px;font-size:12px;color:#6B7280;text-align:right;font-weight:600;">Кол-во</th>
                      </tr>
                      ${statusRows}
                    </table>
                  </div>
                  <div style="margin-top:10px;display:flex;gap:8px;">
                    <div style="background:#EFF6FF;border-radius:6px;padding:10px 14px;flex:1;text-align:center;">
                      <div style="font-size:11px;color:#6B7280;">Новых сегодня</div>
                      <div style="font-size:22px;font-weight:700;color:#1D4ED8;">${r.applications.new_today}</div>
                    </div>
                    <div style="background:#F0FDF4;border-radius:6px;padding:10px 14px;flex:1;text-align:center;">
                      <div style="font-size:11px;color:#6B7280;">Активных</div>
                      <div style="font-size:22px;font-weight:700;color:#059669;">${r.applications.total_active}</div>
                    </div>
                  </div>
                </td>
                <td width="50%" style="padding-left:12px;vertical-align:top;">
                  <div style="background:#F9FAFB;border-radius:8px;overflow:hidden;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr style="background:#F3F4F6;">
                        <th style="padding:8px 12px;font-size:12px;color:#6B7280;text-align:left;font-weight:600;">Страна</th>
                        <th style="padding:8px 12px;font-size:12px;color:#6B7280;text-align:center;font-weight:600;">Кол.</th>
                        <th style="padding:8px 12px;font-size:12px;color:#6B7280;text-align:right;font-weight:600;">Выручка</th>
                      </tr>
                      ${countryRows}
                    </table>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Leads -->
        <tr>
          <td style="padding:24px 40px 0;">
            <div style="font-size:16px;font-weight:700;color:#111827;margin-bottom:12px;border-bottom:2px solid #E5E7EB;padding-bottom:8px;">🎯 Лиды</div>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="33%" style="padding-right:8px;">
                  <div style="background:#F9FAFB;border-radius:8px;padding:14px;text-align:center;">
                    <div style="font-size:11px;color:#6B7280;">Новых сегодня</div>
                    <div style="font-size:28px;font-weight:700;color:#111827;">${r.leads.new_today}</div>
                  </div>
                </td>
                <td width="33%" style="padding:0 4px;">
                  <div style="background:#FFF7ED;border-radius:8px;padding:14px;text-align:center;">
                    <div style="font-size:11px;color:#6B7280;">Горячих</div>
                    <div style="font-size:28px;font-weight:700;color:#EA580C;">${r.leads.hot_count}</div>
                  </div>
                </td>
                <td width="33%" style="padding-left:8px;">
                  <div style="background:#F0FDF4;border-radius:8px;padding:14px;text-align:center;">
                    <div style="font-size:11px;color:#6B7280;">Конверсия (7 дн)</div>
                    <div style="font-size:28px;font-weight:700;color:#059669;">${r.leads.conversion_rate}%</div>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Recommendations -->
        <tr>
          <td style="padding:24px 40px 0;">
            <div style="font-size:16px;font-weight:700;color:#111827;margin-bottom:12px;border-bottom:2px solid #E5E7EB;padding-bottom:8px;">💡 Рекомендации ИИ</div>
            <ul style="margin:0;padding-left:20px;">
              ${recsHtml}
            </ul>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#F9FAFB;padding:24px 40px;border-top:1px solid #E5E7EB;margin-top:24px;">
            <p style="margin:0;font-size:13px;color:#6B7280;">С уважением, <strong>VisaKZ CFO Agent</strong></p>
            <p style="margin:4px 0 0;font-size:12px;color:#9CA3AF;">Автоматический отчёт · visakz.kz</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
