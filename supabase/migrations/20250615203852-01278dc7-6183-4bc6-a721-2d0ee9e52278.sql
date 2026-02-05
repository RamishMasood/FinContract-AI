
-- Remove all old UPDATE policies to avoid conflicts
DROP POLICY IF EXISTS "Users can update their own agreements" ON public.legal_agreements;

-- Allow users to update their own agreements (including soft deletes)
CREATE POLICY "Users can update their own agreements"
  ON public.legal_agreements
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (user_id = auth.uid());
