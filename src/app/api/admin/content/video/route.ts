import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { createHeyGenVideo, getHeyGenVideoStatus, listHeyGenAvatars, listHeyGenVoices } from '@/lib/integrations/heygen'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('users').select('is_admin').eq('id', user.id).single()
  const profile = data as { is_admin: boolean } | null
  if (!profile?.is_admin) return null
  return user
}

// POST /api/admin/content/video — generate a HeyGen video from a script
export async function POST(request: NextRequest) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })

  if (!process.env.HEYGEN_API_KEY) {
    return NextResponse.json({ error: 'HEYGEN_API_KEY не настроен. Добавьте ключ в переменные окружения.' }, { status: 503 })
  }

  const body = await request.json() as {
    script: string
    avatarId: string
    voiceId: string
    contentId?: string
  }

  const { script, avatarId, voiceId, contentId } = body

  if (!script?.trim()) return NextResponse.json({ error: 'Нужен script' }, { status: 400 })
  if (!avatarId) return NextResponse.json({ error: 'Нужен avatarId' }, { status: 400 })
  if (!voiceId) return NextResponse.json({ error: 'Нужен voiceId' }, { status: 400 })

  // Strip stage directions / timecodes — only spoken text goes to HeyGen
  const spokenScript = script
    .replace(/\[.*?\]/g, '')      // remove [визуал: ...] blocks
    .replace(/\(.*?\)/g, '')      // remove (pause) etc
    .replace(/^\s*\d+:\d+.*$/gm, '') // remove timecode lines like "00:03 — ..."
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  try {
    const { videoId } = await createHeyGenVideo({ avatarId, voiceId, script: spokenScript })

    // Save video_id to content_calendar if contentId provided
    if (contentId) {
      try {
        const supabase = createAdminClient()
        await (supabase as any)
          .from('content_calendar')
          .update({ video_id: videoId, video_status: 'processing' })
          .eq('id', contentId)
      } catch { /* table may not have these columns yet */ }
    }

    return NextResponse.json({ ok: true, videoId })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('POST /api/admin/content/video error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// GET /api/admin/content/video?videoId=xxx — poll status
export async function GET(request: NextRequest) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })

  const videoId = request.nextUrl.searchParams.get('videoId')
  if (!videoId) return NextResponse.json({ error: 'Нужен videoId' }, { status: 400 })

  if (!process.env.HEYGEN_API_KEY) {
    return NextResponse.json({ error: 'HEYGEN_API_KEY не настроен' }, { status: 503 })
  }

  try {
    const result = await getHeyGenVideoStatus(videoId)

    // If completed, update content_calendar
    if (result.status === 'completed' && result.videoUrl) {
      try {
        const supabase = createAdminClient()
        await (supabase as any)
          .from('content_calendar')
          .update({ video_url: result.videoUrl, video_status: 'completed' })
          .eq('video_id', videoId)
      } catch { /* ignore */ }
    }

    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// GET /api/admin/content/video/setup — list avatars and voices for UI
export async function HEAD() {
  // Used to check if HeyGen is configured
  return new NextResponse(null, {
    status: process.env.HEYGEN_API_KEY ? 200 : 503,
  })
}
