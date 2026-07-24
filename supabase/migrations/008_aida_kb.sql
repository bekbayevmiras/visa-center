-- Аида Knowledge Base: хранилище симуляций для RAG
-- Аида ищет похожие сценарии и использует лучшие ответы как пример

CREATE TABLE public.aida_kb (
  id            serial PRIMARY KEY,
  category      text NOT NULL,
  subcategory   text NOT NULL,
  difficulty    text NOT NULL,
  client_message text NOT NULL,
  aida_response  text NOT NULL,
  intent        text,
  hand_off      boolean DEFAULT false,
  upsell        text,
  grade_total   integer DEFAULT 0,
  verdict       text,           -- excellent | good | needs_improvement | fail
  strengths     text[],
  issues        text[],
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('russian', coalesce(client_message, '') || ' ' || coalesce(category, '') || ' ' || coalesce(subcategory, ''))
  ) STORED,
  created_at    timestamptz DEFAULT now()
);

-- Полнотекстовый поиск по запросу клиента
CREATE INDEX aida_kb_search_idx ON public.aida_kb USING gin(search_vector);

-- Быстрый поиск по категории и оценке
CREATE INDEX aida_kb_category_grade_idx ON public.aida_kb (category, grade_total DESC);
CREATE INDEX aida_kb_verdict_idx ON public.aida_kb (verdict, grade_total DESC);

-- RLS: только сервис может читать/писать
ALTER TABLE public.aida_kb ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_full_access" ON public.aida_kb
  USING (true) WITH CHECK (true);
