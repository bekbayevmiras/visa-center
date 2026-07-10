import { NextRequest, NextResponse } from 'next/server'
import { generateDailyReport } from '@/lib/agents/agent-orchestrator'

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const report = await generateDailyReport()
    return NextResponse.json({
      success: true,
      date: report.date,
      conversion_delta: report.conversion_delta,
      agents_ran: report.agents_ran.length,
      bottlenecks: report.bottlenecks.length,
      wins: report.wins.length,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    console.error('daily-orchestrator cron error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
