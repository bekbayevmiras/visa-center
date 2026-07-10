import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = async () => (await createAdminClient()) as any

// GET — all agent configs
export async function GET() {
  const supabase = await db()
  const { data, error } = await supabase
    .from('agent_configs')
    .select('*')
    .order('agent_name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ configs: data })
}

// PATCH — update one config (is_active, goal, config)
export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { agent_name, is_active, goal, config } = body

  if (!agent_name) return NextResponse.json({ error: 'agent_name обязателен' }, { status: 400 })

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (is_active !== undefined) update.is_active = is_active
  if (goal !== undefined) update.goal = goal
  if (config !== undefined) update.config = config

  const supabase = await db()
  const { data, error } = await supabase
    .from('agent_configs')
    .update(update)
    .eq('agent_name', agent_name)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ config: data })
}
