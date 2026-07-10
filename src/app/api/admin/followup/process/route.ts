import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { processFollowUps } from '@/lib/agents/followup-agent'

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

export async function POST() {
  const user = await checkAdmin()
  if (!user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  try {
    const stats = await processFollowUps()
    return NextResponse.json({ ok: true, stats })
  } catch (err) {
    console.error('POST /api/admin/followup/process error:', err)
    return NextResponse.json({ error: 'Ошибка обработки follow-up' }, { status: 500 })
  }
}
