import { NextRequest, NextResponse } from 'next/server'
import { processReviewRequests } from '@/lib/agents/review-collector'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const result = await processReviewRequests()
    console.log('[cron:reviews]', result)
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error('[cron:reviews] error:', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
