import { CheckCircle, Circle, Clock } from 'lucide-react'
import { ApplicationStatus } from '@/lib/supabase/types'

const STEPS: { status: ApplicationStatus; label: string }[] = [
  { status: 'new', label: 'Принята' },
  { status: 'docs_collection', label: 'Документы' },
  { status: 'docs_review', label: 'Проверка' },
  { status: 'submitted', label: 'Подача' },
  { status: 'in_progress', label: 'В работе' },
  { status: 'approved', label: 'Виза' },
]

const STATUS_ORDER: ApplicationStatus[] = [
  'new', 'consultation', 'docs_collection', 'docs_review',
  'docs_ready', 'submitted', 'in_progress', 'approved',
]

function getStepIndex(status: ApplicationStatus): number {
  return STATUS_ORDER.indexOf(status)
}

export function StatusTracker({ status }: { status: ApplicationStatus }) {
  const currentIndex = getStepIndex(status)
  const isRejected = status === 'rejected'

  return (
    <div className="w-full">
      <div className="flex items-center">
        {STEPS.map((step, i) => {
          const stepIndex = getStepIndex(step.status)
          const done = currentIndex > stepIndex
          const active = currentIndex === stepIndex
          const isLast = i === STEPS.length - 1

          return (
            <div key={step.status} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                  isRejected && active
                    ? 'bg-red-100 text-red-600'
                    : done
                    ? 'bg-secondary text-white'
                    : active
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {done ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : active ? (
                    <Clock className="h-4 w-4 animate-pulse" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </div>
                <span className={`mt-1.5 text-xs whitespace-nowrap ${
                  done || active ? 'font-medium text-foreground' : 'text-muted-foreground'
                }`}>
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div className={`flex-1 h-0.5 mx-1 mb-5 transition-colors ${
                  done ? 'bg-secondary' : 'bg-border'
                }`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
