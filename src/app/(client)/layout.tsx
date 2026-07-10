import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ClientSidebar } from '@/components/client/ClientSidebar'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-muted/20">
      <ClientSidebar />
      <main className="flex-1 p-4 md:p-8 max-w-full overflow-auto">
        {children}
      </main>
    </div>
  )
}
