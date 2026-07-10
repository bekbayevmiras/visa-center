import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profileRaw } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  const profile = profileRaw as { is_admin: boolean } | null

  if (!profile?.is_admin) redirect('/login')

  return (
    <div className="min-h-screen flex bg-muted/20">
      <AdminSidebar />
      <main className="flex-1 p-6 max-w-full overflow-auto">
        {children}
      </main>
    </div>
  )
}
