-- Market Intelligence: competitor tracking + AI reports

CREATE TABLE IF NOT EXISTS public.market_competitors (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  country_code text,
  visa_type   text DEFAULT 'tourist',
  price       integer NOT NULL,
  source      text DEFAULT 'manual',
  notes       text,
  recorded_at timestamptz DEFAULT now(),
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.market_reports (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date      date DEFAULT CURRENT_DATE,
  summary          text NOT NULL,
  insights         jsonb,
  competitor_count integer DEFAULT 0,
  data_points      integer DEFAULT 0,
  created_at       timestamptz DEFAULT now()
);

ALTER TABLE public.market_competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_reports ENABLE ROW LEVEL SECURITY;

-- Admin-only via service role (server routes only)
CREATE POLICY "service_competitors" ON public.market_competitors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_reports"     ON public.market_reports     FOR ALL USING (true) WITH CHECK (true);
