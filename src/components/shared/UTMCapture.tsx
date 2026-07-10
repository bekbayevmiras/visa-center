'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

const UTM_KEY = 'visakz_utm'

export function UTMCapture() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const utm_source = searchParams.get('utm_source')
    const utm_medium = searchParams.get('utm_medium')
    const utm_campaign = searchParams.get('utm_campaign')

    // Only save if at least one UTM param is present
    if (!utm_source && !utm_medium && !utm_campaign) return

    const utmData: Record<string, string> = {}
    if (utm_source) utmData.utm_source = utm_source
    if (utm_medium) utmData.utm_medium = utm_medium
    if (utm_campaign) utmData.utm_campaign = utm_campaign

    try {
      localStorage.setItem(UTM_KEY, JSON.stringify(utmData))
    } catch { /* localStorage unavailable */ }
  }, [searchParams])

  return null
}
