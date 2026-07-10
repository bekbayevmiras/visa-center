'use client'

import { useState } from 'react'
import { CheckCircle, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

type ProfileData = {
  full_name: string
  phone: string
  passport_number: string
  passport_expiry: string
  birth_date: string
  citizenship: string
}

export function ProfileForm({
  userId,
  email,
  initialData,
}: {
  userId: string
  email: string
  initialData: ProfileData
}) {
  const [data, setData] = useState<ProfileData>(initialData)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const set = (key: keyof ProfileData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setData(d => ({ ...d, [key]: e.target.value }))

  const save = async () => {
    if (!data.full_name.trim()) { setError('Укажите ФИО'); return }
    setSaving(true)
    setError('')
    try {
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: err } = await (supabase as any)
        .from('users')
        .update({
          full_name: data.full_name,
          phone: data.phone || null,
          passport_number: data.passport_number || null,
          passport_expiry: data.passport_expiry || null,
          birth_date: data.birth_date || null,
          citizenship: data.citizenship,
        })
        .eq('id', userId)
      if (err) throw err
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Ошибка сохранения. Попробуйте снова.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-5">
      {/* Email - readonly */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
        <input
          value={email}
          disabled
          className="w-full rounded-xl border border-border bg-muted px-4 py-2.5 text-sm text-muted-foreground"
        />
      </div>

      {/* Full name */}
      <div>
        <label className="text-xs font-medium mb-1.5 block">ФИО <span className="text-red-500">*</span></label>
        <input
          value={data.full_name}
          onChange={set('full_name')}
          placeholder="Иванов Иван Иванович"
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Phone */}
      <div>
        <label className="text-xs font-medium mb-1.5 block">Телефон</label>
        <input
          value={data.phone}
          onChange={set('phone')}
          placeholder="+7 (777) 123-45-67"
          type="tel"
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
        />
      </div>

      <div className="border-t border-border pt-5">
        <p className="text-xs font-medium text-muted-foreground mb-4">Паспортные данные (необязательно)</p>
        <div className="space-y-4">
          {/* Passport number */}
          <div>
            <label className="text-xs font-medium mb-1.5 block">Номер паспорта</label>
            <input
              value={data.passport_number}
              onChange={set('passport_number')}
              placeholder="N12345678"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Birth date */}
            <div>
              <label className="text-xs font-medium mb-1.5 block">Дата рождения</label>
              <input
                type="date"
                value={data.birth_date}
                onChange={set('birth_date')}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Passport expiry */}
            <div>
              <label className="text-xs font-medium mb-1.5 block">Срок действия</label>
              <input
                type="date"
                value={data.passport_expiry}
                onChange={set('passport_expiry')}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Citizenship */}
          <div>
            <label className="text-xs font-medium mb-1.5 block">Гражданство</label>
            <select
              value={data.citizenship}
              onChange={set('citizenship')}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
            >
              <option value="KZ">Казахстан</option>
              <option value="RU">Россия</option>
              <option value="KG">Кыргызстан</option>
              <option value="UZ">Узбекистан</option>
              <option value="BY">Беларусь</option>
              <option value="OTHER">Другое</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}

      {saved && (
        <div className="flex items-center gap-2 text-secondary text-sm bg-secondary/10 border border-secondary/20 rounded-xl px-4 py-2.5">
          <CheckCircle className="h-4 w-4 shrink-0" />
          Профиль сохранён
        </div>
      )}

      <Button
        onClick={save}
        disabled={saving}
        className="w-full bg-primary text-white hover:bg-primary/90 h-11 rounded-xl gap-2"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {saving ? 'Сохранение...' : 'Сохранить'}
      </Button>
    </div>
  )
}
