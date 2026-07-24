/**
 * Тест: проверяет что Аида использует базу знаний (RAG) при ответе
 * Запуск: npx tsx scripts/test-rag.ts
 */

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

const TEST_MESSAGES = [
  'сколько стоит ваша услуга по оформлению визы?',
  'вы вообще надёжные? боюсь мошенников',
  'хочу поехать в Германию, что нужно?',
]

async function main() {
  // Dynamic imports — после загрузки env vars
  const { findSimilarScenarios, formatKBExamples } = await import('../src/lib/agents/aida-kb')
  const { askAidaPro } = await import('../src/lib/agents/aida-pro')

  console.log('═'.repeat(60))
  console.log('  ТЕСТ RAG: База знаний Аиды')
  console.log('═'.repeat(60))

  // ── Шаг 1: Прямой поиск по KB ──────────────────────────────
  console.log('\n📚 ШАГ 1: Прямой поиск по aida_kb\n')

  for (const msg of TEST_MESSAGES) {
    console.log(`❓ Запрос: "${msg}"`)
    const results = await findSimilarScenarios(msg, 3)
    if (results.length === 0) {
      console.log('   ⚠️  Ничего не найдено в KB\n')
    } else {
      for (const r of results) {
        console.log(`   ✅ [${r.category}/${r.subcategory}] оценка ${r.grade_total}/100`)
        console.log(`      Клиент: "${r.client_message.slice(0, 70)}..."`)
      }
      console.log()
    }
  }

  // ── Шаг 2: Полный ответ Аиды с RAG ────────────────────────
  console.log('═'.repeat(60))
  console.log('\n🤖 ШАГ 2: Полный ответ Аиды (с RAG-контекстом)\n')

  const testMsg = 'сколько стоит виза в Германию через вас? почему так дорого?'
  console.log(`❓ Сообщение клиента: "${testMsg}"\n`)

  // Показываем что KB нашёл
  const kbResults = await findSimilarScenarios(testMsg, 3)
  const kbContext = formatKBExamples(kbResults)

  if (kbContext) {
    console.log('📖 KB-контекст, который видит Аида:')
    console.log('─'.repeat(50))
    console.log(kbContext.slice(0, 600) + (kbContext.length > 600 ? '\n...[обрезано]' : ''))
    console.log('─'.repeat(50))
  } else {
    console.log('⚠️  KB-контекст пустой — сценарии не найдены')
  }

  console.log('\n⏳ Отправляю запрос к Аиде...\n')

  const response = await askAidaPro({
    message: testMsg,
    conversationHistory: [],
  })

  console.log('💬 Ответ Аиды:')
  console.log('─'.repeat(50))
  console.log(response.message)
  console.log('─'.repeat(50))
  console.log(`\n📊 Метаданные:`)
  console.log(`   Intent:            ${response.intent}`)
  console.log(`   Hand-off менеджеру: ${response.hand_off_to_manager}`)
  console.log(`   Upsell:             ${response.upsell_offered ?? 'нет'}`)

  console.log('\n' + '═'.repeat(60))
  console.log(kbResults.length > 0
    ? `✅ RAG работает: найдено ${kbResults.length} сценария в KB, Аида их видела при ответе`
    : '❌ RAG не вернул сценарии — проверь таблицу aida_kb')
  console.log('═'.repeat(60) + '\n')
}

main().catch(console.error)
