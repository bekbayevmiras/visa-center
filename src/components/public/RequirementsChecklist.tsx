'use client'

import { useState } from 'react'
import { CheckSquare, Square } from 'lucide-react'

interface RequirementsChecklistProps {
  required: string[]
  recommended: string[]
}

export function RequirementsChecklist({ required, recommended }: RequirementsChecklistProps) {
  const total = required.length + recommended.length
  const [checked, setChecked] = useState<Set<number>>(new Set())

  const toggle = (i: number) => {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  const done = checked.size

  return (
    <div>
      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="text-muted-foreground">Прогресс подготовки</span>
          <span className="font-medium text-primary">
            Подготовлено {done} из {total} документов
          </span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: total > 0 ? `${(done / total) * 100}%` : '0%' }}
          />
        </div>
      </div>

      {/* Required */}
      {required.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-foreground mb-2">Обязательные документы</h3>
          <ul className="space-y-1">
            {required.map((req, i) => {
              const isChecked = checked.has(i)
              return (
                <li
                  key={i}
                  onClick={() => toggle(i)}
                  className={`flex items-start gap-3 text-sm cursor-pointer rounded-lg px-3 py-2 transition-colors select-none
                    ${isChecked ? 'bg-primary/5 text-muted-foreground' : 'hover:bg-muted/50'}`}
                >
                  {isChecked
                    ? <CheckSquare className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    : <Square className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  }
                  <span className={isChecked ? 'line-through' : ''}>{req}</span>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Recommended */}
      {recommended.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2">Рекомендуемые документы</h3>
          <ul className="space-y-1">
            {recommended.map((rec, i) => {
              const globalIdx = required.length + i
              const isChecked = checked.has(globalIdx)
              return (
                <li
                  key={i}
                  onClick={() => toggle(globalIdx)}
                  className={`flex items-start gap-3 text-sm cursor-pointer rounded-lg px-3 py-2 transition-colors select-none
                    ${isChecked ? 'bg-primary/5 text-muted-foreground' : 'hover:bg-muted/50'}`}
                >
                  {isChecked
                    ? <CheckSquare className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    : <Square className="h-4 w-4 text-muted-foreground/60 shrink-0 mt-0.5" />
                  }
                  <span className={`text-muted-foreground${isChecked ? ' line-through' : ''}`}>{rec}</span>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
