import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateContentCalendar } from '@/lib/agents/content-generator'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profileRaw } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  const profile = profileRaw as { is_admin: boolean } | null
  if (!profile?.is_admin) return null
  return user
}

export async function POST(request: NextRequest) {
  const user = await checkAdmin()
  if (!user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  const body = await request.json() as {
    month: string
    posts_per_week: number
  }

  const { month, posts_per_week } = body

  if (!month) {
    return NextResponse.json({ error: 'Укажите месяц (month), например "Июль 2026"' }, { status: 400 })
  }

  if (!posts_per_week || posts_per_week < 1 || posts_per_week > 14) {
    return NextResponse.json(
      { error: 'Укажите количество постов в неделю (posts_per_week) от 1 до 14' },
      { status: 400 }
    )
  }

  try {
    const calendar = await generateContentCalendar(month, posts_per_week)
    return NextResponse.json({ ok: true, calendar, total: calendar.length })
  } catch (err) {
    console.error('POST /api/admin/content/calendar error:', err)
    return NextResponse.json({ error: 'Ошибка генерации контент-плана' }, { status: 500 })
  }
}
