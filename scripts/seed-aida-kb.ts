/**
 * Загружает результаты симуляций в таблицу aida_kb (Supabase)
 * Запуск: npx tsx scripts/seed-aida-kb.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Загружаем .env.local
const envPath = path.resolve(__dirname, '../.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq === -1) continue
    const k = t.slice(0, eq).trim()
    const v = t.slice(eq + 1).trim()
    if (k && v && !process.env[k]) process.env[k] = v
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface SimResult {
  id: number
  category: string
  subcategory: string
  difficulty: string
  message: string
  response: string
  intent: string
  hand_off: boolean
  upsell: string | null
  grade: {
    total: number
    verdict: string
    strengths: string[]
    issues: string[]
  }
}

const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS public.aida_kb (
  id            serial PRIMARY KEY,
  category      text NOT NULL,
  subcategory   text NOT NULL,
  difficulty    text NOT NULL,
  client_message text NOT NULL,
  aida_response  text NOT NULL,
  intent        text,
  hand_off      boolean DEFAULT false,
  upsell        text,
  grade_total   integer DEFAULT 0,
  verdict       text,
  strengths     text[],
  issues        text[],
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('russian', coalesce(client_message, '') || ' ' || coalesce(category, '') || ' ' || coalesce(subcategory, ''))
  ) STORED,
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS aida_kb_search_idx ON public.aida_kb USING gin(search_vector);
CREATE INDEX IF NOT EXISTS aida_kb_category_grade_idx ON public.aida_kb (category, grade_total DESC);
CREATE INDEX IF NOT EXISTS aida_kb_verdict_idx ON public.aida_kb (verdict, grade_total DESC);

ALTER TABLE public.aida_kb ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'aida_kb' AND policyname = 'service_full_access'
  ) THEN
    CREATE POLICY "service_full_access" ON public.aida_kb USING (true) WITH CHECK (true);
  END IF;
END $$;
`

async function checkTableExists(): Promise<boolean> {
  const { error } = await supabase.from('aida_kb').select('id').limit(1)
  return !error || !error.message.includes('does not exist')
}

async function main() {
  const resultsPath = path.resolve(__dirname, 'sim-results.json')
  if (!fs.existsSync(resultsPath)) {
    console.error('❌ scripts/sim-results.json не найден. Сначала запустите: npx tsx scripts/simulate-sales.ts')
    process.exit(1)
  }

  // Проверяем существование таблицы
  const tableExists = await checkTableExists()

  if (!tableExists) {
    console.log('\n⚠️  Таблица aida_kb не существует.')
    console.log('Откройте Supabase Dashboard → SQL Editor и выполните:\n')
    console.log('─'.repeat(60))
    console.log(CREATE_TABLE_SQL)
    console.log('─'.repeat(60))
    console.log('\nПосле этого запустите скрипт снова.')
    process.exit(0)
  }

  const data = JSON.parse(fs.readFileSync(resultsPath, 'utf8'))
  const results: SimResult[] = data.results

  // Только успешно оценённые записи (без ошибок парсинга)
  const valid = results.filter(r =>
    r.grade.total > 0 &&
    !r.grade.issues?.includes('Ошибка парсинга оценки') &&
    r.response && r.response.length > 20
  )

  console.log(`\n📦 Загружаю ${valid.length} записей из ${results.length} симуляций...`)

  // Очищаем старые данные
  const { error: deleteError } = await supabase.from('aida_kb').delete().neq('id', 0)
  if (deleteError) {
    console.error('❌ Ошибка очистки:', deleteError.message)
    process.exit(1)
  }
  console.log('🗑️  Старые записи очищены')

  // Загружаем батчами по 50
  const batchSize = 50
  let inserted = 0

  for (let i = 0; i < valid.length; i += batchSize) {
    const batch = valid.slice(i, i + batchSize).map(r => ({
      category:       r.category,
      subcategory:    r.subcategory,
      difficulty:     r.difficulty,
      client_message: r.message,
      aida_response:  r.response,
      intent:         r.intent || null,
      hand_off:       r.hand_off || false,
      upsell:         r.upsell && r.upsell !== 'null' ? r.upsell : null,
      grade_total:    r.grade.total,
      verdict:        r.grade.verdict,
      strengths:      r.grade.strengths || [],
      issues:         r.grade.issues || [],
    }))

    const { error } = await supabase.from('aida_kb').insert(batch)
    if (error) {
      console.error(`❌ Ошибка на батче ${i}–${i + batchSize}:`, error.message)
    } else {
      inserted += batch.length
      process.stdout.write(`\r✅ Загружено ${inserted}/${valid.length}`)
    }
  }

  console.log('\n')

  // Финальная статистика
  const { count } = await supabase.from('aida_kb').select('*', { count: 'exact', head: true })
  console.log(`✨ В базе ${count} сценариев`)

  const byCategory: Record<string, number> = {}
  for (const r of valid) byCategory[r.category] = (byCategory[r.category] ?? 0) + 1
  console.log('\nПо категориям:')
  for (const [cat, n] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat.padEnd(15)} ${n} сценариев`)
  }

  console.log('\n✅ База знаний Аиды готова. Теперь она использует реальные симуляции при ответах.')
}

main().catch(console.error)
