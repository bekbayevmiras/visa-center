'use client'

import { useEffect, useRef, useState } from 'react'

const STATS = [
  { value: 1200, suffix: '+', label: 'виз выдано', color: 'text-primary' },
  { value: 98, suffix: '%', label: 'одобрений', color: 'text-secondary' },
  { value: 28, suffix: '', label: 'стран', color: 'text-accent' },
  { value: 4.9, suffix: '★', label: 'рейтинг Google', color: 'text-yellow-500' },
]

function useCountUp(target: number, duration = 1500, start = false) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!start) return
    const isDecimal = target % 1 !== 0
    const steps = 60
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(isDecimal ? Math.round(current * 10) / 10 : Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [target, duration, start])

  return count
}

function StatItem({ stat }: { stat: typeof STATS[0] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const count = useCountUp(stat.value, 1500, visible)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="flex flex-col items-center">
      <span className={`text-4xl font-bold md:text-5xl ${stat.color}`}>
        {count}{stat.suffix}
      </span>
      <span className="mt-1 text-sm text-muted-foreground">{stat.label}</span>
    </div>
  )
}

export function SocialProof() {
  return (
    <section className="border-y border-border bg-card py-12">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {STATS.map(stat => (
            <StatItem key={stat.label} stat={stat} />
          ))}
        </div>
      </div>
    </section>
  )
}
