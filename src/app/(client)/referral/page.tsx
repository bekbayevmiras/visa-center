'use client'

import { useState, useEffect, useCallback } from 'react'
import { Gift, Copy, Check, Users, Banknote, Share2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const SITE_URL = 'https://visakz.kz'

export default function ReferralPage() {
  const [code, setCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [stats, setStats] = useState({ uses: 0, earned: 0 })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      // Generate or get existing code
      const res = await fetch('/api/referral/generate', { method: 'POST' })
      const json = await res.json()
      if (json.code) {
        setCode(json.code)
        // Load stats via supabase client
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: referralRow } = await (supabase as any)
          .from('referrals')
          .select('uses_count, reward_amount')
          .eq('code', json.code)
          .single()
        if (referralRow) {
          const row = referralRow as { uses_count: number; reward_amount: number }
          setStats({ uses: row.uses_count ?? 0, earned: (row.uses_count ?? 0) * (row.reward_amount ?? 5000) })
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const copyCode = async () => {
    if (!code) return
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareWhatsApp = () => {
    if (!code) return
    const text = `Оформляю визу через VisaKZ — советую! Скидка 10% по моему коду: ${code} → ${SITE_URL}/apply?ref=${code}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  const HOW_IT_WORKS = [
    { icon: Share2, title: 'Поделитесь кодом', desc: 'Отправьте ваш персональный код другу через WhatsApp или любой мессенджер' },
    { icon: Gift, title: 'Друг получает скидку', desc: 'Ваш друг использует код при оформлении и получает скидку 10% на первую заявку' },
    { icon: Banknote, title: 'Вы получаете 5 000 ₸', desc: 'После успешного оформления визы другом мы начислим вам 5 000 ₸ на баланс' },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Gift className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2">Пригласите друга — получите 5 000 ₸</h1>
        <p className="text-muted-foreground">
          Поделитесь персональным кодом. Друг получит скидку 10%, а вы — вознаграждение.
        </p>
      </div>

      {/* Referral code */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground mb-3 font-medium">Ваш реферальный код</p>
        {loading ? (
          <div className="h-16 bg-muted animate-pulse rounded-xl" />
        ) : code ? (
          <>
            <div className="flex items-center gap-3">
              <div className="flex-1 rounded-xl bg-muted px-5 py-4 text-center text-3xl font-bold tracking-widest font-mono">
                {code}
              </div>
              <Button
                variant="outline"
                size="lg"
                onClick={copyCode}
                className="gap-2 shrink-0"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Скопировано' : 'Копировать'}
              </Button>
            </div>

            <Button
              onClick={shareWhatsApp}
              className="mt-4 w-full bg-[#25D366] hover:bg-[#22c55e] text-white gap-2"
              size="lg"
            >
              <Share2 className="h-4 w-4" />
              Поделиться в WhatsApp
            </Button>

            <p className="mt-3 text-xs text-center text-muted-foreground">
              Ссылка: {SITE_URL}/apply?ref={code}
            </p>
          </>
        ) : (
          <p className="text-sm text-destructive">Не удалось загрузить код. Обновите страницу.</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <div className="flex justify-center mb-2">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <p className="text-3xl font-bold">{stats.uses}</p>
          <p className="text-sm text-muted-foreground mt-1">Друзей приглашено</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <div className="flex justify-center mb-2">
            <Banknote className="h-6 w-6 text-secondary" />
          </div>
          <p className="text-3xl font-bold">{stats.earned.toLocaleString('ru-RU')} ₸</p>
          <p className="text-sm text-muted-foreground mt-1">Заработано</p>
        </div>
      </div>

      {/* How it works */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold mb-5">Как это работает</h2>
        <div className="space-y-4">
          {HOW_IT_WORKS.map((step, i) => {
            const Icon = step.icon
            return (
              <div key={i} className="flex items-start gap-4">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground">ШАГ {i + 1}</span>
                    {i < HOW_IT_WORKS.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                  </div>
                  <p className="font-medium text-sm mt-0.5">{step.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
