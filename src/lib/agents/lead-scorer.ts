import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient } from '@/lib/supabase/server'

export type LeadCategory = 'hot' | 'warm' | 'cold' | 'unqualified'

export interface LeadScore {
  total_score: number
  category: LeadCategory
  breakdown: {
    source: number
    engagement: number
    country: number
    budget: number
    urgency: number
  }
  next_action: string
  priority_rank: number
}

interface LeadInput {
  source?: string
  country_interest?: string
  messages?: string[]
  created_at?: string
  last_contact_at?: string
  status?: string
}

interface AiSignals {
  budget_score: number    // 0, 10, or 20
  urgency_score: number   // 5, 10, 15, or 20
  reasoning: string
}

const client = new Anthropic()

// ---------------------------------------------------------------------------
// Rule-based scoring helpers
// ---------------------------------------------------------------------------

function scoreSource(source?: string): number {
  const s = (source ?? '').toLowerCase()
  if (s === 'whatsapp' || s === 'referral') return 20
  if (s === 'website') return 15
  if (s === 'instagram') return 10
  return 5
}

function scoreEngagement(status?: string, lastContact?: string): number {
  const s = (status ?? '').toLowerCase()
  if (s === 'qualified' || s === 'contacted') {
    // If they have been contacted and responded
    if (lastContact) return 20
    return 10
  }
  if (s === 'new') return 10
  if (s === 'converted') return 20
  if (s === 'lost') return 0
  return 5
}

function scoreCountry(country?: string): number {
  if (!country) return 5
  const c = country.toLowerCase()

  const schengenUSUK = [
    'шенген', 'германия', 'франция', 'испания', 'италия', 'нидерланды',
    'бельгия', 'австрия', 'швейцария', 'португалия', 'греция', 'чехия',
    'польша', 'венгрия', 'сша', 'соединённые штаты', 'великобритания', 'англия',
    'schengen', 'germany', 'france', 'spain', 'italy', 'usa', 'us', 'uk',
    'united kingdom', 'england',
  ]
  const uaeTurkey = [
    'оаэ', 'дубай', 'абу-даби', 'турция', 'стамбул',
    'uae', 'dubai', 'turkey', 'istanbul',
  ]
  const asia = [
    'китай', 'япония', 'южная корея', 'таиланд', 'индия', 'вьетнам', 'сингапур',
    'china', 'japan', 'korea', 'thailand', 'india', 'vietnam', 'singapore',
  ]

  if (schengenUSUK.some(k => c.includes(k))) return 20
  if (uaeTurkey.some(k => c.includes(k))) return 15
  if (asia.some(k => c.includes(k))) return 10
  return 5
}

function categoryFromScore(score: number): LeadCategory {
  if (score >= 80) return 'hot'
  if (score >= 50) return 'warm'
  if (score >= 20) return 'cold'
  return 'unqualified'
}

function nextActionFromCategory(category: LeadCategory, breakdown: LeadScore['breakdown']): string {
  switch (category) {
    case 'hot':
      return 'Позвонить в течение 2 часов, предложить срочную консультацию и скидку 5%'
    case 'warm':
      if (breakdown.budget < 10) {
        return 'Отправить кейсы и цены, закрыть возражение по стоимости'
      }
      if (breakdown.urgency < 10) {
        return 'Уточнить сроки поездки и создать ощущение срочности'
      }
      return 'Запланировать звонок в течение 24 часов, выявить потребности'
    case 'cold':
      return 'Добавить в email-рассылку, отправить полезный контент о стране'
    case 'unqualified':
      return 'Поддерживать в базе, повторный контакт через 30 дней'
  }
}

// ---------------------------------------------------------------------------
// AI analysis for budget and urgency signals
// ---------------------------------------------------------------------------

async function analyzeMessagesWithAI(messages: string[]): Promise<AiSignals> {
  if (!messages || messages.length === 0) {
    return { budget_score: 10, urgency_score: 5, reasoning: 'Нет сообщений для анализа' }
  }

  const conversation = messages.join('\n---\n')

  const systemPrompt = `Ты — аналитик лидов визового центра VisaKZ.
Проанализируй переписку с клиентом и определи сигналы бюджета и срочности.

Верни ТОЛЬКО JSON:
{
  "budget_score": <0, 10 или 20>,
  "urgency_score": <5, 10, 15 или 20>,
  "reasoning": "<краткое объяснение на русском>"
}

Правила для budget_score:
- 20: упомянул цену и не возражал, готов платить
- 10: спрашивал о цене, нет явного возражения
- 0: жаловался на дороговизну, явный ценовой барьер

Правила для urgency_score:
- 20: поездка в течение 1 месяца
- 15: поездка через 1-3 месяца
- 10: поездка через 3-6 месяцев
- 5: дата не указана или неопределённая`

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Переписка с клиентом:\n\n${conversation}`,
      },
    ],
  })

  const raw = response.content[0].type === 'text' ? response.content[0].text : '{}'
  const text = raw.replace(/```(?:json)?\n?/g, '').trim()

  try {
    const parsed = JSON.parse(text) as AiSignals
    return {
      budget_score: [0, 10, 20].includes(parsed.budget_score) ? parsed.budget_score : 10,
      urgency_score: [5, 10, 15, 20].includes(parsed.urgency_score) ? parsed.urgency_score : 5,
      reasoning: parsed.reasoning ?? '',
    }
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        const parsed = JSON.parse(match[0]) as AiSignals
        return {
          budget_score: [0, 10, 20].includes(parsed.budget_score) ? parsed.budget_score : 10,
          urgency_score: [5, 10, 15, 20].includes(parsed.urgency_score) ? parsed.urgency_score : 5,
          reasoning: parsed.reasoning ?? '',
        }
      } catch { /* fall through */ }
    }
    console.error('[lead-scorer] AI parse error, raw:', raw)
    return { budget_score: 10, urgency_score: 5, reasoning: 'Ошибка анализа' }
  }
}

// ---------------------------------------------------------------------------
// Public scoring function
// ---------------------------------------------------------------------------

export async function scoreLead(lead: LeadInput): Promise<LeadScore> {
  const sourceScore = scoreSource(lead.source)
  const engagementScore = scoreEngagement(lead.status, lead.last_contact_at)
  const countryScore = scoreCountry(lead.country_interest)

  // Use AI to analyse messages for budget + urgency
  const aiSignals = await analyzeMessagesWithAI(lead.messages ?? [])

  const breakdown = {
    source: sourceScore,
    engagement: engagementScore,
    country: countryScore,
    budget: aiSignals.budget_score,
    urgency: aiSignals.urgency_score,
  }

  const total = Object.values(breakdown).reduce((a, b) => a + b, 0)
  const category = categoryFromScore(total)
  const next_action = nextActionFromCategory(category, breakdown)

  return {
    total_score: total,
    category,
    breakdown,
    next_action,
    priority_rank: 0, // will be set by caller when ranking multiple leads
  }
}

// ---------------------------------------------------------------------------
// Bulk re-score all leads
// ---------------------------------------------------------------------------

export async function scoreAllLeads(): Promise<void> {
  const supabase = createAdminClient()

  const { data: leads, error } = await (supabase as any)
    .from('leads')
    .select('id, source, country_interest, status, created_at, updated_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[lead-scorer] Failed to fetch leads:', error)
    return
  }

  if (!leads || leads.length === 0) return

  // Score each lead (messages not available in bulk mode — pass empty array)
  const scored: Array<{ id: string; score: LeadScore }> = []

  for (const lead of leads as Array<{
    id: string
    source?: string
    country_interest?: string
    status?: string
    created_at?: string
    updated_at?: string
  }>) {
    const score = await scoreLead({
      source: lead.source,
      country_interest: lead.country_interest,
      status: lead.status,
      created_at: lead.created_at,
      last_contact_at: lead.updated_at,
      messages: [], // no messages in bulk mode
    })
    scored.push({ id: lead.id, score })
  }

  // Sort by total descending, assign priority rank
  scored.sort((a, b) => b.score.total_score - a.score.total_score)
  scored.forEach((item, idx) => {
    item.score.priority_rank = idx + 1
  })

  // Persist scores back to DB
  for (const { id, score } of scored) {
    const { error: updateError } = await (supabase as any)
      .from('leads')
      .update({
        notes: JSON.stringify({
          ai_score: score.total_score,
          ai_category: score.category,
          ai_breakdown: score.breakdown,
          ai_next_action: score.next_action,
          ai_priority_rank: score.priority_rank,
          scored_at: new Date().toISOString(),
        }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      console.error(`[lead-scorer] Failed to update lead ${id}:`, updateError)
    }
  }

  console.log(`[lead-scorer] Scored ${scored.length} leads`)
}
