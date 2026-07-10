'use client'

import { useState, useEffect, useCallback } from 'react'
import { X } from 'lucide-react'

const ACTIVITIES = [
  { text: 'Асель из Алматы получила визу в 🇩🇪 Германию', time: '2 мин назад' },
  { text: 'Данияр подал документы на 🇫🇷 Францию', time: '5 мин назад' },
  { text: 'Айгерим оформила срочную визу в 🇦🇪 ОАЭ', time: '12 мин назад' },
  { text: 'Новая заявка на 🇪🇸 Испанию принята', time: '18 мин назад' },
  { text: 'Виза в 🇺🇸 США одобрена для клиента из Нур-Султана', time: '31 мин назад' },
  { text: 'Болат успешно получил шенгенскую визу', time: '45 мин назад' },
  { text: 'Зарина оформила визу в 🇹🇷 Турцию за 1 день', time: '1 час назад' },
]

function getInitials(text: string): string {
  const names = ['Асель', 'Данияр', 'Айгерим', 'Болат', 'Зарина', 'Нурлан', 'Мадина']
  for (const name of names) {
    if (text.includes(name)) return name.slice(0, 2).toUpperCase()
  }
  return 'ВК'
}

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-green-500', 'bg-purple-500',
  'bg-orange-500', 'bg-pink-500', 'bg-teal-500', 'bg-red-500',
]

export function LiveActivity() {
  const [dismissed, setDismissed] = useState(false)
  const [visible, setVisible] = useState(false)
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)

  const showNext = useCallback((index: number) => {
    setAnimating(true)
    // Slide in
    setTimeout(() => setAnimating(false), 300)
    // Stay 4 seconds, then slide out
    setTimeout(() => {
      setAnimating(true)
      setTimeout(() => {
        setCurrent(i => (i + 1) % ACTIVITIES.length)
        setAnimating(false)
        // Schedule next
      }, 400)
    }, 4400)
  }, [])

  useEffect(() => {
    if (dismissed) return

    // Start after 2 seconds
    const startTimer = setTimeout(() => {
      setVisible(true)
      showNext(0)
    }, 2000)

    return () => clearTimeout(startTimer)
  }, [dismissed, showNext])

  // Cycle through activities
  useEffect(() => {
    if (!visible || dismissed) return
    const timer = setTimeout(() => {
      showNext(current)
    }, 5200)
    return () => clearTimeout(timer)
  }, [current, visible, dismissed, showNext])

  if (dismissed || !visible) return null

  const activity = ACTIVITIES[current]
  const initials = getInitials(activity.text)
  const color = AVATAR_COLORS[current % AVATAR_COLORS.length]

  return (
    <div
      className={`fixed bottom-6 left-4 z-50 flex items-start gap-3 rounded-2xl border border-border bg-card shadow-lg px-4 py-3 max-w-xs transition-all duration-300 ${
        animating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
      }`}
    >
      {/* Avatar */}
      <div className={`h-9 w-9 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
        {initials}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-snug line-clamp-2">{activity.text}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
      </div>

      {/* Dismiss */}
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Закрыть"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
