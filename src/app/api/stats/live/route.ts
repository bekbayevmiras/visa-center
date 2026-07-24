import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const revalidate = 60 // Cache 60 seconds

export async function GET() {
  try {
    const supabase = createAdminClient()
    const today = new Date().toISOString().split('T')[0]

    const [appsTodayRes, recentApprovedRes] = await Promise.all([
      // Сколько заявок создано сегодня
      (supabase as any)
        .from('applications')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', today),

      // Последние одобренные заявки для LiveActivity (реальные события)
      (supabase as any)
        .from('applications')
        .select(`
          id,
          status,
          is_express,
          updated_at,
          country:countries(name_ru, flag_emoji),
          user:users(full_name)
        `)
        .in('status', ['approved', 'submitted', 'docs_collection'])
        .order('updated_at', { ascending: false })
        .limit(10),
    ])

    const appsToday = appsTodayRes.count ?? 0

    type ActivityRow = {
      id: string
      status: string
      is_express: boolean
      updated_at: string
      country: { name_ru: string; flag_emoji: string | null } | null
      user: { full_name: string } | null
    }

    const activities = ((recentApprovedRes.data ?? []) as ActivityRow[]).map(row => {
      const name = row.user?.full_name
        ? row.user.full_name.split(' ')[0] // только имя без фамилии
        : 'Клиент'
      const country = row.country?.name_ru ?? 'страну'
      const flag = row.country?.flag_emoji ?? '🌍'
      const minsAgo = Math.max(1, Math.round((Date.now() - new Date(row.updated_at).getTime()) / 60000))
      const timeLabel = minsAgo < 60
        ? `${minsAgo} мин назад`
        : `${Math.round(minsAgo / 60)} ч назад`

      let text: string
      if (row.status === 'approved') {
        text = `${name} получил${name.endsWith('а') ? 'а' : ''} визу в ${flag} ${country}`
      } else if (row.is_express) {
        text = `${name} оформил${name.endsWith('а') ? 'а' : ''} срочную визу в ${flag} ${country}`
      } else {
        text = `Новая заявка на ${flag} ${country} принята`
      }

      return { text, time: timeLabel }
    })

    return NextResponse.json({ appsToday, activities })
  } catch {
    // Возвращаем нейтральный ответ при ошибке
    return NextResponse.json({ appsToday: 0, activities: [] })
  }
}
