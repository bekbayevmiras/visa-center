import { NextRequest, NextResponse } from 'next/server'
import { generateCFOReport, sendCFOReport } from '@/lib/agents/cfo-agent'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const email = process.env.ADMIN_EMAIL ?? 'bekbayevmiras@gmail.com'
    const report = await generateCFOReport()
    await sendCFOReport(email)

    console.log('[cron:cfo-report] Отчёт отправлен на', email)

    return NextResponse.json({
      ok: true,
      date: report.date,
      revenue_today: report.revenue.today,
      alerts_count: report.alerts.length,
      sent_to: email,
    })
  } catch (err) {
    console.error('[cron:cfo-report] error:', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
