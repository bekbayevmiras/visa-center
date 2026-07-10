-- Снизить все цены на 20% (агрессивная стратегия захвата рынка)
-- Округление до ближайших 500₸ для чистоты

UPDATE public.countries
SET
  base_price    = ROUND(base_price    * 0.8 / 500) * 500,
  express_price = ROUND(express_price * 0.8 / 500) * 500,
  updated_at    = NOW();

UPDATE public.visa_types
SET
  price         = ROUND(price         * 0.8 / 500) * 500,
  express_price = ROUND(COALESCE(express_price, 0) * 0.8 / 500) * 500,
  updated_at    = NOW();
