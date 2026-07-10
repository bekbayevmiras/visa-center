'use client'

import { useEffect, useRef, useState } from 'react'
import { trackWhatsAppClick } from '@/lib/analytics'

const WA_NUMBER = '77000000000'
const WA_MESSAGE = encodeURIComponent('Здравствуйте! Хочу оформить визу')
const WA_URL = `https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`

export function WhatsAppWidget() {
  const [showBubble, setShowBubble] = useState(false)
  const [bubbleDismissed, setBubbleDismissed] = useState(false)
  const [keyboardOpen, setKeyboardOpen] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Detect mobile keyboard via viewport resize
    const handleResize = () => {
      if (typeof window === 'undefined') return
      const visualViewportHeight = window.visualViewport?.height ?? window.innerHeight
      const windowHeight = window.innerHeight
      setKeyboardOpen(visualViewportHeight < windowHeight * 0.75)
    }

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
    }

    // Show chat bubble after 30 seconds
    timerRef.current = setTimeout(() => {
      if (!bubbleDismissed) setShowBubble(true)
    }, 30000)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize)
      }
    }
  }, [bubbleDismissed])

  const handleClick = () => {
    trackWhatsAppClick()
    window.open(WA_URL, '_blank', 'noopener,noreferrer')
  }

  const handleBubbleWrite = () => {
    setBubbleDismissed(true)
    setShowBubble(false)
    trackWhatsAppClick()
    window.open(WA_URL, '_blank', 'noopener,noreferrer')
  }

  if (keyboardOpen) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Delayed chat bubble */}
      {showBubble && !bubbleDismissed && (
        <div className="mb-1 flex flex-col items-end gap-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="relative max-w-[220px] rounded-2xl rounded-br-sm bg-white px-4 py-3 shadow-lg border border-border">
            <button
              onClick={() => { setShowBubble(false); setBubbleDismissed(true) }}
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-muted text-muted-foreground text-xs flex items-center justify-center hover:bg-muted/80 transition-colors"
              aria-label="Закрыть"
            >
              ×
            </button>
            <p className="text-sm font-medium text-foreground leading-snug">
              Привет! Могу помочь с визой 👋
            </p>
            <button
              onClick={handleBubbleWrite}
              className="mt-2 w-full rounded-xl bg-[#25D366] py-1.5 text-xs font-semibold text-white hover:bg-[#20bd5a] transition-colors"
            >
              Написать
            </button>
          </div>
          {/* Tail */}
          <div className="mr-4 h-2.5 w-3 overflow-hidden">
            <div className="h-4 w-4 rotate-45 bg-white border-r border-b border-border -translate-y-1 translate-x-0.5 shadow-sm" />
          </div>
        </div>
      )}

      {/* Main button */}
      <div className="group relative">
        {/* Tooltip */}
        <span className="pointer-events-none absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-foreground/90 px-3 py-1.5 text-xs font-medium text-background opacity-0 transition-opacity group-hover:opacity-100">
          Написать в WhatsApp
        </span>

        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />

        <button
          onClick={handleClick}
          aria-label="Написать в WhatsApp"
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#20bd5a] transition-all hover:scale-110 active:scale-95"
        >
          {/* WhatsApp SVG icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-7 w-7"
            aria-hidden="true"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
