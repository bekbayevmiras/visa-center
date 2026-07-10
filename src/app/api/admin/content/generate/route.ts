import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { generateContent, ContentType } from '@/lib/agents/content-generator'

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

const VALID_CONTENT_TYPES: ContentType[] = [
  'instagram_post',
  'telegram_post',
  'email_newsletter',
  'blog_article',
  'whatsapp_broadcast',
]

export async function POST(request: NextRequest) {
  const user = await checkAdmin()
  if (!user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  const body = await request.json() as {
    type: ContentType
    topic: string
    context?: {
      country?: string
      season?: string
      promotion?: string
      tone?: 'formal' | 'friendly' | 'urgent'
    }
  }

  const { type, topic, context } = body

  if (!type || !VALID_CONTENT_TYPES.includes(type)) {
    return NextResponse.json(
      { error: `Недопустимый тип контента. Допустимые: ${VALID_CONTENT_TYPES.join(', ')}` },
      { status: 400 }
    )
  }

  if (!topic) {
    return NextResponse.json({ error: 'Укажите тему (topic)' }, { status: 400 })
  }

  try {
    const content = await generateContent(type, topic, context)

    // Try to save to content_calendar table (may not exist)
    try {
      const supabase = createAdminClient()
      await (supabase as any)
        .from('content_calendar')
        .insert({
          type: content.type,
          title: content.title ?? null,
          body: content.body,
          hashtags: content.hashtags ?? null,
          meta_description: content.meta_description ?? null,
          suggested_image_prompt: content.suggested_image_prompt ?? null,
          publish_at: content.publish_at ?? null,
          created_at: new Date().toISOString(),
          created_by: user.id,
        })
    } catch (saveErr) {
      console.log('content_calendar table may not exist, skipping save:', saveErr)
    }

    return NextResponse.json({ ok: true, content })
  } catch (err) {
    console.error('POST /api/admin/content/generate error:', err)
    return NextResponse.json({ error: 'Ошибка генерации контента' }, { status: 500 })
  }
}
