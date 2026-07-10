import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { runMarketAnalysis, saveMarketReport } from '@/lib/agents/market-intelligence'
import type { Competitor } from '@/lib/agents/market-intelligence'

export async function POST() {
  const supabase = await createAdminClient()

  type CountryRow = { code: string; base_price: number; express_price: number }
  type CompetitorDbRow = { name: string; country_code: string | null; visa_type: string | null; price: number; source: string | null; notes: string | null }

  // Fetch our prices
  const { data: countries, error: cErr } = await supabase
    .from('countries')
    .select('code, base_price, express_price')
    .eq('is_active', true)
  if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 })

  // Fetch stored competitors (new table — cast via any until types are generated)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: competitorRows, error: compErr } = await (supabase as any)
    .from('market_competitors')
    .select('name, country_code, visa_type, price, source, notes')
    .order('recorded_at', { ascending: false })
    .limit(200)
  if (compErr) return NextResponse.json({ error: (compErr as { message: string }).message }, { status: 500 })

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
  const reportId = await saveMarketReport(report)

  return NextResponse.json({ report, report_id: reportId })
}
