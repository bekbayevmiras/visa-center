import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/client/ProfileForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Мой профиль — VisaKZ' }

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profileData } = await supabase
    .from('users')
    .select('full_name, phone, passport_number, passport_expiry, birth_date, citizenship')
    .eq('id', user.id)
    .single()

  const profile = profileData as {
    full_name: string
    phone: string | null
    passport_number: string | null
    passport_expiry: string | null
    birth_date: string | null
    citizenship: string
  } | null

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-1">Мой профиль</h1>
      <p className="text-muted-foreground text-sm mb-8">Данные автоматически подставляются в заявки</p>
      <ProfileForm
        userId={user.id}
        email={user.email ?? ''}
        initialData={{
          full_name: profile?.full_name ?? '',
          phone: profile?.phone ?? '',
          passport_number: profile?.passport_number ?? '',
          passport_expiry: profile?.passport_expiry ?? '',
          birth_date: profile?.birth_date ?? '',
          citizenship: profile?.citizenship ?? 'KZ',
        }}
      />
    </div>
  )
}
