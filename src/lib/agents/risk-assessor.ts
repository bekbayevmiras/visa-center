import Anthropic from '@anthropic-ai/sdk'

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export interface RiskAssessment {
  risk_level: RiskLevel
  risk_score: number
  approval_probability: number
  factors: {
    category: string
    score: number
    description: string
    recommendation?: string
  }[]
  summary: string
  recommended_actions: string[]
}

const client = new Anthropic()

const SYSTEM_PROMPT = `Ты — эксперт по оценке рисков визовых заявок визового центра VisaKZ (Казахстан).
Твоя задача — объективно оценить вероятность одобрения визы на основе предоставленных данных.

Оценивай следующие факторы:
1. Полнота заявки (насколько полно заполнена заявка и предоставлены документы)
2. Финансовая состоятельность (баланс банка vs. минимальные требования)
3. История путешествий (предыдущие визы, отказы)
4. Согласованность цели (заявленная цель соответствует документам)
5. Риск невозврата (занятость, семейные связи)

Уровни риска:
- low (низкий): высокая вероятность одобрения, нет серьёзных проблем
- medium (средний): есть некоторые замечания, требуется дополнительная подготовка
- high (высокий): серьёзные проблемы, требуется значительная доработка
- critical (критический): высокий риск отказа, необходима консультация с менеджером

Верни ТОЛЬКО JSON без дополнительного текста:
{
  "risk_level": "<low|medium|high|critical>",
  "risk_score": <число от 0 до 100, выше = больше риск>,
  "approval_probability": <число от 0 до 1>,
  "factors": [
    {
      "category": "<название категории>",
      "score": <число от 0 до 10, выше = больше риск>,
      "description": "<описание на русском>",
      "recommendation": "<рекомендация на русском или null>"
    }
  ],
  "summary": "<краткое резюме на русском, 2-3 предложения>",
  "recommended_actions": ["действие 1", "действие 2"]
}`

export async function assessApplicationRisk(application: {
  country: string
  visa_type: string
  travel_purpose: string
  duration_days: number
  bank_balance?: number
  employment_status?: string
  previous_visas?: string[]
  previous_refusals?: number
  documents_provided?: string[]
}): Promise<RiskAssessment> {
  const promptData = JSON.stringify(application, null, 2)

  const userPrompt = `Оцени риски визовой заявки для следующих данных:

${promptData}

Проанализируй каждый фактор риска:

1. **Полнота заявки**:
   - Предоставленные документы: ${application.documents_provided?.join(', ') || 'не указано'}
   - Оцени, насколько полный пакет документов

2. **Финансовая состоятельность**:
   - Баланс: ${application.bank_balance !== undefined ? `${application.bank_balance} (валюта не указана)` : 'не указан'}
   - Для визы в ${application.country} на ${application.duration_days} дней нужен достаточный запас средств
   - Минимум ~$100/день + расходы на перелёт и проживание

3. **История путешествий**:
   - Предыдущие визы: ${application.previous_visas?.join(', ') || 'нет данных'}
   - Количество отказов: ${application.previous_refusals ?? 0}
   - Отказы серьёзно снижают вероятность одобрения

4. **Согласованность цели**:
   - Тип визы: ${application.visa_type}
   - Цель поездки: ${application.travel_purpose}
   - Длительность: ${application.duration_days} дней
   - Проверь соответствие цели и типа визы

5. **Риск невозврата**:
   - Статус занятости: ${application.employment_status || 'не указан'}
   - Оцени привязанность к стране проживания

Верни JSON с оценкой рисков.`

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  })

  const raw = response.content[0].type === 'text' ? response.content[0].text : '{}'
  const text = raw.replace(/```(?:json)?\n?/g, '').trim()

  try {
    const parsed = JSON.parse(text) as {
      risk_level?: RiskLevel
      risk_score?: number
      approval_probability?: number
      factors?: {
        category: string
        score: number
        description: string
        recommendation?: string
      }[]
      summary?: string
      recommended_actions?: string[]
    }
    return {
      risk_level: parsed.risk_level ?? 'medium',
      risk_score: parsed.risk_score ?? 50,
      approval_probability: parsed.approval_probability ?? 0.5,
      factors: parsed.factors ?? [],
      summary: parsed.summary ?? 'Не удалось провести полный анализ.',
      recommended_actions: parsed.recommended_actions ?? [],
    }
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        const parsed = JSON.parse(match[0]) as {
          risk_level?: RiskLevel
          risk_score?: number
          approval_probability?: number
          factors?: {
            category: string
            score: number
            description: string
            recommendation?: string
          }[]
          summary?: string
          recommended_actions?: string[]
        }
        return {
          risk_level: parsed.risk_level ?? 'medium',
          risk_score: parsed.risk_score ?? 50,
          approval_probability: parsed.approval_probability ?? 0.5,
          factors: parsed.factors ?? [],
          summary: parsed.summary ?? 'Не удалось провести полный анализ.',
          recommended_actions: parsed.recommended_actions ?? [],
        }
      } catch { /* fall through */ }
    }
    console.error('assessApplicationRisk parse error, raw:', raw)
    return {
      risk_level: 'medium',
      risk_score: 50,
      approval_probability: 0.5,
      factors: [],
      summary: 'Не удалось провести анализ рисков. Обратитесь к менеджеру.',
      recommended_actions: ['Обратитесь к менеджеру для ручной проверки заявки'],
    }
  }
}
