import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

type RouteContext = {
  params: Promise<{ userId: string }>
}

// POST — send admin reply
export async function POST(request: NextRequest, context: RouteContext) {
  const { userId } = await context.params

  // Verify admin auth
  const supabaseAuth = await createClient()
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profileRaw } = await supabaseAuth
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  const profile = profileRaw as { is_admin: boolean } | null
  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const content: string = body.content?.trim()

  if (!content) {
    return NextResponse.json({ error: 'content is required' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: inserted, error } = await (supabase as any)
    .from('messages')
    .insert({
      user_id: userId,
      channel: 'internal',
      direction: 'outbound',
      content,
      sent_by: 'manager',
      is_read: true,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: inserted })
}

// PATCH — mark all inbound messages for this user as read
export async function PATCH(_request: NextRequest, context: RouteContext) {
  const { userId } = await context.params

  // Verify admin auth
  const supabaseAuth = await createClient()
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profileRaw } = await supabaseAuth
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  const profile = profileRaw as { is_admin: boolean } | null
  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = createAdminClient()

  const { error } = await (supabase as any)
    .from('messages')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('direction', 'inbound')
    .eq('channel', 'internal')
    .eq('is_read', false)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
