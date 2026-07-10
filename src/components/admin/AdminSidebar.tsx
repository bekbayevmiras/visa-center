'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Globe,
  LayoutDashboard,
  FileText,
  Kanban,
  Users,
  BarChart2,
  Brain,
  Settings,
  LogOut,
  MessageSquare,
  Activity,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { href: '/admin/applications', icon: FileText, label: 'Заявки' },
  { href: '/admin/kanban', icon: Kanban, label: 'Канбан' },
  { href: '/admin/leads', icon: Users, label: 'Лиды' },
  { href: '/admin/inbox', icon: MessageSquare, label: 'Входящие' },
  { href: '/admin/analytics', icon: BarChart2, label: 'Аналитика' },
  { href: '/admin/agents', icon: Activity, label: 'Агенты' },
  { href: '/admin/ai', icon: Brain, label: 'AI Инструменты' },
  { href: '/admin/settings', icon: Settings, label: 'Настройки' },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen border-r border-border bg-card px-4 py-6 shrink-0">
      <Link href="/admin" className="flex items-center gap-2 font-bold text-lg mb-8 px-2">
        <Globe className="h-5 w-5 text-primary" />
        <span>Visa<span className="text-primary">KZ</span> <span className="text-xs font-normal text-muted-foreground">Admin</span></span>
      </Link>

      <nav className="flex-1 space-y-1">
        {NAV.map(item => {
          const Icon = item.icon
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary text-white'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full"
      >
        <LogOut className="h-4 w-4" />
        Выйти
      </button>
    </aside>
  )
}
