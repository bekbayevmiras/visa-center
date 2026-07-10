import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { generateDailyReport } from '@/lib/agents/agent-orchestrator'

// GET — latest daily report
export async function GET() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createAdminClient()) as any
  const { data, error } = await supabase
    .from('agent_daily_reports')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(7)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ reports: data })
}

// POST — generate report now (manual trigger)
export async function POST() {
  try {
    const report = await generateDailyReport()
    return NextResponse.json({ report })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
