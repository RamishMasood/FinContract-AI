-- Add new fields to profiles table for signup data
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Create referrals table to track referral relationships
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_user_id UUID NOT NULL,
  referred_user_id UUID NOT NULL,
  referral_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  first_paid_purchase_at TIMESTAMP WITH TIME ZONE,
  reward_granted BOOLEAN DEFAULT false NOT NULL,
  reward_plan_id TEXT,
  reward_month_year TEXT, -- Format: "2025-01" for tracking monthly rewards
  UNIQUE(referred_user_id), -- Each user can only be referred once
  CONSTRAINT fk_referrer FOREIGN KEY (referrer_user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_referred FOREIGN KEY (referred_user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS on referrals table
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for referrals
CREATE POLICY "Users can view their own referrals" 
ON public.referrals 
FOR SELECT 
USING (auth.uid() = referrer_user_id OR auth.uid() = referred_user_id);

CREATE POLICY "System can manage referrals" 
ON public.referrals 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create referral_rewards table to track reward plans given to referrers
CREATE TABLE IF NOT EXISTS public.referral_rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_id TEXT NOT NULL, -- 'basic' or 'premium'
  month_year TEXT NOT NULL, -- Format: "2025-01"
  referral_count INTEGER NOT NULL,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT fk_reward_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS on referral_rewards table
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for referral_rewards
CREATE POLICY "Users can view their own referral rewards" 
ON public.referral_rewards 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can manage referral rewards" 
ON public.referral_rewards 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Function to process referral rewards when a user makes a paid purchase
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
        
      -- Create unique constraint for referral rewards
      CREATE UNIQUE INDEX IF NOT EXISTS idx_referral_rewards_user_month 
      ON public.referral_rewards (user_id, month_year);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to process referral rewards on user plan changes
CREATE TRIGGER trigger_process_referral_reward
  AFTER INSERT ON public.user_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.process_referral_reward();

-- Function to get effective user plan (including referral rewards)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;