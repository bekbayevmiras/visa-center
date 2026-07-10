import { NextRequest, NextResponse } from 'next/server'
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await checkAdmin()
  if (!user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  const { id } = await params

  const adminClient = createAdminClient()

  // Fetch the payment to get amount and application_id
  const { data: payment, error: fetchError } = await (adminClient as any)
    .from('payments')
    .select('id, application_id, amount, payment_method, provider')
    .eq('id', id)
    .single()

  if (fetchError || !payment) {
    return NextResponse.json({ error: 'Платёж не найден' }, { status: 404 })
  }

  // Update payment status to paid
  const { data: updatedPayment, error: paymentError } = await (adminClient as any)
    .from('payments')
    .update({
      status: 'paid',
      completed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (paymentError) {
    console.error('PATCH /api/admin/payments/[id]/confirm payment error:', paymentError)
    return NextResponse.json({ error: 'Ошибка обновления платежа' }, { status: 500 })
  }

  // Update application payment_status and payment_amount
  const { error: appError } = await (adminClient as any)
    .from('applications')
    .update({
      payment_status: 'paid',
      payment_amount: payment.amount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', payment.application_id)

  if (appError) {
    console.error('PATCH /api/admin/payments/[id]/confirm application error:', appError)
    return NextResponse.json({ error: 'Ошибка обновления заявки' }, { status: 500 })
  }

  // Add to application_history
  const providerLabel = payment.provider === 'kaspi' ? 'Kaspi Pay' : 'Банковская карта'
  const historyNote = `Оплата подтверждена — ${payment.amount.toLocaleString('ru')} ₸ (${providerLabel})`
  await (adminClient as any)
    .from('application_history')
    .insert({
      application_id: payment.application_id,
      changed_by: user.id,
      note: historyNote,
    })

  return NextResponse.json({ ok: true, payment: updatedPayment })
}
