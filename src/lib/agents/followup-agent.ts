import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient } from '@/lib/supabase/server'
import { sendWhatsAppMessage } from '@/lib/whatsapp/client'
import { sendNotification } from './notification-agent'

const client = new Anthropic()

export type SequenceDay = 1 | 3 | 7 | 14 | 30

export interface FollowUpMessage {
  sequence_day: SequenceDay
  channel: 'whatsapp' | 'email'
  message: string
  sent_at?: string
}

export async function generateFollowUpMessage(
  lead: {
    name: string
    country_interest?: string
    source?: string
    created_at: string
    last_message?: string
  },
  sequence_day: SequenceDay
): Promise<string> {
  const dayPrompts: Record<SequenceDay, string> = {
    1: `Напиши дружелюбное follow-up сообщение для клиента визового центра VisaKZ.
Это первое напоминание через 24 часа после обращения.
Клиент: ${lead.name}
${lead.country_interest ? `Интересует виза в: ${lead.country_interest}` : ''}
${lead.last_message ? `Последнее сообщение клиента: "${lead.last_message}"` : ''}

Стиль: Тёплое, персональное, напоминание что мы готовы помочь. Упомяни страну если есть. 2-3 предложения максимум. С эмодзи. На русском языке. Только текст сообщения, без пояснений.`,

    3: `Напиши follow-up сообщение для клиента визового центра VisaKZ.
Это второе напоминание на 3-й день. Предложи специальные условия.
Клиент: ${lead.name}
${lead.country_interest ? `Интересует виза в: ${lead.country_interest}` : ''}

Стиль: Немного более настойчивое, упомяни схему оплаты 30/70 (платишь только 30% сейчас, 70% после получения визы). 2-3 предложения. С эмодзи. На русском языке. Только текст сообщения, без пояснений.`,

    7: `Напиши follow-up сообщение для клиента визового центра VisaKZ.
Это третье напоминание на 7-й день. Предложи бесплатную консультацию.
Клиент: ${lead.name}
${lead.country_interest ? `Интересует виза в: ${lead.country_interest}` : ''}

Стиль: Деликатная срочность, предложение бесплатной консультации. Упомяни что наш AI-ассистент проверяет документы за 30 секунд. 2-3 предложения. С эмодзи. На русском языке. Только текст сообщения, без пояснений.`,

    14: `Напиши follow-up сообщение для клиента визового центра VisaKZ.
Это четвёртое напоминание на 14-й день. Поделись историей успеха клиента.
Клиент: ${lead.name}
${lead.country_interest ? `Интересует виза в: ${lead.country_interest}` : ''}

Стиль: Социальное доказательство — упомяни что на этой неделе уже помогли нескольким клиентам получить визу. Добавь конкретную выгоду (98% одобрений, возврат средств при отказе). 2-3 предложения. С эмодзи. На русском языке. Только текст сообщения, без пояснений.`,

    30: `Напиши финальное follow-up сообщение для клиента визового центра VisaKZ.
Это последнее напоминание на 30-й день. Предложи альтернативу или новый сезон.
Клиент: ${lead.name}
${lead.country_interest ? `Интересует виза в: ${lead.country_interest}` : ''}

Стиль: Ненавязчивое последнее касание. Упомяни что планы могут измениться и мы всегда готовы помочь. Если была страна — предложи что для неё сейчас хороший сезон. Предложи написать если появятся вопросы. 2-3 предложения. С эмодзи. На русском языке. Только текст сообщения, без пояснений.`,
  }

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    messages: [{ role: 'user', content: dayPrompts[sequence_day] }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return text.trim()
}

export async function processFollowUps(): Promise<{
  processed: number
  sent: number
  errors: number
}> {
  const supabase = createAdminClient()
  let processed = 0
  let sent = 0
  let errors = 0

  const now = new Date()

  const { data: leads, error: leadsError } = await (supabase as any)
    .from('leads')
    .select('*')
    .in('status', ['new', 'contacted'])

  if (leadsError) {
    console.error('processFollowUps: error fetching leads:', leadsError)
    return { processed: 0, sent: 0, errors: 1 }
  }

  const leadsData = (leads ?? []) as Array<{
    id: string
    name: string
    whatsapp_id: string | null
    email?: string | null
    country_interest?: string
    source?: string
    created_at: string
    last_message?: string
    status: string
  }>

  const SEQUENCE_DAYS: SequenceDay[] = [1, 3, 7, 14, 30]

  for (const lead of leadsData) {
    const createdAt = new Date(lead.created_at)
    const diffDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)

    // Определяем какой день последовательности
    let sequenceDay: SequenceDay | null = null
    for (const day of SEQUENCE_DAYS) {
      if (diffDays >= day && diffDays < day + 1) {
        sequenceDay = day
        break
      }
    }

    if (!sequenceDay) continue

    // Проверяем, не отправляли ли уже этот день
    const { data: existingMessages } = await (supabase as any)
      .from('messages')
      .select('id')
      .eq('tag', `followup_day_${sequenceDay}`)
      .limit(1)

    // Также проверяем по lead_id если есть
    if (existingMessages && existingMessages.length > 0) continue

    processed++

    try {
      const messageText = await generateFollowUpMessage(
        {
          name: lead.name ?? 'Клиент',
          country_interest: lead.country_interest,
          source: lead.source,
          created_at: lead.created_at,
          last_message: lead.last_message,
        },
        sequenceDay
      )

      const sentAt = new Date().toISOString()
      let channelUsed: 'whatsapp' | 'email' = 'whatsapp'

      if (lead.whatsapp_id) {
        // Основной канал — WhatsApp
        if (process.env.WHATSAPP_TOKEN) {
          await sendWhatsAppMessage(lead.whatsapp_id, messageText)
        } else {
          console.log(`[FollowUp] WhatsApp not configured. Would send to ${lead.whatsapp_id}:`, messageText)
        }
        channelUsed = 'whatsapp'
      } else if (lead.email) {
        // Fallback — email для лидов без WhatsApp
        await sendNotification(lead.email, 'status_update', {
          client_name: lead.name ?? 'Клиент',
          country: lead.country_interest,
          custom_message: messageText,
        })
        channelUsed = 'email'
        console.log(`[FollowUp] Sent email fallback to ${lead.email} (no WhatsApp)`)
      } else {
        console.log(`[FollowUp] No contact method for lead ${lead.id}, skipping`)
        processed--
        continue
      }

      await (supabase as any)
        .from('messages')
        .insert({
          lead_id: lead.id,
          direction: 'outbound',
          channel: channelUsed,
          content: messageText,
          tag: `followup_day_${sequenceDay}`,
          sent_at: sentAt,
          created_at: sentAt,
        })

      if (lead.status === 'new') {
        await (supabase as any)
          .from('leads')
          .update({ status: 'contacted', updated_at: sentAt })
          .eq('id', lead.id)
      }

      sent++
    } catch (err) {
      console.error(`processFollowUps: error processing lead ${lead.id}:`, err)
      errors++
    }
  }

  return { processed, sent, errors }
}
