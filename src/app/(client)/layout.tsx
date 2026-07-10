import { createClient } from '@/lib/supabase/server'
import { ClientSidebar } from '@/components/client/ClientSidebar'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // /apply is now public — no auth redirect (proxy.ts protects /dashboard etc.)
  if (!user) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-muted/20">
      <ClientSidebar />
      <main className="flex-1 p-4 md:p-8 max-w-full overflow-auto">
        {children}
      </main>
    </div>
  )
}
