import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { code } = await request.json()
  if (!code?.trim()) {
    return NextResponse.json({ error: 'Укажите реферальный код' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Find referral by code
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: referral } = await (admin as any)
    .from('referrals')
    .select('id, referrer_id, discount_percent')
    .eq('code', code.trim().toUpperCase())
    .single()

  if (!referral) {
    return NextResponse.json({ error: 'Реферальный код не найден' }, { status: 404 })
  }

  const ref = referral as { id: string; referrer_id: string; discount_percent: number }

  // Cannot use own code
  if (ref.referrer_id === user.id) {
    return NextResponse.json({ error: 'Нельзя использовать собственный реферальный код' }, { status: 400 })
  }

  // Check user hasn't already used a referral code
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existingUse } = await (admin as any)
    .from('referral_uses')
    .select('id')
    .eq('referred_user_id', user.id)
    .single()

  if (existingUse) {
    return NextResponse.json({ error: 'Вы уже использовали реферальный код' }, { status: 400 })
  }

  // Save referral use
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: insertError } = await (admin as any)
    .from('referral_uses')
    .insert({ referral_id: ref.id, referred_user_id: user.id })

  if (insertError) {
    console.error('referral_uses insert error:', insertError)
    return NextResponse.json({ error: 'Ошибка применения кода' }, { status: 500 })
  }

  // Increment uses_count using raw SQL increment
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin as any).rpc('increment_referral_uses', { referral_id: ref.id }).maybeSingle()
    .catch(() => {
      // fallback: best-effort increment, ignore errors
    })

  return NextResponse.json({ ok: true, discount_percent: ref.discount_percent })
}
