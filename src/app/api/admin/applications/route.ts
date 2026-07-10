import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'

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

export async function GET() {
  const user = await checkAdmin()
  if (!user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const { data, error } = await (supabase as any)
    .from('applications')
    .select(`
      *,
      country:countries(id, name_ru, flag_emoji, code),
      user:users(id, full_name, email, phone),
      visa_type:visa_types(id, name_ru, type_code)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('GET /api/admin/applications error:', error)
    return NextResponse.json({ error: 'Ошибка получения данных' }, { status: 500 })
  }

  return NextResponse.json({ data: data ?? [] })
}

export async function PATCH(request: NextRequest) {
  const user = await checkAdmin()
  if (!user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  const body = await request.json()
  const { id, status } = body as { id: string; status: string }

  if (!id || !status) {
    return NextResponse.json({ error: 'Укажите id и status' }, { status: 400 })
  }

  const validStatuses = [
    'new', 'consultation', 'docs_collection', 'docs_review',
    'docs_ready', 'submitted', 'in_progress', 'approved', 'rejected', 'closed',
  ]
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Недопустимый статус' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { error } = await (supabase as any)
    .from('applications')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('PATCH /api/admin/applications error:', error)
    return NextResponse.json({ error: 'Ошибка обновления' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
