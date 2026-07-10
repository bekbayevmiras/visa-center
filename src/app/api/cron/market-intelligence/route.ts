import { NextRequest, NextResponse } from 'next/server'
import { runWeeklyMarketIntelligence } from '@/lib/agents/market-intelligence'

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const report = await runWeeklyMarketIntelligence()
    return NextResponse.json({
      success: true,
      competitor_count: report.competitor_count,
      data_points: report.data_points,
      opportunities: report.opportunities.length,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    console.error('market-intelligence cron error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
