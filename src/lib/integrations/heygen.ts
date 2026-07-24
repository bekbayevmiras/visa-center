const HEYGEN_BASE = 'https://api.heygen.com'

function apiKey() {
  const key = process.env.HEYGEN_API_KEY
  if (!key) throw new Error('HEYGEN_API_KEY not set')
  return key
}

export interface HeyGenVideoInput {
  avatarId: string
  voiceId: string
  script: string
  backgroundHex?: string
}

export interface HeyGenVideoResult {
  videoId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  videoUrl?: string
  thumbnailUrl?: string
  error?: string
}

// POST /v2/video/generate — portrait 9:16 for TikTok/Reels
export async function createHeyGenVideo(input: HeyGenVideoInput): Promise<{ videoId: string }> {
  const res = await fetch(`${HEYGEN_BASE}/v2/video/generate`, {
    method: 'POST',
    headers: {
      'X-Api-Key': apiKey(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      video_inputs: [
        {
          character: {
            type: 'avatar',
            avatar_id: input.avatarId,
            avatar_style: 'normal',
          },
          voice: {
            type: 'text',
            input_text: input.script,
            voice_id: input.voiceId,
          },
          background: {
            type: 'color',
            value: input.backgroundHex ?? '#F8FAFC',
          },
        },
      ],
      dimension: { width: 720, height: 1280 },
      aspect_ratio: null,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`HeyGen generate failed ${res.status}: ${err}`)
  }

  const json = (await res.json()) as { data?: { video_id: string }; video_id?: string; error?: string }
  const videoId = json.data?.video_id ?? json.video_id
  if (!videoId) throw new Error(`HeyGen: no video_id in response: ${JSON.stringify(json)}`)
  return { videoId }
}

// GET /v1/video_status.get — poll until completed/failed
export async function getHeyGenVideoStatus(videoId: string): Promise<HeyGenVideoResult> {
  const res = await fetch(`${HEYGEN_BASE}/v1/video_status.get?video_id=${encodeURIComponent(videoId)}`, {
    headers: { 'X-Api-Key': apiKey() },
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`HeyGen status failed ${res.status}: ${err}`)
  }

  const json = (await res.json()) as {
    data?: {
      status: string
      video_url?: string
      thumbnail_url?: string
      error?: string
    }
    error?: string
  }

  const d = json.data
  if (!d) throw new Error(`HeyGen: unexpected status response: ${JSON.stringify(json)}`)

  const statusMap: Record<string, HeyGenVideoResult['status']> = {
    pending: 'pending',
    processing: 'processing',
    waiting: 'pending',
    completed: 'completed',
    failed: 'failed',
  }

  return {
    videoId,
    status: statusMap[d.status] ?? 'processing',
    videoUrl: d.video_url,
    thumbnailUrl: d.thumbnail_url,
    error: d.error,
  }
}

// GET /v2/avatars — list available avatars
export async function listHeyGenAvatars(): Promise<{ avatarId: string; name: string; previewUrl?: string }[]> {
  const res = await fetch(`${HEYGEN_BASE}/v2/avatars`, {
    headers: { 'X-Api-Key': apiKey() },
  })

  if (!res.ok) throw new Error(`HeyGen avatars failed ${res.status}`)

  const json = (await res.json()) as { data?: { avatars?: { avatar_id: string; avatar_name: string; preview_image_url?: string }[] } }
  return (json.data?.avatars ?? []).map(a => ({
    avatarId: a.avatar_id,
    name: a.avatar_name,
    previewUrl: a.preview_image_url,
  }))
}

// GET /v2/voices — list voices, filter by Russian
export async function listHeyGenVoices(): Promise<{ voiceId: string; name: string; language: string; gender: string }[]> {
  const res = await fetch(`${HEYGEN_BASE}/v2/voices`, {
    headers: { 'X-Api-Key': apiKey() },
  })

  if (!res.ok) throw new Error(`HeyGen voices failed ${res.status}`)

  type VoiceRaw = { voice_id: string; name: string; language: string; gender: string }
  const json = (await res.json()) as { data?: { voices?: VoiceRaw[] } }
  return (json.data?.voices ?? []).map(v => ({
    voiceId: v.voice_id,
    name: v.name,
    language: v.language,
    gender: v.gender,
  }))
}
