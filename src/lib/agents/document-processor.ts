import Anthropic from '@anthropic-ai/sdk'

export type DocumentType = 'passport' | 'photo' | 'bank_statement' | 'invitation' | 'insurance' | 'other'

export interface DocumentAnalysis {
  document_type: DocumentType
  is_valid: boolean
  confidence: number
  extracted_data: Record<string, string | number | boolean | null>
  issues: string[]
  recommendations: string[]
}

const client = new Anthropic()

const SYSTEM_PROMPT = `Ты — специалист по проверке документов визового центра VisaKZ (Казахстан).
Твоя задача — анализировать документы, загружённые клиентами для получения визы.
Ты помогаешь гражданам Казахстана и других стран подготовить документы к подаче в посольства.

При анализе документов:
- Будь точным и внимательным к деталям
- Проверяй соответствие требованиям конкретной страны назначения
- Указывай конкретные проблемы на русском языке
- Давай практические рекомендации по исправлению

Всегда возвращай ТОЛЬКО JSON без дополнительного текста в следующем формате:
{
  "document_type": "<тип документа>",
  "is_valid": <true/false>,
  "confidence": <число от 0 до 1>,
  "extracted_data": {
    // данные зависят от типа документа
  },
  "issues": ["проблема 1", "проблема 2"],
  "recommendations": ["рекомендация 1", "рекомендация 2"]
}`

function buildUserPrompt(documentType: DocumentType, targetCountry?: string): string {
  const countryNote = targetCountry ? ` для визы в ${targetCountry}` : ''
  const today = new Date().toISOString().split('T')[0]

  switch (documentType) {
    case 'passport':
      return `Проанализируй паспорт${countryNote}. Сегодняшняя дата: ${today}.

Извлеки данные (extracted_data):
- full_name: ФИО владельца
- date_of_birth: дата рождения (YYYY-MM-DD)
- passport_number: номер паспорта
- nationality: гражданство
- issue_date: дата выдачи (YYYY-MM-DD)
- expiry_date: дата истечения срока (YYYY-MM-DD)
- issuing_country: страна выдачи
- months_until_expiry: количество месяцев до истечения срока (число)
- mrz_readable: читаемость MRZ строки (true/false)

Проверь:
1. Паспорт действителен минимум 6 месяцев от сегодняшней даты (${today})
2. Фото соответствует владельцу и хорошо видно
3. Данные чёткие и читаемые
4. MRZ строка присутствует и читаема

Верни JSON.`

    case 'photo':
      return `Проверь соответствие фотографии биометрическим требованиям${countryNote}.

Извлеки данные (extracted_data):
- background_color: цвет фона
- face_centered: лицо по центру (true/false)
- face_visible_percentage: процент лица на фото (число)
- glasses_present: есть ли очки (true/false)
- hat_present: есть ли головной убор (true/false)
- neutral_expression: нейтральное выражение лица (true/false)
- eyes_open: глаза открыты (true/false)
- image_quality: качество изображения (good/acceptable/poor)
- estimated_size_compliance: соответствие размеру 3.5x4.5 см (true/false/unknown)

Проверь биометрические требования:
1. Белый или светло-серый фон
2. Лицо по центру, занимает 70-80% фото
3. Нейтральное выражение, рот закрыт
4. Глаза открыты, смотрят прямо
5. Без очков и головных уборов (кроме религиозных)
6. Хорошее освещение без теней на лице

Верни JSON.`

    case 'bank_statement':
      return `Проанализируй банковскую выписку${countryNote}. Сегодняшняя дата: ${today}.

Извлеки данные (extracted_data):
- account_holder: имя владельца счёта
- bank_name: название банка
- account_number: номер счёта (последние 4 цифры)
- statement_period_from: начало периода выписки (YYYY-MM-DD)
- statement_period_to: конец периода выписки (YYYY-MM-DD)
- closing_balance: итоговый баланс (число)
- currency: валюта
- closing_balance_usd_approx: примерный баланс в USD (число или null)
- avg_monthly_balance: средний баланс за месяц (число или null)
- statement_age_days: сколько дней назад выдана выписка (число)
- is_certified: заверена ли печатью банка (true/false)

Проверь:
1. Выписка не старше 3 месяцев
2. Достаточный баланс (минимум $3000 эквивалент для большинства виз)
3. Наличие печати/подписи банка
4. Регулярные поступления/движения средств

Верни JSON.`

    case 'invitation':
      return `Проверь приглашение или спонсорское письмо${countryNote}.

Извлеки данные (extracted_data):
- inviting_party: имя/организация приглашающей стороны
- invitee_name: имя приглашённого
- invitation_date: дата приглашения (YYYY-MM-DD)
- visit_purpose: цель визита
- stay_duration: предполагаемая длительность пребывания
- address_in_country: адрес в стране назначения
- contact_info_present: есть ли контактная информация (true/false)
- notarized: нотариально заверено (true/false)

Проверь:
1. Чёткое указание цели визита
2. Точные даты пребывания
3. Адрес в стране назначения
4. Контактная информация приглашающей стороны

Верни JSON.`

    case 'insurance':
      return `Проверь страховой полис для путешествий${countryNote}. Сегодняшняя дата: ${today}.

Извлеки данные (extracted_data):
- insured_name: имя застрахованного
- insurance_company: название страховой компании
- policy_number: номер полиса
- coverage_start: начало действия полиса (YYYY-MM-DD)
- coverage_end: конец действия полиса (YYYY-MM-DD)
- coverage_amount_eur: сумма покрытия в EUR (число)
- covers_medical: покрывает ли медицинские расходы (true/false)
- covers_repatriation: покрывает ли репатриацию (true/false)
- territory: территория действия полиса

Проверь:
1. Минимальное покрытие €30 000 (требование Шенгена и большинства стран)
2. Покрытие медицинских расходов и репатриации
3. Даты соответствуют планируемой поездке
4. Страховая компания признана в стране назначения

Верни JSON.`

    default:
      return `Проанализируй документ${countryNote} и определи его тип и валидность.

Извлеки все доступные данные (extracted_data) из документа.
Оцени, подходит ли документ для визовой заявки.

Верни JSON.`
  }
}

export async function analyzeDocument(
  imageBase64: string,
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp' | 'application/pdf',
  documentType: DocumentType,
  targetCountry?: string
): Promise<DocumentAnalysis> {
  const userPrompt = buildUserPrompt(documentType, targetCountry)

  // PDFs use a document block; images use an image block
  const fileBlock: Anthropic.ContentBlockParam =
    mimeType === 'application/pdf'
      ? {
          type: 'document',
          source: {
            type: 'base64',
            media_type: 'application/pdf',
            data: imageBase64,
          },
        }
      : {
          type: 'image',
          source: {
            type: 'base64',
            media_type: mimeType,
            data: imageBase64,
          },
        }

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          fileBlock,
          {
            type: 'text',
            text: userPrompt,
          },
        ],
      },
    ],
  })

  const raw = response.content[0].type === 'text' ? response.content[0].text : '{}'
  const text = raw.replace(/```(?:json)?\n?/g, '').trim()

  try {
    const parsed = JSON.parse(text) as {
      document_type?: DocumentType
      is_valid?: boolean
      confidence?: number
      extracted_data?: Record<string, string | number | boolean | null>
      issues?: string[]
      recommendations?: string[]
    }
    return {
      document_type: parsed.document_type ?? documentType,
      is_valid: parsed.is_valid ?? false,
      confidence: parsed.confidence ?? 0.5,
      extracted_data: parsed.extracted_data ?? {},
      issues: parsed.issues ?? [],
      recommendations: parsed.recommendations ?? [],
    }
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        const parsed = JSON.parse(match[0]) as {
          document_type?: DocumentType
          is_valid?: boolean
          confidence?: number
          extracted_data?: Record<string, string | number | boolean | null>
          issues?: string[]
          recommendations?: string[]
        }
        return {
          document_type: parsed.document_type ?? documentType,
          is_valid: parsed.is_valid ?? false,
          confidence: parsed.confidence ?? 0.5,
          extracted_data: parsed.extracted_data ?? {},
          issues: parsed.issues ?? [],
          recommendations: parsed.recommendations ?? [],
        }
      } catch { /* fall through */ }
    }
    console.error('analyzeDocument parse error, raw:', raw)
    return {
      document_type: documentType,
      is_valid: false,
      confidence: 0,
      extracted_data: {},
      issues: ['Не удалось обработать документ'],
      recommendations: ['Загрузите документ повторно или обратитесь к менеджеру'],
    }
  }
}

export async function analyzeDocumentBatch(
  documents: Array<{ base64: string; mimeType: string; type: DocumentType }>,
  targetCountry: string
): Promise<{ analyses: DocumentAnalysis[]; overall_ready: boolean; blocking_issues: string[] }> {
  const analyses = await Promise.all(
    documents.map((doc) =>
      analyzeDocument(
        doc.base64,
        doc.mimeType as 'image/jpeg' | 'image/png' | 'image/webp' | 'application/pdf',
        doc.type,
        targetCountry
      )
    )
  )

  const blockingIssues: string[] = []
  for (const analysis of analyses) {
    if (!analysis.is_valid) {
      for (const issue of analysis.issues) {
        blockingIssues.push(`[${analysis.document_type}] ${issue}`)
      }
    }
  }

  const overall_ready = blockingIssues.length === 0

  return {
    analyses,
    overall_ready,
    blocking_issues: blockingIssues,
  }
}
