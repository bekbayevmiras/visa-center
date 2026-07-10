'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Loader2, Play, Pause, Target, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle, ChevronDown, ChevronRight,
  RefreshCw, Zap, Clock, Activity,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type AgentGoal = 'REACH' | 'LEADS' | 'QUALITY' | 'REVENUE'

interface AgentConfig {
  id: string
  agent_name: string
  display_name: string
  description: string
  is_active: boolean
  goal: AgentGoal
  schedule: string | null
  last_run_at: string | null
  last_run_status: string | null
  last_run_summary: string | null
}

interface AgentRun {
  id: string
  agent_name: string
  ran_at: string
  status: string
  summary: string | null
  actions_count: number
}

interface DailyReportRow {
  id: string
  report_date: string
  global_goal: string
  summary: string
  insights: {
    metrics?: {
      applications_today: number
      applications_yesterday: number
      leads_today: number
      leads_yesterday: number
      conversion_rate_today: number
      conversion_rate_yesterday: number
      revenue_today: number
      revenue_week: number
      approved_today: number
    }
    bottlenecks?: string[]
    wins?: string[]
    recommendations?: string[]
    rollback_alerts?: string[]
    content_strategy?: string
    conversion_delta?: number
    agents_ran?: string[]
  }
  created_at: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GOALS: { value: AgentGoal; label: string; color: string; desc: string }[] = [
  { value: 'REACH',   label: 'Охват',    color: 'bg-purple-100 text-purple-700 border-purple-200', desc: 'Максимум просмотров и подписчиков' },
  { value: 'LEADS',   label: 'Лиды',     color: 'bg-blue-100 text-blue-700 border-blue-200',       desc: 'Максимум заявок и конверсий' },
  { value: 'QUALITY', label: 'Качество', color: 'bg-green-100 text-green-700 border-green-200',    desc: 'Удовлетворённость клиентов' },
  { value: 'REVENUE', label: 'Выручка',  color: 'bg-amber-100 text-amber-700 border-amber-200',    desc: 'Максимум оплаченных заявок' },
]

const STATUS_STYLES: Record<string, string> = {
  success: 'bg-green-100 text-green-700',
  error:   'bg-red-100 text-red-700',
  skipped: 'bg-gray-100 text-gray-600',
}

const HIDDEN_AGENTS = ['__global__']

function formatRelativeTime(iso: string | null): string {
  if (!iso) return 'никогда'
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins} мин назад`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} ч назад`
  return `${Math.floor(hrs / 24)} дн назад`
}

// ─── Agent Card ───────────────────────────────────────────────────────────────

function AgentCard({
  config,
  onToggle,
  onGoalChange,
  toggling,
}: {
  config: AgentConfig
  onToggle: (name: string, active: boolean) => void
  onGoalChange: (name: string, goal: AgentGoal) => void
  toggling: string | null
}) {
  const goal = GOALS.find(g => g.value === config.goal) ?? GOALS[1]
  const isToggling = toggling === config.agent_name

  return (
    <div className={`rounded-2xl border bg-card p-5 transition-all ${config.is_active ? 'border-border' : 'border-border/40 opacity-60'}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-semibold text-sm">{config.display_name}</span>
            {config.is_active && (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                активен
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-snug">{config.description}</p>
        </div>

        {/* Toggle */}
        <button
          onClick={() => onToggle(config.agent_name, !config.is_active)}
          disabled={isToggling}
          className={`shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
            config.is_active ? 'bg-primary' : 'bg-muted-foreground/30'
          } ${isToggling ? 'opacity-60 cursor-wait' : 'cursor-pointer'}`}
        >
          {isToggling ? (
            <Loader2 className="h-3 w-3 text-white absolute left-1/2 -translate-x-1/2 animate-spin" />
          ) : (
            <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${config.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
          )}
        </button>
      </div>

      {/* Schedule + last run */}
      <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
        {config.schedule && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {config.schedule}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Activity className="h-3 w-3" />
          {formatRelativeTime(config.last_run_at)}
        </span>
        {config.last_run_status && (
          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[config.last_run_status] ?? 'bg-gray-100 text-gray-600'}`}>
            {config.last_run_status}
          </span>
        )}
      </div>

      {config.last_run_summary && (
        <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2 mb-3 leading-relaxed line-clamp-2">
          {config.last_run_summary}
        </p>
      )}

      {/* Goal selector */}
      <div>
        <label className="text-xs text-muted-foreground mb-1.5 block">Цель агента</label>
        <div className="flex flex-wrap gap-1.5">
          {GOALS.map(g => (
            <button
              key={g.value}
              onClick={() => onGoalChange(config.agent_name, g.value)}
              title={g.desc}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                config.goal === g.value
                  ? g.color
                  : 'border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Daily Report ─────────────────────────────────────────────────────────────

function DailyReportCard({ report }: { report: DailyReportRow }) {
  const [expanded, setExpanded] = useState<string | null>('metrics')
  const ins = report.insights
  const m = ins.metrics
  const delta = ins.conversion_delta ?? 0
  const goal = GOALS.find(g => g.value === report.global_goal)

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border bg-muted/20">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm">
                Отчёт за {new Date(report.report_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
              </h3>
              {goal && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${goal.color}`}>
                  Цель: {goal.label}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{report.summary}</p>
          </div>
          <div className={`shrink-0 flex items-center gap-1 text-sm font-bold ${delta >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {delta >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {delta >= 0 ? '+' : ''}{delta}%
          </div>
        </div>
      </div>

      {/* Metrics */}
      {m && (
        <div>
          <button
            onClick={() => setExpanded(e => e === 'metrics' ? null : 'metrics')}
            className="w-full flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors text-sm font-medium"
          >
            Метрики дня
            {expanded === 'metrics' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          {expanded === 'metrics' && (
            <div className="px-5 pb-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Заявки', val: m.applications_today, prev: m.applications_yesterday },
                { label: 'Лиды', val: m.leads_today, prev: m.leads_yesterday },
                { label: 'Конверсия', val: `${m.conversion_rate_today}%`, prev: `${m.conversion_rate_yesterday}%` },
                { label: 'Одобрено', val: m.approved_today, prev: null },
                { label: 'Выручка', val: `${(m.revenue_today / 1000).toFixed(0)}K ₸`, prev: null },
                { label: 'Выручка (нед.)', val: `${(m.revenue_week / 1000).toFixed(0)}K ₸`, prev: null },
              ].map(item => (
                <div key={item.label} className="rounded-xl bg-muted/40 p-3 text-center">
                  <div className="text-lg font-bold">{item.val}</div>
                  <div className="text-xs text-muted-foreground">{item.label}</div>
                  {item.prev !== null && (
                    <div className="text-xs text-muted-foreground/70">вчера: {item.prev}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Wins */}
      {ins.wins && ins.wins.length > 0 && (
        <div className="border-t border-border">
          <button
            onClick={() => setExpanded(e => e === 'wins' ? null : 'wins')}
            className="w-full flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors text-sm font-medium"
          >
            <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Победы ({ins.wins.length})</span>
            {expanded === 'wins' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          {expanded === 'wins' && (
            <ul className="px-5 pb-4 space-y-1.5">
              {ins.wins.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-green-500 shrink-0 mt-0.5">✓</span>{w}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Bottlenecks */}
      {ins.bottlenecks && ins.bottlenecks.length > 0 && (
        <div className="border-t border-border">
          <button
            onClick={() => setExpanded(e => e === 'bottlenecks' ? null : 'bottlenecks')}
            className="w-full flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors text-sm font-medium"
          >
            <span className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" /> Узкие горла ({ins.bottlenecks.length})</span>
            {expanded === 'bottlenecks' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          {expanded === 'bottlenecks' && (
            <ul className="px-5 pb-4 space-y-1.5">
              {ins.bottlenecks.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-amber-500 shrink-0 mt-0.5">▸</span>{b}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Rollback alerts */}
      {ins.rollback_alerts && ins.rollback_alerts.length > 0 && (
        <div className="border-t border-red-200 bg-red-50">
          <button
            onClick={() => setExpanded(e => e === 'rollback' ? null : 'rollback')}
            className="w-full flex items-center justify-between px-5 py-3 hover:bg-red-100/50 transition-colors text-sm font-medium text-red-700"
          >
            <span className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Откат! Конверсия упала</span>
            {expanded === 'rollback' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          {expanded === 'rollback' && (
            <ul className="px-5 pb-4 space-y-1.5">
              {ins.rollback_alerts.map((a, i) => (
                <li key={i} className="text-sm text-red-700">{a}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Recommendations */}
      {ins.recommendations && ins.recommendations.length > 0 && (
        <div className="border-t border-border">
          <button
            onClick={() => setExpanded(e => e === 'recs' ? null : 'recs')}
            className="w-full flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors text-sm font-medium"
          >
            Рекомендации на завтра ({ins.recommendations.length})
            {expanded === 'recs' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          {expanded === 'recs' && (
            <ol className="px-5 pb-4 space-y-1.5 list-decimal pl-9">
              {ins.recommendations.map((r, i) => (
                <li key={i} className="text-sm text-muted-foreground">{r}</li>
              ))}
            </ol>
          )}
        </div>
      )}

      {/* Content strategy */}
      {ins.content_strategy && (
        <div className="border-t border-border">
          <button
            onClick={() => setExpanded(e => e === 'content' ? null : 'content')}
            className="w-full flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors text-sm font-medium"
          >
            <span className="flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> Стратегия контента на завтра</span>
            {expanded === 'content' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          {expanded === 'content' && (
            <p className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">{ins.content_strategy}</p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AgentsPage() {
  const [configs, setConfigs] = useState<AgentConfig[]>([])
  const [globalConfig, setGlobalConfig] = useState<AgentConfig | null>(null)
  const [runs, setRuns] = useState<AgentRun[]>([])
  const [reports, setReports] = useState<DailyReportRow[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)
  const [generatingReport, setGeneratingReport] = useState(false)
  const [reportMsg, setReportMsg] = useState('')
  const [activeTab, setActiveTab] = useState<'agents' | 'runs' | 'reports'>('agents')

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [cfgRes, runsRes, repRes] = await Promise.all([
        fetch('/api/admin/agents/configs', { credentials: 'include' }),
        fetch('/api/admin/agents/runs', { credentials: 'include' }),
        fetch('/api/admin/agents/report', { credentials: 'include' }),
      ])
      const [cfgData, runsData, repData] = await Promise.all([cfgRes.json(), runsRes.json(), repRes.json()])
      const allConfigs: AgentConfig[] = cfgData.configs ?? []
      setGlobalConfig(allConfigs.find(c => c.agent_name === '__global__') ?? null)
      setConfigs(allConfigs.filter(c => !HIDDEN_AGENTS.includes(c.agent_name)))
      setRuns(runsData.runs ?? [])
      setReports(repData.reports ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleToggle = async (agentName: string, active: boolean) => {
    setToggling(agentName)
    try {
      await fetch('/api/admin/agents/configs', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_name: agentName, is_active: active }),
      })
      setConfigs(prev => prev.map(c => c.agent_name === agentName ? { ...c, is_active: active } : c))
    } finally {
      setToggling(null)
    }
  }

  const handleGoalChange = async (agentName: string, goal: AgentGoal) => {
    await fetch('/api/admin/agents/configs', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent_name: agentName, goal }),
    })
    setConfigs(prev => prev.map(c => c.agent_name === agentName ? { ...c, goal } : c))
  }

  const handleGlobalGoal = async (goal: AgentGoal) => {
    await fetch('/api/admin/agents/configs', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent_name: '__global__', goal }),
    })
    if (globalConfig) setGlobalConfig({ ...globalConfig, goal })
  }

  const handleGenerateReport = async () => {
    setGeneratingReport(true)
    setReportMsg('')
    try {
      const res = await fetch('/api/admin/agents/report', { method: 'POST', credentials: 'include' })
      const data = await res.json()
      if (res.ok) {
        setReportMsg('Отчёт сгенерирован')
        setActiveTab('reports')
        await fetchAll()
      } else {
        setReportMsg(data.error ?? 'Ошибка')
      }
    } catch { setReportMsg('Ошибка сети') }
    finally {
      setGeneratingReport(false)
      setTimeout(() => setReportMsg(''), 4000)
    }
  }

  const activeCount = configs.filter(c => c.is_active).length
  const globalGoal = GOALS.find(g => g.value === (globalConfig?.goal ?? 'LEADS')) ?? GOALS[1]

  const TABS = [
    { id: 'agents' as const, label: 'Агенты' },
    { id: 'runs' as const, label: 'Логи' },
    { id: 'reports' as const, label: 'Отчёты' },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Activity className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Центр управления агентами</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {activeCount} из {configs.length} активны · Автономный режим
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {reportMsg && <span className="text-sm text-muted-foreground">{reportMsg}</span>}
          <button
            onClick={handleGenerateReport}
            disabled={generatingReport}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            {generatingReport ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Сгенерировать отчёт
          </button>
        </div>
      </div>

      {/* Global goal */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-3 mb-3">
          <Target className="h-5 w-5 text-primary" />
          <div>
            <h2 className="font-semibold text-sm">Глобальная цель</h2>
            <p className="text-xs text-muted-foreground">Все агенты адаптируют поведение под выбранную цель</p>
          </div>
          <span className={`ml-auto px-3 py-1 rounded-full text-sm font-semibold border ${globalGoal.color}`}>
            {globalGoal.label}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {GOALS.map(g => (
            <button
              key={g.value}
              onClick={() => handleGlobalGoal(g.value)}
              className={`rounded-xl border px-3 py-3 text-left transition-all ${
                globalConfig?.goal === g.value
                  ? g.color
                  : 'border-border hover:bg-muted/50'
              }`}
            >
              <div className="font-semibold text-sm">{g.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{g.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-xl w-fit">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Загрузка...
        </div>
      ) : (
        <>
          {/* Agents tab */}
          {activeTab === 'agents' && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {configs.map(cfg => (
                <AgentCard
                  key={cfg.agent_name}
                  config={cfg}
                  onToggle={handleToggle}
                  onGoalChange={handleGoalChange}
                  toggling={toggling}
                />
              ))}
            </div>
          )}

          {/* Runs tab */}
          {activeTab === 'runs' && (
            <div className="rounded-2xl border border-border bg-card overflow-x-auto">
              <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                <span className="text-sm font-medium">Лог запусков</span>
                <span className="text-xs text-muted-foreground">{runs.length} записей</span>
              </div>
              {runs.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">Нет запусков</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground text-xs">
                      <th className="text-left py-2.5 px-4 font-medium">Агент</th>
                      <th className="text-left py-2.5 px-4 font-medium">Время</th>
                      <th className="text-left py-2.5 px-4 font-medium">Статус</th>
                      <th className="text-left py-2.5 px-4 font-medium">Действий</th>
                      <th className="text-left py-2.5 px-4 font-medium">Результат</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {runs.map(run => (
                      <tr key={run.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 px-4 font-medium">{run.agent_name}</td>
                        <td className="py-2.5 px-4 text-muted-foreground text-xs">
                          {new Date(run.ran_at).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[run.status] ?? 'bg-gray-100 text-gray-600'}`}>
                            {run.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-muted-foreground">{run.actions_count}</td>
                        <td className="py-2.5 px-4 text-muted-foreground text-xs max-w-[280px] truncate">{run.summary ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Reports tab */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              {reports.length === 0 ? (
                <div className="rounded-2xl border border-border bg-card py-12 text-center text-sm text-muted-foreground">
                  <p className="mb-4">Отчётов пока нет</p>
                  <button
                    onClick={handleGenerateReport}
                    disabled={generatingReport}
                    className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors mx-auto"
                  >
                    {generatingReport ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                    Сгенерировать первый отчёт
                  </button>
                </div>
              ) : (
                reports.map(r => <DailyReportCard key={r.id} report={r} />)
              )}
            </div>
          )}
        </>
      )}

      {/* Status bar */}
      <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-4">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            {activeCount} агентов активны
          </span>
          <span className="flex items-center gap-1.5">
            <Pause className="h-3 w-3" />
            {configs.length - activeCount} остановлено
          </span>
        </div>
        <span>Ежедневный отчёт: 23:30 автоматически</span>
      </div>
    </div>
  )
}
