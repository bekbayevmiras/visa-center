import { NextRequest, NextResponse } from 'next/server'
import { handleIncomingMessage } from '@/lib/agents/conversation-handler'
import { sendWhatsAppMessage } from '@/lib/whatsapp/client'

// GET — верификация webhook от Meta
export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// POST — входящие сообщения
export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const payload = body as {
    entry?: Array<{
      changes?: Array<{
        value?: {
          messages?: Array<{
            from?: string
            text?: { body?: string }
          }>
          contacts?: Array<{
            profile?: { name?: string }
          }>
        }
      }>
    }>
  }

  const value = payload?.entry?.[0]?.changes?.[0]?.value
  const msg = value?.messages?.[0]

  if (!msg?.from || !msg?.text?.body) {
    // Не текстовое сообщение или статус-апдейт — возвращаем 200 немедленно
    return NextResponse.json({ ok: true }, { status: 200 })
  }

  const from = msg.from
  const text = msg.text.body
  const name = value?.contacts?.[0]?.profile?.name ?? from

  // Отвечаем Meta немедленно, обработку делаем асинхронно
  void (async () => {
    try {
      const response = await handleIncomingMessage(from, text, name)
      await sendWhatsAppMessage(from, response)
    } catch (err) {
      console.error('WhatsApp webhook processing error:', err)
    }
  })()

  return NextResponse.json({ ok: true }, { status: 200 })
}
