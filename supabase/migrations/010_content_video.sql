-- Add video generation columns to content_calendar
ALTER TABLE public.content_calendar
  ADD COLUMN IF NOT EXISTS video_id       TEXT,
  ADD COLUMN IF NOT EXISTS video_status   TEXT CHECK (video_status IN ('processing', 'completed', 'failed')),
  ADD COLUMN IF NOT EXISTS video_url      TEXT,
  ADD COLUMN IF NOT EXISTS platform       TEXT CHECK (platform IN ('instagram', 'tiktok', 'both', 'telegram', 'email')),
  ADD COLUMN IF NOT EXISTS utm_campaign   TEXT;

-- Index for polling by video_id
CREATE INDEX IF NOT EXISTS idx_content_calendar_video_id ON public.content_calendar (video_id) WHERE video_id IS NOT NULL;

-- Index for calendar view by date
CREATE INDEX IF NOT EXISTS idx_content_calendar_publish_at ON public.content_calendar (publish_at);
