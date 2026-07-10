const WHATSAPP_API_URL = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
  }
}

export async function sendWhatsAppMessage(to: string, text: string): Promise<void> {
  const body = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'text',
    text: { body: text },
  }

  const res = await fetch(WHATSAPP_API_URL, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const error = await res.text()
    console.error('WhatsApp sendMessage error:', error)
    throw new Error(`WhatsApp API error: ${res.status}`)
  }
}

export async function sendWhatsAppTemplate(
  to: string,
  templateName: string,
  params: string[]
): Promise<void> {
  const body = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: { code: 'ru' },
      components: [
        {
          type: 'body',
          parameters: params.map((text) => ({ type: 'text', text })),
        },
      ],
    },
  }

  const res = await fetch(WHATSAPP_API_URL, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const error = await res.text()
    console.error('WhatsApp sendTemplate error:', error)
    throw new Error(`WhatsApp API error: ${res.status}`)
  }
}
