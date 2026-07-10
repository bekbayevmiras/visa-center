'use client'

import { useEffect, useState, useCallback } from 'react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Zap } from 'lucide-react'

interface KanbanApplication {
  id: string
  application_number: string
  status: string
  is_express: boolean
  created_at: string
  country: { id: string; name_ru: string; flag_emoji: string | null; code: string } | null
  user: { id: string; full_name: string; email: string | null; phone: string | null } | null
  visa_type: { id: string; name_ru: string; type_code: string } | null
}

const COLUMNS: { status: string; label: string; color: string; headerColor: string }[] = [
  { status: 'new', label: 'Новые', color: 'bg-blue-50 border-blue-100', headerColor: 'bg-blue-100 text-blue-700' },
  { status: 'docs_collection', label: 'Сбор документов', color: 'bg-yellow-50 border-yellow-100', headerColor: 'bg-yellow-100 text-yellow-700' },
  { status: 'docs_review', label: 'Проверка', color: 'bg-orange-50 border-orange-100', headerColor: 'bg-orange-100 text-orange-700' },
  { status: 'submitted', label: 'Подано', color: 'bg-indigo-50 border-indigo-100', headerColor: 'bg-indigo-100 text-indigo-700' },
  { status: 'in_progress', label: 'В процессе', color: 'bg-sky-50 border-sky-100', headerColor: 'bg-sky-100 text-sky-700' },
  { status: 'approved', label: 'Одобрено', color: 'bg-green-50 border-green-100', headerColor: 'bg-green-100 text-green-700' },
]

export function KanbanBoard() {
  const [applications, setApplications] = useState<KanbanApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null)
  const [filterCountry, setFilterCountry] = useState<string>('all')

  const fetchApplications = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/applications')
      if (!res.ok) throw new Error('Ошибка загрузки')
      const json = await res.json()
      setApplications(json.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  const updateStatus = async (id: string, newStatus: string) => {
    // Optimistic update
    setApplications(prev =>
      prev.map(app => app.id === id ? { ...app, status: newStatus } : app)
    )
    try {
      const res = await fetch('/api/admin/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      })
      if (!res.ok) throw new Error()
    } catch {
      // Revert on error
      fetchApplications()
    }
  }

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggingId(id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverStatus(status)
  }

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault()
    if (draggingId) {
      const app = applications.find(a => a.id === draggingId)
      if (app && app.status !== status) {
        updateStatus(draggingId, status)
      }
    }
    setDraggingId(null)
    setDragOverStatus(null)
  }

  const handleDragEnd = () => {
    setDraggingId(null)
    setDragOverStatus(null)
  }

  // Unique countries for filter
  const countries = Array.from(
    new Map(
      applications
        .filter(a => a.country)
        .map(a => [a.country!.id, a.country!])
    ).values()
  ).sort((a, b) => a.name_ru.localeCompare(b.name_ru))

  const visibleApps = filterCountry === 'all'
    ? applications
    : applications.filter(a => a.country?.id === filterCountry)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Загрузка...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-muted-foreground">Фильтр по стране:</span>
        <select
          value={filterCountry}
          onChange={e => setFilterCountry(e.target.value)}
          className="text-sm border border-border rounded-lg px-3 py-1.5 bg-card focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <option value="all">Все страны</option>
          {countries.map(c => (
            <option key={c.id} value={c.id}>
              {c.flag_emoji} {c.name_ru}
            </option>
          ))}
        </select>
        <span className="text-xs text-muted-foreground ml-2">
          Показано: {visibleApps.length} заявок
        </span>
      </div>

      {/* Kanban columns */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(col => {
          const colApps = visibleApps.filter(a => a.status === col.status)
          const isDragTarget = dragOverStatus === col.status
          return (
            <div
              key={col.status}
              className={`flex-shrink-0 w-72 rounded-2xl border ${col.color} flex flex-col min-h-[200px] transition-all ${
                isDragTarget ? 'ring-2 ring-primary ring-offset-1' : ''
              }`}
              onDragOver={e => handleDragOver(e, col.status)}
              onDrop={e => handleDrop(e, col.status)}
              onDragLeave={() => setDragOverStatus(null)}
            >
              {/* Column header */}
              <div className={`px-3 py-2.5 rounded-t-2xl flex items-center justify-between ${col.headerColor}`}>
                <span className="font-semibold text-sm">{col.label}</span>
                <span className="text-xs font-medium bg-white/60 px-2 py-0.5 rounded-full">
                  {colApps.length}
                </span>
              </div>

              {/* Cards */}
              <div className="p-2 space-y-2 flex-1">
                {colApps.map(app => (
                  <div
                    key={app.id}
                    draggable
                    onDragStart={e => handleDragStart(e, app.id)}
                    onDragEnd={handleDragEnd}
                    className={`bg-white rounded-xl p-3 shadow-sm border border-white/80 cursor-grab active:cursor-grabbing transition-all select-none ${
                      draggingId === app.id ? 'opacity-40 scale-95' : 'hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-mono text-xs text-muted-foreground">
                        {app.application_number}
                      </span>
                      {app.is_express && (
                        <span className="flex items-center gap-0.5 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">
                          <Zap className="h-3 w-3" />
                          Срочная
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-sm truncate">
                      {app.user?.full_name ?? '—'}
                    </p>
                    {app.country && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {app.country.flag_emoji} {app.country.name_ru}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(app.created_at), 'd MMM yyyy', { locale: ru })}
                    </p>
                  </div>
                ))}
                {colApps.length === 0 && (
                  <div className="flex items-center justify-center h-16 text-xs text-muted-foreground/60 italic">
                    Пусто
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
