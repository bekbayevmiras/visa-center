import { NextResponse } from 'next/server'
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

  const { data: leadsRaw, error } = await (supabase as any)
    .from('leads')
    .select('id, name, phone, source, country_interest, status, notes, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('[leads/list] fetch error:', error)
    return NextResponse.json({ error: 'Ошибка загрузки лидов' }, { status: 500 })
  }

  // Parse AI score from notes JSON if present
  const leads = (leadsRaw ?? []).map((lead: {
    id: string
    name: string | null
    phone: string | null
    source: string
    country_interest: string | null
    status: string
    notes: string | null
    created_at: string
  }) => {
    let ai_category: string | null = null
    let ai_score: number | null = null
    if (lead.notes) {
      try {
        const parsed = JSON.parse(lead.notes)
        ai_category = parsed.ai_category ?? null
        ai_score = parsed.ai_score ?? null
      } catch {
        // notes is plain text, not JSON
      }
    }
    return {
      id: lead.id,
      name: lead.name,
      phone: lead.phone,
      source: lead.source,
      country_interest: lead.country_interest,
      status: lead.status,
      ai_category,
      ai_score,
      created_at: lead.created_at,
    }
  })

  return NextResponse.json({ ok: true, leads })
}
