import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { MessageSquare } from 'lucide-react'

type ConversationRow = {
  user_id: string
  full_name: string
  email: string | null
  phone: string | null
  last_message: string
  last_message_at: string
  unread_count: number
}

export default async function AdminInboxPage() {
  const supabase = createAdminClient()

  // Get all internal messages to build conversation list
  const { data: messagesRaw } = await (supabase as any)
    .from('messages')
    .select('user_id, content, direction, is_read, created_at')
    .eq('channel', 'internal')
    .not('user_id', 'is', null)
    .order('created_at', { ascending: false })

  const messages = (messagesRaw ?? []) as {
    user_id: string
    content: string
    direction: string
    is_read: boolean
    created_at: string
  }[]

  // Group by user_id — take latest message per user (already sorted desc) and count unreads
  const convMap = new Map<
    string,
    { last_message: string; last_message_at: string; unread_count: number }
  >()

  for (const msg of messages) {
    if (!msg.user_id) continue
    if (!convMap.has(msg.user_id)) {
      convMap.set(msg.user_id, {
        last_message: msg.content,
        last_message_at: msg.created_at,
        unread_count: 0,
      })
    }
    if (msg.direction === 'inbound' && !msg.is_read) {
      const entry = convMap.get(msg.user_id)!
      entry.unread_count += 1
    }
  }

  // Fetch user info for all user_ids
  const userIds = Array.from(convMap.keys())
  let conversations: ConversationRow[] = []

  if (userIds.length > 0) {
    const { data: usersRaw } = await (supabase as any)
      .from('users')
      .select('id, full_name, email, phone')
      .in('id', userIds)

    const users = (usersRaw ?? []) as {
      id: string
      full_name: string
      email: string | null
      phone: string | null
    }[]

    conversations = users.map(u => {
      const conv = convMap.get(u.id)!
      return {
        user_id: u.id,
        full_name: u.full_name,
        email: u.email,
        phone: u.phone,
        last_message: conv.last_message,
        last_message_at: conv.last_message_at,
        unread_count: conv.unread_count,
      }
    })

    // Sort by latest message desc
    conversations.sort(
      (a, b) =>
        new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
    )
  }

  const truncate = (text: string, max = 60) =>
    text.length > max ? text.slice(0, max) + '…' : text

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          Входящие сообщения
        </h1>
        <p className="text-muted-foreground mt-1">
          Переписка с клиентами через внутренний чат
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mb-3 opacity-20" />
            <p className="text-sm font-medium">Нет сообщений</p>
            <p className="text-xs mt-1">Когда клиенты напишут — диалоги появятся здесь</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {conversations.map(conv => {
              const hasUnread = conv.unread_count > 0
              return (
                <li key={conv.user_id}>
                  <Link
                    href={`/admin/inbox/${conv.user_id}`}
                    className={`flex items-start gap-4 px-5 py-4 hover:bg-muted/40 transition-colors ${
                      hasUnread ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                    }`}
                  >
                    {/* Avatar */}
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-sm font-semibold text-primary">
                        {conv.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-sm truncate ${
                            hasUnread
                              ? 'font-bold text-foreground'
                              : 'font-medium text-foreground'
                          }`}
                        >
                          {conv.full_name}
                        </span>
                        <span className="text-[11px] text-muted-foreground shrink-0">
                          {formatDistanceToNow(new Date(conv.last_message_at), {
                            addSuffix: true,
                            locale: ru,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <p
                          className={`text-xs truncate ${
                            hasUnread ? 'text-foreground' : 'text-muted-foreground'
                          }`}
                        >
                          {truncate(conv.last_message)}
                        </p>
                        {hasUnread && (
                          <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-primary text-white text-[10px] font-bold shrink-0">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                      {conv.phone && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {conv.phone}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
