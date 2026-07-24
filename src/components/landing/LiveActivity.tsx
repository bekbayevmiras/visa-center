'use client'

import { useState, useEffect, useCallback } from 'react'
import { X } from 'lucide-react'

const FALLBACK_ACTIVITIES = [
  { text: 'Асель из Алматы получила визу в 🇩🇪 Германию', time: 'сегодня' },
  { text: 'Данияр подал документы на 🇫🇷 Францию', time: 'сегодня' },
  { text: 'Айгерим оформила срочную визу в 🇦🇪 ОАЭ', time: 'сегодня' },
  { text: 'Новая заявка на 🇪🇸 Испанию принята', time: 'сегодня' },
  { text: 'Виза в 🇺🇸 США одобрена', time: 'сегодня' },
  { text: 'Болат успешно получил шенгенскую визу', time: 'сегодня' },
  { text: 'Зарина оформила визу в 🇹🇷 Турцию за 1 день', time: 'сегодня' },
]

interface Activity {
  text: string
  time: string
}

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
  const [activities, setActivities] = useState<Activity[]>(FALLBACK_ACTIVITIES)

  // Загружаем реальные данные
  useEffect(() => {
    fetch('/api/stats/live')
      .then(r => r.json())
      .then(data => {
        if (data.activities && data.activities.length >= 3) {
          setActivities(data.activities)
        }
      })
      .catch(() => { /* используем fallback */ })
  }, [])

  const showNext = useCallback(() => {
    setAnimating(true)
    setTimeout(() => setAnimating(false), 300)
    setTimeout(() => {
      setAnimating(true)
      setTimeout(() => {
        setCurrent(i => (i + 1) % activities.length)
        setAnimating(false)
      }, 400)
    }, 4400)
  }, [activities.length])

  useEffect(() => {
    if (dismissed) return
    const startTimer = setTimeout(() => {
      setVisible(true)
      showNext()
    }, 2000)
    return () => clearTimeout(startTimer)
  }, [dismissed, showNext])

  useEffect(() => {
    if (!visible || dismissed) return
    const timer = setTimeout(() => {
      showNext()
    }, 5200)
    return () => clearTimeout(timer)
  }, [current, visible, dismissed, showNext])

  if (dismissed || !visible) return null

  const activity = activities[current]
  const initials = getInitials(activity.text)
  const color = AVATAR_COLORS[current % AVATAR_COLORS.length]

  return (
    <div
      className={`fixed bottom-6 left-4 z-50 flex items-start gap-3 rounded-2xl border border-border bg-card shadow-lg px-4 py-3 max-w-xs transition-all duration-300 ${
        animating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
      }`}
    >
      <div className={`h-9 w-9 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-snug line-clamp-2">{activity.text}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
      </div>

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
