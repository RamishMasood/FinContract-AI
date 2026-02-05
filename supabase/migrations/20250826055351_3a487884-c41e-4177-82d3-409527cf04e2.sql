-- Add unique constraint to referral_rewards and manually process rewards
ALTER TABLE public.referral_rewards 
ADD CONSTRAINT referral_rewards_user_month_unique 
UNIQUE (user_id, month_year);

-- Manually create referral reward for the referrer (f2c9e32c-7bd2-4f84-adba-19028fa1cb03) who has 2 paid referrals
INSERT INTO public.referral_rewards (
  user_id, 
  plan_id, 
  month_year, 
  referral_count, 
  starts_at, 
  expires_at
)
VALUES (
  'f2c9e32c-7bd2-4f84-adba-19028fa1cb03',
  'premium',
  '2025-08',
  2,
  now(),
  now() + INTERVAL '1 month'
);

-- Update gumroad webhook to populate email fields
-- We need to update the gumroad-webhook edge function to set email fields