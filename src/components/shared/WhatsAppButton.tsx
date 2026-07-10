'use client'

import { MessageCircle } from 'lucide-react'

const WA_NUMBER = '77000000000'
const WA_MESSAGE = 'Здравствуйте! Хочу узнать подробнее об оформлении визы.'

export function WhatsAppButton() {
  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_MESSAGE)}`

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Написать в WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#20bd5a] transition-all hover:scale-110 active:scale-95"
    >
      <MessageCircle className="h-7 w-7" fill="currentColor" />
    </a>
  )
}
