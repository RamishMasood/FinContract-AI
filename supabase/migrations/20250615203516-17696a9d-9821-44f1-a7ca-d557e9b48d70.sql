
-- Fix RLS UPDATE policy for soft deletes (clarifies check on user_id)
DROP POLICY IF EXISTS "Users can update their own agreements" ON public.legal_agreements;

CREATE POLICY "Users can update their own agreements"
  ON public.legal_agreements
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (user_id = auth.uid());
