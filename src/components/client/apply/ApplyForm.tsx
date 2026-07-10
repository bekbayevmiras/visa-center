'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { StepCountry } from '@/components/client/apply/StepCountry'
import { StepDetails } from '@/components/client/apply/StepDetails'
import { StepDocuments } from '@/components/client/apply/StepDocuments'
import { StepPayment } from '@/components/client/apply/StepPayment'
import { StepConfirm } from '@/components/client/apply/StepConfirm'
import { Check } from 'lucide-react'
import { ApplyFormData } from '@/app/(client)/apply/page'

const STEPS = [
  { label: 'Направление' },
  { label: 'Данные' },
  { label: 'Документы' },
  { label: 'Оплата' },
  { label: 'Готово' },
]

export type InitialProfile = {
  full_name?: string
  phone?: string
  email?: string
  passport_number?: string
  passport_expiry?: string
}

const INITIAL: ApplyFormData = {
  country_id: '',
  country_code: '',
  country_name: '',
  country_flag: '',
  visa_type_id: '',
  visa_type_name: '',
  visa_price: 0,
  express_price: 0,
  is_express: false,
  travel_date_from: '',
  travel_date_to: '',
  travel_purpose: 'tourist',
  adults_count: 1,
  children_count: 0,
  full_name: '',
  phone: '',
  email: '',
  passport_number: '',
  passport_expiry: '',
}

export function ApplyForm({ initialProfile }: { initialProfile?: InitialProfile }) {
  const searchParams = useSearchParams()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<ApplyFormData>({
    ...INITIAL,
    country_code: searchParams.get('country') ?? '',
    full_name: initialProfile?.full_name ?? '',
    phone: initialProfile?.phone ?? '',
    email: initialProfile?.email ?? '',
    passport_number: initialProfile?.passport_number ?? '',
    passport_expiry: initialProfile?.passport_expiry ?? '',
  })

  // Only prefill fields that are still empty (don't override user edits)
  useEffect(() => {
    if (!initialProfile) return
    setData(prev => ({
      ...prev,
      full_name: prev.full_name || initialProfile.full_name || '',
      phone: prev.phone || initialProfile.phone || '',
      email: prev.email || initialProfile.email || '',
      passport_number: prev.passport_number || initialProfile.passport_number || '',
      passport_expiry: prev.passport_expiry || initialProfile.passport_expiry || '',
    }))
  }, [initialProfile])

  const update = (patch: Partial<ApplyFormData>) => setData(d => ({ ...d, ...patch }))
  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1))
  const prev = () => setStep(s => Math.max(s - 1, 0))

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step indicator */}
      <div className="mb-8">
        <div className="flex items-center">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  i < step
                    ? 'bg-secondary text-white'
                    : i === step
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span className={`mt-1.5 text-xs whitespace-nowrap hidden sm:block ${
                  i <= step ? 'text-foreground font-medium' : 'text-muted-foreground'
                }`}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-5 ${i < step ? 'bg-secondary' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
        {step === 0 && <StepCountry data={data} update={update} onNext={next} />}
        {step === 1 && <StepDetails data={data} update={update} onNext={next} onPrev={prev} />}
        {step === 2 && <StepDocuments data={data} update={update} onNext={next} onPrev={prev} />}
        {step === 3 && <StepPayment data={data} update={update} onNext={next} onPrev={prev} />}
        {step === 4 && <StepConfirm data={data} />}
      </div>
    </div>
  )
}
