'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

interface Lead {
  id: string
  name: string | null
  phone: string | null
  source: string
  status: string
  created_at: string
}

const STATUS_LABELS: Record<string, string> = {
  new: 'Новый',
  contacted: 'Связались',
  qualified: 'Квалифицирован',
  converted: 'Конвертирован',
  lost: 'Потерян',
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  qualified: 'bg-purple-100 text-purple-700',
  converted: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
}

const ALL_STATUSES = Object.keys(STATUS_LABELS)

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchLeads = useCallback(async () => {
    const supabase = createClient()
    const { data } = await (supabase as any)
      .from('leads')
      .select('id, name, phone, source, status, created_at')
      .order('created_at', { ascending: false })

    setLeads((data ?? []) as Lead[])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id)
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l))

    const supabase = createClient()
    await (supabase as any)
      .from('leads')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id)

    setUpdatingId(null)
  }

  const visibleLeads = filterStatus === 'all'
    ? leads
    : leads.filter(l => l.status === filterStatus)

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Лиды</h1>
        <p className="text-muted-foreground mt-1">Входящие заявки и обращения ({visibleLeads.length})</p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 bg-card border border-border rounded-2xl p-4 flex-wrap">
        <span className="text-sm text-muted-foreground">Статус:</span>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="text-sm border border-border rounded-xl px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <option value="all">Все</option>
          {ALL_STATUSES.map(s => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            Загрузка...
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-3 px-4 font-medium">Имя</th>
                <th className="text-left py-3 px-4 font-medium">Телефон</th>
                <th className="text-left py-3 px-4 font-medium">Источник</th>
                <th className="text-left py-3 px-4 font-medium">Статус</th>
                <th className="text-left py-3 px-4 font-medium">Дата</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visibleLeads.map(lead => (
                <tr key={lead.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 font-medium">{lead.name ?? '—'}</td>
                  <td className="py-3 px-4 text-muted-foreground">{lead.phone ?? '—'}</td>
                  <td className="py-3 px-4 text-muted-foreground">{lead.source}</td>
                  <td className="py-3 px-4">
                    <select
                      value={lead.status}
                      disabled={updatingId === lead.id}
                      onChange={e => handleStatusChange(lead.id, e.target.value)}
                      className={`text-xs font-medium px-2 py-1 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                        STATUS_COLORS[lead.status] ?? 'bg-gray-100 text-gray-700'
                      } ${updatingId === lead.id ? 'opacity-50' : ''}`}
                    >
                      {ALL_STATUSES.map(s => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">
                    {format(new Date(lead.created_at), 'd MMM yyyy, HH:mm', { locale: ru })}
                  </td>
                </tr>
              ))}
              {visibleLeads.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    Лидов не найдено
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
