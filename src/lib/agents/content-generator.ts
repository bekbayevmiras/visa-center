import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export type ContentType =
  | 'instagram_post'
  | 'telegram_post'
  | 'email_newsletter'
  | 'blog_article'
  | 'whatsapp_broadcast'
  | 'video_script'

export interface GeneratedContent {
  type: ContentType
  title?: string
  body: string
  hashtags?: string[]
  meta_description?: string
  suggested_image_prompt?: string
  publish_at?: string
}

const CONTENT_SYSTEM_PROMPT = `Ты — Senior Content Strategist визового центра VisaKZ (Алматы, Казахстан).
Ты создаёшь контент, который КОНВЕРТИРУЕТ — не просто информирует, а побуждает к действию.
Целевая аудитория: казахстанцы 25-45 лет, планируют поездку, выбирают между самостоятельным оформлением и визовым центром.

Наши УТП которые нужно продвигать:
1. Оплата 30/70 — платишь 30% сейчас, 70% только ПОСЛЕ получения визы (уникально в Казахстане)
2. AI-ассистент Аида Про — отвечает в WhatsApp за 30 секунд, 24/7
3. Гарантия возврата при отказе консульства — полный возврат 30% аванса
4. Цены на 20% ниже среднерыночных
5. Личный менеджер + AI-проверка документов — не пропустим ни одной ошибки

СТРОГИЕ ПРАВИЛА (нарушение = плохой контент):
- НИКОГДА не придумывай статистику: не пиши "98%", "94%", "87% одобрений" — у нас нет верифицированных цифр по каждой стране
- Вместо выдуманных процентов пиши: "высокий процент одобрений", "большинство наших клиентов получают визу"
- НИКОГДА не используй фейковую срочность: "осталось N мест", "предложение истекает через X часов" — это разрушает доверие
- Реальная срочность: реальные сроки консульств, реальные сезонные очереди (лето = высокий сезон)
- Боли клиентов: боятся отказа, не хотят собирать документы самостоятельно, не знают что подавать
- Социальное доказательство: реальные сценарии (студент, бизнес-поездка, семейный отпуск) — без выдуманных имён и цифр
- CTA конкретный: "Напишите в WhatsApp прямо сейчас" > "Свяжитесь с нами"
- Иногда используй казахские фразы: "Жол болсын!", "Сіздің визаңыз дайын!", "Рахмет"
- Используй уместные эмодзи ✈️🛂🌍🎉
- Упоминай бренд VisaKZ органично, не навязчиво`

function buildContentPrompt(
  type: ContentType,
  topic: string,
  context?: {
    country?: string
    season?: string
    promotion?: string
    tone?: 'formal' | 'friendly' | 'urgent'
  }
): string {
  const toneMap = {
    formal: 'официальный и профессиональный',
    friendly: 'дружелюбный и тёплый',
    urgent: 'срочный и призывающий к действию',
  }
  const tone = context?.tone ? toneMap[context.tone] : 'дружелюбный и тёплый'
  const country = context?.country ? `Страна: ${context.country}` : ''
  const season = context?.season ? `Сезон/период: ${context.season}` : ''
  const promotion = context?.promotion ? `Акция: ${context.promotion}` : ''

  const contextBlock = [country, season, promotion].filter(Boolean).join('\n')

  switch (type) {
    case 'instagram_post':
      return `Создай пост для Instagram визового центра VisaKZ.
Тема: ${topic}
${contextBlock}
Тон: ${tone}

Требования:
- 150-200 слов
- Интересный, вовлекающий текст
- 10-15 хэштегов включая #виза #казахстан #visakz #путешествия
- Призыв к действию в конце
- С эмодзи

Верни JSON:
{
  "body": "<текст поста>",
  "hashtags": ["хэштег1", "хэштег2", ...],
  "suggested_image_prompt": "<промпт на английском для генерации изображения>"
}`

    case 'telegram_post':
      return `Создай пост для Telegram-канала визового центра VisaKZ.
Тема: ${topic}
${contextBlock}
Тон: ${tone}

Требования:
- 100-150 слов
- Информативный и полезный
- 5-8 хэштегов
- Можно использовать форматирование Markdown (жирный, курсив)

Верни JSON:
{
  "body": "<текст поста с Markdown>",
  "hashtags": ["хэштег1", ...],
  "suggested_image_prompt": "<промпт на английском для изображения>"
}`

    case 'email_newsletter':
      return `Создай email-рассылку для клиентов визового центра VisaKZ.
Тема: ${topic}
${contextBlock}
Тон: ${tone}

Требования:
- Тема письма (subject line)
- 300-400 слов основного текста
- Структурированный, с заголовками
- Информативный, полезный контент о визах и путешествиях
- Призыв к действию

Верни JSON:
{
  "title": "<тема письма>",
  "body": "<текст письма>",
  "suggested_image_prompt": "<промпт для баннера письма>"
}`

    case 'blog_article':
      return `Создай SEO-оптимизированную статью для блога визового центра VisaKZ.
Тема: ${topic}
${contextBlock}
Тон: ${tone}

Требования:
- Заголовок статьи (H1)
- 500-700 слов
- Структурированный текст с подзаголовками
- SEO-оптимизированный: ключевые слова про визы и страну
- Meta-description (150-160 символов)
- Полезная информация для тех кто хочет получить визу

Верни JSON:
{
  "title": "<заголовок статьи>",
  "body": "<полный текст статьи с HTML-заголовками h2, h3>",
  "meta_description": "<мета-описание 150-160 символов>",
  "suggested_image_prompt": "<промпт для главного изображения>"
}`

    case 'whatsapp_broadcast':
      return `Создай массовое сообщение для WhatsApp-рассылки визового центра VisaKZ.
Тема: ${topic}
${contextBlock}
Тон: ${tone}

Требования:
- 50-80 слов максимум
- Информативное и ценное
- Не спамное, персональное ощущение
- Чёткий призыв к действию
- С эмодзи

Верни JSON:
{
  "body": "<текст сообщения>"
}`

    case 'video_script':
      return `Создай сценарий короткого видео (TikTok / Instagram Reels) для визового центра VisaKZ.
Тема: ${topic}
${contextBlock}
Тон: ${tone}

Требования:
- Длительность: 30–60 секунд
- Хук в первые 3 секунды — должен ОСТАНОВИТЬ скролл
- Чёткая структура: хук → боль → решение → CTA
- Разговорный язык, будто говорит живой человек в камеру
- Конкретные визуальные инструкции для каждой сцены
- CTA в конце: подписаться / написать в WhatsApp

Верни JSON:
{
  "title": "<заголовок видео>",
  "body": "<полный сценарий с таймкодами и визуальными инструкциями>",
  "suggested_image_prompt": "<промпт для превью-обложки видео на английском>",
  "hashtags": ["хэштег1", "хэштег2", ...]
}`

    default:
      return `Создай контент для визового центра VisaKZ на тему: ${topic}`
  }
}

export async function generateContent(
  type: ContentType,
  topic: string,
  context?: {
    country?: string
    season?: string
    promotion?: string
    tone?: 'formal' | 'friendly' | 'urgent'
  }
): Promise<GeneratedContent> {
  const prompt = buildContentPrompt(type, topic, context)

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: CONTENT_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const raw = response.content[0].type === 'text' ? response.content[0].text : '{}'
  const text = raw.replace(/```(?:json)?\n?/g, '').trim()

  let parsed: Partial<GeneratedContent> = {}
  const tryParse = (s: string): Partial<GeneratedContent> | null => {
    try {
      return JSON.parse(s) as Partial<GeneratedContent>
    } catch {
      // Escape unescaped literal newlines inside JSON string values
      try {
        const fixed = s.replace(/("(?:[^"\\]|\\.)*")/g, (m) =>
          m.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')
        )
        return JSON.parse(fixed) as Partial<GeneratedContent>
      } catch {
        return null
      }
    }
  }

  const direct = tryParse(text)
  if (direct) {
    parsed = direct
  } else {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) {
      parsed = tryParse(match[0]) ?? { body: text }
    } else {
      parsed = { body: text }
    }
  }

  // Suggest a publish time (next business day at 10:00 AM Almaty time)
  const publishAt = new Date()
  publishAt.setDate(publishAt.getDate() + 1)
  publishAt.setHours(10, 0, 0, 0)

  return {
    type,
    title: parsed.title,
    body: parsed.body ?? '',
    hashtags: parsed.hashtags,
    meta_description: parsed.meta_description,
    suggested_image_prompt: parsed.suggested_image_prompt,
    publish_at: publishAt.toISOString(),
  }
}

export async function generateContentCalendar(
  month: string,
  posts_per_week: number
): Promise<GeneratedContent[]> {
  const totalPosts = posts_per_week * 4 // 4 weeks

  const planningResponse = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: CONTENT_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Составь контент-план для визового центра VisaKZ на ${month}.
Нужно ${totalPosts} публикаций (${posts_per_week} в неделю).
Разнообразие типов: instagram_post, telegram_post, whatsapp_broadcast.
Разные темы: советы по визам, страны, акции, полезные лайфхаки, истории успеха клиентов.

Верни JSON-массив:
[
  {
    "type": "<тип контента>",
    "topic": "<тема>",
    "context": {
      "country": "<страна или null>",
      "season": "${month}",
      "tone": "<formal|friendly|urgent>"
    }
  },
  ...
]
Верни ТОЛЬКО JSON, без пояснений.`,
      },
    ],
  })

  const planRaw =
    planningResponse.content[0].type === 'text' ? planningResponse.content[0].text : '[]'
  const planText = planRaw.replace(/```(?:json)?\n?/g, '').trim()

  type PlanItem = { type: ContentType; topic: string; context?: { country?: string; season?: string; tone?: 'formal' | 'friendly' | 'urgent' } }
  let plan: PlanItem[] = []
  try {
    plan = JSON.parse(planText) as PlanItem[]
  } catch {
    const match = planText.match(/\[[\s\S]*\]/)
    if (match) {
      try {
        plan = JSON.parse(match[0]) as PlanItem[]
      } catch {
        plan = []
      }
    }
  }

  // Generate content for each planned item (limit to totalPosts)
  const results: GeneratedContent[] = []
  const items = plan.slice(0, totalPosts)

  for (const item of items) {
    try {
      const content = await generateContent(item.type, item.topic, item.context)
      results.push(content)
    } catch (err) {
      console.error('generateContentCalendar: error generating item:', err)
    }
  }

  return results
}
