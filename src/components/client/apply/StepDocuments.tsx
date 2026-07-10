'use client'

import { useState, useRef } from 'react'
import { Upload, CheckCircle, XCircle, Loader2, FileText, ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ApplyFormData } from '@/app/(client)/apply/page'
import { createClient } from '@/lib/supabase/client'

type DocStatus = 'idle' | 'uploading' | 'done' | 'error'

type DocSlot = {
  key: string
  label: string
  required: boolean
  status: DocStatus
  fileName?: string
}

const BASE_DOCS: Omit<DocSlot, 'status'>[] = [
  { key: 'passport', label: 'Паспорт (разворот с фото)', required: true },
  { key: 'photo', label: 'Фото 3.5×4.5 см (как на паспорт)', required: true },
  { key: 'bank_statement', label: 'Банковская выписка (3 месяца)', required: true },
  { key: 'work_certificate', label: 'Справка с места работы / ИП', required: false },
  { key: 'hotel_booking', label: 'Бронь отеля', required: false },
  { key: 'flight_booking', label: 'Бронь авиабилетов', required: false },
]

export function StepDocuments({
  data,
  update,
  onNext,
  onPrev,
}: {
  data: ApplyFormData
  update: (p: Partial<ApplyFormData>) => void
  onNext: () => void
  onPrev: () => void
}) {
  const [docs, setDocs] = useState<DocSlot[]>(
    BASE_DOCS.map(d => ({ ...d, status: 'idle' }))
  )
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const handleFile = async (key: string, file: File) => {
    if (!['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Разрешены только PDF, JPG, PNG')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Файл не должен превышать 10 МБ')
      return
    }

    setDocs(d => d.map(doc => doc.key === key ? { ...doc, status: 'uploading', fileName: file.name } : doc))

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const userId = user?.id ?? 'anonymous'
      const ext = file.name.split('.').pop()
      const path = `${userId}/temp/${Date.now()}_${key}.${ext}`
      const { error } = await supabase.storage.from('documents').upload(path, file, { upsert: true })

      if (error) throw error
      setDocs(d => d.map(doc => doc.key === key ? { ...doc, status: 'done' } : doc))
    } catch {
      setDocs(d => d.map(doc => doc.key === key ? { ...doc, status: 'error' } : doc))
    }
  }

  const requiredDone = docs.filter(d => d.required).every(d => d.status === 'done')
  const doneCount = docs.filter(d => d.status === 'done').length

  return (
    <div>
      <h2 className="text-xl font-bold mb-1">Загрузка документов</h2>
      <p className="text-sm text-muted-foreground mb-2">
        AI проверит каждый документ за 30 секунд
      </p>
      <div className="flex items-center gap-2 mb-6">
        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-secondary rounded-full transition-all"
            style={{ width: `${(doneCount / docs.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground">{doneCount}/{docs.length}</span>
      </div>

      <div className="space-y-2 mb-6">
        {docs.map(doc => (
          <div
            key={doc.key}
            className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
              doc.status === 'done'
                ? 'border-secondary/40 bg-secondary/5'
                : doc.status === 'error'
                ? 'border-red-300 bg-red-50'
                : 'border-border'
            }`}
          >
            {/* Icon */}
            <div className="shrink-0">
              {doc.status === 'done' && <CheckCircle className="h-5 w-5 text-secondary" />}
              {doc.status === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
              {doc.status === 'uploading' && <Loader2 className="h-5 w-5 text-primary animate-spin" />}
              {doc.status === 'idle' && <FileText className="h-5 w-5 text-muted-foreground" />}
            </div>

            {/* Label */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium flex items-center gap-1.5">
                {doc.label}
                {doc.required && <span className="text-red-500 text-xs">*</span>}
              </p>
              {doc.fileName && doc.status !== 'idle' && (
                <p className="text-xs text-muted-foreground truncate">{doc.fileName}</p>
              )}
              {doc.status === 'error' && (
                <p className="text-xs text-red-500">Ошибка загрузки. Попробуйте снова.</p>
              )}
            </div>

            {/* Upload button */}
            <div className="shrink-0">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                className="hidden"
                ref={el => { inputRefs.current[doc.key] = el }}
                onChange={e => e.target.files?.[0] && handleFile(doc.key, e.target.files[0])}
              />
              <button
                type="button"
                onClick={() => inputRefs.current[doc.key]?.click()}
                disabled={doc.status === 'uploading'}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  doc.status === 'done'
                    ? 'border border-border text-muted-foreground hover:bg-muted'
                    : 'bg-primary text-white hover:bg-primary/90'
                }`}
              >
                <Upload className="h-3 w-3" />
                {doc.status === 'done' ? 'Заменить' : 'Загрузить'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Drop zone hint */}
      <div className="mb-6 rounded-xl border-2 border-dashed border-border p-4 text-center text-sm text-muted-foreground">
        Можно отправить документы через{' '}
        <a href={`https://wa.me/77000000000`} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
          WhatsApp
        </a>{' '}
        — наш бот примет и прикрепит автоматически
      </div>

      {!requiredDone && (
        <p className="mb-4 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Загрузите обязательные документы (отмечены *) чтобы продолжить. Остальные можно добавить позже.
        </p>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onPrev} className="flex-1 h-11 rounded-xl">
          <ArrowLeft className="mr-2 h-4 w-4" /> Назад
        </Button>
        <Button
          onClick={onNext}
          className="flex-1 bg-primary text-white hover:bg-primary/90 h-11 rounded-xl"
        >
          {requiredDone ? 'Далее' : 'Пропустить пока'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
