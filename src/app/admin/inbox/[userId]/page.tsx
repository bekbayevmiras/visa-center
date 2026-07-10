import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Phone, Mail, ExternalLink } from 'lucide-react'
import { AdminChatThread } from '@/components/admin/AdminChatThread'

type Message = {
  id: string
  content: string
  direction: 'inbound' | 'outbound'
  sent_by: string
  created_at: string
  is_read: boolean
}

type UserInfo = {
  id: string
  full_name: string
  email: string | null
  phone: string | null
}

export default async function AdminInboxThreadPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params
  const supabase = createAdminClient()

  // Load user info
  const { data: userRaw } = await (supabase as any)
    .from('users')
    .select('id, full_name, email, phone')
    .eq('id', userId)
    .single()

  if (!userRaw) notFound()

  const user = userRaw as UserInfo

  // Load last 100 messages for this user
  const { data: messagesRaw } = await (supabase as any)
    .from('messages')
    .select('id, content, direction, sent_by, created_at, is_read')
    .eq('user_id', userId)
    .eq('channel', 'internal')
    .order('created_at', { ascending: true })
    .limit(100)

  const messages = (messagesRaw ?? []) as Message[]

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="flex items-start gap-4 pb-4 mb-4 border-b border-border shrink-0">
        <Link
          href="/admin/inbox"
          className="mt-0.5 h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-lg font-bold text-foreground">{user.full_name}</h1>
            <Link
              href={`/admin/applications?userId=${userId}`}
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              Заявки
            </Link>
          </div>
          <div className="flex items-center gap-4 mt-1 flex-wrap">
            {user.phone && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" />
                {user.phone}
              </span>
            )}
            {user.email && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Mail className="h-3 w-3" />
                {user.email}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Chat thread */}
      <AdminChatThread userId={userId} initialMessages={messages} />
    </div>
  )
}
