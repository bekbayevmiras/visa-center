import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Competitor {
  name: string
  country_code?: string
  visa_type?: string
  price: number
  source?: string
  notes?: string
}

export interface PricingPosition {
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

export interface MarketOpportunity {
  type: 'price_increase' | 'new_country' | 'express_premium' | 'package_upsell' | 'segment_gap'
  description: string
  potential_revenue: string
  priority: 'high' | 'medium' | 'low'
}

export interface MarketIntelligenceReport {
  generated_at: string
  executive_summary: string
  pricing_positions: PricingPosition[]
  opportunities: MarketOpportunity[]
  threats: string[]
  action_items: Array<{
    action: string
    timeline: string
    impact: 'high' | 'medium' | 'low'
  }>
  competitor_count: number
  data_points: number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const COUNTRY_NAMES: Record<string, string> = {
  DE: 'Германия',
  FR: 'Франция',
  AE: 'ОАЭ',
  TR: 'Турция',
  US: 'США',
  GB: 'Великобритания',
  IT: 'Италия',
  ES: 'Испания',
  CZ: 'Чехия',
  PL: 'Польша',
  TH: 'Таиланд',
  CN: 'Китай',
  KR: 'Южная Корея',
  JP: 'Япония',
  IN: 'Индия',
  CA: 'Канада',
  AU: 'Австралия',
  NL: 'Нидерланды',
  AT: 'Австрия',
  CH: 'Швейцария',
}

// ---------------------------------------------------------------------------
// Core analysis — Claude Haiku for speed/cost
// ---------------------------------------------------------------------------

export async function runMarketAnalysis(
  competitors: Competitor[],
  ourPrices: Array<{ country_code: string; base_price: number; express_price: number }>
): Promise<MarketIntelligenceReport> {
  const now = new Date().toISOString()

  // Group competitors by country
  const byCountry: Record<string, Competitor[]> = {}
  for (const c of competitors) {
    const key = c.country_code ?? 'GENERAL'
    byCountry[key] = byCountry[key] ?? []
    byCountry[key].push(c)
  }

  // Build pricing positions for countries where we have data
  const pricingPositions: PricingPosition[] = ourPrices.map(p => {
    const comps = byCountry[p.country_code] ?? []
    const prices = comps.map(c => c.price).filter(Boolean)
    const market_avg = prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0
    const market_min = prices.length ? Math.min(...prices) : 0
    const market_max = prices.length ? Math.max(...prices) : 0

    let position: PricingPosition['position'] = 'competitive'
    let recommendation = 'Цена соответствует рынку'

    if (market_avg > 0) {
      const diff = ((p.base_price - market_avg) / market_avg) * 100
      if (diff > 15) {
        position = 'overpriced'
        recommendation = `Снизить на ${Math.round(diff - 10)}% или добавить уникальное преимущество для обоснования цены`
      } else if (diff < -15) {
        position = 'underpriced'
        recommendation = `Можно поднять цену на ${Math.round(-diff - 10)}% — рынок готов платить больше`
      }
    }

    return {
      country_code: p.country_code,
      country_name: COUNTRY_NAMES[p.country_code] ?? p.country_code,
      our_price: p.base_price,
      market_avg,
      market_min,
      market_max,
      competitor_count: comps.length,
      position,
      recommendation,
    }
  })

  // Build Claude prompt with all data
  const dataContext = `
## Наши текущие цены:
${ourPrices.map(p => `- ${COUNTRY_NAMES[p.country_code] ?? p.country_code}: базовая ${p.base_price}₸, экспресс ${p.express_price}₸`).join('\n')}

## Данные конкурентов (${competitors.length} позиций):
${competitors.map(c => `- ${c.name} | ${COUNTRY_NAMES[c.country_code ?? ''] ?? c.country_code ?? 'общее'} | ${c.visa_type ?? 'туризм'} | ${c.price}₸ | источник: ${c.source ?? 'ручной ввод'}${c.notes ? ` | ${c.notes}` : ''}`).join('\n')}

## Анализ позиций по рынку:
${pricingPositions.map(p => `- ${p.country_name}: наша цена ${p.our_price}₸, рынок avg ${p.market_avg || 'нет данных'}₸, позиция: ${p.position}`).join('\n')}
`

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: `Ты — Senior Market Intelligence аналитик визового центра VisaKZ (Алматы).
Контекст: ~15-20 визовых центров в Алматы, 3-4 крупных игрока. Наши УТП: оплата 30/70 (70% ТОЛЬКО после получения визы), AI-ассистент, 24/7, онлайн.
Цель: захват 50% рынка Алматы за 12 месяцев. Аудитория: 25-45 лет, доход средний+, активные путешественники.

${dataContext}

Дай КОНКРЕТНЫЙ анализ с цифрами. Избегай общих фраз.
JSON только (без markdown):
{
  "executive_summary": "2-3 предложения с конкретными цифрами о нашей позиции",
  "opportunities": [
    {
      "type": "price_increase|new_country|express_premium|package_upsell|segment_gap|partnership",
      "description": "конкретное описание — какая страна, сегмент, потенциал",
      "potential_revenue": "реалистичная доп. выручка в месяц в тенге",
      "priority": "high|medium|low",
      "quick_win": true
    }
  ],
  "threats": ["конкретная угроза с оценкой влияния"],
  "action_items": [
    {
      "action": "конкретное действие с ответственным",
      "timeline": "например: следующие 7 дней",
      "impact": "high|medium|low",
      "metric": "как измерим успех"
    }
  ],
  "pricing_insight": "главный вывод — где теряем деньги или клиентов"
}`,
      },
    ],
  })

  let insights: {
    executive_summary: string
    opportunities: MarketOpportunity[]
    threats: string[]
    action_items: MarketIntelligenceReport['action_items']
  } = {
    executive_summary: 'Анализ рынка выполнен на основе доступных данных.',
    opportunities: [],
    threats: [],
    action_items: [],
  }

  try {
    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      insights = JSON.parse(jsonMatch[0])
    }
  } catch {
    // keep defaults
  }

  return {
    generated_at: now,
    executive_summary: insights.executive_summary,
    pricing_positions: pricingPositions,
    opportunities: insights.opportunities ?? [],
    threats: insights.threats ?? [],
    action_items: insights.action_items ?? [],
    competitor_count: new Set(competitors.map(c => c.name)).size,
    data_points: competitors.length,
  }
}

// ---------------------------------------------------------------------------
// Persist report to DB
// ---------------------------------------------------------------------------

export async function saveMarketReport(report: MarketIntelligenceReport): Promise<string | null> {
  const supabase = await createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('market_reports')
    .insert({
      summary: report.executive_summary,
      insights: {
        pricing_positions: report.pricing_positions,
        opportunities: report.opportunities,
        threats: report.threats,
        action_items: report.action_items,
      },
      competitor_count: report.competitor_count,
      data_points: report.data_points,
    })
    .select('id')
    .single()

  if (error) {
    console.error('saveMarketReport error:', error)
    return null
  }
  return (data as { id: string }).id
}

// ---------------------------------------------------------------------------
// Weekly cron: fetch our prices + competitors, run analysis, save
// ---------------------------------------------------------------------------

export async function runWeeklyMarketIntelligence(): Promise<MarketIntelligenceReport> {
  const supabase = await createAdminClient()

  type CountryRow = { code: string; base_price: number; express_price: number }
  type CompetitorDbRow = { name: string; country_code: string | null; visa_type: string | null; price: number; source: string | null; notes: string | null }

  // Fetch our prices
  const { data: countries } = await supabase
    .from('countries')
    .select('code, base_price, express_price')
    .eq('is_active', true)

  // Fetch stored competitors (new table — cast via any until types are generated)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: competitorRows } = await (supabase as any)
    .from('market_competitors')
    .select('name, country_code, visa_type, price, source, notes')
    .order('recorded_at', { ascending: false })
    .limit(200)

  const ourPrices = ((countries ?? []) as CountryRow[]).map(c => ({
    country_code: c.code,
    base_price: c.base_price,
    express_price: c.express_price,
  }))

  const competitors: Competitor[] = ((competitorRows ?? []) as CompetitorDbRow[]).map(r => ({
    name: r.name,
    country_code: r.country_code ?? undefined,
    visa_type: r.visa_type ?? undefined,
    price: r.price,
    source: r.source ?? undefined,
    notes: r.notes ?? undefined,
  }))

  const report = await runMarketAnalysis(competitors, ourPrices)
  await saveMarketReport(report)
  return report
}
