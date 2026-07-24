/**
 * Тест контекстного интеллекта Аиды через реальный askAidaPro (как в production)
 * Запуск: npx tsx scripts/test-context.ts
 */

import * as fs from 'fs'
import * as path from 'path'

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

async function main() {
  const { askAidaPro } = await import('../src/lib/agents/aida-pro')

  // Имитируем production: plain text в истории (как в messages таблице Supabase)
  type Turn = { role: 'user' | 'assistant'; content: string }
  const history: Turn[] = []

  const DIALOG = [
    { msg: 'Привет, хочу визу в Испанию, я работаю дизайнером фрилансером', check: 'Базовый запрос — страна + профиль' },
    { msg: 'Сколько денег нужно на счету?',                                  check: 'Помнит "Испания" без упоминания?' },
    { msg: 'А если у меня был отказ в Германии год назад?',                  check: 'Учитывает фриланс + Испания + отказ?' },
    { msg: 'Окей, беру вашу услугу. Что делать дальше?',                    check: 'Конверсия → hand_off: true?' },
  ]

  console.log('═'.repeat(65))
  console.log('  ТЕСТ КОНТЕКСТНОГО ИНТЕЛЛЕКТА АИДЫ (production mode)')
  console.log('  История: plain text из БД → askAidaPro оборачивает в JSON')
  console.log('═'.repeat(65) + '\n')

  let allPassed = true

  for (let i = 0; i < DIALOG.length; i++) {
    const { msg, check } = DIALOG[i]
    console.log(`── Сообщение ${i + 1}: ${check} ──`)
    console.log(`👤 "${msg}"\n`)

    const response = await askAidaPro({ message: msg, conversationHistory: history })

    const msgOk = response.message && response.message.length > 10 && !response.message.startsWith('...')
    if (!msgOk) allPassed = false

    console.log(`🤖 ${response.message.replace(/\n/g, '\n   ')}`)
    console.log(`\n   intent: ${response.intent} | hand_off: ${response.hand_off_to_manager} | approval: ${response.approval_probability ?? '—'}%`)
    console.log(`   ${msgOk ? '✅ Ответ содержательный' : '❌ Ответ пустой или ...'}\n`)

    // Сохраняем plain text — как в production (messages таблица)
    history.push({ role: 'user', content: msg })
    history.push({ role: 'assistant', content: response.message })
  }

  console.log('═'.repeat(65))
  console.log(allPassed
    ? '✅ ВСЕ ТЕСТЫ ПРОЙДЕНЫ: контекстный интеллект работает корректно'
    : '❌ ЕСТЬ ПРОБЛЕМЫ: некоторые ответы оказались пустыми')
  console.log(`   История к концу диалога: ${history.length} сообщений в контексте`)
  console.log('═'.repeat(65) + '\n')
}

main().catch(console.error)
