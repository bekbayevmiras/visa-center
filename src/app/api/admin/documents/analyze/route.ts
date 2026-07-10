import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { analyzeDocument, DocumentType } from '@/lib/agents/document-processor'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profileRaw } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  const profile = profileRaw as { is_admin: boolean } | null
  if (!profile?.is_admin) return null
  return user
}

export async function POST(request: NextRequest) {
  const user = await checkAdmin()
  if (!user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  let body: {
    application_id: string
    document_id: string
    image_base64: string
    mime_type: string
    document_type: DocumentType
    target_country?: string
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Неверный формат запроса' }, { status: 400 })
  }

  const { application_id, document_id, image_base64, mime_type, document_type, target_country } = body

  if (!application_id || !document_id || !image_base64 || !mime_type || !document_type) {
    return NextResponse.json(
      { error: 'Укажите application_id, document_id, image_base64, mime_type и document_type' },
      { status: 400 }
    )
  }

  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  if (!allowedMimeTypes.includes(mime_type)) {
    return NextResponse.json(
      { error: `Неподдерживаемый тип файла. Разрешены: ${allowedMimeTypes.join(', ')}` },
      { status: 400 }
    )
  }

  const validDocumentTypes: DocumentType[] = ['passport', 'photo', 'bank_statement', 'invitation', 'insurance', 'other']
  if (!validDocumentTypes.includes(document_type)) {
    return NextResponse.json(
      { error: `Неверный тип документа. Допустимые значения: ${validDocumentTypes.join(', ')}` },
      { status: 400 }
    )
  }

  let analysis
  try {
    analysis = await analyzeDocument(
      image_base64,
      mime_type as 'image/jpeg' | 'image/png' | 'image/webp' | 'application/pdf',
      document_type,
      target_country
    )
  } catch (err) {
    console.error('POST /api/admin/documents/analyze analyzeDocument error:', err)
    return NextResponse.json({ error: 'Ошибка анализа документа' }, { status: 500 })
  }

  const supabase = createAdminClient()
  const { error: updateError } = await (supabase as any)
    .from('documents')
    .update({ ai_validation_result: analysis, updated_at: new Date().toISOString() })
    .eq('id', document_id)
    .eq('application_id', application_id)

  if (updateError) {
    console.error('POST /api/admin/documents/analyze update error:', updateError)
    // Return the analysis even if saving failed — don't block the user
    return NextResponse.json(
      { data: analysis, warning: 'Анализ выполнен, но не удалось сохранить результат в БД' },
      { status: 200 }
    )
  }

  return NextResponse.json({ data: analysis })
}
