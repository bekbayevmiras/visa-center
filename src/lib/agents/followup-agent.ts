import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient } from '@/lib/supabase/server'
import { sendWhatsAppMessage } from '@/lib/whatsapp/client'

const client = new Anthropic()

export interface FollowUpMessage {
  sequence_day: 1 | 3 | 7
  channel: 'whatsapp'
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
  sequence_day: 1 | 3 | 7
): Promise<string> {
  const dayPrompts: Record<1 | 3 | 7, string> = {
    1: `Напиши дружелюбное follow-up сообщение для клиента визового центра VisaKZ.
Это первое напоминание через 24 часа после обращения.
Клиент: ${lead.name}
${lead.country_interest ? `Интересует виза в: ${lead.country_interest}` : ''}
${lead.last_message ? `Последнее сообщение клиента: "${lead.last_message}"` : ''}

Стиль: Тёплое, персональное, напоминание что мы готовы помочь. Упомяни страну если есть. 2-3 предложения максимум. С эмодзи. На русском языке. Только текст сообщения, без пояснений.`,
    3: `Напиши follow-up сообщение для клиента визового центра VisaKZ.
Это второе напоминание на 3-й день. Предложи специальные условия или упомяни дедлайн.
Клиент: ${lead.name}
${lead.country_interest ? `Интересует виза в: ${lead.country_interest}` : ''}

Стиль: Немного более настойчивое, с упоминанием специального предложения (например, быстрое оформление, помощь с документами). 2-3 предложения. С эмодзи. На русском языке. Только текст сообщения, без пояснений.`,
    7: `Напиши последнее follow-up сообщение для клиента визового центра VisaKZ.
Это финальное напоминание на 7-й день. Создай ощущение срочности, предложи бесплатную консультацию.
Клиент: ${lead.name}
${lead.country_interest ? `Интересует виза в: ${lead.country_interest}` : ''}

Стиль: Деликатная срочность, предложение бесплатной консультации как последний шанс. 2-3 предложения. С эмодзи. На русском языке. Только текст сообщения, без пояснений.`,
  }

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content: dayPrompts[sequence_day],
      },
    ],
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

  // Query leads with status 'new' or 'contacted' that have whatsapp_id
  const { data: leads, error: leadsError } = await (supabase as any)
    .from('leads')
    .select('*')
    .in('status', ['new', 'contacted'])
    .not('whatsapp_id', 'is', null)

  if (leadsError) {
    console.error('processFollowUps: error fetching leads:', leadsError)
    return { processed: 0, sent: 0, errors: 1 }
  }

  const leadsData = (leads ?? []) as Array<{
    id: string
    name: string
    whatsapp_id: string
    country_interest?: string
    source?: string
    created_at: string
    last_message?: string
    status: string
  }>

  for (const lead of leadsData) {
    const createdAt = new Date(lead.created_at)
    const diffMs = now.getTime() - createdAt.getTime()
    const diffDays = diffMs / (1000 * 60 * 60 * 24)

    // Determine which sequence day applies
    let sequenceDay: 1 | 3 | 7 | null = null
    if (diffDays >= 1 && diffDays < 2) {
      sequenceDay = 1
    } else if (diffDays >= 3 && diffDays < 4) {
      sequenceDay = 3
    } else if (diffDays >= 7 && diffDays < 8) {
      sequenceDay = 7
    }

    if (!sequenceDay) continue

    // Check if we already sent a follow-up for this day
    const { data: existingMessages } = await (supabase as any)
      .from('messages')
      .select('id')
      .eq('lead_id', lead.id)
      .eq('tag', `followup_day_${sequenceDay}`)
      .limit(1)

    if (existingMessages && existingMessages.length > 0) {
      continue // Already sent for this day
    }

    processed++

    try {
      // Generate personalized message
      const messageText = await generateFollowUpMessage(
        {
          name: lead.name,
          country_interest: lead.country_interest,
          source: lead.source,
          created_at: lead.created_at,
          last_message: lead.last_message,
        },
        sequenceDay
      )

      // Send via WhatsApp if configured
      if (process.env.WHATSAPP_TOKEN) {
        await sendWhatsAppMessage(lead.whatsapp_id, messageText)
      } else {
        console.log(`[FollowUp] WhatsApp not configured. Would send to ${lead.whatsapp_id}:`, messageText)
      }

      // Log the message
      const sentAt = new Date().toISOString()
      await (supabase as any)
        .from('messages')
        .insert({
          lead_id: lead.id,
          direction: 'outbound',
          channel: 'whatsapp',
          content: messageText,
          tag: `followup_day_${sequenceDay}`,
          sent_at: sentAt,
          created_at: sentAt,
        })

      // Update lead status to 'contacted' if it was 'new'
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
