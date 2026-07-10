import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const body = await request.json()
  const { name, phone, country, purpose, when_traveling, source, utm_source, utm_medium, utm_campaign } = body

  if (!name?.trim() || !phone?.trim()) {
    return NextResponse.json({ error: 'Заполните имя и телефон' }, { status: 400 })
  }

  const notes = [
    purpose && `Цель: ${purpose}`,
    when_traveling && `Когда: ${when_traveling}`,
  ].filter(Boolean).join('; ') || null

  const supabase = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('leads')
    .insert({
      name: name.trim(),
      phone: phone.trim(),
      country_interest: country ?? null,
      source: source ?? 'landing_cta',
      status: 'new',
      notes,
      utm_source: utm_source ?? null,
      utm_medium: utm_medium ?? null,
      utm_campaign: utm_campaign ?? null,
    })

  if (error) {
    console.error('leads insert error:', error)
    return NextResponse.json({ error: 'Ошибка сохранения' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
