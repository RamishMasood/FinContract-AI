-- Add email fields to tables and fix referral reward system
-- Add user email to user_plans table
ALTER TABLE public.user_plans ADD COLUMN user_email TEXT;

-- Add referred user email to referrals table  
ALTER TABLE public.referrals ADD COLUMN referred_user_email TEXT;

-- Update the process_referral_reward function to handle the new plan IDs correctly
CREATE OR REPLACE FUNCTION public.process_referral_reward()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

-- Create the trigger on gumroad_purchases table
DROP TRIGGER IF EXISTS referral_reward_trigger ON public.gumroad_purchases;
CREATE TRIGGER referral_reward_trigger
AFTER INSERT ON public.gumroad_purchases
FOR EACH ROW EXECUTE FUNCTION public.process_referral_reward();

-- Populate existing email data
UPDATE public.user_plans 
SET user_email = (
  SELECT au.email 
  FROM auth.users au 
  WHERE au.id = user_plans.user_id
);

UPDATE public.referrals 
SET referred_user_email = (
  SELECT au.email 
  FROM auth.users au 
  WHERE au.id = referrals.referred_user_id
);

-- Process existing referrals that should have rewards (manually fix existing data)
UPDATE public.referrals 
SET first_paid_purchase_at = (
  SELECT MIN(gp.created_at)
  FROM public.gumroad_purchases gp
  WHERE gp.user_id = referrals.referred_user_id 
  AND gp.plan_id IN ('basic', 'premium')
  AND gp.status = 'completed'
)
WHERE first_paid_purchase_at IS NULL;