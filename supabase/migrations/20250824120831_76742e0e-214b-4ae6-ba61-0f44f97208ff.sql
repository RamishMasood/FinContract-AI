-- Fix function search path security issues
CREATE OR REPLACE FUNCTION public.process_referral_reward()
RETURNS TRIGGER AS $$
DECLARE
  referrer_id UUID;
  current_month_year TEXT;
  referral_count INTEGER;
  reward_plan TEXT;
  latest_plan_expiry TIMESTAMP WITH TIME ZONE;
  reward_start_date TIMESTAMP WITH TIME ZONE;
  reward_end_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Only process if this is a paid plan and first purchase for this user
  IF NEW.plan_id IN ('basic', 'premium') AND OLD IS NULL THEN
    -- Get the month-year for this purchase
    current_month_year := TO_CHAR(NEW.created_at, 'YYYY-MM');
    
    -- Check if this user was referred
    SELECT referrer_user_id INTO referrer_id 
    FROM public.referrals 
    WHERE referred_user_id = NEW.user_id 
    AND first_paid_purchase_at IS NULL;
    
    IF referrer_id IS NOT NULL THEN
      -- Mark the referral as having made first paid purchase
      UPDATE public.referrals 
      SET first_paid_purchase_at = NEW.created_at 
      WHERE referred_user_id = NEW.user_id;
      
      -- Count referrals for this month that made paid purchases
      SELECT COUNT(*) INTO referral_count 
      FROM public.referrals r
      WHERE r.referrer_user_id = referrer_id 
      AND r.first_paid_purchase_at IS NOT NULL
      AND TO_CHAR(r.first_paid_purchase_at, 'YYYY-MM') = current_month_year;
      
      -- Determine reward plan based on referral count
      IF referral_count >= 2 THEN
        reward_plan := 'premium';
      ELSE
        reward_plan := 'basic';
      END IF;
      
      -- Find the latest expiry date for the referrer (either from user_plans or referral_rewards)
      SELECT GREATEST(
        COALESCE((SELECT MAX(expires_at) FROM public.user_plans WHERE user_id = referrer_id), '1970-01-01'::timestamptz),
        COALESCE((SELECT MAX(expires_at) FROM public.referral_rewards WHERE user_id = referrer_id), '1970-01-01'::timestamptz),
        now()
      ) INTO latest_plan_expiry;
      
      -- Set reward start and end dates
      reward_start_date := latest_plan_expiry;
      reward_end_date := reward_start_date + INTERVAL '1 month';
      
      -- Insert or update referral reward for this month
      INSERT INTO public.referral_rewards (
        user_id, 
        plan_id, 
        month_year, 
        referral_count, 
        starts_at, 
        expires_at
      )
      VALUES (
        referrer_id, 
        reward_plan, 
        current_month_year, 
        referral_count, 
        reward_start_date, 
        reward_end_date
      )
      ON CONFLICT (user_id, month_year) 
      DO UPDATE SET 
        plan_id = EXCLUDED.plan_id,
        referral_count = EXCLUDED.referral_count,
        expires_at = reward_start_date + INTERVAL '1 month';
        
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix get_effective_user_plan function
CREATE OR REPLACE FUNCTION public.get_effective_user_plan(user_uuid UUID)
RETURNS TABLE (
  plan_id TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_referral_reward BOOLEAN
) AS $$
BEGIN
  -- Check for active referral rewards first (they take priority)
  RETURN QUERY
  SELECT 
    rr.plan_id,
    rr.expires_at,
    true as is_referral_reward
  FROM public.referral_rewards rr
  WHERE rr.user_id = user_uuid 
  AND rr.starts_at <= now() 
  AND rr.expires_at > now()
  ORDER BY rr.expires_at DESC
  LIMIT 1;
  
  -- If no active referral reward, check user plans
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      up.plan_id,
      up.expires_at,
      false as is_referral_reward
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
      false as is_referral_reward;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;