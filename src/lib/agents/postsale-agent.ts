import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient } from '@/lib/supabase/server'
import { sendWhatsAppMessage } from '@/lib/whatsapp/client'
import { sendNotification } from './notification-agent'

const client = new Anthropic()

// ---------------------------------------------------------------------------
// Post-sale sequence for approved applications
// Day 3: review request (already handled by review-collector)
// Day 7: referral offer
// Day 30: next visa offer
// ---------------------------------------------------------------------------

type PostSaleDay = 7 | 30

async function generatePostSaleMessage(
  clientName: string,
  country: string,
  day: PostSaleDay,
  referralCode?: string
): Promise<string> {
  const prompts: Record<PostSaleDay, string> = {
    7: `Напиши WhatsApp-сообщение от визового центра VisaKZ клиенту, которому неделю назад одобрили визу в ${country}.
Имя клиента: ${clientName}
${referralCode ? `Реферальный код клиента: ${referralCode}` : ''}

Цель: пригласить поделиться кодом с друзьями. За каждого приглашённого клиент получает 5 000 ₸.
Стиль: радостный, дружелюбный. Не спамный. 3-4 предложения максимум. С эмодзи ✈️🎉.
Упомяни что друг получит скидку 10%, а клиент — 5 000 ₸.
На русском языке. Только текст сообщения, без пояснений.`,

    30: `Напиши WhatsApp-сообщение от визового центра VisaKZ клиенту, которому месяц назад помогли получить визу в ${country}.
Имя клиента: ${clientName}

Цель: напомнить о себе и предложить помощь со следующей визой.
Стиль: тёплое, ненавязчивое. Напомни что мы работаем 24/7 и схема 30/70 по-прежнему действует.
2-3 предложения. С эмодзи. На русском языке. Только текст сообщения, без пояснений.`,
  }

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompts[day] }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return text.trim()
}

// ---------------------------------------------------------------------------
// Get or create referral code for user
// ---------------------------------------------------------------------------

async function getOrCreateReferralCode(userId: string): Promise<string | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any

  const { data: existing } = await supabase
    .from('referrals')
    .select('code')
    .eq('user_id', userId)
    .single()

  if (existing?.code) return existing.code

  // Generate new code
  const code = userId.replace(/-/g, '').slice(0, 8).toUpperCase()
  const { error } = await supabase.from('referrals').insert({
    user_id: userId,
    code,
    reward_amount: 5000,
    uses_count: 0,
  })

  return error ? null : code
}

// ---------------------------------------------------------------------------
// Main: process post-sale sequences
// ---------------------------------------------------------------------------

export async function processPostSaleSequences(): Promise<{ sent: number; errors: number }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  let sent = 0
  let errors = 0

  const now = new Date()

  // Загружаем одобренные заявки с данными пользователя и страны
  const { data: approvedApps, error } = await supabase
    .from('applications')
    .select(`
      id,
      updated_at,
      user_id,
      country:countries(name_ru),
      user:users(id, full_name, phone, whatsapp_id, email)
    `)
    .eq('status', 'approved')

  if (error) {
    console.error('[postsale-agent] Failed to fetch approved apps:', error)
    return { sent: 0, errors: 1 }
  }

  type AppRow = {
    id: string
    updated_at: string
    user_id: string | null
    country: { name_ru: string } | null
    user: { id: string; full_name: string; phone: string | null; whatsapp_id: string | null; email: string | null } | null
  }

  for (const app of (approvedApps ?? []) as AppRow[]) {
    if (!app.user) continue
    const user = app.user
    const country = app.country?.name_ru ?? 'страну'
    const clientName = user.full_name?.split(' ')[0] ?? 'Клиент'

    const approvedAt = new Date(app.updated_at)
    const diffDays = (now.getTime() - approvedAt.getTime()) / (1000 * 60 * 60 * 24)

    let postSaleDay: PostSaleDay | null = null
    if (diffDays >= 7 && diffDays < 8) postSaleDay = 7
    if (diffDays >= 30 && diffDays < 31) postSaleDay = 30

    if (!postSaleDay) continue

    // Проверяем — не отправляли ли уже этот шаг
    const tag = `postsale_day_${postSaleDay}`
    const { data: existingMsg } = await supabase
      .from('messages')
      .select('id')
      .eq('application_id', app.id)
      .eq('tag', tag)
      .limit(1)

    if (existingMsg && existingMsg.length > 0) continue

    try {
      let referralCode: string | undefined
      if (postSaleDay === 7 && user.id) {
        referralCode = (await getOrCreateReferralCode(user.id)) ?? undefined
      }

      const messageText = await generatePostSaleMessage(clientName, country, postSaleDay, referralCode)

      const contact = user.whatsapp_id ?? user.phone
      const sentAt = new Date().toISOString()

      if (contact) {
        if (process.env.WHATSAPP_TOKEN) {
          await sendWhatsAppMessage(contact, messageText)
        } else {
          console.log(`[PostSale] Would send to ${contact}:`, messageText)
        }

        await supabase.from('messages').insert({
          application_id: app.id,
          direction: 'outbound',
          channel: 'whatsapp',
          content: messageText,
          tag,
          sent_at: sentAt,
          created_at: sentAt,
        })
        sent++
      } else if (user.email) {
        await sendNotification(user.email, 'status_update', {
          client_name: clientName,
          country,
          custom_message: messageText,
        })

        await supabase.from('messages').insert({
          application_id: app.id,
          direction: 'outbound',
          channel: 'email',
          content: messageText,
          tag,
          sent_at: sentAt,
          created_at: sentAt,
        })
        sent++
      }
    } catch (err) {
      console.error(`[postsale-agent] Error for app ${app.id}:`, err)
      errors++
    }
  }

  return { sent, errors }
}
