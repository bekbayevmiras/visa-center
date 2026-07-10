-- Реферальные коды
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  code VARCHAR(20) UNIQUE NOT NULL,
  uses_count INTEGER DEFAULT 0,
  discount_percent INTEGER DEFAULT 10,
  reward_amount INTEGER DEFAULT 5000,  -- ₸ reward per referral
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Использования реферального кода
CREATE TABLE IF NOT EXISTS public.referral_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id UUID REFERENCES public.referrals(id),
  referred_user_id UUID REFERENCES public.users(id),
  application_id UUID REFERENCES public.applications(id),
  reward_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_uses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own referrals" ON public.referrals
  FOR SELECT TO authenticated USING (referrer_id = auth.uid());

CREATE POLICY "Users see own referral uses" ON public.referral_uses
  FOR SELECT TO authenticated
  USING (referral_id IN (SELECT id FROM public.referrals WHERE referrer_id = auth.uid()));

GRANT SELECT, INSERT ON public.referrals TO authenticated;
GRANT SELECT ON public.referral_uses TO authenticated;
GRANT ALL ON public.referrals TO service_role;
GRANT ALL ON public.referral_uses TO service_role;

-- Helper function to atomically increment uses_count
CREATE OR REPLACE FUNCTION public.increment_referral_uses(referral_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.referrals SET uses_count = uses_count + 1 WHERE id = referral_id;
$$;
