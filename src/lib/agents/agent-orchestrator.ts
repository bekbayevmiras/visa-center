import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AgentGoal = 'REACH' | 'LEADS' | 'QUALITY' | 'REVENUE'

export interface AgentRunLog {
  agent_name: string
  status: 'success' | 'error' | 'skipped'
  summary?: string
  actions_count?: number
  metrics?: Record<string, unknown>
  error_message?: string
}

export interface DailyMetrics {
  applications_today: number
  applications_yesterday: number
  leads_today: number
  leads_yesterday: number
  messages_today: number
  conversion_rate_today: number   // leads → applications %
  conversion_rate_yesterday: number
  revenue_today: number
  revenue_week: number
  approved_today: number
}

export interface DailyReport {
  date: string
  global_goal: AgentGoal
  summary: string
  metrics: DailyMetrics
  agents_ran: string[]
  bottlenecks: string[]
  wins: string[]
  recommendations: string[]
  rollback_alerts: string[]
  content_strategy: string
  conversion_delta: number  // % change
}

// ---------------------------------------------------------------------------
// Log agent run
// ---------------------------------------------------------------------------

export async function logAgentRun(log: AgentRunLog): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createAdminClient()) as any
  await supabase.from('agent_runs').insert({
    agent_name: log.agent_name,
    status: log.status,
    summary: log.summary,
    actions_count: log.actions_count ?? 0,
    metrics: log.metrics ?? {},
    error_message: log.error_message,
  })
  // Update last_run on config
  await supabase
    .from('agent_configs')
    .update({
      last_run_at: new Date().toISOString(),
      last_run_status: log.status,
      last_run_summary: log.summary,
      updated_at: new Date().toISOString(),
    })
    .eq('agent_name', log.agent_name)
}

// ---------------------------------------------------------------------------
// Get global goal
// ---------------------------------------------------------------------------

export async function getGlobalGoal(): Promise<AgentGoal> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createAdminClient()) as any
  const { data } = await supabase
    .from('agent_configs')
    .select('goal')
    .eq('agent_name', '__global__')
    .single()
  return ((data as { goal: string } | null)?.goal as AgentGoal) ?? 'LEADS'
}

// ---------------------------------------------------------------------------
// Get agent config
// ---------------------------------------------------------------------------

export async function getAgentConfig(agentName: string): Promise<{ is_active: boolean; goal: AgentGoal; config: Record<string, unknown> }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createAdminClient()) as any
  const { data } = await supabase
    .from('agent_configs')
    .select('is_active, goal, config')
    .eq('agent_name', agentName)
    .single()
  const row = data as { is_active: boolean; goal: string; config: Record<string, unknown> } | null
  return {
    is_active: row?.is_active ?? true,
    goal: (row?.goal as AgentGoal) ?? 'LEADS',
    config: row?.config ?? {},
  }
}

// ---------------------------------------------------------------------------
// Fetch today's metrics from DB
// ---------------------------------------------------------------------------

async function fetchDailyMetrics(): Promise<DailyMetrics> {
  const supabase = await createAdminClient()
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  const [appToday, appYest, leadsToday, leadsYest, msgsToday, revenueToday, revenueWeek, approvedToday] =
    await Promise.all([
      supabase.from('applications').select('id', { count: 'exact', head: true }).gte('created_at', today),
      supabase.from('applications').select('id', { count: 'exact', head: true }).gte('created_at', yesterday).lt('created_at', today),
      supabase.from('leads').select('id', { count: 'exact', head: true }).gte('created_at', today),
      supabase.from('leads').select('id', { count: 'exact', head: true }).gte('created_at', yesterday).lt('created_at', today),
      supabase.from('messages').select('id', { count: 'exact', head: true }).gte('created_at', today),
      supabase.from('applications').select('visa_price').gte('created_at', today).eq('status', 'completed'),
      supabase.from('applications').select('visa_price').gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString()).eq('status', 'completed'),
      supabase.from('applications').select('id', { count: 'exact', head: true }).gte('updated_at', today).eq('status', 'approved'),
    ])

  const at = appToday.count ?? 0
  const ay = appYest.count ?? 0
  const lt = leadsToday.count ?? 0
  const ly = leadsYest.count ?? 0
  const mt = msgsToday.count ?? 0
  const apt = approvedToday.count ?? 0

  const revToday = ((revenueToday.data ?? []) as { visa_price: number }[]).reduce((s, r) => s + (r.visa_price ?? 0), 0)
  const revWeek = ((revenueWeek.data ?? []) as { visa_price: number }[]).reduce((s, r) => s + (r.visa_price ?? 0), 0)

  const convToday = lt > 0 ? Math.round((at / lt) * 100) : 0
  const convYest = ly > 0 ? Math.round((ay / ly) * 100) : 0

  return {
    applications_today: at,
    applications_yesterday: ay,
    leads_today: lt,
    leads_yesterday: ly,
    messages_today: mt,
    conversion_rate_today: convToday,
    conversion_rate_yesterday: convYest,
    revenue_today: revToday,
    revenue_week: revWeek,
    approved_today: apt,
  }
}

// ---------------------------------------------------------------------------
// Fetch today's agent runs
// ---------------------------------------------------------------------------

async function fetchTodayRuns(): Promise<Array<{ agent_name: string; status: string; summary: string; actions_count: number }>> {
  const today = new Date().toISOString().split('T')[0]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createAdminClient()) as any
  const { data } = await supabase
    .from('agent_runs')
    .select('agent_name, status, summary, actions_count')
    .gte('ran_at', today)
    .order('ran_at', { ascending: false })
  return (data ?? []) as Array<{ agent_name: string; status: string; summary: string; actions_count: number }>
}

// ---------------------------------------------------------------------------
// Fetch yesterday's report for comparison
// ---------------------------------------------------------------------------

async function fetchYesterdayReport(): Promise<{ summary: string; conversion_delta: number } | null> {
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createAdminClient()) as any
  const { data } = await supabase
    .from('agent_daily_reports')
    .select('summary, insights')
    .eq('report_date', yesterday)
    .single()
  if (!data) return null
  const row = data as { summary: string; insights: { conversion_delta?: number } }
  return { summary: row.summary, conversion_delta: row.insights?.conversion_delta ?? 0 }
}

// ---------------------------------------------------------------------------
// Generate daily report via Claude
// ---------------------------------------------------------------------------

export async function generateDailyReport(): Promise<DailyReport> {
  const [metrics, runs, globalGoal, yesterday] = await Promise.all([
    fetchDailyMetrics(),
    fetchTodayRuns(),
    getGlobalGoal(),
    fetchYesterdayReport(),
  ])

  const convDelta = metrics.conversion_rate_today - metrics.conversion_rate_yesterday
  const appDelta = metrics.applications_today - metrics.applications_yesterday
  const leadDelta = metrics.leads_today - metrics.leads_yesterday

  const goalDescriptions: Record<AgentGoal, string> = {
    REACH: 'максимальный охват аудитории (просмотры, подписчики, узнаваемость)',
    LEADS: 'максимальное количество лидов и конверсия в заявки',
    QUALITY: 'максимальное качество сервиса и удовлетворённость клиентов',
    REVENUE: 'максимальная выручка и конверсия в оплаченные заявки',
  }

  const runsContext = runs.length > 0
    ? runs.map(r => `- ${r.agent_name}: ${r.status} | ${r.summary ?? 'нет данных'} | ${r.actions_count} действий`).join('\n')
    : 'Нет запусков агентов сегодня'

  const yesterdayContext = yesterday
    ? `Вчера: конверсия ${yesterday.conversion_delta > 0 ? '+' : ''}${yesterday.conversion_delta}%. Резюме: ${yesterday.summary.slice(0, 200)}`
    : 'Данных за вчера нет'

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: `Ты — Chief Operating Officer VisaKZ, визового центра в Алматы. Анализируй ежедневные метрики и давай конкретные рекомендации.

## ТЕКУЩАЯ ГЛОБАЛЬНАЯ ЦЕЛЬ: ${globalGoal}
Фокус: ${goalDescriptions[globalGoal]}

## МЕТРИКИ СЕГОДНЯ
- Заявки: ${metrics.applications_today} (вчера: ${metrics.applications_yesterday}, дельта: ${appDelta > 0 ? '+' : ''}${appDelta})
- Лиды: ${metrics.leads_today} (вчера: ${metrics.leads_yesterday}, дельта: ${leadDelta > 0 ? '+' : ''}${leadDelta})
- Сообщений: ${metrics.messages_today}
- Конверсия лиды→заявки: ${metrics.conversion_rate_today}% (вчера: ${metrics.conversion_rate_yesterday}%, дельта: ${convDelta > 0 ? '+' : ''}${convDelta}%)
- Одобрено виз: ${metrics.approved_today}
- Выручка сегодня: ${metrics.revenue_today.toLocaleString('ru-RU')}₸
- Выручка за неделю: ${metrics.revenue_week.toLocaleString('ru-RU')}₸

## РАБОТА АГЕНТОВ СЕГОДНЯ
${runsContext}

## СРАВНЕНИЕ С ВЧЕРА
${yesterdayContext}

Дай анализ в JSON (только JSON):
{
  "summary": "2-3 предложения итога дня",
  "bottlenecks": ["узкое горло 1", "узкое горло 2"],
  "wins": ["победа 1", "победа 2"],
  "recommendations": ["рекомендация 1 на завтра", "рекомендация 2"],
  "rollback_alerts": ["если конверсия упала — что откатить, иначе пустой массив"],
  "content_strategy": "конкретная стратегия контента на завтра исходя из цели ${globalGoal}: что именно публиковать"
}`,
      },
    ],
  })

  let insights = {
    summary: `Сегодня обработано ${metrics.applications_today} заявок, ${metrics.leads_today} лидов.`,
    bottlenecks: [] as string[],
    wins: [] as string[],
    recommendations: [] as string[],
    rollback_alerts: [] as string[],
    content_strategy: 'Продолжать текущую стратегию.',
  }

  try {
    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const match = text.match(/\{[\s\S]*\}/)
    if (match) insights = JSON.parse(match[0])
  } catch { /* keep defaults */ }

  const report: DailyReport = {
    date: new Date().toISOString().split('T')[0],
    global_goal: globalGoal,
    summary: insights.summary,
    metrics,
    agents_ran: [...new Set(runs.map(r => r.agent_name))],
    bottlenecks: insights.bottlenecks,
    wins: insights.wins,
    recommendations: insights.recommendations,
    rollback_alerts: insights.rollback_alerts,
    content_strategy: insights.content_strategy,
    conversion_delta: convDelta,
  }

  // Save to DB
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createAdminClient()) as any
  await supabase.from('agent_daily_reports').insert({
    global_goal: globalGoal,
    summary: report.summary,
    insights: {
      metrics,
      bottlenecks: report.bottlenecks,
      wins: report.wins,
      recommendations: report.recommendations,
      rollback_alerts: report.rollback_alerts,
      content_strategy: report.content_strategy,
      conversion_delta: convDelta,
      agents_ran: report.agents_ran,
    },
  })

  return report
}
