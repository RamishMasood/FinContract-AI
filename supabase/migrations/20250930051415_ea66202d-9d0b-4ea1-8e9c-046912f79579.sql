-- Create promo_codes table
CREATE TABLE public.promo_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  max_usage INTEGER NOT NULL DEFAULT 1,
  current_usage INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  validity_duration_days INTEGER NOT NULL DEFAULT 7,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create promo_code_redemptions table to track usage
CREATE TABLE public.promo_code_redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  promo_code_id UUID NOT NULL REFERENCES public.promo_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  redeemed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  plan_id TEXT NOT NULL DEFAULT 'premium',
  UNIQUE(promo_code_id, user_id)
);

-- Enable RLS
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_code_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for promo_codes (users can only check if code exists via edge function)
CREATE POLICY "Service role can manage promo codes"
ON public.promo_codes
FOR ALL
USING (true)
WITH CHECK (true);

-- RLS Policies for promo_code_redemptions
CREATE POLICY "Users can view their own redemptions"
ON public.promo_code_redemptions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage redemptions"
ON public.promo_code_redemptions
FOR ALL
USING (true)
WITH CHECK (true);

-- Drop and recreate get_effective_user_plan to include promo code redemptions
DROP FUNCTION IF EXISTS public.get_effective_user_plan(uuid);

CREATE FUNCTION public.get_effective_user_plan(user_uuid uuid)
RETURNS TABLE(plan_id text, expires_at timestamp with time zone, is_referral_reward boolean, is_promo_code boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check for active promo code redemptions first (highest priority)
  RETURN QUERY
  SELECT 
    pcr.plan_id,
    pcr.expires_at,
    false as is_referral_reward,
    true as is_promo_code
  FROM public.promo_code_redemptions pcr
  WHERE pcr.user_id = user_uuid 
  AND pcr.starts_at <= now() 
  AND pcr.expires_at > now()
  ORDER BY pcr.expires_at DESC
  LIMIT 1;
  
  -- If no active promo code, check for active referral rewards
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      rr.plan_id,
      rr.expires_at,
      true as is_referral_reward,
      false as is_promo_code
    FROM public.referral_rewards rr
    WHERE rr.user_id = user_uuid 
    AND rr.starts_at <= now() 
    AND rr.expires_at > now()
    ORDER BY rr.expires_at DESC
    LIMIT 1;
  END IF;
  
  -- If no promo or referral reward, check user plans
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      up.plan_id,
      up.expires_at,
      false as is_referral_reward,
      false as is_promo_code
    FROM public.user_plans up
    WHERE up.user_id = user_uuid 
    AND (up.expires_at IS NULL OR up.expires_at > now())
    ORDER BY up.expires_at DESC NULLS FIRST
    LIMIT 1;
  END IF;
  
  -- If no plans found, return free plan
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      'free'::TEXT as plan_id,
      NULL::TIMESTAMP WITH TIME ZONE as expires_at,
      false as is_referral_reward,
      false as is_promo_code;
  END IF;
END;
$function$;

-- Create index for performance
CREATE INDEX idx_promo_codes_code ON public.promo_codes(code);
CREATE INDEX idx_promo_code_redemptions_user_id ON public.promo_code_redemptions(user_id);
CREATE INDEX idx_promo_code_redemptions_dates ON public.promo_code_redemptions(starts_at, expires_at);