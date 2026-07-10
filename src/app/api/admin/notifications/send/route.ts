import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { sendNotification, NotificationTemplate } from '@/lib/agents/notification-agent'

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

const VALID_TEMPLATES: NotificationTemplate[] = [
  'application_received',
  'documents_required',
  'application_approved',
  'application_rejected',
  'appointment_reminder',
  'status_update',
]

export async function POST(request: NextRequest) {
  const adminUser = await checkAdmin()
  if (!adminUser) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  let body: { application_id?: string; template?: string; custom_message?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Неверный формат запроса' }, { status: 400 })
  }

  const { application_id, template, custom_message } = body

  if (!application_id || !template) {
    return NextResponse.json(
      { error: 'Укажите application_id и template' },
      { status: 400 }
    )
  }

  if (!VALID_TEMPLATES.includes(template as NotificationTemplate)) {
    return NextResponse.json(
      { error: `Недопустимый шаблон. Доступные: ${VALID_TEMPLATES.join(', ')}` },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()

  // Load application with user and country details
  const { data: appRaw, error: appError } = await (supabase as any)
    .from('applications')
    .select(`
      id,
      application_number,
      status,
      appointment_date,
      appointment_location,
      ai_recommendations,
      country:countries(name_ru),
      visa_type:visa_types(name_ru),
      user:users(id, full_name, email)
    `)
    .eq('id', application_id)
    .single()

  if (appError || !appRaw) {
    console.error('[notifications/send] application fetch error:', appError)
    return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 })
  }

  const app = appRaw as {
    id: string
    application_number: string
    status: string
    appointment_date: string | null
    appointment_location: string | null
    ai_recommendations: string | null
    country: { name_ru: string } | null
    visa_type: { name_ru: string } | null
    user: { id: string; full_name: string; email: string | null } | null
  }

  const userEmail = app.user?.email
  if (!userEmail) {
    return NextResponse.json(
      { error: 'У пользователя не указан email' },
      { status: 422 }
    )
  }

  const notificationData = {
    client_name: app.user?.full_name ?? 'Клиент',
    application_id: app.application_number,
    country: app.country?.name_ru,
    visa_type: app.visa_type?.name_ru,
    appointment_date: app.appointment_date ?? undefined,
    status: app.status,
    custom_message: custom_message ?? app.ai_recommendations ?? undefined,
  }

  const result = await sendNotification(
    userEmail,
    template as NotificationTemplate,
    notificationData
  )

  // Log to application_history (best-effort; table may not exist in all envs)
  try {
    await (supabase as any)
      .from('application_history')
      .insert({
        application_id,
        action: `notification_sent:${template}`,
        performed_by: adminUser.id,
        details: {
          template,
          email_sent: result.email_sent,
          email_id: result.email_id,
          error: result.error,
        },
        created_at: new Date().toISOString(),
      })
  } catch (histErr) {
    // Non-fatal: log and continue
    console.warn('[notifications/send] history insert failed:', histErr)
  }

  if (!result.email_sent) {
    return NextResponse.json(
      { error: result.error ?? 'Не удалось отправить письмо', email_sent: false },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true, email_sent: true, email_id: result.email_id })
}
