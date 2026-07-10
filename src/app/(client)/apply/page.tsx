import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ApplyForm } from '@/components/client/apply/ApplyForm'
import type { InitialProfile } from '@/components/client/apply/ApplyForm'

// Re-export ApplyFormData so other components can import from this path
export type ApplyFormData = {
  country_id: string
  country_code: string
  country_name: string
  country_flag: string
  visa_type_id: string
  visa_type_name: string
  visa_price: number
  express_price: number
  is_express: boolean
  travel_date_from: string
  travel_date_to: string
  travel_purpose: string
  adults_count: number
  children_count: number
  full_name: string
  phone: string
  email: string
  passport_number: string
  passport_expiry: string
  application_id?: string
}

export default async function ApplyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let initialProfile: InitialProfile | undefined

  if (user) {
    const { data } = await supabase
      .from('users')
      .select('full_name, phone, passport_number, passport_expiry')
      .eq('id', user.id)
      .single()

    const profile = data as {
      full_name: string | null
      phone: string | null
      passport_number: string | null
      passport_expiry: string | null
    } | null

    initialProfile = {
      full_name: profile?.full_name ?? undefined,
      phone: profile?.phone ?? undefined,
      email: user.email ?? undefined,
      passport_number: profile?.passport_number ?? undefined,
      passport_expiry: profile?.passport_expiry ?? undefined,
    }
  }

  return (
    <Suspense>
      <ApplyForm initialProfile={initialProfile} />
    </Suspense>
  )
}
