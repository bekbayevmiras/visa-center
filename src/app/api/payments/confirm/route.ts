import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  const body = await request.json() as {
    application_id: string
    amount: number
    method: 'kaspi' | 'card'
  }
  const { application_id, amount, method } = body

  if (!application_id || !amount || !method) {
    return NextResponse.json({ error: 'Укажите application_id, amount и method' }, { status: 400 })
  }

  // Verify the application belongs to the current user
  const { data: app, error: appError } = await (supabase as any)
    .from('applications')
    .select('id, user_id')
    .eq('id', application_id)
    .single()

  if (appError || !app) {
    return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 })
  }

  if (app.user_id !== user.id) {
    return NextResponse.json({ error: 'Нет доступа к данной заявке' }, { status: 403 })
  }

  // Use admin client to insert payment (bypasses RLS)
  const adminClient = createAdminClient()
  const { data: payment, error: paymentError } = await (adminClient as any)
    .from('payments')
    .insert({
      application_id,
      user_id: user.id,
      amount,
      currency: 'KZT',
      payment_method: method,
      provider: method === 'kaspi' ? 'kaspi' : 'card',
      status: 'pending',
    })
    .select()
    .single()

  if (paymentError) {
    console.error('POST /api/payments/confirm error:', paymentError)
    return NextResponse.json({ error: 'Ошибка создания платежа' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, payment_id: payment.id })
}
