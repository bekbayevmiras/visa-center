'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, User, Bot } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Message = {
  id: string
  content: string
  direction: 'inbound' | 'outbound'
  sent_by: string
  created_at: string
  is_read: boolean
}

export function AdminChatThread({
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

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Mark inbound messages as read when thread opens
  useEffect(() => {
    const markRead = async () => {
      await fetch(`/api/admin/inbox/${userId}/messages`, {
        method: 'PATCH',
      })
    }
    markRead()
  }, [userId])

  // Realtime subscription for new messages
  useEffect(() => {
    const channel = supabase
      .channel('admin-chat-' + userId)
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
          // Add inbound messages (from client) in real time
          if (msg.direction === 'inbound') {
            setMessages(prev => {
              // Avoid duplicates
              if (prev.some(m => m.id === msg.id)) return prev
              return [...prev, msg]
            })
            // Mark the new inbound message as read immediately
            fetch(`/api/admin/inbox/${userId}/messages`, { method: 'PATCH' })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  const send = async () => {
    if (!text.trim() || sending) return
    setSending(true)
    const content = text.trim()
    setText('')

    // Optimistic message
    const optimistic: Message = {
      id: crypto.randomUUID(),
      content,
      direction: 'outbound',
      sent_by: 'manager',
      created_at: new Date().toISOString(),
      is_read: true,
    }
    setMessages(prev => [...prev, optimistic])

    try {
      const res = await fetch(`/api/admin/inbox/${userId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (res.ok) {
        const data = await res.json()
        // Replace optimistic with real message
        setMessages(prev =>
          prev.map(m => (m.id === optimistic.id ? (data.message as Message) : m))
        )
      }
    } catch (e) {
      console.error('send error', e)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-2">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-12">
            <Bot className="h-12 w-12 mb-3 opacity-20" />
            <p className="text-sm font-medium">Нет сообщений</p>
            <p className="text-xs mt-1">Напишите клиенту первым</p>
          </div>
        )}

        {messages.map(msg => {
          // In admin view: inbound = client (left), outbound = manager (right)
          const isManager = msg.direction === 'outbound'
          return (
            <div
              key={msg.id}
              className={`flex gap-2 ${isManager ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                  isManager ? 'bg-primary/10' : 'bg-muted'
                }`}
              >
                {isManager ? (
                  <Bot className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[75%] flex flex-col gap-0.5 ${
                  isManager ? 'items-end' : 'items-start'
                }`}
              >
                <span className="text-[10px] text-muted-foreground px-1 font-medium">
                  {isManager ? 'Менеджер' : 'Клиент'}
                </span>
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm ${
                    isManager
                      ? 'bg-primary text-white rounded-tr-sm'
                      : 'bg-muted text-foreground rounded-tl-sm'
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-[10px] text-muted-foreground px-1">
                  {formatTime(msg.created_at)}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="pt-3 border-t border-border shrink-0">
        <div className="flex gap-2">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e =>
              e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())
            }
            placeholder="Написать клиенту..."
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
      </div>
    </div>
  )
}
