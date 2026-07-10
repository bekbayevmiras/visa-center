-- Agent Control Center: configs, run logs, daily reports

CREATE TABLE IF NOT EXISTS public.agent_configs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name   text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description  text,
  is_active    boolean DEFAULT true,
  goal         text DEFAULT 'LEADS',  -- REACH | LEADS | QUALITY | REVENUE
  config       jsonb DEFAULT '{}',
  schedule     text,                   -- human-readable: "Ежедневно 9:00"
  last_run_at  timestamptz,
  last_run_status text,               -- success | error | skipped
  last_run_summary text,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.agent_runs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name   text NOT NULL,
  ran_at       timestamptz DEFAULT now(),
  status       text NOT NULL,          -- success | error | skipped
  summary      text,
  actions_count integer DEFAULT 0,
  metrics      jsonb DEFAULT '{}',
  error_message text
);

CREATE TABLE IF NOT EXISTS public.agent_daily_reports (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date  date DEFAULT CURRENT_DATE,
  global_goal  text DEFAULT 'LEADS',
  summary      text NOT NULL,
  insights     jsonb DEFAULT '{}',
  created_at   timestamptz DEFAULT now()
);

-- Seed default agent configs
INSERT INTO public.agent_configs (agent_name, display_name, description, is_active, goal, schedule) VALUES
  ('followup',            'Follow-up',            'WhatsApp-напоминания лидам через 1/3/7 дней',                    true, 'LEADS',   'Ежедневно 9:00'),
  ('reviews',             'Сбор отзывов',         'Запрашивает отзывы у клиентов с одобренной визой',               true, 'QUALITY', 'Ежедневно 10:00'),
  ('lead-scorer',         'Скоринг лидов',        'AI-оценка лидов: hot/warm/cold',                                 true, 'LEADS',   'Понедельник 8:00'),
  ('cfo-report',          'CFO отчёт',            'Ежедневный финансовый отчёт на email',                           true, 'REVENUE', 'Ежедневно 7:00'),
  ('market-intelligence', 'Market Intelligence',  'Анализ конкурентов и ценовых позиций',                           true, 'REVENUE', 'Понедельник 8:00'),
  ('content',             'Контент',              'Генерация постов для Instagram/Telegram/блог',                   true, 'REACH',   'Ручной запуск'),
  ('aida-pro',            'Aida Pro',             'Эксперт-AI в чате с клиентами (всегда активен)',                 true, 'QUALITY', 'При каждом сообщении'),
  ('document-processor',  'Проверка документов',  'AI-анализ паспортов и документов при загрузке',                 true, 'QUALITY', 'При загрузке файла'),
  ('risk-assessor',       'Оценка рисков',        'AI-оценка риска заявки 0-100 при создании',                     true, 'QUALITY', 'При создании заявки')
ON CONFLICT (agent_name) DO NOTHING;

-- Global goal stored as special config row
INSERT INTO public.agent_configs (agent_name, display_name, description, is_active, goal, schedule) VALUES
  ('__global__', 'Глобальная цель', 'Мастер-цель для всех агентов', true, 'LEADS', NULL)
ON CONFLICT (agent_name) DO NOTHING;

ALTER TABLE public.agent_configs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_runs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_daily_reports  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_agent_configs"   ON public.agent_configs        FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_agent_runs"      ON public.agent_runs           FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_daily_reports"   ON public.agent_daily_reports  FOR ALL USING (true) WITH CHECK (true);
