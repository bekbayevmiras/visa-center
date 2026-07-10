'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MessageCircle, Phone } from 'lucide-react'
import { trackLead } from '@/lib/analytics'

export function CTASection() {
  const [form, setForm] = useState({ name: '', phone: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    trackLead()
    await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSubmitted(true)
  }

  return (
    <section className="bg-primary py-16 md:py-24">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center text-white">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Получите бесплатную консультацию
          </h2>
          <p className="mb-10 text-primary-foreground/80">
            Расскажем какие документы нужны, сколько стоит и как быстро можно получить визу именно в вашем случае.
          </p>

          {submitted ? (
            <div className="rounded-2xl bg-white/10 p-8 backdrop-blur">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="text-xl font-semibold mb-2">Заявка принята!</h3>
              <p className="text-primary-foreground/80">
                Наш менеджер свяжется с вами в WhatsApp в течение 15 минут.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <input
                type="text"
                placeholder="Ваше имя"
                required
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 outline-none focus:border-white/50 focus:bg-white/15 max-w-xs"
              />
              <input
                type="tel"
                placeholder="+7 (___) ___-__-__"
                required
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 outline-none focus:border-white/50 focus:bg-white/15 max-w-xs"
              />
              <Button
                type="submit"
                className="bg-white text-primary hover:bg-white/90 font-semibold px-8 py-3 rounded-xl h-auto"
              >
                Получить консультацию
              </Button>
            </form>
          )}

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-primary-foreground/70">
            <a href="https://wa.me/77000000000" className="flex items-center gap-2 hover:text-white transition-colors">
              <MessageCircle className="h-4 w-4" />
              Написать в WhatsApp
            </a>
            <span className="hidden sm:block">·</span>
            <a href="tel:+77000000000" className="flex items-center gap-2 hover:text-white transition-colors">
              <Phone className="h-4 w-4" />
              +7 (700) 000-0000
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
