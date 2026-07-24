'use client'

import { useState, useEffect, useRef } from 'react'
import { X, PhoneCall } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getStoredUTM } from '@/components/shared/UTMCapture'

const SESSION_KEY = 'visakz_exit_shown'

export function ExitIntentModal() {
  const [open, setOpen] = useState(false)
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const fired = useRef(false)

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return

    const handleMouseLeave = (e: MouseEvent) => {
      if (fired.current) return
      if (e.clientY <= 0) {
        fired.current = true
        sessionStorage.setItem(SESSION_KEY, '1')
        setOpen(true)
      }
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    return () => document.removeEventListener('mouseleave', handleMouseLeave)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone.trim()) return
    setLoading(true)

    const utm = getStoredUTM()

    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Клиент (exit intent)',
          phone: phone.trim(),
          source: 'exit_intent',
          ...utm,
        }),
      })
    } catch { /* ignore */ }

    setLoading(false)
    setSubmitted(true)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl p-8">
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Закрыть"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex justify-center mb-4">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
            <PhoneCall className="h-7 w-7 text-primary" />
          </div>
        </div>

        {submitted ? (
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">Отлично!</h2>
            <p className="text-muted-foreground text-sm">
              Мы свяжемся с вами в WhatsApp в течение 15 минут.
            </p>
            <Button
              className="mt-6 w-full"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Закрыть
            </Button>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-center mb-1">Подождите!</h2>
            <p className="text-center font-semibold text-primary mb-2">
              Получите бесплатную консультацию
            </p>
            <p className="text-center text-sm text-muted-foreground mb-6">
              Наш эксперт разберёт вашу ситуацию и скажет шансы на одобрение
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="tel"
                placeholder="+7 (777) 123-45-67"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
                className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
              />
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white hover:bg-primary/90"
              >
                {loading ? 'Отправляем...' : 'Получить консультацию'}
              </Button>
            </form>

            <button
              onClick={() => setOpen(false)}
              className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Нет спасибо
            </button>
          </>
        )}
      </div>
    </div>
  )
}
