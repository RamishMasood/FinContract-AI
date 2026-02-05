-- Add validity_duration_days column to promo_code_redemptions table
ALTER TABLE public.promo_code_redemptions 
ADD COLUMN IF NOT EXISTS validity_duration_days integer NOT NULL DEFAULT 7;

-- Add comment for documentation
COMMENT ON COLUMN public.promo_code_redemptions.validity_duration_days IS 'The duration in days of the promo code validity, stored at redemption time';