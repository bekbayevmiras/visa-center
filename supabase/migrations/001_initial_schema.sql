-- ============================================================
-- VISA CENTER — Initial Schema
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- fuzzy search

-- ============================================================
-- USERS (extends Supabase auth.users)
-- ============================================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  whatsapp_id TEXT,
  telegram_id TEXT,
  full_name TEXT NOT NULL DEFAULT '',
  iin TEXT,
  birth_date DATE,
  passport_number TEXT,
  passport_expiry DATE,
  citizenship TEXT DEFAULT 'KZ',
  preferred_language TEXT DEFAULT 'ru',
  lead_source TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  is_vip BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COUNTRIES
-- ============================================================
CREATE TABLE public.countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ru TEXT NOT NULL,
  name_en TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  flag_emoji TEXT,
  processing_time_days INTEGER DEFAULT 10,
  processing_time_express_days INTEGER DEFAULT 5,
  base_price INTEGER DEFAULT 25000,
  express_price INTEGER DEFAULT 37500,
  embassy_info JSONB DEFAULT '{}',
  requirements JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  popularity_rank INTEGER DEFAULT 99,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VISA TYPES
-- ============================================================
CREATE TABLE public.visa_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID REFERENCES public.countries(id) ON DELETE CASCADE,
  type_code TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  name_en TEXT NOT NULL,
  price INTEGER NOT NULL,
  express_price INTEGER,
  processing_days INTEGER DEFAULT 10,
  express_days INTEGER DEFAULT 5,
  validity_days INTEGER,
  max_stay_days INTEGER,
  entries TEXT DEFAULT 'single',
  requirements JSONB NOT NULL DEFAULT '[]',
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LEADS
-- ============================================================
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT,
  whatsapp_id TEXT,
  name TEXT,
  country_interest TEXT,
  source TEXT DEFAULT 'unknown',
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  status TEXT DEFAULT 'new',
  notes TEXT,
  converted_user_id UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- APPLICATIONS
-- ============================================================
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_number TEXT UNIQUE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  country_id UUID REFERENCES public.countries(id),
  visa_type_id UUID REFERENCES public.visa_types(id),
  status TEXT DEFAULT 'new',
  travel_purpose TEXT,
  travel_date_from DATE,
  travel_date_to DATE,
  adults_count INTEGER DEFAULT 1,
  children_count INTEGER DEFAULT 0,
  is_express BOOLEAN DEFAULT FALSE,
  price INTEGER NOT NULL DEFAULT 0,
  discount_percent INTEGER DEFAULT 0,
  final_price INTEGER NOT NULL DEFAULT 0,
  payment_status TEXT DEFAULT 'pending',
  payment_amount INTEGER DEFAULT 0,
  manager_id UUID REFERENCES public.users(id),
  manager_notes TEXT,
  deadline DATE,
  appointment_date TIMESTAMPTZ,
  appointment_location TEXT,
  ai_checklist JSONB,
  ai_risk_score INTEGER,
  ai_recommendations TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-generate application number
CREATE OR REPLACE FUNCTION generate_application_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.application_number := 'VZ-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('application_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS application_seq START 1000;

CREATE TRIGGER set_application_number
  BEFORE INSERT ON public.applications
  FOR EACH ROW
  WHEN (NEW.application_number IS NULL)
  EXECUTE FUNCTION generate_application_number();

-- ============================================================
-- DOCUMENTS
-- ============================================================
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id),
  doc_type TEXT NOT NULL,
  doc_name TEXT NOT NULL,
  file_url TEXT,
  file_size INTEGER,
  ocr_text TEXT,
  ocr_data JSONB,
  status TEXT DEFAULT 'pending',
  rejection_reason TEXT,
  verified_by UUID REFERENCES public.users(id),
  verified_at TIMESTAMPTZ,
  expires_at DATE,
  ai_validation_result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- APPLICATION HISTORY (audit log)
-- ============================================================
CREATE TABLE public.application_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT,
  changed_by TEXT,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-log status changes (SECURITY DEFINER so it can write past RLS)
CREATE OR REPLACE FUNCTION log_application_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.application_history (application_id, old_status, new_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, 'system');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER application_status_change
  AFTER UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION log_application_status_change();

-- ============================================================
-- MESSAGES
-- ============================================================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.applications(id),
  user_id UUID REFERENCES public.users(id),
  channel TEXT NOT NULL,
  direction TEXT NOT NULL,
  content TEXT NOT NULL,
  media_url TEXT,
  media_type TEXT,
  whatsapp_message_id TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  sent_by TEXT DEFAULT 'agent',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MESSAGE TEMPLATES
-- ============================================================
CREATE TABLE public.message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  channel TEXT DEFAULT 'all',
  language TEXT DEFAULT 'ru',
  subject TEXT,
  body TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CONTENT POSTS
-- ============================================================
CREATE TABLE public.content_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  post_type TEXT,
  status TEXT DEFAULT 'draft',
  title TEXT,
  caption TEXT NOT NULL,
  hashtags TEXT[] DEFAULT '{}',
  media_urls TEXT[] DEFAULT '{}',
  visual_description TEXT,
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  engagement_data JSONB DEFAULT '{}',
  ai_generated BOOLEAN DEFAULT TRUE,
  campaign_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CAMPAIGNS
-- ============================================================
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT,
  target_country TEXT,
  target_audience JSONB DEFAULT '{}',
  channels TEXT[] DEFAULT '{}',
  budget INTEGER,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'draft',
  kpi JSONB DEFAULT '{}',
  actual_results JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.applications(id),
  user_id UUID REFERENCES public.users(id),
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'KZT',
  payment_method TEXT,
  provider TEXT,
  provider_transaction_id TEXT,
  status TEXT DEFAULT 'pending',
  invoice_url TEXT,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ============================================================
-- ANALYTICS EVENTS
-- ============================================================
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES public.users(id),
  session_id TEXT,
  properties JSONB DEFAULT '{}',
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SETTINGS
-- ============================================================
CREATE TABLE public.settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER applications_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_applications_user_id ON public.applications(user_id);
CREATE INDEX idx_applications_status ON public.applications(status);
CREATE INDEX idx_applications_created_at ON public.applications(created_at DESC);
CREATE INDEX idx_documents_application_id ON public.documents(application_id);
CREATE INDEX idx_messages_user_id ON public.messages(user_id);
CREATE INDEX idx_messages_channel ON public.messages(channel);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_whatsapp_id ON public.leads(whatsapp_id);
CREATE INDEX idx_analytics_events_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visa_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Helper function: check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND is_admin = TRUE
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Users: see own profile, admins see all
CREATE POLICY "users_select_own" ON public.users FOR SELECT USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "users_update_own" ON public.users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND is_admin = (SELECT is_admin FROM public.users WHERE id = auth.uid())
    AND is_vip   = (SELECT is_vip   FROM public.users WHERE id = auth.uid())
  );
CREATE POLICY "users_insert_own" ON public.users FOR INSERT WITH CHECK (id = auth.uid());

-- Applications: see own, admins see all
CREATE POLICY "applications_select" ON public.applications FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "applications_insert" ON public.applications FOR INSERT WITH CHECK (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "applications_update" ON public.applications FOR UPDATE USING (user_id = auth.uid() OR public.is_admin());

-- Documents: see own, admins see all
CREATE POLICY "documents_select" ON public.documents FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "documents_insert" ON public.documents FOR INSERT WITH CHECK (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "documents_update" ON public.documents FOR UPDATE USING (user_id = auth.uid() OR public.is_admin());

-- Messages: see own, admins see all
CREATE POLICY "messages_select" ON public.messages FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "messages_insert" ON public.messages FOR INSERT WITH CHECK (
  (user_id = auth.uid() AND sent_by IN ('client', 'user'))
  OR public.is_admin()
);

-- Payments: see own, admins see all
CREATE POLICY "payments_select" ON public.payments FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

-- Countries & visa_types: public read
CREATE POLICY "countries_public_read" ON public.countries FOR SELECT USING (TRUE);
CREATE POLICY "countries_admin_write" ON public.countries FOR ALL USING (public.is_admin());
CREATE POLICY "visa_types_public_read" ON public.visa_types FOR SELECT USING (TRUE);
CREATE POLICY "visa_types_admin_write" ON public.visa_types FOR ALL USING (public.is_admin());

-- Application history: owner can read (via join), admins see all; writes only via SECURITY DEFINER trigger
CREATE POLICY "history_select_own" ON public.application_history FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.applications a
    WHERE a.id = application_history.application_id
      AND (a.user_id = auth.uid() OR public.is_admin())
  )
);

-- Leads: admin only (CTA inserts go through /api/leads server route with service_role)
CREATE POLICY "leads_admin_only" ON public.leads FOR ALL USING (public.is_admin());

-- Content & campaigns: admin only
CREATE POLICY "content_posts_admin" ON public.content_posts FOR ALL USING (public.is_admin());
CREATE POLICY "campaigns_admin" ON public.campaigns FOR ALL USING (public.is_admin());
CREATE POLICY "message_templates_admin" ON public.message_templates FOR ALL USING (public.is_admin());
CREATE POLICY "settings_admin" ON public.settings FOR ALL USING (public.is_admin());

-- Analytics: insert for auth users (own events only), read for admins
CREATE POLICY "analytics_insert" ON public.analytics_events FOR INSERT WITH CHECK (user_id = auth.uid() OR auth.uid() IS NOT NULL);
CREATE POLICY "analytics_select_admin" ON public.analytics_events FOR SELECT USING (public.is_admin());

-- ============================================================
-- NEW USER TRIGGER (create profile on signup)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
