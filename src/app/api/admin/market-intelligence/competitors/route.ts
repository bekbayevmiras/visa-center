import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = async () => (await createAdminClient()) as any

// GET — list saved competitors
export async function GET() {
  const supabase = await db()
  const { data, error } = await supabase
    .from('market_competitors')
    .select('*')
    .order('recorded_at', { ascending: false })
    .limit(500)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ competitors: data })
}

// POST — add competitor entry
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, country_code, visa_type, price, source, notes } = body

  if (!name || !price) {
    return NextResponse.json({ error: 'name и price обязательны' }, { status: 400 })
  }

  const supabase = await db()
  const { data, error } = await supabase
    .from('market_competitors')
    .insert({ name, country_code: country_code || null, visa_type: visa_type ?? 'tourist', price, source: source ?? 'manual', notes: notes || null })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ competitor: data })
}

// DELETE — remove entry
export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id обязателен' }, { status: 400 })

  const supabase = await db()
  const { error } = await supabase.from('market_competitors').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
