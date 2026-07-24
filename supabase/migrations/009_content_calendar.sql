-- Content calendar: stores AI-generated content + performance metrics
CREATE TABLE IF NOT EXISTS public.content_calendar (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type          TEXT NOT NULL,  -- instagram_post, telegram_post, video_script, etc.
  title         TEXT,
  body          TEXT NOT NULL,
  hashtags      JSONB,
  suggested_image_prompt TEXT,
  meta_description TEXT,
  utm_campaign  TEXT,           -- e.g. "reels_july_visa_germany" — for tracking leads
  platform      TEXT,           -- instagram, telegram, tiktok, email, whatsapp
  publish_at    TIMESTAMPTZ,
  published_at  TIMESTAMPTZ,   -- set when actually published
  leads_count   INT DEFAULT 0, -- updated via trigger or manually
  created_by    UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.content_calendar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "content_calendar_admin" ON public.content_calendar FOR ALL USING (public.is_admin());

GRANT ALL ON public.content_calendar TO service_role;
GRANT ALL ON public.content_calendar TO authenticated;
