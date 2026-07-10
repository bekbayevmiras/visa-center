'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Bot, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Message = {
  id: string
  content: string
  direction: 'inbound' | 'outbound'
  sent_by: string
  created_at: string
  is_read: boolean
}

export function ChatWindow({
  userId,
  initialMessages,
}: {
  userId: string
  initialMessages: Message[]
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const channel = supabase
      .channel('chat-' + userId)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const msg = payload.new as Message
          if (msg.direction === 'outbound') {
            setMessages(prev => [...prev, msg])
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, supabase])

  const send = async () => {
    if (!text.trim() || sending) return
    setSending(true)
    const content = text.trim()
    setText('')

    const optimistic: Message = {
      id: crypto.randomUUID(),
      content,
      direction: 'inbound',
      sent_by: userId,
      created_at: new Date().toISOString(),
      is_read: false,
    }
    setMessages(prev => [...prev, optimistic])

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('messages').insert({
        user_id: userId,
        channel: 'internal',
        direction: 'inbound',
        content,
        sent_by: userId,
        is_read: false,
      })
    } catch (e) {
      console.error('send error', e)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 mb-4 border-b border-border">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-sm">Менеджер VisaKZ</p>
          <p className="text-xs text-muted-foreground">Отвечаем пн–пт 9:00–18:00</p>
        </div>
        <span className="ml-auto flex items-center gap-1.5 text-xs text-secondary">
          <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
          Онлайн
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-2">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <Bot className="h-12 w-12 mb-3 opacity-20" />
            <p className="text-sm font-medium">Напишите нам</p>
            <p className="text-xs mt-1">Менеджер ответит в рабочее время</p>
          </div>
        )}

        {messages.map(msg => {
          const isClient = msg.direction === 'inbound'
          return (
            <div key={msg.id} className={`flex gap-2 ${isClient ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                isClient ? 'bg-primary/10' : 'bg-muted'
              }`}>
                {isClient
                  ? <User className="h-3.5 w-3.5 text-primary" />
                  : <Bot className="h-3.5 w-3.5 text-muted-foreground" />
                }
              </div>
              <div className={`max-w-[75%] ${isClient ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                <div className={`rounded-2xl px-4 py-2.5 text-sm ${
                  isClient
                    ? 'bg-primary text-white rounded-tr-sm'
                    : 'bg-muted text-foreground rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
                <span className="text-[10px] text-muted-foreground px-1">{formatTime(msg.created_at)}</span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="pt-3 border-t border-border">
        <div className="flex gap-2">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
            placeholder="Напишите сообщение..."
            className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
          />
          <button
            onClick={send}
            disabled={!text.trim() || sending}
            className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 disabled:opacity-40 transition-all shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
          Или напишите нам в{' '}
          <a href="https://wa.me/77000000000" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            WhatsApp
          </a>
        </p>
      </div>
    </div>
  )
}
