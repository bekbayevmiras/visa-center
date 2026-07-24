import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface KBEntry {
  client_message: string
  aida_response: string
  category: string
  subcategory: string
  grade_total: number
  verdict: string
  strengths: string[]
}

/**
 * Находит top-3 похожих сценария из базы знаний Аиды.
 * Использует PostgreSQL full-text search по русскому тексту.
 */
export async function findSimilarScenarios(
  message: string,
  limit = 3
): Promise<KBEntry[]> {
  // Полнотекстовый поиск — ищем похожие вопросы клиентов
  const { data: ftsResults } = await supabase
    .from('aida_kb')
    .select('client_message, aida_response, category, subcategory, grade_total, verdict, strengths')
    .textSearch('search_vector', message.split(' ').slice(0, 6).join(' | '), {
      type: 'websearch',
      config: 'russian',
    })
    .in('verdict', ['excellent', 'good'])
    .order('grade_total', { ascending: false })
    .limit(limit)

  if (ftsResults && ftsResults.length >= limit) return ftsResults as KBEntry[]

  // Фоллбэк: keyword matching по ключевым словам
  const keywords = extractKeywords(message)
  if (keywords.length === 0) return ftsResults as KBEntry[] ?? []

  const { data: keywordResults } = await supabase
    .from('aida_kb')
    .select('client_message, aida_response, category, subcategory, grade_total, verdict, strengths')
    .ilike('client_message', `%${keywords[0]}%`)
    .in('verdict', ['excellent', 'good'])
    .order('grade_total', { ascending: false })
    .limit(limit)

  // Объединяем и дедуплицируем
  const combined = [...(ftsResults ?? []), ...(keywordResults ?? [])]
  const seen = new Set<string>()
  const unique: KBEntry[] = []
  for (const entry of combined as KBEntry[]) {
    const key = entry.client_message.slice(0, 50)
    if (!seen.has(key)) {
      seen.add(key)
      unique.push(entry)
    }
  }

  return unique.slice(0, limit)
}

/**
 * Форматирует примеры для вставки в контекст Аиды.
 * Только лучшие примеры (grade 80+) чтобы не учить плохим ответам.
 */
export function formatKBExamples(examples: KBEntry[]): string {
  if (examples.length === 0) return ''

  const lines = examples
    .filter(e => e.grade_total >= 75)
    .map((e, i) =>
      `Пример ${i + 1} [${e.category}/${e.subcategory}, оценка ${e.grade_total}/100]:\n` +
      `Клиент: "${e.client_message}"\n` +
      `Лучший ответ: "${e.aida_response.slice(0, 400)}${e.aida_response.length > 400 ? '...' : ''}"`
    )

  if (lines.length === 0) return ''

  return `\n\n[ПОХОЖИЕ УСПЕШНЫЕ СЦЕНАРИИ ИЗ БАЗЫ ЗНАНИЙ — используй как ориентир, не копируй дословно]\n${lines.join('\n\n')}\n[КОНЕЦ ПРИМЕРОВ]`
}

// Простое извлечение ключевых слов для fallback-поиска
function extractKeywords(message: string): string[] {
  const stopWords = new Set(['и', 'в', 'на', 'по', 'с', 'из', 'у', 'а', 'но', 'не', 'да', 'что', 'это', 'как', 'мне', 'мой', 'вы', 'я', 'он', 'она', 'они', 'их', 'ли', 'то', 'бы'])
  return message
    .toLowerCase()
    .replace(/[^\wа-яё ]/gi, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w))
    .slice(0, 5)
}
