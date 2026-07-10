import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient } from '@/lib/supabase/server'
import { sendWhatsAppMessage } from '@/lib/whatsapp/client'

const client = new Anthropic()

const REVIEW_LINK = 'https://g.page/visakz/review'

export interface ReviewRequest {
  client_name: string
  country: string
  platform: 'google' | '2gis' | 'instagram' | 'whatsapp_testimonial'
}

export async function generateReviewRequestMessage(
  request: ReviewRequest
): Promise<string> {
  const platformMap = {
    google: 'Google Maps',
    '2gis': '2GIS',
    instagram: 'Instagram',
    whatsapp_testimonial: 'WhatsApp',
  }
  const platformName = platformMap[request.platform]

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    messages: [
      {
        role: 'user',
        content: `Напиши тёплое поздравительное сообщение для клиента визового центра VisaKZ, которому одобрили визу.
Имя клиента: ${request.client_name}
Страна: ${request.country}
Платформа для отзыва: ${platformName}
Ссылка на отзыв: ${REVIEW_LINK}

Требования:
- Поздравь с получением визы! Искренне и тепло.
- Попроси оставить отзыв на ${platformName}
- Включи ссылку ${REVIEW_LINK}
- Используй праздничные эмодзи 🎉🎊✈️
- На русском языке
- 3-4 предложения максимум
- Только текст сообщения, без пояснений`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return text.trim()
}

export async function processReviewRequests(): Promise<{
  sent: number
  errors: number
}> {
  const supabase = createAdminClient()
  let sent = 0
  let errors = 0

  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  // Query applications that were approved in the last 24h
  const { data: applications, error: appsError } = await (supabase as any)
    .from('applications')
    .select(`
      id,
      updated_at,
      status,
      user:users(id, full_name, phone),
      country:countries(name_ru)
    `)
    .eq('status', 'approved')
    .gte('updated_at', yesterday.toISOString())
    .lte('updated_at', now.toISOString())

  if (appsError) {
    console.error('processReviewRequests: error fetching applications:', appsError)
    return { sent: 0, errors: 1 }
  }

  type ApplicationRow = {
    id: string
    updated_at: string
    status: string
    user: { id: string; full_name: string; phone: string } | null
    country: { name_ru: string } | null
  }

  const appsData = (applications ?? []) as ApplicationRow[]

  for (const app of appsData) {
    const user = app.user
    if (!user?.phone) continue

    // Check if we already sent a review request for this application
    const { data: existingMessages } = await (supabase as any)
      .from('messages')
      .select('id')
      .eq('tag', 'review_request')
      .eq('application_id', app.id)
      .limit(1)

    if (existingMessages && existingMessages.length > 0) {
      continue // Already sent review request for this application
    }

    try {
      const countryName = app.country?.name_ru ?? 'желаемую страну'
      const clientName = user.full_name ?? 'Клиент'

      const messageText = await generateReviewRequestMessage({
        client_name: clientName,
        country: countryName,
        platform: 'google',
      })

      // Send via WhatsApp if configured
      if (process.env.WHATSAPP_TOKEN) {
        await sendWhatsAppMessage(user.phone, messageText)
      } else {
        console.log(`[ReviewCollector] WhatsApp not configured. Would send to ${user.phone}:`, messageText)
      }

      // Log the message
      const sentAt = new Date().toISOString()
      await (supabase as any)
        .from('messages')
        .insert({
          application_id: app.id,
          direction: 'outbound',
          channel: 'whatsapp',
          content: messageText,
          tag: 'review_request',
          sent_at: sentAt,
          created_at: sentAt,
        })

      sent++
    } catch (err) {
      console.error(`processReviewRequests: error processing application ${app.id}:`, err)
      errors++
    }
  }

  return { sent, errors }
}
