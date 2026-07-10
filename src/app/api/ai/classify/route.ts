import { NextRequest, NextResponse } from 'next/server'
import { classifyIntent } from '@/lib/agents/intent-classifier'

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { message } = body as { message?: string }

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Поле message обязательно' }, { status: 400 })
  }

  try {
    const result = await classifyIntent(message, [])
    return NextResponse.json(result)
  } catch (err) {
    console.error('classify error:', err)
    return NextResponse.json({ error: 'Ошибка классификации' }, { status: 500 })
  }
}
