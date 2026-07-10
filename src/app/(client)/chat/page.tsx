import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ChatWindow } from '@/components/client/ChatWindow'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Чат с менеджером — VisaKZ' }

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rawMessages } = await supabase
    .from('messages')
    .select('id, content, direction, sent_by, created_at, is_read')
    .eq('user_id', user.id)
    .eq('channel', 'internal')
    .order('created_at', { ascending: true })
    .limit(100)

  const messages = (rawMessages ?? []) as Array<{
    id: string
    content: string
    direction: 'inbound' | 'outbound'
    sent_by: string
    created_at: string
    is_read: boolean
  }>

  return <ChatWindow userId={user.id} initialMessages={messages} />
}
