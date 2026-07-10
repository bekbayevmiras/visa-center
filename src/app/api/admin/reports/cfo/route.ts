import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateCFOReport } from '@/lib/agents/cfo-agent'

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

  try {
    const report = await generateCFOReport()
    return NextResponse.json({ ok: true, report })
  } catch (err) {
    console.error('[admin/reports/cfo] error:', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
