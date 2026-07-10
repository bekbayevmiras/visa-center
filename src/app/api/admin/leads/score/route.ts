import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { scoreLead, scoreAllLeads } from '@/lib/agents/lead-scorer'

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
  const adminUser = await checkAdmin()
  if (!adminUser) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  let body: { lead_id?: string }
  try {
    body = await request.json()
  } catch {
    body = {}
  }

  const { lead_id } = body

  // Bulk re-score all leads
  if (!lead_id) {
    await scoreAllLeads()
    return NextResponse.json({ ok: true, message: 'Все лиды оценены и обновлены' })
  }

  // Score a single lead
  const supabase = createAdminClient()

  const { data: leadRaw, error: leadError } = await (supabase as any)
    .from('leads')
    .select('id, source, country_interest, status, notes, created_at, updated_at')
    .eq('id', lead_id)
    .single()

  if (leadError || !leadRaw) {
    console.error('[leads/score] lead fetch error:', leadError)
    return NextResponse.json({ error: 'Лид не найден' }, { status: 404 })
  }

  const lead = leadRaw as {
    id: string
    source?: string
    country_interest?: string
    status?: string
    notes?: string | null
    created_at?: string
    updated_at?: string
  }

  // Fetch conversation messages for this lead's whatsapp/phone
  let messages: string[] = []
  try {
    const { data: msgRaw } = await (supabase as any)
      .from('messages')
      .select('content, direction')
      .eq('user_id', lead.id)
      .order('created_at', { ascending: true })
      .limit(50)

    if (msgRaw && Array.isArray(msgRaw)) {
      messages = (msgRaw as Array<{ content: string; direction: string }>)
        .map(m => `[${m.direction === 'inbound' ? 'Клиент' : 'Менеджер'}]: ${m.content}`)
    }
  } catch {
    // Non-fatal — scoring works without messages
  }

  const score = await scoreLead({
    source: lead.source,
    country_interest: lead.country_interest,
    messages,
    created_at: lead.created_at,
    last_contact_at: lead.updated_at,
    status: lead.status,
  })

  // Persist score to DB
  const scorePayload = {
    ai_score: score.total_score,
    ai_category: score.category,
    ai_breakdown: score.breakdown,
    ai_next_action: score.next_action,
    ai_priority_rank: score.priority_rank,
    scored_at: new Date().toISOString(),
  }

  const { error: updateError } = await (supabase as any)
    .from('leads')
    .update({
      notes: JSON.stringify(scorePayload),
      updated_at: new Date().toISOString(),
    })
    .eq('id', lead_id)

  if (updateError) {
    console.error('[leads/score] update error:', updateError)
    return NextResponse.json({ error: 'Ошибка сохранения оценки' }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    lead_id,
    score,
  })
}
