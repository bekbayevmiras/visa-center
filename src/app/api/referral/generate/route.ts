import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()

  // Check if user already has a referral code
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (admin as any)
    .from('referrals')
    .select('code')
    .eq('referrer_id', user.id)
    .single()

  if (existing) {
    return NextResponse.json({ code: (existing as { code: string }).code })
  }

  // Get user name to build code prefix
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (admin as any)
    .from('users')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const name: string = (profile as { full_name: string } | null)?.full_name ?? 'USER'
  const prefix = name.replace(/\s+/g, '').slice(0, 4).toUpperCase()
  const digits = Math.floor(1000 + Math.random() * 9000).toString()
  const code = `${prefix}${digits}`

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from('referrals')
    .insert({ referrer_id: user.id, code })

  if (error) {
    console.error('referral insert error:', error)
    return NextResponse.json({ error: 'Ошибка создания кода' }, { status: 500 })
  }

  return NextResponse.json({ code })
}
