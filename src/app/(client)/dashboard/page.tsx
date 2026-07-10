import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ApplicationCard } from '@/components/client/ApplicationCard'
import { Button } from '@/components/ui/button'
import { ApplicationWithDetails } from '@/lib/supabase/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profileData } = await supabase
    .from('users')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const profile = profileData as { full_name: string } | null

  const { data: applications } = await supabase
    .from('applications')
    .select(`
      *,
      country:countries(*),
      visa_type:visa_types(*),
      user:users(full_name, email)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const apps = (applications ?? []) as unknown as ApplicationWithDetails[]
  const firstName = profile?.full_name?.split(' ')[0] ?? 'Клиент'

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Добрый день, {firstName}!</h1>
          <p className="text-muted-foreground mt-1">
            {apps.length === 0
              ? 'Подайте первую заявку — это займёт 5 минут'
              : `У вас ${apps.length} ${apps.length === 1 ? 'заявка' : apps.length < 5 ? 'заявки' : 'заявок'}`}
          </p>
        </div>
        <Link href="/apply">
          <Button className="bg-primary text-white hover:bg-primary/90 gap-2">
            <Plus className="h-4 w-4" />
            Новая заявка
          </Button>
        </Link>
      </div>

      {/* Applications */}
      {apps.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-20 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="font-semibold mb-2">Заявок пока нет</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            Оформите визу в любую из 28 стран — AI проверит документы за 30 секунд, менеджер возьмёт всё под контроль.
          </p>
          <Link href="/apply">
            <Button className="bg-primary text-white hover:bg-primary/90 gap-2">
              <Plus className="h-4 w-4" />
              Подать первую заявку
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {apps.map(app => (
            <ApplicationCard key={app.id} app={app} />
          ))}
        </div>
      )}
    </div>
  )
}
