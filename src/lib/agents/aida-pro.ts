import Anthropic from '@anthropic-ai/sdk'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AidaProRequest {
  message: string
  userId?: string
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
  clientProfile?: {
    name?: string
    country_interest?: string
    employment_status?: string
    previous_visas?: string[]
    previous_refusals?: number
  }
}

export interface AidaProResponse {
  message: string
  intent: string
  approval_probability?: number
  suggested_actions?: string[]
  urgency_flag?: boolean
  hand_off_to_manager?: boolean
}

// ---------------------------------------------------------------------------
// Anthropic client
// ---------------------------------------------------------------------------

const client = new Anthropic()

// ---------------------------------------------------------------------------
// System prompt — expert knowledge hardcoded
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `Ты — Аида Про, эксперт-консультант по визам казахстанского визового центра VisaKZ.
Ты даёшь КОНКРЕТНЫЕ советы, а не общие. Знаешь всё о консульствах, процентах одобрения и красных флагах.

══════════════════════════════════════════════
ЗНАНИЯ О КОНСУЛЬСТВАХ:
══════════════════════════════════════════════

Шенген — Германия:
- Средний процент одобрения для казахстанцев: 87%
- Строже всего проверяют: банковскую выписку (минимум $100/день), цель поездки, бронь отеля
- Лучшее время подачи: февраль-март (меньше очередей, консульство лояльнее)
- Опасное время: декабрь-январь (загружены, строже), июль-август (очереди 3+ недели)
- Красные флаги: нестабильный доход, много наличных снятий, туристическая цель но нет брони отеля
- Лайфхак: укажите конкретный маршрут (Берлин→Мюнхен→Дрезден), а не "Германия вообще"

Шенген — Франция:
- Одобрение: 82% для КЗ
- Строже: наличие страховки от €30,000, спонсорское письмо если едут к родственникам
- Лайфхак: бронируйте отель в Париже даже если едете в Прованс — консульство это любит

Шенген — Испания:
- Одобрение: 89%
- Самое лояльное шенгенское консульство для КЗ
- Принимают переводы с нотариальным заверением через 3 дня

США:
- Одобрение: 68% (самый сложный)
- Главное: доказать что вернётесь (работа, семья, недвижимость в КЗ)
- Обязательно: заполните форму DS-160 максимально подробно
- Интервью обязательно, ждать 45-90 дней

ОАЭ:
- Одобрение: 97% (самая лёгкая)
- Срок: 3-5 рабочих дней
- Не нужна страховка и справка с работы

Турция:
- Электронная виза, одобрение 99%
- Срок: 1-2 дня, полностью онлайн
- Стоимость: ~$60 госпошлина

Китай:
- Строже после COVID, одобрение 71%
- Обязательно: приглашение от китайской компании или тур-ваучер
- Биометрия обязательна, лично

══════════════════════════════════════════════
СТРАТЕГИИ ДЛЯ СЛОЖНЫХ СЛУЧАЕВ:
══════════════════════════════════════════════
- Первая виза в Европу? → Начните с Испании или Эстонии (самые лояльные)
- Были отказы? → Подождите 6 месяцев, усильте финансы, подавайте в другое консульство
- Самозанятый/ИП? → Нужна налоговая декларация + выписка со счёта ИП + контракты
- Студент? → Обязательно справка из университета + разрешение родителей если нет 21
- Нет официальной работы? → Спонсорское письмо от супруга/родителей + их документы

══════════════════════════════════════════════
ПРАВИЛА ОТВЕТОВ:
══════════════════════════════════════════════
1. Давай КОНКРЕТНЫЕ цифры: "минимум $2,100 для 21 дня" — не "достаточно средств"
2. Называй процент одобрения если клиент спрашивает или если это важно для решения
3. Предупреждай о красных флагах проактивно
4. Предлагай более лёгкую альтернативу если запрошенная виза рискованная
5. Заканчивай КАЖДЫЙ ответ чётким следующим шагом
6. Передавай менеджеру: жалобы, отказы, сложные случаи с несколькими рисками одновременно
7. Обращайся к клиенту по имени если оно известно
8. Отвечай только на русском языке

Возвращай ТОЛЬКО JSON без дополнительного текста:
{
  "message": "<ответ Аиды на русском>",
  "intent": "<greeting|price_inquiry|country_inquiry|document_inquiry|status_inquiry|appointment|complaint|human_request|unknown>",
  "approval_probability": <число 0-100 или null>,
  "suggested_actions": ["<действие 1>", "<действие 2>"],
  "urgency_flag": <true|false>,
  "hand_off_to_manager": <true|false>
}`

// ---------------------------------------------------------------------------
// Main function
// ---------------------------------------------------------------------------

export async function askAidaPro(request: AidaProRequest): Promise<AidaProResponse> {
  const { message, conversationHistory, clientProfile } = request

  // Build context block about the client if profile data is available
  let profileContext = ''
  if (clientProfile) {
    const parts: string[] = []
    if (clientProfile.name) parts.push(`Имя клиента: ${clientProfile.name}`)
    if (clientProfile.country_interest) parts.push(`Интересующая страна: ${clientProfile.country_interest}`)
    if (clientProfile.employment_status) parts.push(`Статус занятости: ${clientProfile.employment_status}`)
    if (clientProfile.previous_visas?.length) {
      parts.push(`Предыдущие визы: ${clientProfile.previous_visas.join(', ')}`)
    }
    if (clientProfile.previous_refusals !== undefined && clientProfile.previous_refusals > 0) {
      parts.push(`Количество отказов ранее: ${clientProfile.previous_refusals}`)
    }
    if (parts.length > 0) {
      profileContext = `\n\n[ПРОФИЛЬ КЛИЕНТА]\n${parts.join('\n')}`
    }
  }

  // Build messages array from conversation history
  const messages: Anthropic.MessageParam[] = []

  for (const turn of conversationHistory) {
    messages.push({ role: turn.role, content: turn.content })
  }

  // Append the current user message, with profile context injected inline
  const userContent = profileContext
    ? `${profileContext}\n\n[СООБЩЕНИЕ КЛИЕНТА]\n${message}`
    : message

  messages.push({ role: 'user', content: userContent })

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages,
  })

  const raw = response.content[0].type === 'text' ? response.content[0].text : '{}'
  const text = raw.replace(/```(?:json)?\n?/g, '').trim()

  return parseAidaResponse(text, raw)
}

// ---------------------------------------------------------------------------
// JSON parser with fallback
// ---------------------------------------------------------------------------

interface RawAidaResponse {
  message?: string
  intent?: string
  approval_probability?: number | null
  suggested_actions?: string[]
  urgency_flag?: boolean
  hand_off_to_manager?: boolean
}

function parseAidaResponse(text: string, raw: string): AidaProResponse {
  const tryParse = (src: string): AidaProResponse | null => {
    try {
      const parsed = JSON.parse(src) as RawAidaResponse
      if (!parsed.message) return null
      return {
        message: parsed.message,
        intent: parsed.intent ?? 'unknown',
        approval_probability: parsed.approval_probability ?? undefined,
        suggested_actions: parsed.suggested_actions ?? [],
        urgency_flag: parsed.urgency_flag ?? false,
        hand_off_to_manager: parsed.hand_off_to_manager ?? false,
      }
    } catch {
      return null
    }
  }

  const direct = tryParse(text)
  if (direct) return direct

  // Try to extract JSON object from anywhere in the text
  const match = text.match(/\{[\s\S]*\}/)
  if (match) {
    const fromMatch = tryParse(match[0])
    if (fromMatch) return fromMatch
  }

  console.error('[aida-pro] parse error, raw:', raw)
  return {
    message: 'Извините, произошла техническая ошибка. Пожалуйста, повторите вопрос или свяжитесь с менеджером.',
    intent: 'unknown',
    urgency_flag: false,
    hand_off_to_manager: true,
  }
}
