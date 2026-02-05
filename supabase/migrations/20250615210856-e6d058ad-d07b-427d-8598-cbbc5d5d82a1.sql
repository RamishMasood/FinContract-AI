
-- Remove ALL existing UPDATE policies on legal_agreements
DROP POLICY IF EXISTS "Users can update (incl. soft-delete) their own agreements" ON public.legal_agreements;
DROP POLICY IF EXISTS "Users can update their own agreements" ON public.legal_agreements;

-- Create a SINGLE update policy: Only allow users to update their own row, as long as user_id value remains unchanged
CREATE POLICY "Users can update (soft-delete) their own agreements"
  ON public.legal_agreements
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (user_id = auth.uid());
