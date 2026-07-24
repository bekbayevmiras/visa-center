import { NextRequest, NextResponse } from 'next/server'
import { processPostSaleSequences } from '@/lib/agents/postsale-agent'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const result = await processPostSaleSequences()
    console.log('[cron:postsale]', result)
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error('[cron:postsale] error:', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
