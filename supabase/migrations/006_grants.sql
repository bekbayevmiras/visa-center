-- Grant service_role access to all tables (server-side API routes use service_role key)
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Grant anon insert on leads for public CTAs
GRANT INSERT ON public.leads TO anon;
