import { FileText, Upload, Stamp } from 'lucide-react'

const STEPS = [
  {
    icon: FileText,
    step: '01',
    title: 'Подаёте заявку',
    description: 'Выбираете страну, тип визы и заполняете форму за 5 минут. Бесплатная консультация включена.',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: Upload,
    step: '02',
    title: 'Загружаете документы',
    description: 'Фотографируете и загружаете через личный кабинет или WhatsApp. AI проверяет каждый документ за 30 секунд.',
    color: 'bg-secondary/10 text-secondary',
  },
  {
    icon: Stamp,
    step: '03',
    title: 'Получаете визу',
    description: 'Мы подаём документы в посольство и держим вас в курсе каждого шага. Виза приходит по SMS.',
    color: 'bg-accent/20 text-amber-600',
  },
]

export function HowItWorks() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Как это работает</h2>
          <p className="mt-3 text-muted-foreground">Три простых шага — и виза у вас</p>
        </div>

        <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Connector line (desktop) */}
          <div className="absolute top-8 left-1/3 right-1/3 hidden h-0.5 bg-border md:block" />

          {STEPS.map((step) => {
            const Icon = step.icon
            return (
              <div key={step.step} className="relative flex flex-col items-center text-center">
                <div className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl ${step.color} mb-6`}>
                  <Icon className="h-8 w-8" />
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background text-xs font-bold">
                    {step.step}
                  </span>
                </div>
                <h3 className="mb-3 text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
