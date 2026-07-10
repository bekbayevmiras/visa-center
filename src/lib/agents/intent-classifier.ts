import Anthropic from '@anthropic-ai/sdk'

export type Intent =
  | 'greeting'
  | 'price_inquiry'
  | 'country_inquiry'
  | 'document_inquiry'
  | 'status_inquiry'
  | 'appointment'
  | 'complaint'
  | 'human_request'
  | 'unknown'

export interface ClassifyResult {
  intent: Intent
  country?: string
  confidence: number
}

const client = new Anthropic()

const SYSTEM_PROMPT = `Ты — ИИ-ассистент казахстанского визового центра VisaKZ. Анализируй сообщения клиентов и определяй их намерение.

Возможные намерения (intent):
- greeting: приветствие (привет, здравствуйте, добрый день)
- price_inquiry: вопрос о цене/стоимости (сколько стоит, цена, стоимость)
- country_inquiry: интерес к визе в конкретную страну (виза в [страну], хочу в [страну])
- document_inquiry: вопрос о документах (какие документы, что нужно, список документов)
- status_inquiry: проверка статуса заявки (статус заявки, где моя виза, что с моей заявкой)
- appointment: запись на приём (записаться, назначить встречу, когда можно прийти)
- complaint: жалоба или недовольство (жалоба, не доволен, плохой сервис)
- human_request: запрос живого менеджера (соедините с менеджером, живой человек, оператор)
- unknown: непонятное или не относящееся к теме сообщение

Верни ТОЛЬКО JSON без дополнительного текста:
{
  "intent": "<одно из значений выше>",
  "country": "<название страны на русском если упоминается, иначе null>",
  "confidence": <число от 0 до 1>
}`

export async function classifyIntent(
  message: string,
  conversationHistory: string[]
): Promise<ClassifyResult> {
  const messages: Anthropic.MessageParam[] = []

  for (let i = 0; i < conversationHistory.length; i++) {
    messages.push({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: conversationHistory[i],
    })
  }

  messages.push({ role: 'user', content: message })

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    system: SYSTEM_PROMPT,
    messages,
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}'

  try {
    const parsed = JSON.parse(text) as { intent: Intent; country?: string | null; confidence: number }
    return {
      intent: parsed.intent ?? 'unknown',
      country: parsed.country ?? undefined,
      confidence: parsed.confidence ?? 0.5,
    }
  } catch {
    console.error('classifyIntent parse error, raw:', text)
    return { intent: 'unknown', confidence: 0 }
  }
}
