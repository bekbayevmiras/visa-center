import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { listHeyGenAvatars, listHeyGenVoices } from '@/lib/integrations/heygen'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('users').select('is_admin').eq('id', user.id).single()
  const profile = data as { is_admin: boolean } | null
  if (!profile?.is_admin) return null
  return user
}

export async function GET() {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })

  if (!process.env.HEYGEN_API_KEY) {
    return NextResponse.json({ configured: false, avatars: [], voices: [] })
  }

  try {
    const [avatars, allVoices] = await Promise.all([
      listHeyGenAvatars(),
      listHeyGenVoices(),
    ])

    // Prioritize Russian voices, then English
    const voices = allVoices
      .filter(v => ['ru', 'ru-RU', 'Russian', 'russian'].some(l => v.language.toLowerCase().includes(l.toLowerCase())))
      .concat(
        allVoices.filter(v => ['en', 'en-US', 'English'].some(l => v.language.toLowerCase().includes(l.toLowerCase())))
      )
      .slice(0, 30)

    return NextResponse.json({ configured: true, avatars: avatars.slice(0, 20), voices })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ configured: false, error: msg, avatars: [], voices: [] })
  }
}
