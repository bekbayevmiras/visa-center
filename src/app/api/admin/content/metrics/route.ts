import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data } = await supabase.from('users').select('is_admin').eq('id', user.id).single()
  return (data as { is_admin: boolean } | null)?.is_admin ?? false
}

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Leads by utm_source
  const { data: leadsBySource } = await (supabase as any)
    .from('leads')
    .select('utm_source, utm_medium, utm_campaign, status, created_at')

  type LeadRow = {
    utm_source: string | null
    utm_medium: string | null
    utm_campaign: string | null
    status: string
    created_at: string
  }

  const leads = (leadsBySource ?? []) as LeadRow[]

  // Aggregate by source
  const sourceMap = new Map<string, { source: string; leads: number; converted: number }>()
  for (const lead of leads) {
    const key = lead.utm_source ?? 'organic'
    if (!sourceMap.has(key)) sourceMap.set(key, { source: key, leads: 0, converted: 0 })
    const s = sourceMap.get(key)!
    s.leads++
    if (lead.status === 'converted') s.converted++
  }

  // Aggregate by campaign
  const campaignMap = new Map<string, { campaign: string; source: string; leads: number; converted: number }>()
  for (const lead of leads) {
    const key = lead.utm_campaign ?? '—'
    if (!campaignMap.has(key)) {
      campaignMap.set(key, { campaign: key, source: lead.utm_source ?? 'organic', leads: 0, converted: 0 })
    }
    const c = campaignMap.get(key)!
    c.leads++
    if (lead.status === 'converted') c.converted++
  }

  const bySource = Array.from(sourceMap.values()).sort((a, b) => b.leads - a.leads)
  const byCampaign = Array.from(campaignMap.values()).sort((a, b) => b.leads - a.leads).slice(0, 20)

  // Total organic (no UTM)
  const totalOrganic = leads.filter(l => !l.utm_source).length
  const totalPaid = leads.filter(l => l.utm_source).length

  return NextResponse.json({ bySource, byCampaign, totalOrganic, totalPaid, total: leads.length })
}
