import { NextRequest, NextResponse } from 'next/server'
import { scoreAllLeads } from '@/lib/agents/lead-scorer'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    await scoreAllLeads()
    console.log('[cron:lead-score] completed')
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[cron:lead-score] error:', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
