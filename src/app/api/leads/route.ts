import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const { name, phone } = await request.json()

  if (!name?.trim() || !phone?.trim()) {
    return NextResponse.json({ error: 'Заполните имя и телефон' }, { status: 400 })
  }

  const supabase = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('leads')
    .insert({ name: name.trim(), phone: phone.trim(), source: 'landing_cta', status: 'new' })

  if (error) {
    console.error('leads insert error:', error)
    return NextResponse.json({ error: 'Ошибка сохранения' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
