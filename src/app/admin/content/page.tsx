'use client'

import { useState, useEffect, useCallback } from 'react'
import { Sparkles, Video, FileText, Camera, Music2, Loader2, CheckCircle2, XCircle, Copy, Download, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ContentType = 'instagram_post' | 'video_script' | 'tiktok_reel' | 'blog_article' | 'email_newsletter' | 'whatsapp_broadcast'
type Tone = 'friendly' | 'formal' | 'urgent'

interface GeneratedContent {
  type: ContentType
  title?: string
  body: string
  hashtags?: string[]
  suggested_image_prompt?: string
  meta_description?: string
}

interface Avatar { avatarId: string; name: string; previewUrl?: string }
interface Voice { voiceId: string; name: string; language: string; gender: string }

const CONTENT_TYPES: { value: ContentType; label: string; icon: React.ReactNode; platform: string }[] = [
  { value: 'video_script', label: 'Видео-сценарий', icon: <Video className="h-4 w-4" />, platform: 'TikTok / Reels' },
  { value: 'instagram_post', label: 'Instagram пост', icon: <Camera className="h-4 w-4" />, platform: 'Instagram' },
  { value: 'blog_article', label: 'Статья в блог', icon: <FileText className="h-4 w-4" />, platform: 'SEO' },
  { value: 'email_newsletter', label: 'Email рассылка', icon: <FileText className="h-4 w-4" />, platform: 'Email' },
  { value: 'whatsapp_broadcast', label: 'WhatsApp сообщение', icon: <Music2 className="h-4 w-4" />, platform: 'WhatsApp' },
]

const QUICK_TOPICS = [
  'Топ-3 ошибки при подаче на шенген из Казахстана',
  'Как получить визу в Германию за 14 дней',
  'Почему визовые центры лучше самостоятельной подачи',
  'Оплата 30/70 — почему мы единственные в Казахстане',
  'Visa-free страны для казахстанцев в 2026',
  'Что делать если получил отказ в визе',
  'Семейная виза в США — чек-лист документов',
  'Чем Аида Про отличается от обычного чат-бота',
]

export default function ContentPage() {
  const [type, setType] = useState<ContentType>('video_script')
  const [topic, setTopic] = useState('')
  const [tone, setTone] = useState<Tone>('friendly')
  const [country, setCountry] = useState('')
  const [generating, setGenerating] = useState(false)
  const [content, setContent] = useState<GeneratedContent | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // HeyGen state
  const [heygenReady, setHeygenReady] = useState(false)
  const [avatars, setAvatars] = useState<Avatar[]>([])
  const [voices, setVoices] = useState<Voice[]>([])
  const [selectedAvatar, setSelectedAvatar] = useState('')
  const [selectedVoice, setSelectedVoice] = useState('')
  const [videoGenerating, setVideoGenerating] = useState(false)
  const [videoId, setVideoId] = useState<string | null>(null)
  const [videoStatus, setVideoStatus] = useState<'processing' | 'completed' | 'failed' | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [heygenError, setHeygenError] = useState<string | null>(null)

  // Load HeyGen avatars/voices on mount
  useEffect(() => {
    fetch('/api/admin/content/video/setup')
      .then(r => r.json())
      .then((d: { configured: boolean; avatars: Avatar[]; voices: Voice[]; error?: string }) => {
        if (d.configured) {
          setHeygenReady(true)
          setAvatars(d.avatars)
          setVoices(d.voices)
          if (d.avatars[0]) setSelectedAvatar(d.avatars[0].avatarId)
          if (d.voices[0]) setSelectedVoice(d.voices[0].voiceId)
        }
      })
      .catch(() => {})
  }, [])

  const generate = async () => {
    if (!topic.trim()) return
    setGenerating(true)
    setError(null)
    setContent(null)
    setVideoId(null)
    setVideoStatus(null)
    setVideoUrl(null)
    setHeygenError(null)

    try {
      const res = await fetch('/api/admin/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, topic, context: { tone, country: country || undefined } }),
      })
      const data = await res.json() as { ok: boolean; content?: GeneratedContent; error?: string }
      if (!res.ok || !data.ok) throw new Error(data.error ?? 'Ошибка генерации')
      setContent(data.content ?? null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setGenerating(false)
    }
  }

  const generateVideo = async () => {
    if (!content?.body || !selectedAvatar || !selectedVoice) return
    setVideoGenerating(true)
    setHeygenError(null)
    setVideoId(null)
    setVideoStatus(null)
    setVideoUrl(null)

    try {
      const res = await fetch('/api/admin/content/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script: content.body, avatarId: selectedAvatar, voiceId: selectedVoice }),
      })
      const data = await res.json() as { ok: boolean; videoId?: string; error?: string }
      if (!res.ok || !data.ok) throw new Error(data.error ?? 'Ошибка HeyGen')
      setVideoId(data.videoId ?? null)
      setVideoStatus('processing')
    } catch (e) {
      setHeygenError(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setVideoGenerating(false)
    }
  }

  const pollVideoStatus = useCallback(async () => {
    if (!videoId) return
    try {
      const res = await fetch(`/api/admin/content/video?videoId=${videoId}`)
      const data = await res.json() as { status?: string; videoUrl?: string; error?: string }
      if (data.status === 'completed') {
        setVideoStatus('completed')
        setVideoUrl(data.videoUrl ?? null)
      } else if (data.status === 'failed') {
        setVideoStatus('failed')
        setHeygenError(data.error ?? 'Видео не удалось создать')
      }
    } catch { /* ignore */ }
  }, [videoId])

  // Poll every 10s while processing
  useEffect(() => {
    if (videoStatus !== 'processing') return
    const t = setInterval(pollVideoStatus, 10_000)
    return () => clearInterval(t)
  }, [videoStatus, pollVideoStatus])

  const copyBody = async () => {
    if (!content?.body) return
    await navigator.clipboard.writeText(content.body)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isVideoType = type === 'video_script'

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          Контент-машина
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          AI генерация контента для Instagram, TikTok и блога
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Form */}
        <div className="space-y-4">
          {/* Content type */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <p className="text-sm font-medium">Тип контента</p>
            <div className="grid grid-cols-1 gap-2">
              {CONTENT_TYPES.map(ct => (
                <button
                  key={ct.value}
                  onClick={() => setType(ct.value)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm transition-all ${
                    type === ct.value
                      ? 'border-primary bg-primary/5 text-primary font-medium'
                      : 'border-border hover:border-primary/40 hover:bg-muted/30'
                  }`}
                >
                  {ct.icon}
                  <span>{ct.label}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{ct.platform}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Topic */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <p className="text-sm font-medium">Тема</p>
            <textarea
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="Например: Топ-3 ошибки при подаче на шенген"
              rows={3}
              className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
            <div>
              <p className="text-xs text-muted-foreground mb-2">Быстрые темы:</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_TOPICS.map(t => (
                  <button
                    key={t}
                    onClick={() => setTopic(t)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-colors border border-border"
                  >
                    {t.length > 40 ? t.slice(0, 38) + '…' : t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <p className="text-sm font-medium">Параметры</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Тон</label>
                <select
                  value={tone}
                  onChange={e => setTone(e.target.value as Tone)}
                  className="w-full rounded-xl border border-border bg-muted px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="friendly">Дружелюбный</option>
                  <option value="formal">Официальный</option>
                  <option value="urgent">Срочный</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Страна (необязательно)</label>
                <input
                  type="text"
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  placeholder="Германия, США…"
                  className="w-full rounded-xl border border-border bg-muted px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          </div>

          <Button
            onClick={generate}
            disabled={!topic.trim() || generating}
            className="w-full bg-primary text-white hover:bg-primary/90 h-11"
          >
            {generating ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Генерирую…</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" />Сгенерировать контент</>
            )}
          </Button>
        </div>

        {/* Right: Output */}
        <div className="space-y-4">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
              {error}
            </div>
          )}

          {!content && !generating && (
            <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground text-sm">
              Сгенерированный контент появится здесь
            </div>
          )}

          {generating && (
            <div className="rounded-2xl border border-border bg-card p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Claude пишет контент…</p>
            </div>
          )}

          {content && (
            <div className="space-y-4">
              {/* Content card */}
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                  <p className="text-sm font-medium">{content.title ?? 'Контент'}</p>
                  <button
                    onClick={copyBody}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copied ? <><CheckCircle2 className="h-3.5 w-3.5 text-green-500" />Скопировано</> : <><Copy className="h-3.5 w-3.5" />Копировать</>}
                  </button>
                </div>
                <div className="p-5">
                  <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">{content.body}</pre>
                </div>
              </div>

              {/* Hashtags */}
              {content.hashtags && content.hashtags.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-xs text-muted-foreground mb-2 font-medium">Хэштеги</p>
                  <div className="flex flex-wrap gap-1.5">
                    {content.hashtags.map(h => (
                      <span key={h} className="text-xs px-2 py-1 rounded-lg bg-primary/10 text-primary">
                        {h.startsWith('#') ? h : `#${h}`}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Image prompt */}
              {content.suggested_image_prompt && (
                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-xs text-muted-foreground mb-1 font-medium">Промпт для обложки</p>
                  <p className="text-xs text-muted-foreground italic">{content.suggested_image_prompt}</p>
                </div>
              )}

              {/* HeyGen video generation (video_script only) */}
              {isVideoType && (
                <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-primary" />
                    <p className="text-sm font-medium">Создать AI видео (HeyGen)</p>
                    {!heygenReady && (
                      <span className="ml-auto text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        Нужен HEYGEN_API_KEY
                      </span>
                    )}
                  </div>

                  {!heygenReady ? (
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>Добавьте <code className="bg-muted px-1 rounded">HEYGEN_API_KEY</code> в Vercel Environment Variables.</p>
                      <p>Ключ: <a href="https://app.heygen.com/settings?nav=API" target="_blank" rel="noopener" className="text-primary underline">app.heygen.com/settings → API</a></p>
                    </div>
                  ) : (
                    <>
                      {/* Avatar select */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Аватар</label>
                          <select
                            value={selectedAvatar}
                            onChange={e => setSelectedAvatar(e.target.value)}
                            className="w-full rounded-xl border border-border bg-muted px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                          >
                            {avatars.map(a => (
                              <option key={a.avatarId} value={a.avatarId}>{a.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Голос (русский)</label>
                          <select
                            value={selectedVoice}
                            onChange={e => setSelectedVoice(e.target.value)}
                            className="w-full rounded-xl border border-border bg-muted px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                          >
                            {voices.map(v => (
                              <option key={v.voiceId} value={v.voiceId}>{v.name} ({v.gender})</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {heygenError && (
                        <p className="text-xs text-red-600">{heygenError}</p>
                      )}

                      {/* Video status */}
                      {videoStatus === 'processing' && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-xl px-4 py-3">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>HeyGen создаёт видео… (~2-5 мин)</span>
                          <button onClick={pollVideoStatus} className="ml-auto">
                            <RefreshCw className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}

                      {videoStatus === 'completed' && videoUrl && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Видео готово!</span>
                          </div>
                          <video
                            src={videoUrl}
                            controls
                            className="w-full rounded-xl aspect-[9/16] max-h-80 object-cover bg-black"
                          />
                          <a
                            href={videoUrl}
                            download
                            target="_blank"
                            rel="noopener"
                            className="flex items-center justify-center gap-2 w-full py-2 rounded-xl border border-border text-sm hover:bg-muted/30 transition-colors"
                          >
                            <Download className="h-4 w-4" />
                            Скачать видео
                          </a>
                        </div>
                      )}

                      {videoStatus === 'failed' && (
                        <div className="flex items-center gap-2 text-sm text-red-600">
                          <XCircle className="h-4 w-4" />
                          <span>{heygenError ?? 'Видео не удалось создать'}</span>
                        </div>
                      )}

                      {!videoStatus && (
                        <Button
                          onClick={generateVideo}
                          disabled={videoGenerating || !selectedAvatar || !selectedVoice}
                          className="w-full"
                          variant="outline"
                        >
                          {videoGenerating ? (
                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Запускаю HeyGen…</>
                          ) : (
                            <><Video className="h-4 w-4 mr-2" />Создать AI видео (9:16)</>
                          )}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
