
-- Drop the old UPDATE policy if present (to avoid duplicates)
DROP POLICY IF EXISTS "Users can update their own agreements" ON public.legal_agreements;

-- Add the correct UPDATE policy with EXPLICIT WITH CHECK:
CREATE POLICY "Users can update their own agreements"
  ON public.legal_agreements
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- (No insert policy change made, already permissive. But check your frontend code sets user_id on insert!)
