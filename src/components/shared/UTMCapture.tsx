'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

const UTM_KEY = 'visakz_utm'
const TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 дней — стандарт last-touch

export function UTMCapture() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const utm_source = searchParams.get('utm_source')
    const utm_medium = searchParams.get('utm_medium')
    const utm_campaign = searchParams.get('utm_campaign')
    const utm_content = searchParams.get('utm_content')

    if (!utm_source && !utm_medium && !utm_campaign) return

    const utmData: Record<string, string> = { _ts: String(Date.now()) }
    if (utm_source) utmData.utm_source = utm_source
    if (utm_medium) utmData.utm_medium = utm_medium
    if (utm_campaign) utmData.utm_campaign = utm_campaign
    if (utm_content) utmData.utm_content = utm_content

    try {
      localStorage.setItem(UTM_KEY, JSON.stringify(utmData))
    } catch { /* localStorage unavailable */ }
  }, [searchParams])

  return null
}

/** Читает сохранённые UTM-параметры. Возвращает {} если нет или истёк TTL. */
export function getStoredUTM(): { utm_source?: string; utm_medium?: string; utm_campaign?: string; utm_content?: string } {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(UTM_KEY)
    if (!raw) return {}
    const data = JSON.parse(raw) as Record<string, string>
    if (data._ts && Date.now() - Number(data._ts) > TTL_MS) {
      localStorage.removeItem(UTM_KEY)
      return {}
    }
    return {
      utm_source: data.utm_source,
      utm_medium: data.utm_medium,
      utm_campaign: data.utm_campaign,
      utm_content: data.utm_content,
    }
  } catch {
    return {}
  }
}
