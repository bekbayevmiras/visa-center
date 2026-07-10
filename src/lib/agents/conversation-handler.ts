import { classifyIntent } from './intent-classifier'
import { createAdminClient } from '@/lib/supabase/server'
import type { Country, VisaType } from '@/lib/supabase/types'

export async function handleIncomingMessage(
  waId: string,
  message: string,
  name: string
): Promise<string> {
  const { intent, country, confidence } = await classifyIntent(message, [])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any

  // Сохраняем или обновляем лид
  const { data: existingLeads } = await supabase
    .from('leads')
    .select('id')
    .eq('whatsapp_id', waId)
    .limit(1)

  const existingLead = (existingLeads as Array<{ id: string }> | null)?.[0]

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

  // Сохраняем входящее сообщение
  await supabase.from('messages').insert({
    channel: 'whatsapp',
    direction: 'inbound',
    content: message,
    sent_by: waId,
  })

  // Формируем ответ
  const responseText = await buildResponse(intent, country ?? undefined, name, confidence, supabase)

  // Сохраняем исходящее сообщение
  await supabase.from('messages').insert({
    channel: 'whatsapp',
    direction: 'outbound',
    content: responseText,
    sent_by: 'aida_bot',
  })

  return responseText
}

async function buildResponse(
  intent: string,
  country: string | undefined,
  name: string,
  confidence: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
): Promise<string> {
  switch (intent) {
    case 'greeting':
      return `Привет, ${name}! Я Аида, ИИ-ассистент VisaKZ. В какую страну планируете поездку?`

    case 'price_inquiry': {
      if (!country) {
        return 'Уточните пожалуйста страну назначения'
      }
      const { data: countries } = await supabase
        .from('countries')
        .select('name_ru, base_price, express_price, processing_time_days')
        .ilike('name_ru', `%${country}%`)
        .eq('is_active', true)
        .limit(1)

      const found = (countries as Country[] | null)?.[0]
      if (!found) {
        return `К сожалению, не нашли информацию по визе в ${country}. Позвоните нам: +7 (727) 123-45-67`
      }
      return (
        `Виза в ${found.name_ru}:\n` +
        `• Стандартное оформление: от ${found.base_price.toLocaleString('ru-KZ')} ₸ (${found.processing_time_days} дней)\n` +
        `• Срочное оформление: от ${found.express_price.toLocaleString('ru-KZ')} ₸\n\n` +
        `Хотите записаться на консультацию?`
      )
    }

    case 'country_inquiry': {
      if (!country) {
        return 'В какую страну вы хотите оформить визу?'
      }
      const { data: countries } = await supabase
        .from('countries')
        .select('name_ru, processing_time_days, base_price')
        .ilike('name_ru', `%${country}%`)
        .eq('is_active', true)
        .limit(1)

      const found = (countries as Country[] | null)?.[0]
      if (!found) {
        return `Уточним детали по визе в ${country}. Цель поездки — туризм или бизнес?`
      }
      return (
        `Отлично! Виза в ${found.name_ru} оформляется от ${found.processing_time_days} дней.\n` +
        `Стоимость от ${found.base_price.toLocaleString('ru-KZ')} ₸.\n\n` +
        `Цель поездки — туризм или бизнес?`
      )
    }

    case 'document_inquiry': {
      if (!country) {
        return 'Для какой страны вас интересует список документов?'
      }
      const { data: countries } = await supabase
        .from('countries')
        .select('name_ru, requirements, id')
        .ilike('name_ru', `%${country}%`)
        .eq('is_active', true)
        .limit(1)

      const foundCountry = (countries as Country[] | null)?.[0]
      if (!foundCountry) {
        return `Уточните страну — напишите, например: "документы для Германии"`
      }

      const { data: visaTypes } = await supabase
        .from('visa_types')
        .select('name_ru, requirements')
        .eq('country_id', foundCountry.id)
        .eq('type_code', 'tourist')
        .eq('is_active', true)
        .limit(1)

      const vt = (visaTypes as VisaType[] | null)?.[0]
      const reqs = vt?.requirements ?? foundCountry.requirements

      let reqList = ''
      if (Array.isArray(reqs)) {
        reqList = (reqs as string[]).map((r, i) => `${i + 1}. ${r}`).join('\n')
      } else if (reqs && typeof reqs === 'object') {
        reqList = JSON.stringify(reqs, null, 2)
      } else {
        reqList = 'Уточняется — обратитесь к менеджеру'
      }

      return `Документы для визы в ${foundCountry.name_ru}:\n${reqList}\n\nЕсть вопросы? Напишите "записаться" для консультации.`
    }

    case 'status_inquiry':
      return 'Для проверки статуса укажите номер заявки (формат VZ-XXXX-XXXXXX) или зарегистрируйтесь на сайте visakz.kz'

    case 'appointment':
      return `${name}, для записи на консультацию выберите удобное время на сайте visakz.kz или напишите менеджеру. Работаем пн-пт 9:00–18:00.`

    case 'human_request':
    case 'complaint':
      return 'Передаю вас менеджеру. Ожидайте ответа в течение 15 минут.'

    default:
      void confidence
      return 'Не совсем понял ваш вопрос. Уточните — в какую страну нужна виза?'
  }
}
