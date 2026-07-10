import Link from 'next/link'
import { CheckCircle, LayoutDashboard, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ApplyFormData } from '@/components/client/apply/types'

const STEPS_NEXT = [
  'Менеджер свяжется с вами в WhatsApp в течение 15 минут',
  'Проверим все загруженные документы (AI + менеджер)',
  'Уведомим о каждом шаге — подача, результат',
]

export function StepConfirm({ data }: { data: ApplyFormData }) {
  return (
    <div className="text-center">
      <div className="flex justify-center mb-6">
        <div className="h-20 w-20 rounded-full bg-secondary/10 flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-secondary" />
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-2">Заявка подана!</h2>
      <p className="text-muted-foreground mb-8">
        {data.country_flag} Виза в {data.country_name} · {data.visa_type_name}
      </p>

      <div className="rounded-2xl bg-muted/30 border border-border p-6 text-left mb-8">
        <h3 className="font-semibold mb-4 text-sm">Что дальше:</h3>
        <ol className="space-y-3">
          {STEPS_NEXT.map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
                {i + 1}
              </span>
              <span className="text-muted-foreground">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-col gap-3">
        <Link href="/dashboard">
          <Button className="w-full bg-primary text-white hover:bg-primary/90 h-11 gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Перейти в личный кабинет
          </Button>
        </Link>
        <a href="https://wa.me/77000000000" target="_blank" rel="noopener noreferrer">
          <Button variant="outline" className="w-full h-11 gap-2">
            <MessageCircle className="h-4 w-4 text-[#25D366]" />
            Написать в WhatsApp
          </Button>
        </a>
      </div>
    </div>
  )
}
