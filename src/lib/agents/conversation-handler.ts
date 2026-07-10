import { classifyIntent } from './intent-classifier'
import { askAidaPro } from './aida-pro'
import { createAdminClient } from '@/lib/supabase/server'

export async function handleIncomingMessage(
  waId: string,
  message: string,
  name: string
): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any

  // Classify intent (still useful for logging / country extraction)
  const { country } = await classifyIntent(message, [])

  // Сохраняем или обновляем лид и получаем его данные
  const { data: existingLeads } = await supabase
    .from('leads')
    .select('id, name, country_interest, status')
    .eq('whatsapp_id', waId)
    .limit(1)

  type LeadRow = { id: string; name: string | null; country_interest: string | null; status: string | null }
  const existingLead = (existingLeads as LeadRow[] | null)?.[0]

  if (existingLead) {
    await supabase
      .from('leads')
      .update({
        name,
        ...(country ? { country_interest: country } : {}),
      })
      .eq('id', existingLead.id)
  } else {
    await supabase.from('leads').insert({
      whatsapp_id: waId,
      phone: waId,
      name,
      source: 'whatsapp',
      status: 'new',
      ...(country ? { country_interest: country } : {}),
    })
  }

  // Загружаем последние сообщения для контекста диалога
  const { data: recentMessages } = await supabase
    .from('messages')
    .select('direction, content')
    .order('created_at', { ascending: false })
    .limit(10)

  type MessageRow = { direction: string; content: string }
  const history: Array<{ role: 'user' | 'assistant'; content: string }> = []

  if (recentMessages) {
    // Сообщения приходят в порядке "новое первым" — переворачиваем для хронологии
    const rows = (recentMessages as MessageRow[]).reverse()
    for (const row of rows) {
      if (row.direction === 'inbound') {
        history.push({ role: 'user', content: row.content })
      } else {
        history.push({ role: 'assistant', content: row.content })
      }
    }
  }

  // Сохраняем входящее сообщение
  await supabase.from('messages').insert({
    channel: 'whatsapp',
    direction: 'inbound',
    content: message,
    sent_by: waId,
  })

  // Строим профиль клиента из данных лида
  const clientProfile = {
    name,
    country_interest: existingLead?.country_interest ?? country ?? undefined,
  }

  // Аида Про — экспертный ответ вместо шаблонного switch-case
  const aidaResponse = await askAidaPro({
    message,
    conversationHistory: history,
    clientProfile,
  })

  const responseText = aidaResponse.message

  // Если нужен менеджер — обновляем статус лида
  if (aidaResponse.hand_off_to_manager && existingLead) {
    await supabase
      .from('leads')
      .update({ status: 'contacted' })
      .eq('id', existingLead.id)
  }

  // Сохраняем исходящее сообщение
  await supabase.from('messages').insert({
    channel: 'whatsapp',
    direction: 'outbound',
    content: responseText,
    sent_by: 'aida_bot',
  })

  return responseText
}
