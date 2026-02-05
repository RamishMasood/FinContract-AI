-- Fix critical security vulnerability in referrals table
-- Remove overly permissive policy that exposes all user emails

-- Drop the dangerous "System can manage referrals" policy
DROP POLICY IF EXISTS "System can manage referrals" ON public.referrals;

-- Create secure system-level policies for referrals table
-- Only allow system/service role to insert/update referrals (for webhook processing)
CREATE POLICY "Service role can manage referrals" 
ON public.referrals 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Allow authenticated users to insert referrals only for themselves as referrer
CREATE POLICY "Users can create referrals as referrer" 
ON public.referrals 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = referrer_user_id);

-- The existing "Users can view their own referrals" policy is correct and secure
-- It only allows users to see referrals where they are involved:
-- Using Expression: ((auth.uid() = referrer_user_id) OR (auth.uid() = referred_user_id))

-- Add audit logging for referral access (optional security enhancement)
CREATE OR REPLACE FUNCTION log_referral_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log access to referrals for security monitoring
  INSERT INTO auth.audit_log_entries (
    instance_id,
    id,
    payload,
    created_at,
    ip_address
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    jsonb_build_object(
      'action', 'referral_access',
      'user_id', auth.uid(),
      'referral_id', NEW.id,
      'timestamp', now()
    ),
    now(),
    inet_client_addr()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;