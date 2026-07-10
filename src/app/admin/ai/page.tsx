'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2, Copy, Check, ChevronDown, ChevronRight, Brain, TrendingUp, Plus, Trash2, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface GeneratedContent {
  type: string
  title?: string
  body: string
  hashtags?: string[]
  suggested_image_prompt?: string
  meta_description?: string
  publish_at?: string
}

interface CalendarPost {
  type: string
  title?: string
  body: string
  hashtags?: string[]
  suggested_image_prompt?: string
  publish_at?: string
}

interface Lead {
  id: string
  name: string | null
  phone: string | null
  source: string
  country_interest: string | null
  status: string
  ai_category: string | null
  ai_score: number | null
  created_at: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SCORE_COLORS: Record<string, string> = {
  hot: 'bg-red-100 text-red-700',
  warm: 'bg-amber-100 text-amber-700',
  cold: 'bg-blue-100 text-blue-700',
  unqualified: 'bg-gray-100 text-gray-600',
}

const SCORE_LABELS: Record<string, string> = {
  hot: 'Горячий',
  warm: 'Тёплый',
  cold: 'Холодный',
  unqualified: 'Нет потенциала',
}

const TABS = [
  { id: 'content', label: 'Контент' },
  { id: 'leads', label: 'Лиды' },
  { id: 'notifications', label: 'Уведомления' },
  { id: 'automation', label: 'Автоматизация' },
  { id: 'market', label: 'Рынок' },
]

// ─── Tab: Content ─────────────────────────────────────────────────────────────

function ContentTab() {
  const [contentType, setContentType] = useState('instagram_post')
  const [topic, setTopic] = useState('')
  const [country, setCountry] = useState('')
  const [promotion, setPromotion] = useState('')
  const [tone, setTone] = useState('friendly')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GeneratedContent | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  // Calendar
  const [calMonth, setCalMonth] = useState('Август 2026')
  const [postsPerWeek, setPostsPerWeek] = useState(3)
  const [calLoading, setCalLoading] = useState(false)
  const [calPosts, setCalPosts] = useState<CalendarPost[]>([])
  const [calError, setCalError] = useState('')
  const [expandedPost, setExpandedPost] = useState<number | null>(null)

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Укажите тему')
      return
    }
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/admin/content/generate', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: contentType,
          topic,
          context: {
            country: country || undefined,
            promotion: promotion || undefined,
            tone,
          },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Ошибка генерации')
      setResult(data.content)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!result) return
    await navigator.clipboard.writeText(result.body)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCalendar = async () => {
    setCalLoading(true)
    setCalError('')
    setCalPosts([])
    setExpandedPost(null)
    try {
      const res = await fetch('/api/admin/content/calendar', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: calMonth, posts_per_week: postsPerWeek }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Ошибка генерации')
      setCalPosts(data.calendar ?? [])
    } catch (e) {
      setCalError(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setCalLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Generator form */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold text-base">Генератор контента</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Тип контента</label>
            <select
              value={contentType}
              onChange={e => setContentType(e.target.value)}
              className="w-full text-sm border border-border rounded-xl px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="instagram_post">Instagram пост</option>
              <option value="telegram_post">Telegram пост</option>
              <option value="blog_article">Статья в блог</option>
              <option value="email_newsletter">Email рассылка</option>
              <option value="whatsapp_broadcast">WhatsApp рассылка</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Тональность</label>
            <select
              value={tone}
              onChange={e => setTone(e.target.value)}
              className="w-full text-sm border border-border rounded-xl px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="friendly">Дружелюбная</option>
              <option value="formal">Официальная</option>
              <option value="urgent">Срочная</option>
            </select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-sm font-medium">Тема <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="например: Виза в Германию летом 2026"
              className="w-full text-sm border border-border rounded-xl px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Страна <span className="text-muted-foreground text-xs">(необязательно)</span></label>
            <input
              type="text"
              value={country}
              onChange={e => setCountry(e.target.value)}
              placeholder="например: Германия"
              className="w-full text-sm border border-border rounded-xl px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Акция <span className="text-muted-foreground text-xs">(необязательно)</span></label>
            <input
              type="text"
              value={promotion}
              onChange={e => setPromotion(e.target.value)}
              placeholder="например: скидка 15%"
              className="w-full text-sm border border-border rounded-xl px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Генерировать
        </button>
      </div>

      {/* Result preview */}
      {result && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-base">Результат</h2>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg border border-border hover:bg-muted"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Скопировано!' : 'Копировать'}
            </button>
          </div>

          {result.title && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Заголовок</p>
              <p className="font-semibold text-base">{result.title}</p>
            </div>
          )}

          <div>
            <p className="text-xs text-muted-foreground mb-1">Текст</p>
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{result.body}</p>
          </div>

          {result.hashtags && result.hashtags.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Хэштеги</p>
              <div className="flex flex-wrap gap-1.5">
                {result.hashtags.map(tag => (
                  <span key={tag} className="bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full font-medium">
                    {tag.startsWith('#') ? tag : `#${tag}`}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.suggested_image_prompt && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Промпт для изображения</p>
              <div className="bg-muted/60 rounded-xl px-4 py-3 text-sm text-muted-foreground italic">
                {result.suggested_image_prompt}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Calendar section */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold text-base">Генерировать календарь на месяц</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Месяц</label>
            <input
              type="text"
              value={calMonth}
              onChange={e => setCalMonth(e.target.value)}
              placeholder="например: Август 2026"
              className="w-full text-sm border border-border rounded-xl px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Постов в неделю</label>
            <input
              type="number"
              min={2}
              max={7}
              value={postsPerWeek}
              onChange={e => setPostsPerWeek(Number(e.target.value))}
              className="w-full text-sm border border-border rounded-xl px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        {calError && <p className="text-sm text-red-500">{calError}</p>}

        <button
          onClick={handleCalendar}
          disabled={calLoading}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors"
        >
          {calLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Генерировать календарь
        </button>

        {calPosts.length > 0 && (
          <div className="space-y-2 mt-2">
            <p className="text-sm text-muted-foreground">{calPosts.length} постов сгенерировано</p>
            {calPosts.map((post, i) => (
              <div key={i} className="border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedPost(expandedPost === i ? null : i)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors text-left"
                >
                  {expandedPost === i ? (
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className="text-xs text-muted-foreground shrink-0">#{i + 1}</span>
                  <span className="text-sm font-medium truncate">{post.title ?? post.body.slice(0, 60) + '…'}</span>
                  <span className="ml-auto text-xs text-muted-foreground shrink-0">{post.type}</span>
                </button>
                {expandedPost === i && (
                  <div className="px-4 pb-4 pt-0 border-t border-border space-y-3">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed mt-3">{post.body}</p>
                    {post.hashtags && post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {post.hashtags.map(tag => (
                          <span key={tag} className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                            {tag.startsWith('#') ? tag : `#${tag}`}
                          </span>
                        ))}
                      </div>
                    )}
                    {post.suggested_image_prompt && (
                      <div className="bg-muted/60 rounded-xl px-3 py-2 text-xs text-muted-foreground italic">
                        {post.suggested_image_prompt}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Tab: Leads ───────────────────────────────────────────────────────────────

function LeadsTab() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loadingLeads, setLoadingLeads] = useState(true)
  const [scoringAll, setScoringAll] = useState(false)
  const [scoringId, setScoringId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  const fetchLeads = useCallback(async () => {
    setLoadingLeads(true)
    try {
      const res = await fetch('/api/admin/leads/list', { credentials: 'include' })
      const data = await res.json()
      if (res.ok) setLeads(data.leads ?? [])
    } finally {
      setLoadingLeads(false)
    }
  }, [])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage(text)
    setMessageType(type)
    setTimeout(() => setMessage(''), 4000)
  }

  const handleScoreAll = async () => {
    setScoringAll(true)
    try {
      const res = await fetch('/api/admin/leads/score', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (res.ok) {
        showMessage(data.message ?? 'Все лиды оценены', 'success')
        await fetchLeads()
      } else {
        showMessage(data.error ?? 'Ошибка', 'error')
      }
    } catch {
      showMessage('Ошибка сети', 'error')
    } finally {
      setScoringAll(false)
    }
  }

  const handleScoreLead = async (leadId: string) => {
    setScoringId(leadId)
    try {
      const res = await fetch('/api/admin/leads/score', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: leadId }),
      })
      const data = await res.json()
      if (res.ok) {
        showMessage('Лид оценён', 'success')
        // Update the lead in state
        if (data.score) {
          setLeads(prev => prev.map(l =>
            l.id === leadId
              ? { ...l, ai_category: data.score.category, ai_score: data.score.total_score }
              : l
          ))
        }
      } else {
        showMessage(data.error ?? 'Ошибка', 'error')
      }
    } catch {
      showMessage('Ошибка сети', 'error')
    } finally {
      setScoringId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={handleScoreAll}
          disabled={scoringAll}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors"
        >
          {scoringAll && <Loader2 className="h-4 w-4 animate-spin" />}
          Оценить все лиды
        </button>
        {message && (
          <span className={`text-sm font-medium ${messageType === 'success' ? 'text-green-600' : 'text-red-500'}`}>
            {message}
          </span>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-x-auto">
        {loadingLeads ? (
          <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Загрузка лидов...
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-3 px-4 font-medium">Имя</th>
                <th className="text-left py-3 px-4 font-medium">Телефон</th>
                <th className="text-left py-3 px-4 font-medium">Источник</th>
                <th className="text-left py-3 px-4 font-medium">Страна</th>
                <th className="text-left py-3 px-4 font-medium">Статус</th>
                <th className="text-left py-3 px-4 font-medium">AI Оценка</th>
                <th className="text-left py-3 px-4 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {leads.map(lead => (
                <tr key={lead.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 font-medium">{lead.name ?? '—'}</td>
                  <td className="py-3 px-4 text-muted-foreground">{lead.phone ?? '—'}</td>
                  <td className="py-3 px-4 text-muted-foreground">{lead.source}</td>
                  <td className="py-3 px-4 text-muted-foreground">{lead.country_interest ?? '—'}</td>
                  <td className="py-3 px-4 text-muted-foreground">{lead.status}</td>
                  <td className="py-3 px-4">
                    {lead.ai_category ? (
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${SCORE_COLORS[lead.ai_category] ?? 'bg-gray-100 text-gray-600'}`}>
                        {SCORE_LABELS[lead.ai_category] ?? lead.ai_category}
                        {lead.ai_score != null && ` (${lead.ai_score})`}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">не оценен</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleScoreLead(lead.id)}
                      disabled={scoringId === lead.id}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-60"
                    >
                      {scoringId === lead.id ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                      Оценить
                    </button>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    Лидов не найдено
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ─── Tab: Notifications ───────────────────────────────────────────────────────

function NotificationsTab() {
  const [appId, setAppId] = useState('')
  const [template, setTemplate] = useState('application_received')
  const [customMessage, setCustomMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ email_sent?: boolean; email_id?: string } | null>(null)
  const [error, setError] = useState('')

  const handleSend = async () => {
    if (!appId.trim()) {
      setError('Укажите ID заявки')
      return
    }
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/admin/notifications/send', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: appId,
          template,
          custom_message: customMessage || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Ошибка отправки')
      setResult({ email_sent: data.email_sent, email_id: data.email_id })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setLoading(false)
    }
  }

  const TEMPLATE_LABELS: Record<string, string> = {
    application_received: 'Заявка получена',
    documents_required: 'Нужны документы',
    application_approved: 'Заявка одобрена',
    application_rejected: 'Заявка отклонена',
    appointment_reminder: 'Напоминание о встрече',
    status_update: 'Обновление статуса',
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold text-base">Отправить уведомление</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">ID заявки <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={appId}
              onChange={e => setAppId(e.target.value)}
              placeholder="UUID заявки"
              className="w-full text-sm border border-border rounded-xl px-3 py-2 bg-background font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Шаблон</label>
            <select
              value={template}
              onChange={e => setTemplate(e.target.value)}
              className="w-full text-sm border border-border rounded-xl px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {Object.entries(TEMPLATE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-sm font-medium">Кастомное сообщение <span className="text-muted-foreground text-xs">(необязательно)</span></label>
            <textarea
              value={customMessage}
              onChange={e => setCustomMessage(e.target.value)}
              rows={3}
              placeholder="Дополнительный текст для клиента..."
              className="w-full text-sm border border-border rounded-xl px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          onClick={handleSend}
          disabled={loading}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Отправить
        </button>
      </div>

      {result && (
        <div className={`rounded-2xl border p-5 ${result.email_sent ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <p className={`text-sm font-medium ${result.email_sent ? 'text-green-700' : 'text-red-700'}`}>
            {result.email_sent ? 'Email успешно отправлен' : 'Email не отправлен'}
          </p>
          {result.email_id && (
            <p className="text-xs text-muted-foreground mt-1 font-mono">ID: {result.email_id}</p>
          )}
        </div>
      )}

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm text-amber-700">
          Для работы нужен <code className="font-mono bg-amber-100 px-1 rounded">RESEND_API_KEY</code> в переменных Vercel
        </p>
      </div>
    </div>
  )
}

// ─── Tab: Automation ──────────────────────────────────────────────────────────

interface AutoStats {
  processed?: number
  sent?: number
  errors?: number
}

function AutomationTab() {
  const [followupLoading, setFollowupLoading] = useState(false)
  const [followupStats, setFollowupStats] = useState<AutoStats | null>(null)
  const [followupError, setFollowupError] = useState('')

  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewsStats, setReviewsStats] = useState<AutoStats | null>(null)
  const [reviewsError, setReviewsError] = useState('')

  const handleFollowup = async () => {
    setFollowupLoading(true)
    setFollowupError('')
    setFollowupStats(null)
    try {
      const res = await fetch('/api/admin/followup/process', {
        method: 'POST',
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Ошибка')
      setFollowupStats(data.stats ?? {})
    } catch (e) {
      setFollowupError(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setFollowupLoading(false)
    }
  }

  const handleReviews = async () => {
    setReviewsLoading(true)
    setReviewsError('')
    setReviewsStats(null)
    try {
      const res = await fetch('/api/admin/reviews/process', {
        method: 'POST',
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Ошибка')
      setReviewsStats(data.stats ?? {})
    } catch (e) {
      setReviewsError(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setReviewsLoading(false)
    }
  }

  return (
    <div className="grid sm:grid-cols-2 gap-6">
      {/* Follow-up card */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-base">Follow-up</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Отправляет WhatsApp-напоминания лидам, которые не отвечали 1, 3 или 7 дней
          </p>
        </div>

        <button
          onClick={handleFollowup}
          disabled={followupLoading}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors"
        >
          {followupLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Запустить
        </button>

        {followupError && <p className="text-sm text-red-500">{followupError}</p>}

        {followupStats && (
          <div className="grid grid-cols-3 gap-3">
            {followupStats.processed != null && (
              <div className="rounded-xl bg-muted/60 p-3 text-center">
                <p className="text-lg font-bold">{followupStats.processed}</p>
                <p className="text-xs text-muted-foreground">Обработано</p>
              </div>
            )}
            {followupStats.sent != null && (
              <div className="rounded-xl bg-green-50 p-3 text-center">
                <p className="text-lg font-bold text-green-700">{followupStats.sent}</p>
                <p className="text-xs text-muted-foreground">Отправлено</p>
              </div>
            )}
            {followupStats.errors != null && (
              <div className="rounded-xl bg-red-50 p-3 text-center">
                <p className="text-lg font-bold text-red-600">{followupStats.errors}</p>
                <p className="text-xs text-muted-foreground">Ошибок</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reviews card */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-base">Отзывы</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Запрашивает отзывы у клиентов, которым одобрили визу за последние 24 часа
          </p>
        </div>

        <button
          onClick={handleReviews}
          disabled={reviewsLoading}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors"
        >
          {reviewsLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Запустить
        </button>

        {reviewsError && <p className="text-sm text-red-500">{reviewsError}</p>}

        {reviewsStats && (
          <div className="grid grid-cols-2 gap-3">
            {reviewsStats.sent != null && (
              <div className="rounded-xl bg-green-50 p-3 text-center">
                <p className="text-lg font-bold text-green-700">{reviewsStats.sent}</p>
                <p className="text-xs text-muted-foreground">Отправлено</p>
              </div>
            )}
            {reviewsStats.errors != null && (
              <div className="rounded-xl bg-red-50 p-3 text-center">
                <p className="text-lg font-bold text-red-600">{reviewsStats.errors}</p>
                <p className="text-xs text-muted-foreground">Ошибок</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Tab: Market Intelligence ─────────────────────────────────────────────────

interface CompetitorRow {
  id: string
  name: string
  country_code: string | null
  visa_type: string
  price: number
  source: string
  notes: string | null
  recorded_at: string
}

interface PricingPosition {
  country_code: string
  country_name: string
  our_price: number
  market_avg: number
  market_min: number
  market_max: number
  competitor_count: number
  position: 'competitive' | 'overpriced' | 'underpriced'
  recommendation: string
}

interface MarketOpportunity {
  type: string
  description: string
  potential_revenue: string
  priority: 'high' | 'medium' | 'low'
}

interface MarketReport {
  generated_at: string
  executive_summary: string
  pricing_positions: PricingPosition[]
  opportunities: MarketOpportunity[]
  threats: string[]
  action_items: Array<{ action: string; timeline: string; impact: 'high' | 'medium' | 'low' }>
  competitor_count: number
  data_points: number
}

const COUNTRY_OPTIONS = [
  { code: '', label: 'Общее (все страны)' },
  { code: 'DE', label: 'Германия' },
  { code: 'FR', label: 'Франция' },
  { code: 'AE', label: 'ОАЭ' },
  { code: 'TR', label: 'Турция' },
  { code: 'US', label: 'США' },
  { code: 'GB', label: 'Великобритания' },
  { code: 'IT', label: 'Италия' },
  { code: 'ES', label: 'Испания' },
  { code: 'CZ', label: 'Чехия' },
  { code: 'TH', label: 'Таиланд' },
  { code: 'CN', label: 'Китай' },
]

const SOURCE_OPTIONS = [
  { value: 'manual', label: 'Ручной ввод' },
  { value: '2gis', label: '2GIS' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'website', label: 'Сайт конкурента' },
  { value: 'phone_call', label: 'Звонок (mystery)' },
]

const PRIORITY_COLORS: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-blue-100 text-blue-700',
}

const POSITION_COLORS: Record<string, string> = {
  competitive: 'bg-green-100 text-green-700',
  overpriced: 'bg-red-100 text-red-700',
  underpriced: 'bg-amber-100 text-amber-700',
}

const POSITION_LABELS: Record<string, string> = {
  competitive: 'Конкурентная',
  overpriced: 'Дорого',
  underpriced: 'Дёшево',
}

function MarketTab() {
  const [competitors, setCompetitors] = useState<CompetitorRow[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Add form
  const [form, setForm] = useState({ name: '', country_code: '', visa_type: 'tourist', price: '', source: 'manual', notes: '' })
  const [addLoading, setAddLoading] = useState(false)
  const [addMsg, setAddMsg] = useState('')

  // Analysis
  const [analyzing, setAnalyzing] = useState(false)
  const [report, setReport] = useState<MarketReport | null>(null)
  const [analyzeError, setAnalyzeError] = useState('')
  const [expandedSection, setExpandedSection] = useState<string | null>('positions')

  const fetchCompetitors = useCallback(async () => {
    setLoadingList(true)
    try {
      const res = await fetch('/api/admin/market-intelligence/competitors', { credentials: 'include' })
      const data = await res.json()
      setCompetitors(data.competitors ?? [])
    } finally {
      setLoadingList(false)
    }
  }, [])

  useEffect(() => { fetchCompetitors() }, [fetchCompetitors])

  const handleAdd = async () => {
    if (!form.name.trim() || !form.price) { setAddMsg('Заполните название и цену'); return }
    setAddLoading(true)
    setAddMsg('')
    try {
      const res = await fetch('/api/admin/market-intelligence/competitors', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, price: Number(form.price) }),
      })
      if (res.ok) {
        setForm({ name: '', country_code: '', visa_type: 'tourist', price: '', source: 'manual', notes: '' })
        setAddMsg('✓ Добавлено')
        await fetchCompetitors()
        setTimeout(() => setAddMsg(''), 3000)
      } else {
        const d = await res.json()
        setAddMsg(d.error ?? 'Ошибка')
      }
    } catch { setAddMsg('Ошибка сети') }
    finally { setAddLoading(false) }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await fetch('/api/admin/market-intelligence/competitors', {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setCompetitors(prev => prev.filter(c => c.id !== id))
    } finally { setDeletingId(null) }
  }

  const handleAnalyze = async () => {
    setAnalyzing(true)
    setAnalyzeError('')
    setReport(null)
    try {
      const res = await fetch('/api/admin/market-intelligence/analyze', {
        method: 'POST',
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Ошибка анализа')
      setReport(data.report)
      setExpandedSection('summary')
    } catch (e) {
      setAnalyzeError(e instanceof Error ? e.message : 'Ошибка')
    } finally { setAnalyzing(false) }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Market Intelligence
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Введите данные конкурентов → AI проанализирует позицию и даст рекомендации
          </p>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={analyzing || competitors.length === 0}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors"
        >
          {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {analyzing ? 'Анализирую...' : 'Запустить анализ'}
        </button>
      </div>

      {analyzeError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {analyzeError}
        </div>
      )}

      {/* Add competitor form */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h3 className="font-medium text-sm flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Добавить данные конкурента
        </h3>

        <div className="grid sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Название <span className="text-red-500">*</span></label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="VisaLink, GlobalVisa..."
              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Страна</label>
            <select
              value={form.country_code}
              onChange={e => setForm(f => ({ ...f, country_code: e.target.value }))}
              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {COUNTRY_OPTIONS.map(o => <option key={o.code} value={o.code}>{o.label}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Цена (₸) <span className="text-red-500">*</span></label>
            <input
              type="number"
              value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              placeholder="35000"
              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Источник</label>
            <select
              value={form.source}
              onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {SOURCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Тип визы</label>
            <select
              value={form.visa_type}
              onChange={e => setForm(f => ({ ...f, visa_type: e.target.value }))}
              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="tourist">Туристическая</option>
              <option value="business">Бизнес</option>
              <option value="student">Студенческая</option>
              <option value="transit">Транзит</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Примечание</label>
            <input
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="включает консульский сбор..."
              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleAdd}
            disabled={addLoading}
            className="flex items-center gap-2 bg-secondary text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-secondary/90 disabled:opacity-60 transition-colors"
          >
            {addLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            Добавить
          </button>
          {addMsg && <span className="text-sm text-muted-foreground">{addMsg}</span>}
        </div>
      </div>

      {/* Competitors table */}
      <div className="rounded-2xl border border-border bg-card overflow-x-auto">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <span className="text-sm font-medium">База конкурентов</span>
          <span className="text-xs text-muted-foreground">{competitors.length} записей</span>
        </div>
        {loadingList ? (
          <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin" /> Загрузка...
          </div>
        ) : competitors.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            Нет данных — добавьте первого конкурента выше
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-xs">
                <th className="text-left py-2.5 px-4 font-medium">Конкурент</th>
                <th className="text-left py-2.5 px-4 font-medium">Страна</th>
                <th className="text-left py-2.5 px-4 font-medium">Тип</th>
                <th className="text-left py-2.5 px-4 font-medium">Цена</th>
                <th className="text-left py-2.5 px-4 font-medium">Источник</th>
                <th className="text-left py-2.5 px-4 font-medium">Примечание</th>
                <th className="py-2.5 px-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {competitors.map(c => (
                <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 px-4 font-medium">{c.name}</td>
                  <td className="py-2.5 px-4 text-muted-foreground">{c.country_code ?? 'Общее'}</td>
                  <td className="py-2.5 px-4 text-muted-foreground">{c.visa_type}</td>
                  <td className="py-2.5 px-4 font-semibold">{c.price.toLocaleString('ru-RU')}₸</td>
                  <td className="py-2.5 px-4 text-muted-foreground">{c.source}</td>
                  <td className="py-2.5 px-4 text-muted-foreground text-xs max-w-[150px] truncate">{c.notes ?? '—'}</td>
                  <td className="py-2.5 px-4">
                    <button
                      onClick={() => handleDelete(c.id)}
                      disabled={deletingId === c.id}
                      className="text-muted-foreground hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50"
                    >
                      {deletingId === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Analysis Report */}
      {report && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Анализ выполнен · {report.competitor_count} конкурентов · {report.data_points} точек данных
          </div>

          {/* Summary */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <button
              onClick={() => setExpandedSection(s => s === 'summary' ? null : 'summary')}
              className="w-full flex items-center justify-between"
            >
              <span className="font-semibold text-sm">Резюме</span>
              {expandedSection === 'summary' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            {expandedSection === 'summary' && (
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{report.executive_summary}</p>
            )}
          </div>

          {/* Pricing positions */}
          {report.pricing_positions.filter(p => p.competitor_count > 0).length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <button
                onClick={() => setExpandedSection(s => s === 'positions' ? null : 'positions')}
                className="w-full flex items-center justify-between"
              >
                <span className="font-semibold text-sm">Ценовые позиции</span>
                {expandedSection === 'positions' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              {expandedSection === 'positions' && (
                <div className="mt-4 space-y-3">
                  {report.pricing_positions.filter(p => p.competitor_count > 0).map(p => (
                    <div key={p.country_code} className="rounded-xl border border-border p-4">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-sm">{p.country_name}</span>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${POSITION_COLORS[p.position]}`}>
                            {POSITION_LABELS[p.position]}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">{p.competitor_count} конк.</span>
                      </div>
                      <div className="grid grid-cols-4 gap-3 text-center mb-3">
                        {[
                          { label: 'Наша цена', val: p.our_price },
                          { label: 'Рынок avg', val: p.market_avg },
                          { label: 'Мин', val: p.market_min },
                          { label: 'Макс', val: p.market_max },
                        ].map(item => (
                          <div key={item.label} className="rounded-lg bg-muted/50 p-2">
                            <div className="text-sm font-bold">{item.val > 0 ? `${item.val.toLocaleString('ru-RU')}₸` : '—'}</div>
                            <div className="text-xs text-muted-foreground">{item.label}</div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">{p.recommendation}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Opportunities */}
          {report.opportunities.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <button
                onClick={() => setExpandedSection(s => s === 'opportunities' ? null : 'opportunities')}
                className="w-full flex items-center justify-between"
              >
                <span className="font-semibold text-sm">Возможности ({report.opportunities.length})</span>
                {expandedSection === 'opportunities' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              {expandedSection === 'opportunities' && (
                <div className="mt-4 space-y-3">
                  {report.opportunities.map((opp, i) => (
                    <div key={i} className="rounded-xl border border-border p-4 flex gap-4">
                      <div className="shrink-0">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[opp.priority]}`}>
                          {opp.priority === 'high' ? 'Высокий' : opp.priority === 'medium' ? 'Средний' : 'Низкий'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{opp.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">Потенциал: {opp.potential_revenue}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Threats */}
          {report.threats.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <button
                onClick={() => setExpandedSection(s => s === 'threats' ? null : 'threats')}
                className="w-full flex items-center justify-between"
              >
                <span className="font-semibold text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Угрозы ({report.threats.length})
                </span>
                {expandedSection === 'threats' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              {expandedSection === 'threats' && (
                <ul className="mt-4 space-y-2">
                  {report.threats.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-amber-500 shrink-0">▸</span>
                      {t}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Action items */}
          {report.action_items.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <button
                onClick={() => setExpandedSection(s => s === 'actions' ? null : 'actions')}
                className="w-full flex items-center justify-between"
              >
                <span className="font-semibold text-sm">План действий ({report.action_items.length})</span>
                {expandedSection === 'actions' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              {expandedSection === 'actions' && (
                <div className="mt-4 space-y-3">
                  {report.action_items.map((a, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-xl border border-border p-4">
                      <span className={`shrink-0 mt-0.5 h-5 w-5 rounded-full text-xs font-bold flex items-center justify-center ${PRIORITY_COLORS[a.impact]}`}>
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{a.action}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{a.timeline}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tip */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <p className="text-sm text-primary font-medium mb-1">Как использовать</p>
        <ol className="text-xs text-muted-foreground space-y-1 list-decimal pl-4">
          <li>Зайдите на 2GIS → найдите "визовый центр алматы" → откройте топ 5–10 компаний</li>
          <li>Позвоните как клиент (mystery call) или проверьте сайт — узнайте цены на Германию, ОАЭ, США</li>
          <li>Введите данные в форму выше (каждый конкурент × каждая страна = отдельная строка)</li>
          <li>Нажмите "Запустить анализ" — AI покажет где мы конкурентоспособны, где можно поднять/снизить</li>
        </ol>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AIAgentsPage() {
  const [activeTab, setActiveTab] = useState('content')

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Brain className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">AI Агенты</h1>
          <p className="text-muted-foreground mt-0.5">Управление автоматизацией VisaKZ</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-xl w-fit">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'content' && <ContentTab />}
        {activeTab === 'leads' && <LeadsTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
        {activeTab === 'automation' && <AutomationTab />}
        {activeTab === 'market' && <MarketTab />}
      </div>
    </div>
  )
}
